// SEMP 30s Showreel Score + SFX, synthesized in code (no samples).
// 120 BPM (0.5s beat), 15 bars of 2.0s = 30.0s total.
// Writes:
//   out/music.wav  music stem only (used by beats.mjs to measure the beat grid)
//   out/mix.wav    music + UI clicks & whooshes on the beat (normalized to -14 LUFS by render.mjs)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, 'out');
mkdirSync(OUT, { recursive: true });

const SR = 48000;
const DUR = 30;
const N = SR * DUR;
const BEAT = 0.5;
const TAU = Math.PI * 2;

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(19009482);
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const drums = bus();
const bass = bus();
const pad = bus();
const lead = bus();
const sfx = bus();
const verbSend = bus();
const delaySend = bus();

function put(b, i, v, pan = 0) {
  if (i < 0 || i >= N) return;
  b.L[i] += v * Math.cos(((pan + 1) * Math.PI) / 4) * 1.414;
  b.R[i] += v * Math.sin(((pan + 1) * Math.PI) / 4) * 1.414;
}

function biquad(type, f, q) {
  const w = (TAU * Math.min(f, SR * 0.45)) / SR;
  const c = Math.cos(w);
  const s = Math.sin(w);
  const a = s / (2 * q);
  let b0, b1, b2;
  if (type === 'lp') [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (type === 'hp') [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [a, 0, -a];
  const a0 = 1 + a;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: (-2 * c) / a0, a2: (1 - a) / a0 };
}
function filt() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, k) => {
    const y = k.b0 * x + k.b1 * x1 + k.b2 * x2 - k.a1 * y1 - k.a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

// ---------- instruments ----------
function kick(t0, g = 1) {
  const n = Math.floor(0.48 * SR);
  let ph = 0;
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const f = 45 + 125 * Math.exp(-t / 0.026);
    ph += (TAU * f) / SR;
    const env = Math.exp(-t / 0.19) * Math.min(1, t / 0.0014);
    const click = noise() * Math.exp(-t / 0.0022) * 0.26;
    put(drums, i0 + k, (Math.sin(ph) * env * 0.95 + click) * g);
  }
}

function clap(t0, g = 1, pan = 0) {
  const n = Math.floor(0.28 * SR);
  const f = filt();
  const k1 = biquad('bp', 1350, 0.9);
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    let env = Math.exp(-t / 0.1);
    for (const o of [0, 0.009, 0.018]) if (t >= o) env += Math.exp(-(t - o) / 0.006) * 0.8;
    const v = f(noise(), k1) * env * 0.9 + Math.sin(TAU * 190 * t) * Math.exp(-t / 0.04) * 0.25;
    put(drums, i0 + k, v * g, pan);
    put(verbSend, i0 + k, v * g * 0.22, pan);
  }
}

function hat(t0, g = 1, open = false, pan = 0.25) {
  const n = Math.floor((open ? 0.2 : 0.055) * SR);
  const f = filt();
  const k1 = biquad('hp', 7600, 0.8);
  const i0 = Math.floor(t0 * SR);
  const d = open ? 0.075 : 0.016;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    put(drums, i0 + k, f(noise(), k1) * Math.exp(-t / d) * 0.5 * g, pan);
  }
}

function bassNote(t0, dur, m, g = 1) {
  const n = Math.floor((dur + 0.04) * SR);
  const f1 = mtof(m);
  const lp = filt();
  const i0 = Math.floor(t0 * SR);
  let p1 = 0, p2 = 0, p3 = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    p1 += f1 / SR; p2 += (f1 * 1.006) / SR; p3 += f1 / 2 / SR;
    const saw = (2 * (p1 % 1) - 1 + 2 * (p2 % 1) - 1) * 0.5;
    const cut = 250 + 1550 * Math.exp(-t / 0.065);
    const v = lp(saw, biquad('lp', cut, 1.15));
    const env = Math.min(1, t / 0.004) * (t > dur ? Math.exp(-(t - dur) / 0.012) : 1);
    put(bass, i0 + k, (v * 0.55 + Math.sin(TAU * p3) * 0.5) * env * g);
  }
}

