// SEMP showreel score + SFX, synthesized in code (no samples).
// 120 BPM, A minor, 10 bars of 2 s. Writes:
//   out/music.wav  music stem only (used by beats.mjs to measure the beat grid)
//   out/mix.wav    music + SFX (loudnormed to -14 LUFS by render.mjs at mux time)
// SFX times mirror the picture timeline in film.js (same beat grid).
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, 'out')
mkdirSync(OUT, { recursive: true })

const SR = 48000
const DUR = 20
const N = SR * DUR
const BEAT = 0.5
const TAU = Math.PI * 2

function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(9482)
const noise = () => rnd() * 2 - 1
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)

const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) })
const drums = bus()
const bass = bus()
const pad = bus()
const lead = bus()
const sfx = bus()
const verbSend = bus()
const delaySend = bus()

function put(b, i, v, pan = 0) {
  if (i < 0 || i >= N) return
  b.L[i] += v * Math.cos(((pan + 1) * Math.PI) / 4) * 1.414
  b.R[i] += v * Math.sin(((pan + 1) * Math.PI) / 4) * 1.414
}

// RBJ biquad, coefficients recomputed per call (time-varying filters)
function biquad(type, f, q) {
  const w = (TAU * Math.min(f, SR * 0.45)) / SR
  const c = Math.cos(w)
  const s = Math.sin(w)
  const a = s / (2 * q)
  let b0, b1, b2
  if (type === 'lp') [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2]
  else if (type === 'hp') [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2]
  else [b0, b1, b2] = [a, 0, -a]
  const a0 = 1 + a
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * c) / a0, a2: (1 - a) / a0 }
}
function filt() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  return (x, k) => {
    const y = k.b0 * x + k.b1 * x1 + k.b2 * x2 - k.a1 * y1 - k.a2 * y2
    x2 = x1; x1 = x; y2 = y1; y1 = y
    return y
  }
}

