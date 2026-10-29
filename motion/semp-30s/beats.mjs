// Measures the 30s beat grid from out/music.wav and writes beats.json (120 BPM, 60 beats).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const buf = readFileSync(join(here, 'out', 'music.wav'));
const SR = buf.readUInt32LE(24);
const ch = buf.readUInt16LE(22);
let off = 12;
while (buf.toString('ascii', off, off + 4) !== 'data') off += 8 + buf.readUInt32LE(off + 4);
const n = buf.readUInt32LE(off + 4) / (4 * ch);
const data = off + 8;

const w0 = (2 * Math.PI * 135) / SR;
const q = 1.8;
const alpha = Math.sin(w0) / (2 * q);
const b0 = alpha, b1 = 0, b2 = -alpha;
const a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha;
let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

const hop = Math.floor(SR * 0.005);
const dt = hop / SR;
const env = [];
let acc = 0;
for (let i = 0; i < n; i++) {
  let x = 0;
  for (let c = 0; c < ch; c++) x += buf.readFloatLE(data + (i * ch + c) * 4);
  x /= ch;
  const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
  x2 = x1; x1 = x; y2 = y1; y1 = y;
  acc += y * y;
  if ((i + 1) % hop === 0) {
    env.push(Math.sqrt(acc / hop));
    acc = 0;
  }
}

const flux = env.map((v, i) => Math.max(0, v - (env[i - 1] ?? 0)));

let bestLag = Math.round(0.5 / dt);
let bestScore = -1;
for (let lag = Math.round(0.38 / dt); lag <= Math.round(0.62 / dt); lag++) {
  let s = 0;
  for (let i = lag; i < flux.length; i++) s += flux[i] * flux[i - lag];
  if (s > bestScore) {
    bestScore = s;
    bestLag = lag;
  }
}
const period = +(bestLag * dt).toFixed(4);

const barLag = bestLag * 2;
let bestPhase = 0;
let bestComb = -1;
for (let p = 0; p < bestLag; p++) {
  let s = 0;
  for (let i = p; i < flux.length; i += barLag) s += flux[i];
  if (s > bestComb) {
    bestComb = s;
    bestPhase = p;
  }
}
const offset = +Math.max(0, (bestPhase - 1) * dt).toFixed(4);

const sorted = [...flux].sort((p, q) => p - q);
const thr = sorted[Math.floor(sorted.length * 0.96)] * 0.35;
const onsets = [];
for (let i = 1; i < flux.length - 1; i++) {
  if (flux[i] > thr && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1]) {
    const t = +((i - 1) * dt).toFixed(4);
    if (!onsets.length || t - onsets[onsets.length - 1] > period * 0.45) onsets.push(t);
  }
}

const beats = [];
for (let k = 0; offset + k * period < 29.99; k++) {
  beats.push(+(offset + k * period).toFixed(4));
}

// 15 story beats (2.0s each = 15 shots across the 30s timeline) for the contact sheet
const storyBeats = [
  { id: 'B01', t: 0.5,  label: '1A. Hook: PEDIR SOCORRO' },
  { id: 'B02', t: 1.5,  label: '1B. Hook: NÃO PODE' },
  { id: 'B03', t: 2.5,  label: '1C. Hook: ESPERAR. (5 palavras)' },
  { id: 'B04', t: 4.5,  label: '2A. UI Assembly: Peças voando' },
  { id: 'B05', t: 6.5,  label: '2B. UI Assembly: Painel encaixado' },
  { id: 'B06', t: 8.5,  label: '3.1A. Feature 1: Cursor digita 9482=' },
  { id: 'B07', t: 11.2, label: '3.1B. Feature 1: Cursor clica Disfarçar' },
  { id: 'B08', t: 12.8, label: '3.2A. Feature 2: Cursor segura SOS 1,5s' },
  { id: 'B09', t: 13.8, label: '3.2B. Feature 2: ALERTA DISPARADO' },
  { id: 'B10', t: 15.2, label: '3.2C. Feature 2: Cursor copia Autos TJSP' },
  { id: 'B11', t: 17.0, label: '3.3A. Feature 3: SEMP Tático 190 Radar' },
  { id: 'B12', t: 18.8, label: '3.3B. Feature 3: Cursor confirma Viatura 24M' },
  { id: 'B13', t: 21.0, label: '4A. Métrica: 1,5s (10x mais rápido)' },
  { id: 'B14', t: 23.5, label: '4B. Métrica: 62,5% (Pesquisa IFSP)' },
  { id: 'B15', t: 28.0, label: '5. Logo Lockup + CTA SEMP' },
];

const out = {
  bpm: +(60 / period).toFixed(2),
  period,
  offset,
  onsets,
  beats,
  storyBeats,
};
writeFileSync(join(here, 'beats.json'), JSON.stringify(out, null, 2));
console.log(`measured ${out.bpm} BPM, period ${out.period}s, offset ${out.offset}s, ${onsets.length} onsets, ${beats.length} beats`);