function padChord(t0, dur, notes, g = 1, cutA = 900, cutB = 1800) {
  const n = Math.floor((dur + 0.5) * SR);
  const i0 = Math.floor(t0 * SR);
  const voices = [];
  for (const m of notes)
    for (const det of [-0.1, 0, 0.11])
      voices.push({ f: mtof(m) * Math.pow(2, det / 12), p: rnd(), pan: det * 5 });
  const lpL = filt(), lpR = filt(), lpL2 = filt(), lpR2 = filt();
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    let l = 0, r = 0;
    for (const v of voices) {
      v.p += v.f / SR;
      const s = 2 * (v.p % 1) - 1;
      l += s * (1 - v.pan) * 0.5;
      r += s * (1 + v.pan) * 0.5;
    }
    const cut = cutA + (cutB - cutA) * Math.min(1, t / dur);
    const kq = biquad('lp', cut, 0.7);
    l = lpL2(lpL(l, kq), kq);
    r = lpR2(lpR(r, kq), kq);
    const env = Math.min(1, t / 0.1) * (t > dur ? Math.exp(-(t - dur) / 0.16) : 1);
    const a = (env * g * 0.08) / Math.sqrt(notes.length);
    if (i0 + k < N) {
      pad.L[i0 + k] += l * a;
      pad.R[i0 + k] += r * a;
      verbSend.L[i0 + k] += l * a * 0.28;
      verbSend.R[i0 + k] += r * a * 0.28;
    }
  }
}

function pluck(t0, m, g = 1, pan = 0) {
  const n = Math.floor(0.28 * SR);
  const f = mtof(m);
  const lp = filt();
  const i0 = Math.floor(t0 * SR);
  let p = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    p += f / SR;
    const sq = (p % 1 < 0.34 ? 1 : -1) * 0.6 + (2 * (p % 1) - 1) * 0.4;
    const v = lp(sq, biquad('lp', 650 + 5200 * Math.exp(-t / 0.048), 1.4)) * Math.exp(-t / 0.085) * Math.min(1, t / 0.002);
    put(lead, i0 + k, v * g * 0.32, pan);
    put(delaySend, i0 + k, v * g * 0.12, pan);
  }
}

// ---------- SFX ----------
function riser(t0, t1, g = 1, f0 = 300, f1 = 7000) {
  const n = Math.floor((t1 - t0) * SR);
  const bp = filt();
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const p = k / n;
    const f = f0 * Math.pow(f1 / f0, p);
    ph += (TAU * (180 * Math.pow(6, p))) / SR;
    const v = bp(noise(), biquad('bp', f, 2.2)) * 1.4 + Math.sin(ph) * 0.12;
    const a = p * p * g;
    put(sfx, i0 + k, v * a, Math.sin(p * 9) * 0.4);
    put(verbSend, i0 + k, v * a * 0.3);
  }
}

function whoosh(t0, dur, g = 1, up = false, pan = 0) {
  const n = Math.floor(dur * SR);
  const bp = filt();
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const p = k / n;
    const f = up ? 380 * Math.pow(12, p) : 4800 * Math.pow(0.1, p);
    const a = Math.sin(Math.PI * Math.pow(p, up ? 1.5 : 0.6)) * g;
    put(sfx, i0 + k, bp(noise(), biquad('bp', f, 1.3)) * a * 1.1, pan * (p * 2 - 1));
  }
}

function impact(t0, g = 1) {
  const n = Math.floor(1.5 * SR);
  const lp = filt();
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    ph += (TAU * (33 + 62 * Math.exp(-t / 0.085))) / SR;
    const sub = Math.sin(ph) * Math.exp(-t / 0.5);
    const nz = lp(noise(), biquad('lp', 220 + 4800 * Math.exp(-t / 0.05), 0.7)) * Math.exp(-t / 0.24);
    const v = (sub * 0.9 + nz * 0.7) * g;
    put(sfx, i0 + k, v);
    put(verbSend, i0 + k, nz * g * 0.55);
  }
}

function uiClick(t0, g = 1, pitch = 1, pan = 0) {
  const n = Math.floor(0.055 * SR);
  const hp = filt();
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const v =
      hp(noise(), biquad('hp', 2600, 0.8)) * Math.exp(-t / 0.0038) * 0.65 +
      Math.sin(TAU * 1750 * pitch * t) * Math.exp(-t / 0.016) * 0.38 +
      Math.sin(TAU * 190 * pitch * t) * Math.exp(-t / 0.018) * 0.42;
    put(sfx, i0 + k, v * g, pan);
  }
}