// ---------- instruments ----------
function kick(t0, g = 1) {
  const n = Math.floor(0.5 * SR)
  let ph = 0
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const t = k / SR
    const f = 44 + 120 * Math.exp(-t / 0.028)
    ph += (TAU * f) / SR
    const env = Math.exp(-t / 0.2) * Math.min(1, t / 0.0015)
    const click = noise() * Math.exp(-t / 0.0025) * 0.25
    put(drums, i0 + k, (Math.sin(ph) * env * 0.95 + click) * g)
  }
}
function clap(t0, g = 1, pan = 0) {
  const n = Math.floor(0.3 * SR)
  const f = filt()
  const k1 = biquad('bp', 1300, 0.9)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const t = k / SR
    let env = Math.exp(-t / 0.11)
    for (const o of [0, 0.009, 0.018]) if (t >= o) env += Math.exp(-(t - o) / 0.006) * 0.8
    const v = f(noise(), k1) * env * 0.9 + Math.sin(TAU * 185 * t) * Math.exp(-t / 0.04) * 0.25
    put(drums, i0 + k, v * g, pan)
    put(verbSend, i0 + k, v * g * 0.25, pan)
  }
}
function hat(t0, g = 1, open = false, pan = 0.25) {
  const n = Math.floor((open ? 0.22 : 0.06) * SR)
  const f = filt()
  const k1 = biquad('hp', 7500, 0.8)
  const i0 = Math.floor(t0 * SR)
  const d = open ? 0.08 : 0.018
  for (let k = 0; k < n; k++) {
    const t = k / SR
    put(drums, i0 + k, f(noise(), k1) * Math.exp(-t / d) * 0.5 * g, pan)
  }
}
function bassNote(t0, dur, m, g = 1) {
  const n = Math.floor((dur + 0.04) * SR)
  const f1 = mtof(m)
  const lp = filt()
  const i0 = Math.floor(t0 * SR)
  let p1 = 0, p2 = 0, p3 = 0
  for (let k = 0; k < n; k++) {
    const t = k / SR
    p1 += f1 / SR; p2 += (f1 * 1.006) / SR; p3 += f1 / 2 / SR
    const saw = (2 * (p1 % 1) - 1 + 2 * (p2 % 1) - 1) * 0.5
    const cut = 240 + 1500 * Math.exp(-t / 0.07)
    const v = lp(saw, biquad('lp', cut, 1.1))
    const env = Math.min(1, t / 0.004) * (t > dur ? Math.exp(-(t - dur) / 0.012) : 1)
    put(bass, i0 + k, (v * 0.55 + Math.sin(TAU * p3) * 0.5) * env * g)
  }
}
function padChord(t0, dur, notes, g = 1, cutA = 900, cutB = 900) {
  const n = Math.floor((dur + 0.6) * SR)
  const i0 = Math.floor(t0 * SR)
  const voices = []
  for (const m of notes)
    for (const det of [-0.11, 0, 0.12])
      voices.push({ f: mtof(m) * Math.pow(2, det / 12), p: rnd(), pan: det * 5 })
  const lpL = filt(), lpR = filt(), lpL2 = filt(), lpR2 = filt()
  for (let k = 0; k < n; k++) {
    const t = k / SR
    let l = 0, r = 0
    for (const v of voices) {
      v.p += v.f / SR
      const s = 2 * (v.p % 1) - 1
      l += s * (1 - v.pan) * 0.5
      r += s * (1 + v.pan) * 0.5
    }
    const cut = cutA + (cutB - cutA) * Math.min(1, t / dur)
    const kq = biquad('lp', cut, 0.7)
    l = lpL2(lpL(l, kq), kq)
    r = lpR2(lpR(r, kq), kq)
    const env = Math.min(1, t / 0.12) * (t > dur ? Math.exp(-(t - dur) / 0.18) : 1)
    const a = (env * g * 0.08) / Math.sqrt(notes.length)
    if (i0 + k < N) {
      pad.L[i0 + k] += l * a
      pad.R[i0 + k] += r * a
      verbSend.L[i0 + k] += l * a * 0.3
      verbSend.R[i0 + k] += r * a * 0.3
    }
  }
}
function pluck(t0, m, g = 1, pan = 0) {
  const n = Math.floor(0.3 * SR)
  const f = mtof(m)
  const lp = filt()
  const i0 = Math.floor(t0 * SR)
  let p = 0
  for (let k = 0; k < n; k++) {
    const t = k / SR
    p += f / SR
    const sq = (p % 1 < 0.32 ? 1 : -1) * 0.6 + (2 * (p % 1) - 1) * 0.4
    const v = lp(sq, biquad('lp', 600 + 5000 * Math.exp(-t / 0.05), 1.4)) * Math.exp(-t / 0.09) * Math.min(1, t / 0.002)
    put(lead, i0 + k, v * g * 0.32, pan)
    put(delaySend, i0 + k, v * g * 0.12, pan)
  }
}
function riser(t0, t1, g = 1, f0 = 300, f1 = 7000) {
  const n = Math.floor((t1 - t0) * SR)
  const bp = filt()
  const i0 = Math.floor(t0 * SR)
  let ph = 0
  for (let k = 0; k < n; k++) {
    const p = k / n
    const f = f0 * Math.pow(f1 / f0, p)
    ph += (TAU * (180 * Math.pow(6, p))) / SR
    const v = bp(noise(), biquad('bp', f, 2.2)) * 1.4 + Math.sin(ph) * 0.12
    const a = p * p * g
    put(sfx, i0 + k, v * a, Math.sin(p * 9) * 0.4)
    put(verbSend, i0 + k, v * a * 0.3)
  }
}
function whoosh(t0, dur, g = 1, up = false, pan = 0) {
  const n = Math.floor(dur * SR)
  const bp = filt()
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const p = k / n
    const f = up ? 400 * Math.pow(12, p) : 5000 * Math.pow(1 / 10, p)
    const a = Math.sin(Math.PI * Math.pow(p, up ? 1.6 : 0.6)) * g
    put(sfx, i0 + k, bp(noise(), biquad('bp', f, 1.3)) * a * 1.1, pan * (p * 2 - 1))
  }
}
function impact(t0, g = 1) {
  const n = Math.floor(1.6 * SR)
  const lp = filt()
  const i0 = Math.floor(t0 * SR)
  let ph = 0
  for (let k = 0; k < n; k++) {
    const t = k / SR
    ph += (TAU * (32 + 60 * Math.exp(-t / 0.09))) / SR
    const sub = Math.sin(ph) * Math.exp(-t / 0.55)
    const nz = lp(noise(), biquad('lp', 200 + 5000 * Math.exp(-t / 0.05), 0.7)) * Math.exp(-t / 0.25)
    const v = (sub * 0.9 + nz * 0.7) * g
    put(sfx, i0 + k, v)
    put(verbSend, i0 + k, nz * g * 0.6)
  }
}
function click(t0, g = 1, pitch = 1, pan = 0) {
  const n = Math.floor(0.06 * SR)
  const hp = filt()
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const t = k / SR
    const v = hp(noise(), biquad('hp', 2500, 0.8)) * Math.exp(-t / 0.004) * 0.6 +
      Math.sin(TAU * 1700 * pitch * t) * Math.exp(-t / 0.018) * 0.35 +
      Math.sin(TAU * 180 * pitch * t) * Math.exp(-t / 0.02) * 0.4
    put(sfx, i0 + k, v * g, pan)
  }
}
function tick(t0, g = 1, pitch = 1, pan = 0) {
  const n = Math.floor(0.05 * SR)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const t = k / SR
    put(sfx, i0 + k, Math.sin(TAU * 2600 * pitch * t) * Math.exp(-t / 0.012) * 0.4 * g, pan)
  }
}
function ping(t0, g = 1, base = 1046.5) {
  const n = Math.floor(1.4 * SR)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const t = k / SR
    const v = (Math.sin(TAU * base * t) * Math.exp(-t / 0.5) +
      Math.sin(TAU * base * 2.003 * t) * Math.exp(-t / 0.3) * 0.5 +
      Math.sin(TAU * base * 3.01 * t) * Math.exp(-t / 0.12) * 0.25) * Math.min(1, t / 0.002)
    put(sfx, i0 + k, v * 0.35 * g)
    put(verbSend, i0 + k, v * 0.25 * g)
  }
}
function thump(t0, g = 1) {
  const n = Math.floor(0.2 * SR)
  const i0 = Math.floor(t0 * SR)
  let ph = 0
  for (let k = 0; k < n; k++) {
    const t = k / SR
    ph += (TAU * (70 + 110 * Math.exp(-t / 0.02))) / SR
    put(sfx, i0 + k, Math.sin(ph) * Math.exp(-t / 0.07) * 0.8 * g)
  }
}
function beep(t0, g = 1, f = 1760) {
  const n = Math.floor(0.09 * SR)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < n; k++) {
    const t = k / SR
    const env = Math.min(1, t / 0.003) * (t > 0.07 ? Math.exp(-(t - 0.07) / 0.005) : 1)
    put(sfx, i0 + k, (Math.sin(TAU * f * t) > 0 ? 1 : -1) * 0.12 * env * g)
  }
}

