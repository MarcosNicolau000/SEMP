// SEMP 40s Showreel Score + SFX, synthesized in code (no samples).
// 60 BPM (1.0s beat), 10 bars of 4.0s = 40.0s total.
// Writes:
//   out/music.wav  music stem only (used by beats.mjs to measure the 60 BPM beat grid)
//   out/mix.wav    music + UI clicks & whooshes on the beat (normalized to -14 LUFS by render.mjs)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, 'out');
mkdirSync(OUT, { recursive: true });

const SR = 48000;
const DUR = 40;
const N = SR * DUR;
const BEAT = 1.0; // 60 BPM -> 1.0s per beat
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
  const n = Math.floor(0.62 * SR);
  let ph = 0;
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const f = 44 + 130 * Math.exp(-t / 0.028);
    ph += (TAU * f) / SR;
    const env = Math.exp(-t / 0.24) * Math.min(1, t / 0.0015);
    const click = noise() * Math.exp(-t / 0.0024) * 0.28;
    put(drums, i0 + k, (Math.sin(ph) * env * 0.96 + click) * g);
  }
}

function snareRim(t0, g = 1, pan = 0) {
  const n = Math.floor(0.32 * SR);
  const f = filt();
  const k1 = biquad('bp', 1450, 1.0);
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    let env = Math.exp(-t / 0.11);
    for (const o of [0, 0.01, 0.019]) if (t >= o) env += Math.exp(-(t - o) / 0.006) * 0.75;
    const v = f(noise(), k1) * env * 0.85 + Math.sin(TAU * 185 * t) * Math.exp(-t / 0.045) * 0.25;
    put(drums, i0 + k, v * g, pan);
    put(verbSend, i0 + k, v * g * 0.26, pan);
  }
}

function hat(t0, g = 1, open = false, pan = 0.22) {
  const n = Math.floor((open ? 0.24 : 0.06) * SR);
  const f = filt();
  const k1 = biquad('hp', 7800, 0.8);
  const i0 = Math.floor(t0 * SR);
  const d = open ? 0.085 : 0.018;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    put(drums, i0 + k, f(noise(), k1) * Math.exp(-t / d) * 0.48 * g, pan);
  }
}

function bassNote(t0, dur, m, g = 1) {
  const n = Math.floor((dur + 0.08) * SR);
  const f1 = mtof(m);
  const lp = filt();
  const i0 = Math.floor(t0 * SR);
  let p1 = 0, p2 = 0, p3 = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    p1 += f1 / SR; p2 += (f1 * 1.005) / SR; p3 += f1 / 2 / SR;
    const saw = (2 * (p1 % 1) - 1 + 2 * (p2 % 1) - 1) * 0.5;
    const cut = 220 + 1350 * Math.exp(-t / 0.12);
    const v = lp(saw, biquad('lp', cut, 1.1));
    const env = Math.min(1, t / 0.008) * (t > dur ? Math.exp(-(t - dur) / 0.025) : 1);
    put(bass, i0 + k, (v * 0.52 + Math.sin(TAU * p3) * 0.52) * env * g);
  }
}

function padChord(t0, dur, notes, g = 1, cutA = 800, cutB = 1900) {
  const n = Math.floor((dur + 0.6) * SR);
  const i0 = Math.floor(t0 * SR);
  const voices = [];
  for (const m of notes)
    for (const det of [-0.09, 0, 0.1])
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
    const kq = biquad('lp', cut, 0.72);
    l = lpL2(lpL(l, kq), kq);
    r = lpR2(lpR(r, kq), kq);
    const env = Math.min(1, t / 0.25) * (t > dur ? Math.exp(-(t - dur) / 0.24) : 1);
    const a = (env * g * 0.085) / Math.sqrt(notes.length);
    if (i0 + k < N) {
      pad.L[i0 + k] += l * a;
      pad.R[i0 + k] += r * a;
      verbSend.L[i0 + k] += l * a * 0.32;
      verbSend.R[i0 + k] += r * a * 0.32;
    }
  }
}