function ping(t0, g = 1, base = 1046.5) {
  const n = Math.floor(1.2 * SR);
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const v =
      (Math.sin(TAU * base * t) * Math.exp(-t / 0.45) +
        Math.sin(TAU * base * 2.003 * t) * Math.exp(-t / 0.25) * 0.5 +
        Math.sin(TAU * base * 3.01 * t) * Math.exp(-t / 0.1) * 0.25) *
      Math.min(1, t / 0.002);
    put(sfx, i0 + k, v * 0.35 * g);
    put(verbSend, i0 + k, v * 0.25 * g);
  }
}

// ---------- 15-bar (30s) 120 BPM arrangement ----------
// Every beat (0.0, 0.5, 1.0 ... 29.5) gets a solid 4-on-the-floor kick in music.wav
// so beats.mjs measures an exact 120.00 BPM grid across all 60 beats.
const CH = {
  Am: { root: 45, pad: [57, 60, 64, 69], arp: [69, 72, 76, 81] },
  F:  { root: 41, pad: [53, 57, 60, 65], arp: [65, 69, 72, 77] },
  C:  { root: 36, pad: [55, 60, 64, 67], arp: [67, 72, 76, 79] },
  G:  { root: 43, pad: [55, 59, 62, 67], arp: [67, 71, 74, 79] },
  Dm: { root: 38, pad: [50, 53, 57, 62], arp: [62, 65, 69, 74] },
  Em: { root: 40, pad: [52, 55, 59, 64], arp: [64, 67, 71, 76] },
};

const PROG = [
  'Am', 'F',       // 0-4s:   Part 1 Hook (5 words)
  'C',  'G',       // 4-8s:   Part 2 UI Assembly piece by piece
  'Am', 'F',       // 8-12s:  Part 3 Feature 1 (Camouflage Calculator 9482= & Disfarçar)
  'Dm', 'Em',      // 12-16s: Part 3 Feature 2 (1.5s Hold SOS & Medida Protetiva)
  'Am', 'C',       // 16-20s: Part 3 Feature 3 (SEMP Tático 190 & Viatura no Local)
  'F',  'G', 'Am', // 20-26s: Part 4 Metric (1,5s & 62,5%)
  'F',  'Am',      // 26-30s: Part 5 Logo Lockup + CTA
];

const kicks = [];
const K = (t, g = 1) => {
  kick(t, g);
  kicks.push(t);
};

for (let bar = 0; bar < 15; bar++) {
  const t0 = bar * 2;
  const c = CH[PROG[bar]];

  // Pad progression
  const cutStart = bar < 2 ? 450 : bar === 6 ? 600 : 1200;
  const cutEnd = bar < 2 ? 1600 : bar === 6 ? 3400 : 2400;
  padChord(t0, 1.95, c.pad, bar === 14 ? 1.15 : 1.0, cutStart, cutEnd);

  // Four-on-the-floor kick on every 0.5s beat across all 15 bars
  for (let b = 0; b < 4; b++) {
    const bt = t0 + b * BEAT;
    const gain = bar === 14 && b >= 2 ? 0.85 : 1.0;
    K(bt, gain);
  }

  // Claps on beats 2 and 4 (0.5s and 1.5s of each bar)
  if (bar >= 1 && bar <= 13) {
    clap(t0 + 0.5, 0.78, -0.12);
    clap(t0 + 1.5, 0.78, 0.12);
  }

  // 16th hi-hats & offbeat bass
  for (let s = 0; s < 16; s++) {
    const t = t0 + s * 0.125;
    if (bar >= 1 && bar <= 13) {
      if (s % 4 === 2) hat(t, 0.88, true, 0.28);
      else hat(t, s % 2 ? 0.42 : 0.28, false, -0.22);
    } else {
      if (s % 2 === 0) hat(t, 0.35, false, 0.15);
    }
  }

  // Offbeat driving synth bass
  for (let b = 0; b < 4; b++) {
    bassNote(t0 + b * BEAT + 0.25, 0.2, c.root, bar === 0 ? 0.8 : 1.0);
    if (b % 2 === 1 && bar >= 2 && bar <= 13) {
      bassNote(t0 + b * BEAT + 0.375, 0.1, c.root + 12, 0.62);
    }
  }

  // Melodic synth lead arpeggio in active sections
  if (bar >= 2 && bar <= 13) {
    const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
    for (let s = 0; s < 16; s++) {
      if (bar === 6 && s < 8) continue; // tension space during SOS hold start
      const note = c.arp[pattern[s % 8]];
      pluck(t0 + s * 0.125, note, s % 4 === 0 ? 0.95 : 0.65, s % 2 ? 0.35 : -0.35);
    }
  }
  if (bar === 14) {
    // Finale chord arpeggio + resolve
    for (const [i, m] of [69, 72, 76, 81, 88].entries()) {
      pluck(t0 + i * 0.125, m, 0.9, (i % 2 ? 0.35 : -0.35));
    }
    bassNote(t0, 1.5, 33, 0.95);
  }
}