// ---------- arrangement ----------
const CH = {
  Am: { root: 45, pad: [57, 60, 64, 69], arp: [69, 72, 76, 81] },
  F: { root: 41, pad: [53, 57, 60, 65], arp: [65, 69, 72, 77] },
  C: { root: 36, pad: [55, 60, 64, 67], arp: [67, 72, 76, 79] },
  G: { root: 43, pad: [55, 59, 62, 67], arp: [67, 71, 74, 79] },
}
const PROG = ['Am', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am']
const kicks = []
const K = (t, g = 1) => { kick(t, g); kicks.push(t) }

for (let bar = 0; bar < 10; bar++) {
  const t0 = bar * 2
  const c = CH[PROG[bar]]
  const full = bar >= 1 && bar <= 8 && bar !== 3
  // pad
  if (bar === 0) padChord(0, 2, c.pad, 0.9, 350, 1400)
  else if (bar === 3) padChord(t0, 2, c.pad, 1.1, 500, 3800)
  else if (bar === 9) padChord(t0, 1.4, c.pad, 1.2, 2600, 900)
  else padChord(t0, 2, c.pad, 1, 1500, 2200)
  // drums
  if (full) {
    for (let b = 0; b < 4; b++) K(t0 + b * BEAT)
    clap(t0 + 0.5, 0.75, -0.1)
    clap(t0 + 1.5, 0.75, 0.1)
    for (let s = 0; s < 16; s++) {
      const t = t0 + s * 0.125
      if (s % 4 === 2) hat(t, 0.9, true, 0.3)
      else hat(t, s % 2 ? 0.45 : 0.3, false, -0.25)
    }
    // bass: offbeat 8ths + 16th pickups
    for (let b = 0; b < 4; b++) {
      bassNote(t0 + b * BEAT + 0.25, 0.2, c.root, 1)
      if (b % 2 === 1) bassNote(t0 + b * BEAT + 0.375, 0.1, c.root + 12, 0.6)
    }
  }
  if (bar === 0) {
    for (let s = 8; s < 16; s++) hat(s * 0.125, 0.15 + (s - 8) * 0.05, false, -0.2)
    bassNote(0, 1.4, 33, 0.7)
  }
  if (bar === 3) {
    // breakdown under the SOS hold: snare roll accelerating into the drop at 7.5
    for (let t = 6.5; t < 7.0; t += 0.25) clap(t, 0.3)
    for (let t = 7.0; t < 7.25; t += 0.125) clap(t, 0.4)
    for (let t = 7.25; t < 7.5; t += 0.0625) clap(t, 0.5)
    K(6.0, 0.9)
    K(7.5, 1)
    clap(7.5, 0.8)
    hat(7.5, 0.9, true)
    hat(7.75, 0.6, true)
    bassNote(7.5, 0.2, 36, 1)
    bassNote(7.75, 0.2, 36, 1)
  }
  if (bar >= 4 && bar <= 8) {
    for (let s = 0; s < 16; s++) {
      const tone = c.arp[[0, 1, 2, 1, 3, 2, 1, 2][s % 8]]
      pluck(t0 + s * 0.125, tone, s % 4 === 0 ? 1 : 0.7, s % 2 ? 0.35 : -0.35)
    }
  }
  if (bar === 9) {
    K(18, 1.1)
    bassNote(18, 1.4, 33, 0.9)
    for (const [i, m] of [69, 72, 76, 81].entries()) pluck(18 + i * 0.125, m, 0.8, i % 2 ? 0.4 : -0.4)
    pluck(18.5, 88, 0.6)
    K(19, 0.45)
  }
}

// ---------- SFX on the picture timeline ----------
// S1 hook: calculator keys 9 4 8 2 =
click(0.0, 0.8, 1.0, 0.3); click(0.25, 0.8, 1.06, 0.3); click(0.5, 0.8, 0.96, 0.3); click(0.75, 0.8, 1.12, 0.3)
click(1.5, 1, 0.8, 0.3); thump(1.5, 0.8)
tick(1.0, 0.6, 0.8)
riser(0.8, 2.0, 0.55)
// S2
impact(2.0, 1)
whoosh(2.45, 0.3, 0.5, true, 0.6)
for (let k = 0; k < 5; k++) click(2.7 + k * 0.06, 0.45, 1.2 + k * 0.05, 0.5)
ping(3.0, 0.5, 1318.5)
tick(2.5, 0.5); tick(2.625, 0.5, 1.1); tick(3.25, 0.3); tick(3.375, 0.3, 1.1)
whoosh(3.7, 0.36, 0.9, false, -1)
// S3
for (let i = 0; i < 4; i++) thump(4.0 + i * 0.06, 0.45)
for (let i = 0; i < 7; i++) tick(4.5 + i * 0.07, 0.22, 0.9 + i * 0.05)
ping(5.0, 0.3, 880)
for (let i = 0; i < 4; i++) tick(5.0 + i * 0.125, 0.35, 1.3 + i * 0.1)
whoosh(5.62, 0.4, 0.6, true)
// S4 SOS
thump(6.0, 0.9)
riser(6.0, 7.5, 0.7, 200, 9000)
impact(7.5, 1.1); ping(7.5, 0.7, 1046.5)
for (const [i, t] of [8.0, 8.25, 8.5].entries()) { whoosh(t - 0.08, 0.16, 0.35, true, 0.4); tick(t, 0.5, 1 + i * 0.12); beep(t + 0.3, 0.6, 1568 + i * 200) }
whoosh(8.72, 0.3, 0.7, true)
// S5 map
impact(9.0, 0.6)
tick(9.25, 0.3); tick(9.375, 0.3, 1.1); tick(9.5, 0.3, 1.2)
whoosh(10.2, 0.3, 0.45, true, 0.8)
beep(11.0, 0.8, 1760); beep(11.12, 0.8, 1760)
whoosh(11.25, 0.27, 0.7, false, -0.8)
// S6 medida
tick(11.625, 0.3); tick(11.75, 0.3, 1.1); tick(11.875, 0.3, 1.2)
for (let k = 0; k < 13; k++) click(12.5 + k * 0.031, 0.25, 1.4 + (k % 3) * 0.1, 0.2)
ping(13.0, 0.4, 1568)
tick(13.25, 0.4, 1.2); tick(13.5, 0.4, 1.35)
whoosh(13.72, 0.28, 0.6, true)
// S7 montage
impact(14.0, 1)
thump(14.5, 0.6); tick(14.5, 0.3)
thump(15.0, 0.4)
for (let k = 0; k < 8; k++) tick(15.0 + k * 0.0625, 0.35, 1 + k * 0.07, (k % 2 ? 0.3 : -0.3))
riser(15.4, 16.0, 0.5)
// S8 stat + PIN
impact(16.0, 0.7)
for (let k = 0; k < 10; k++) tick(16.0 + 0.6 * (1 - Math.pow(1 - k / 10, 2)), 0.18, 1.5)
for (let k = 0; k < 5; k++) { click(17.0 + k * 0.125, 0.8, 1 + k * 0.04, 0.2); thump(17.0 + k * 0.125, 0.35) }
beep(17.56, 0.5, 2093)
whoosh(17.72, 0.3, 0.7, true)
// S9 end
impact(18.0, 1.2)
thump(18.25, 0.5)
ping(18.5, 0.5, 1046.5)
tick(19.0, 0.3)

// ---------- buses: sidechain, delay, reverb, master ----------
kicks.sort((a, b) => a - b)
const duck = new Float32Array(N).fill(1)
for (const tk of kicks) {
  const i0 = Math.floor(tk * SR)
  for (let k = 0; k < SR * 0.4 && i0 + k < N; k++) duck[i0 + k] = Math.min(duck[i0 + k], 1 - 0.75 * Math.exp(-k / SR / 0.11))
}
for (const b of [pad, bass, lead]) for (let i = 0; i < N; i++) { b.L[i] *= duck[i]; b.R[i] *= duck[i] }

// ping-pong dotted-8th delay
const dl = Math.floor(0.375 * SR)
for (let i = dl; i < N; i++) {
  delaySend.L[i] += delaySend.R[i - dl] * 0.38
  delaySend.R[i] += delaySend.L[i - dl] * 0.38
}
// Schroeder reverb
function reverb(inp, offs) {
  const out = new Float32Array(N)
  for (const d0 of [1557, 1617, 1491, 1422]) {
    const d = Math.floor(((d0 + offs) * SR) / 44100)
    const buf = new Float32Array(d)
    let idx = 0, lp = 0
    for (let i = 0; i < N; i++) {
      const y = buf[idx]
      lp = y * 0.6 + lp * 0.4
      buf[idx] = inp[i] + lp * 0.83
      out[i] += y * 0.25
      idx = (idx + 1) % d
    }
  }
  for (const d0 of [225, 556]) {
    const d = Math.floor(((d0 + offs) * SR) / 44100)
    const buf = new Float32Array(d)
    let idx = 0
    for (let i = 0; i < N; i++) {
      const b = buf[idx]
      const x = out[i]
      buf[idx] = x + b * 0.5
      out[i] = b - x * 0.5
      idx = (idx + 1) % d
    }
  }
  return out
}
const vL = reverb(verbSend.L, 0)
const vR = reverb(verbSend.R, 23)

function render(withSfx) {
  const L = new Float32Array(N), R = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    let l = drums.L[i] * 0.9 + bass.L[i] * 0.8 + pad.L[i] + lead.L[i] * 0.8 + delaySend.L[i] * 0.6 + vL[i] * 0.35
    let r = drums.R[i] * 0.9 + bass.R[i] * 0.8 + pad.R[i] + lead.R[i] * 0.8 + delaySend.R[i] * 0.6 + vR[i] * 0.35
    if (withSfx) { l += sfx.L[i] * 0.85; r += sfx.R[i] * 0.85 }
    // last 0.4 s: gentle tail-out so the file ends clean
    const tail = Math.min(1, (DUR - i / SR) / 0.4)
    L[i] = Math.tanh(l * 0.9) * tail
    R[i] = Math.tanh(r * 0.9) * tail
  }
  return [L, R]
}

function writeWav(path, [L, R]) {
  let peak = 0
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
  const gain = 0.89 / peak
  const buf = Buffer.alloc(44 + N * 8)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 8, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20); buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 8, 28); buf.writeUInt16LE(8, 32); buf.writeUInt16LE(32, 34)
  buf.write('data', 36); buf.writeUInt32LE(N * 8, 40)
  for (let i = 0; i < N; i++) {
    buf.writeFloatLE(L[i] * gain, 44 + i * 8)
    buf.writeFloatLE(R[i] * gain, 48 + i * 8)
  }
  writeFileSync(path, buf)
}

writeWav(join(OUT, 'music.wav'), render(false))
writeWav(join(OUT, 'mix.wav'), render(true))
console.log('wrote out/music.wav, out/mix.wav;', kicks.length, 'kicks')