function pluck(t0, m, g = 1, pan = 0) {
  const n = Math.floor(0.42 * SR);
  const f = mtof(m);
  const lp = filt();
  const i0 = Math.floor(t0 * SR);
  let p = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    p += f / SR;
    const sq = (p % 1 < 0.36 ? 1 : -1) * 0.55 + (2 * (p % 1) - 1) * 0.45;
    const v = lp(sq, biquad('lp', 600 + 4800 * Math.exp(-t / 0.065), 1.35)) * Math.exp(-t / 0.12) * Math.min(1, t / 0.003);
    put(lead, i0 + k, v * g * 0.3, pan);
    put(delaySend, i0 + k, v * g * 0.14, pan);
  }
}

// ---------- SFX ----------
function riser(t0, t1, g = 1, f0 = 280, f1 = 6200) {
  const n = Math.floor((t1 - t0) * SR);
  const bp = filt();
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const p = k / n;
    const f = f0 * Math.pow(f1 / f0, p);
    ph += (TAU * (160 * Math.pow(5, p))) / SR;
    const v = bp(noise(), biquad('bp', f, 2.1)) * 1.3 + Math.sin(ph) * 0.11;
    const a = p * p * g;
    put(sfx, i0 + k, v * a, Math.sin(p * 8) * 0.35);
    put(verbSend, i0 + k, v * a * 0.32);
  }
}

function whoosh(t0, dur, g = 1, up = false, pan = 0) {
  const n = Math.floor(dur * SR);
  const bp = filt();
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const p = k / n;
    const f = up ? 340 * Math.pow(11, p) : 4400 * Math.pow(0.11, p);
    const a = Math.sin(Math.PI * Math.pow(p, up ? 1.4 : 0.65)) * g;
    put(sfx, i0 + k, bp(noise(), biquad('bp', f, 1.25)) * a * 1.05, pan * (p * 2 - 1));
  }
}

function impact(t0, g = 1) {
  const n = Math.floor(1.6 * SR);
  const lp = filt();
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    ph += (TAU * (32 + 60 * Math.exp(-t / 0.09))) / SR;
    const sub = Math.sin(ph) * Math.exp(-t / 0.55);
    const nz = lp(noise(), biquad('lp', 210 + 4400 * Math.exp(-t / 0.055), 0.7)) * Math.exp(-t / 0.26);
    const v = (sub * 0.92 + nz * 0.65) * g;
    put(sfx, i0 + k, v);
    put(verbSend, i0 + k, nz * g * 0.52);
  }
}

function uiClick(t0, g = 1, pitch = 1, pan = 0) {
  const n = Math.floor(0.06 * SR);
  const hp = filt();
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const v =
      hp(noise(), biquad('hp', 2500, 0.8)) * Math.exp(-t / 0.004) * 0.62 +
      Math.sin(TAU * 1720 * pitch * t) * Math.exp(-t / 0.017) * 0.38 +
      Math.sin(TAU * 185 * pitch * t) * Math.exp(-t / 0.02) * 0.42;
    put(sfx, i0 + k, v * g, pan);
  }
}

function ping(t0, g = 1, base = 1046.5) {
  const n = Math.floor(1.35 * SR);
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const v =
      (Math.sin(TAU * base * t) * Math.exp(-t / 0.5) +
        Math.sin(TAU * base * 2.002 * t) * Math.exp(-t / 0.28) * 0.48 +
        Math.sin(TAU * base * 3.008 * t) * Math.exp(-t / 0.12) * 0.22) *
      Math.min(1, t / 0.003);
    put(sfx, i0 + k, v * 0.34 * g);
    put(verbSend, i0 + k, v * 0.28 * g);
  }
}

// ---------- 10-bar (40s) 60 BPM arrangement ----------
// Each bar is 4 beats = 4.0 seconds (10 bars * 4.0s = 40.0s).
// Every 1.0s beat (0.0, 1.0, 2.0 ... 39.0) gets a solid kick in music.wav
// so beats.mjs measures an exact 60.00 BPM grid across all 40 beats.
const CH = {
  Am: { root: 45, pad: [57, 60, 64, 69], arp: [69, 72, 76, 81] },
  F:  { root: 41, pad: [53, 57, 60, 65], arp: [65, 69, 72, 77] },
  C:  { root: 36, pad: [55, 60, 64, 67], arp: [67, 72, 76, 79] },
  G:  { root: 43, pad: [55, 59, 62, 67], arp: [67, 71, 74, 79] },
  Dm: { root: 38, pad: [50, 53, 57, 62], arp: [62, 65, 69, 74] },
  Em: { root: 40, pad: [52, 55, 59, 64], arp: [64, 67, 71, 76] },
};