// ---------- Picture-synced SFX on the 120 BPM beat grid ----------
// 1. HOOK (0.0s - 4.0s): 5 kinetic words on beats 0.0, 0.5, 1.0, 1.5, 2.0
impact(0.0, 1.0);
whoosh(0.0, 0.22, 0.6, true, -0.5);
uiClick(0.5, 0.85, 0.95, -0.2);
uiClick(1.0, 0.85, 1.05, 0.2);
uiClick(1.5, 0.9, 1.12, 0.4);
riser(1.2, 2.0, 0.65, 280, 5200);
impact(2.0, 1.15); // "ESPERAR." slam
ping(2.5, 0.55, 880); // 62,5% IFSP badge pop
whoosh(3.75, 0.28, 0.85, true, 0.6);

// 2. PRODUCT APPEARS & UI ASSEMBLES PIECE BY PIECE (4.0s - 8.0s)
impact(4.0, 0.9);
for (const [i, bt] of [4.0, 4.5, 5.0, 5.5, 6.0].entries()) {
  whoosh(bt - 0.08, 0.18, 0.65, true, (i % 2 ? 0.5 : -0.5));
  uiClick(bt, 0.95, 0.95 + i * 0.08, (i % 2 ? 0.3 : -0.3));
}
ping(6.5, 0.65, 1318.5); // UI assembly lock complete
uiClick(7.0, 0.7, 1.2, -0.2);
uiClick(7.5, 0.7, 1.3, 0.2);
whoosh(7.75, 0.26, 0.8, false, -0.7);

// 3A. FEATURE 1: Camouflage Calculator 9-4-8-2-= & Disfarçar (8.0s - 12.0s)
impact(8.0, 0.8);
for (const [i, bt] of [8.25, 8.5, 8.75, 9.0, 9.5].entries()) {
  uiClick(bt, 1.0, 1.0 + i * 0.06, 0.25);
}
ping(9.5, 0.65, 1046.5); // Unlock /app!
whoosh(9.85, 0.22, 0.75, true, 0.4);
uiClick(11.0, 1.05, 1.25, 0.5); // Cursor clicks "Disfarçar"
whoosh(11.0, 0.2, 0.7, false, -0.5);
ping(11.5, 0.5, 1568); // Coercion "Memória OK" reveal

// 3B. FEATURE 2: 1.5s Hold SOS Trigger & Medida Protetiva (12.0s - 16.0s)
uiClick(12.0, 0.95, 0.9, 0.0); // Cursor presses SOS button at 12.0s
riser(12.0, 13.5, 0.85, 240, 8200); // 1.5s hold (12.0 -> 13.5s)
impact(13.5, 1.25); // ALERTA POLICIAL DISPARADO at 13.5s!
ping(13.5, 0.85, 1046.5);
whoosh(14.0, 0.24, 0.75, true, -0.4);
uiClick(14.5, 0.85, 1.1, -0.3);
uiClick(15.0, 1.0, 1.3, 0.35); // Cursor clicks Copy Process Number on Medida card
ping(15.0, 0.55, 1760);
whoosh(15.75, 0.26, 0.85, true, 0.7);

// 3C. FEATURE 3: SEMP Tático 190 & Confirmar Viatura no Local (16.0s - 20.0s)
impact(16.0, 1.0);
uiClick(16.5, 0.8, 1.05, -0.4);
uiClick(17.0, 0.8, 1.15, 0.4);
ping(17.5, 0.5, 1318.5);
uiClick(18.5, 1.1, 1.2, 0.0); // Cursor clicks "Confirmar Chegada da Viatura no Local"
impact(18.5, 0.95);
ping(18.5, 0.8, 1568); // "Viatura 24M no Local" green confirmation
whoosh(19.72, 0.28, 0.9, true, 0.0);

