// Measures the beat grid from the rendered music stem (out/music.wav) and writes beats.json.
// Kick punch band (90-220 Hz) transient flux -> autocorrelation period + phase comb -> beats.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const buf = readFileSync(join(here, 'out', 'music.wav'))
const SR = buf.readUInt32LE(24)
const ch = buf.readUInt16LE(22)
let off = 12
while (buf.toString('ascii', off, off + 4) !== 'data') off += 8 + buf.readUInt32LE(off + 4)
const n = buf.readUInt32LE(off + 4) / (4 * ch)
const data = off + 8

// Bandpass around kick punch (130 Hz) + high-frequency click so downbeat kicks stand out cleanly
const w0 = (2 * Math.PI * 135) / SR
const q = 1.8
const alpha = Math.sin(w0) / (2 * q)
const b0 = alpha, b1 = 0, b2 = -alpha
const a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha
let x1 = 0, x2 = 0, y1 = 0, y2 = 0

const hop = Math.floor(SR * 0.005) // 5 ms hop
const dt = hop / SR
const env = []
let acc = 0
for (let i = 0; i < n; i++) {
  let x = 0
  for (let c = 0; c < ch; c++) x += buf.readFloatLE(data + (i * ch + c) * 4)
  x /= ch
  const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
  x2 = x1; x1 = x; y2 = y1; y1 = y
  acc += y * y
  if ((i + 1) % hop === 0) {
    env.push(Math.sqrt(acc / hop))
    acc = 0
  }
}

const flux = env.map((v, i) => Math.max(0, v - (env[i - 1] ?? 0)))

// Autocorrelation over candidate beat periods 0.38s..0.62s (96..158 BPM)
let bestLag = Math.round(0.5 / dt)
let bestScore = -1
for (let lag = Math.round(0.38 / dt); lag <= Math.round(0.62 / dt); lag++) {
  let s = 0
  for (let i = lag; i < flux.length; i++) s += flux[i] * flux[i - lag]
  if (s > bestScore) {
    bestScore = s
    bestLag = lag
  }
}
const period = +(bestLag * dt).toFixed(4)

// Phase search by comb filter at 2*period (1s = 2-beat cell, where kick vs snare/offbeat is unambiguous)
const barLag = bestLag * 2
let bestPhase = 0
let bestComb = -1
for (let p = 0; p < bestLag; p++) {
  let s = 0
  for (let i = p; i < flux.length; i += barLag) s += flux[i]
  if (s > bestComb) {
    bestComb = s
    bestPhase = p
  }
}
const offset = +Math.max(0, (bestPhase - 1) * dt).toFixed(4)

const sorted = [...flux].sort((p, q) => p - q)
const thr = sorted[Math.floor(sorted.length * 0.96)] * 0.35
const onsets = []
for (let i = 1; i < flux.length - 1; i++) {
  if (flux[i] > thr && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1]) {
    const t = +((i - 1) * dt).toFixed(4)
    if (!onsets.length || t - onsets[onsets.length - 1] > period * 0.45) onsets.push(t)
  }
}

const beats = []
for (let k = 0; offset + k * period <= 20.0001; k++) {
  beats.push(+(offset + k * period).toFixed(4))
}
const out = {
  bpm: +(60 / period).toFixed(2),
  period,
  offset,
  onsets,
  beats,
}
writeFileSync(join(here, 'beats.json'), JSON.stringify(out, null, 2))
console.log(`measured ${out.bpm} BPM, period ${out.period}s, offset ${out.offset}s, ${onsets.length} onsets, ${beats.length} beats`)