const PROG = [
  'Am', // 0-4s:   Act 1 Hook (words 1..4)
  'F',  // 4-8s:   Act 1 Hook (word 5 + IFSP) -> Act 2 UI Assembly start (beats 6, 7)
  'C',  // 8-12s:  Act 2 UI Assembly pieces 3..5 & focus tour
  'G',  // 12-16s: Act 3 Feature 1 (Calculator 9-4-8-2-= unlocks at 15s)
  'Am', // 16-20s: Act 3 Feature 1 (Disfarçar at 17s) -> Feature 2 SOS hold starts at 19s
  'Dm', // 20-24s: Act 3 Feature 2 (SOS fires at 21s, Medida TJSP copied at 23s)
  'Em', // 24-28s: Act 3 Feature 3 (SEMP Tático 190 radar, Viatura confirmada at 27s)
  'F',  // 28-32s: Act 4 Metric 1,5s (29s) & 62,5% IFSP (31s)
  'G',  // 32-36s: Act 4 Proof -> Act 5 Purple Gradient Giant Logo & Title at 34s
  'Am', // 36-40s: Act 5 Hero Finale + CTA click at 38s
];

const kicks = [];
const K = (t, g = 1) => {
  kick(t, g);
  kicks.push(t);
};

for (let bar = 0; bar < 10; bar++) {
  const t0 = bar * 4.0;
  const c = CH[PROG[bar]];

  // Smooth cinematic pad chord across the 4s bar
  const cutStart = bar === 0 ? 500 : bar === 5 ? 700 : 1100;
  const cutEnd = bar === 0 ? 1500 : bar === 5 ? 2900 : 2300;
  padChord(t0, 3.9, c.pad, bar >= 8 ? 1.15 : 1.0, cutStart, cutEnd);

  // 60 BPM pulse kick on every 1.0s beat (4 beats per bar = 40 beats total)
  for (let b = 0; b < 4; b++) {
    const bt = t0 + b * BEAT;
    const gain = bar === 9 && b === 3 ? 0.88 : 1.0;
    K(bt, gain);

    // Warm synth bass on every beat + gentle offbeat pulse at +0.5s
    bassNote(bt, 0.42, c.root, bar === 0 ? 0.82 : 0.96);
    if (bar >= 1 && bar <= 8) {
      bassNote(bt + 0.5, 0.35, c.root + 12, 0.52);
    }
  }

  // Rim/clap on beats 2 and 4 (t0 + 1.0s and t0 + 3.0s)
  if (bar >= 1 && bar <= 8) {
    snareRim(t0 + 1.0, 0.65, -0.12);
    snareRim(t0 + 3.0, 0.65, 0.12);
  }

  // Gentle 8th/16th hi-hats (0.25s subdivisions at 60 BPM)
  for (let s = 0; s < 16; s++) {
    const t = t0 + s * 0.25;
    if (bar >= 1 && bar <= 8) {
      if (s % 4 === 2) hat(t, 0.68, true, 0.24);
      else hat(t, s % 2 ? 0.34 : 0.22, false, -0.2);
    } else {
      if (s % 2 === 0) hat(t, 0.28, false, 0.15);
    }
  }

  // Clean big-tech melodic arpeggio (0.25s steps = 16th notes at 60 BPM)
  if (bar >= 1 && bar <= 8) {
    const pattern = [0, 1, 2, 3, 2, 1, 3, 2];
    for (let s = 0; s < 16; s++) {
      const t = t0 + s * 0.25;
      if (t >= 19.0 && t < 20.8) continue; // tension space during 1.5s SOS hold
      const note = c.arp[pattern[s % 8]];
      pluck(t, note, s % 4 === 0 ? 0.88 : 0.58, s % 2 ? 0.32 : -0.32);
    }
  }
  if (bar === 9) {
    // Finale warm resolution arpeggio
    for (const [i, m] of [69, 72, 76, 81, 84, 88].entries()) {
      pluck(t0 + i * 0.25, m, 0.85, i % 2 ? 0.32 : -0.32);
    }
    bassNote(t0 + 2.0, 1.8, 33, 0.92);
  }
}