// 4. METRIC: 1,5s & 62,5% (20.0s - 25.0s)
impact(20.0, 1.2);
ping(20.0, 0.75, 1046.5);
uiClick(20.5, 0.75, 1.15, -0.3);
uiClick(21.0, 0.75, 1.25, 0.3);
whoosh(22.25, 0.25, 0.8, true, 0.5);
impact(22.5, 1.05); // 62,5% IFSP stat slam
ping(22.5, 0.65, 1318.5);
uiClick(23.5, 0.8, 1.2, -0.2);
riser(24.0, 25.0, 0.7, 350, 6400);

// 5. LOGO LOCKUP + CTA (25.0s - 30.0s)
impact(25.0, 1.25);
whoosh(25.0, 0.3, 0.75, true, 0.0);
uiClick(25.5, 0.8, 1.05, -0.4);
uiClick(26.0, 0.8, 1.12, 0.0);
uiClick(26.5, 0.8, 1.2, 0.4);
impact(27.5, 1.1); // Final CTA lockup
ping(27.5, 0.85, 1046.5);
ping(28.0, 0.65, 1318.5);
uiClick(28.5, 0.85, 1.3, 0.0);

// ---------- buses: sidechain, delay, reverb, master ----------
kicks.sort((a, b) => a - b);
const duck = new Float32Array(N).fill(1);
for (const tk of kicks) {
  const i0 = Math.floor(tk * SR);
  for (let k = 0; k < SR * 0.38 && i0 + k < N; k++) {
    duck[i0 + k] = Math.min(duck[i0 + k], 1 - 0.72 * Math.exp(-k / SR / 0.1));
  }
}
for (const b of [pad, bass, lead]) {
  for (let i = 0; i < N; i++) {
    b.L[i] *= duck[i];
    b.R[i] *= duck[i];
  }
}

const dl = Math.floor(0.375 * SR);
for (let i = dl; i < N; i++) {
  delaySend.L[i] += delaySend.R[i - dl] * 0.36;
  delaySend.R[i] += delaySend.L[i - dl] * 0.36;
}

function reverb(inp, offs) {
  const out = new Float32Array(N);
  for (const d0 of [1557, 1617, 1491, 1422]) {
    const d = Math.floor(((d0 + offs) * SR) / 44100);
    const buf = new Float32Array(d);
    let idx = 0, lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      lp = y * 0.6 + lp * 0.4;
      buf[idx] = inp[i] + lp * 0.82;
      out[i] += y * 0.25;
      idx = (idx + 1) % d;
    }
  }
  for (const d0 of [225, 556]) {
    const d = Math.floor(((d0 + offs) * SR) / 44100);
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[idx];
      const x = out[i];
      buf[idx] = x + b * 0.5;
      out[i] = b - x * 0.5;
      idx = (idx + 1) % d;
    }
  }
  return out;
}
const vL = reverb(verbSend.L, 0);
const vR = reverb(verbSend.R, 23);

function render(withSfx) {
  const L = new Float32Array(N), R = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let l = drums.L[i] * 0.9 + bass.L[i] * 0.8 + pad.L[i] + lead.L[i] * 0.8 + delaySend.L[i] * 0.58 + vL[i] * 0.34;
    let r = drums.R[i] * 0.9 + bass.R[i] * 0.8 + pad.R[i] + lead.R[i] * 0.8 + delaySend.R[i] * 0.58 + vR[i] * 0.34;
    if (withSfx) {
      l += sfx.L[i] * 0.85;
      r += sfx.R[i] * 0.85;
    }
    const tail = Math.min(1, (DUR - i / SR) / 0.45);
    L[i] = Math.tanh(l * 0.9) * tail;
    R[i] = Math.tanh(r * 0.9) * tail;
  }
  return [L, R];
}

function writeWav(path, [L, R]) {
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const gain = 0.89 / peak;
  const buf = Buffer.alloc(44 + N * 8);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 8, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 8, 28); buf.writeUInt16LE(8, 32); buf.writeUInt16LE(32, 34);
  buf.write('data', 36); buf.writeUInt32LE(N * 8, 40);
  for (let i = 0; i < N; i++) {
    buf.writeFloatLE(L[i] * gain, 44 + i * 8);
    buf.writeFloatLE(R[i] * gain, 48 + i * 8);
  }
  writeFileSync(path, buf);
}

writeWav(join(OUT, 'music.wav'), render(false));
writeWav(join(OUT, 'mix.wav'), render(true));
console.log('wrote 30s out/music.wav and out/mix.wav;', kicks.length, 'kicks');