// ---------- Picture-synced SFX on the 60 BPM (1.0s) beat grid ----------
// ACT 1: HOOK (0.0s - 6.0s) — 5 kinetic words on beats 0, 1, 2, 3, 4 + stat on beat 5
impact(0.0, 0.95);
whoosh(0.0, 0.38, 0.65, true, -0.4);
uiClick(1.0, 0.85, 0.96, -0.2);
whoosh(1.0, 0.32, 0.5, true, 0.2);
uiClick(2.0, 0.88, 1.04, 0.15);
uiClick(3.0, 0.9, 1.12, 0.3);
riser(3.1, 4.0, 0.65, 260, 4800);
impact(4.0, 1.15); // Beat 4: "ESPERAR." slam
ping(5.0, 0.6, 880); // Beat 5: 62,5% IFSP research bar
whoosh(5.65, 0.42, 0.82, true, 0.5);

// ACT 2: PRODUCT APPEARS & UI ASSEMBLES PIECE BY PIECE (6.0s - 13.0s)
impact(6.0, 0.9);
for (const [i, bt] of [6.0, 7.0, 8.0, 9.0, 10.0].entries()) {
  whoosh(bt - 0.15, 0.3, 0.65, true, i % 2 ? 0.45 : -0.45);
  uiClick(bt, 0.95, 0.95 + i * 0.07, i % 2 ? 0.25 : -0.25);
}
ping(10.0, 0.65, 1318.5); // Beat 10: All 5 pieces locked in
uiClick(11.0, 0.78, 1.18, -0.2); // Beat 11: Focus scan top/center
uiClick(12.0, 0.78, 1.26, 0.2);  // Beat 12: Focus scan bottom
whoosh(12.65, 0.42, 0.8, false, -0.5);

// ACT 3A: FEATURE 1 — Camouflage Calculator 9-4-8-2-= & Disfarçar (13.0s - 18.5s)
impact(13.0, 0.82);
for (const [i, bt] of [13.0, 13.5, 14.0, 14.5, 15.0].entries()) {
  uiClick(bt, 1.0, 1.0 + i * 0.06, 0.2);
}
ping(15.0, 0.7, 1046.5); // Beat 15: "=" clicked -> /app unlocked!
whoosh(15.0, 0.35, 0.72, true, 0.35);
uiClick(16.0, 0.75, 1.12, 0.35); // Beat 16: Cursor targets "Disfarçar"
uiClick(17.0, 1.05, 1.28, 0.45); // Beat 17: Cursor clicks "Disfarçar" -> Coercion mode
whoosh(17.0, 0.32, 0.75, false, -0.45);
ping(18.0, 0.58, 1568); // Beat 18: "Memória OK" 1900= zero-trace highlight
whoosh(18.3, 0.38, 0.8, true, -0.4);

// ACT 3B: FEATURE 2 — 1.5s Hold SOS Trigger & Medida Protetiva (18.5s - 24.0s)
uiClick(19.0, 0.95, 0.9, 0.0); // Beat 19: Cursor presses SOS button
riser(19.0, 21.0, 0.85, 240, 7600); // Smooth hold charge -> fires on Beat 21
uiClick(20.0, 0.8, 1.08, 0.0); // Beat 20: Holding pulse
impact(21.0, 1.25); // Beat 21: ALERTA POLICIAL DISPARADO!
ping(21.0, 0.85, 1046.5);
whoosh(22.0, 0.35, 0.72, true, 0.35); // Beat 22: Medida Protetiva TJSP glides in
uiClick(23.0, 1.02, 1.32, 0.35); // Beat 23: Cursor clicks Copy Process Number
ping(23.0, 0.6, 1760);
whoosh(23.65, 0.42, 0.85, true, 0.55);

// ACT 3C: FEATURE 3 — SEMP Tático 190 & Confirmar Viatura no Local (24.0s - 29.0s)
impact(24.0, 0.98);
uiClick(25.0, 0.82, 1.08, 0.15); // Beat 25: Radar 300m & Escuta AES-256 focus
uiClick(26.0, 0.82, 1.16, -0.2); // Beat 26: Cursor targets Confirmar Viatura button
uiClick(27.0, 1.12, 1.24, 0.0);  // Beat 27: Cursor clicks Confirmar Chegada da Viatura!
impact(27.0, 0.95);
ping(27.0, 0.82, 1568); // Viatura 24M no Local green confirmation
uiClick(28.0, 0.88, 1.3, 0.35);  // Beat 28: Dossiê PDF ICP-Brasil reveal
whoosh(28.65, 0.42, 0.88, true, 0.0);

// ACT 4: ONE NUMBER THAT PROVES IT WORKS: 1,5s & 62,5% (29.0s - 34.0s)
impact(29.0, 1.2); // Beat 29: Monumental "1,5s"
ping(29.0, 0.78, 1046.5);
uiClick(30.0, 0.85, 1.2, 0.25); // Beat 30: "10x MAIS RÁPIDO" comparison lock
whoosh(30.7, 0.38, 0.8, true, 0.45);
impact(31.0, 1.08); // Beat 31: "62,5%" IFSP Research reveal
ping(31.0, 0.68, 1318.5);
uiClick(32.0, 0.82, 1.18, 0.25); // Beat 32: Cropped PINs + Coercion proof
uiClick(33.0, 0.85, 1.28, -0.2); // Beat 33: Zero rastro visual stamp
riser(33.0, 34.0, 0.75, 320, 6200);

// ACT 5: VERY BIG LOGO AND TITLE WITH PURPLE GRADIENT FILLING ALL SCREEN (34.0s - 40.0s)
impact(34.0, 1.25); // Beat 34: Full-screen purple gradient + Giant Logo & SEMP Title
whoosh(34.0, 0.45, 0.82, true, 0.0);
ping(34.0, 0.85, 1046.5);
uiClick(35.0, 0.82, 1.1, 0.0);  // Beat 35: Subtitle & tagline lock
uiClick(36.0, 0.85, 1.18, 0.3); // Beat 36: 3 real product screens glide in
uiClick(37.0, 0.85, 1.24, -0.2); // Beat 37: Giant CTA button lock
uiClick(38.0, 1.1, 1.32, 0.0);  // Beat 38: Cursor clicks CTA -> "PROTEÇÃO ATIVA"
impact(38.0, 1.05);
ping(38.0, 0.88, 1318.5);
ping(39.0, 0.7, 1568); // Beat 39: Final heroic chime

// ---------- buses: sidechain, delay, reverb, master ----------
kicks.sort((a, b) => a - b);
const duck = new Float32Array(N).fill(1);
for (const tk of kicks) {
  const i0 = Math.floor(tk * SR);
  for (let k = 0; k < SR * 0.42 && i0 + k < N; k++) {
    duck[i0 + k] = Math.min(duck[i0 + k], 1 - 0.68 * Math.exp(-k / SR / 0.11));
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
  delaySend.L[i] += delaySend.R[i - dl] * 0.35;
  delaySend.R[i] += delaySend.L[i - dl] * 0.35;
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
    let l = drums.L[i] * 0.9 + bass.L[i] * 0.82 + pad.L[i] + lead.L[i] * 0.78 + delaySend.L[i] * 0.56 + vL[i] * 0.35;
    let r = drums.R[i] * 0.9 + bass.R[i] * 0.82 + pad.R[i] + lead.R[i] * 0.78 + delaySend.R[i] * 0.56 + vR[i] * 0.35;
    if (withSfx) {
      l += sfx.L[i] * 0.86;
      r += sfx.R[i] * 0.86;
    }
    const tail = Math.min(1, (DUR - i / SR) / 0.5);
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
console.log('wrote 40s 60-BPM out/music.wav and out/mix.wav;', kicks.length, 'kicks');
