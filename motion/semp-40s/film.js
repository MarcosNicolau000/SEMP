// SEMP 40s Showreel (60 BPM) — Pure Function of Time: window.seek(t)
// Obeys motion/AGENTS.md:
// - No CSS transitions, no requestAnimationFrame in render mode, no Math.random
// - Slow, clean, fluid transitions & spring/quartic curves
// - Every element uses real Playwright-cropped UI PNGs & real SVG logo

(function () {
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const prog = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
  const lerp = (a, b, p) => a + (b - a) * p;

  // Smooth quartic ease-out for slow, clean big-tech motion
  function quartOut(p) {
    const c = clamp(p, 0, 1);
    return 1 - Math.pow(1 - c, 4);
  }

  // Smooth cubic ease-in-out for slow camera & cursor glides
  function smoothIO(p) {
    const c = clamp(p, 0, 1);
    return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
  }

  // Gentle damped spring for UI cards & hero lockups
  function gentleSpring(p) {
    const c = clamp(p, 0, 1);
    if (c <= 0) return 0;
    if (c >= 1) return 1;
    return 1 - Math.exp(-6.0 * c) * Math.cos(7.5 * c);
  }

  // Starts slightly before the beat so the motion is slow & fluid (0.68s),
  // AND at the exact integer beat timestamp t = tBeat it is already ~85% settled and crisp!
  function beatGlide(t, tBeat, dur = 0.68) {
    return gentleSpring(prog(t, tBeat - 0.42, dur));
  }

  const el = (id) => document.getElementById(id);

  function setCursor(x, y, visible, clickPulse = 0) {
    const cur = el('cursor');
    const ring = el('cursor-ring');
    if (!visible) {
      cur.style.opacity = '0';
      ring.style.opacity = '0';
      return;
    }
    const sc = 1 - 0.18 * Math.sin(clickPulse * Math.PI);
    cur.style.opacity = '1';
    cur.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
    if (clickPulse > 0.01 && clickPulse < 0.99) {
      const rSc = lerp(0.35, 1.9, quartOut(clickPulse));
      const rOp = 1 - clickPulse;
      ring.style.opacity = rOp.toFixed(3);
      ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${rSc.toFixed(3)})`;
    } else {
      ring.style.opacity = '0';
    }
  }

  function moveWaypoints(t, pts) {
    if (t <= pts[0].t) return { x: pts[0].x, y: pts[0].y };
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (t <= b.t) {
        const p = smoothIO(prog(t, a.t, Math.max(0.001, b.t - a.t)));
        return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) };
      }
    }
    const last = pts[pts.length - 1];
    return { x: last.x, y: last.y };
  }

  function pulseAt(t, clickTimes, dur = 0.34) {
    let best = 0;
    for (const ct of clickTimes) {
      if (t >= ct - 0.04 && t <= ct + dur) {
        best = Math.max(best, clamp((t - (ct - 0.04)) / dur, 0, 1));
      }
    }
    return best;
  }

  // Smoothly transitions scene container in/out over 0.52s before the cut beat
  // so 60fps video has slow, clean transitions AND integer beats are 100% crisp.
  function applySceneTransition(id, t, tStart, tEnd) {
    const node = el(id);
    const enterLead = tStart > 0 ? 0.52 : 0;
    if (t < tStart - enterLead || t >= tEnd) {
      node.style.display = 'none';
      return false;
    }
    node.style.display = 'block';
    let op = 1;
    let tx = 0;
    let ty = 0;
    let sc = 1;
    if (tStart > 0 && t < tStart) {
      const pIn = quartOut(prog(t, tStart - enterLead, enterLead));
      op = pIn;
      ty = (1 - pIn) * 48;
      sc = lerp(0.965, 1.0, pIn);
    } else if (tEnd < 40.0 && t > tEnd - 0.52) {
      const pOut = smoothIO(prog(t, tEnd - 0.52, 0.52));
      op = 1 - pOut * 0.35;
      tx = -pOut * 36;
      sc = lerp(1.0, 0.975, pOut);
    }
    node.style.opacity = op.toFixed(3);
    node.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
    return true;
  }

  function seek(t) {
    setCursor(0, 0, false, 0);

    // =========================================================================
    // SCENE 1 (0.0s - 6.0s | Beats 0..5): HOOK — 5 WORDS OF HUGE KINETIC TYPE
    // "PEDIR SOCORRO NÃO PODE ESPERAR."
    // =========================================================================
    if (applySceneTransition('s1', t, 0.0, 6.0)) {
      const kP = quartOut(prog(t, 0.0, 0.6));
      el('s1-kicker').style.opacity = '1';
      el('s1-kicker').style.transform = `translate3d(0, ${(1 - kP) * 20}px, 0)`;

      // 5 words enter on Beats 0, 1, 2, 3, 4 with slow 0.68s glide
      const words = [
        ['s1-w1', 0.0],
        ['s1-w2', 1.0],
        ['s1-w3', 2.0],
        ['s1-w4', 3.0],
      ];
      for (const [id, tb] of words) {
        const node = el(id);
        if (tb === 0.0) {
          const p0 = quartOut(prog(t, 0.0, 0.55));
          node.style.opacity = '1';
          node.style.transform = `translate3d(0, ${(1 - p0) * 22}px, 0) scale(${lerp(0.94, 1, p0).toFixed(3)})`;
        } else if (t < tb - 0.42) {
          node.style.opacity = '0';
          node.style.transform = 'translate3d(0, 56px, 0) scale(0.86)';
        } else {
          const p = beatGlide(t, tb, 0.68);
          node.style.opacity = clamp(p * 1.35, 0, 1).toFixed(3);
          node.style.transform = `translate3d(0, ${(1 - p) * 48}px, 0) scale(${lerp(0.88, 1, p).toFixed(3)})`;
        }
      }

      const w5Wrap = el('s1-w5-wrap');
      if (t < 3.58) {
        w5Wrap.style.opacity = '0';
        w5Wrap.style.transform = 'translate3d(-50px, 44px, 0) scale(0.82)';
      } else {
        const p5 = beatGlide(t, 4.0, 0.72);
        w5Wrap.style.opacity = clamp(p5 * 1.4, 0, 1).toFixed(3);
        w5Wrap.style.transform = `translate3d(${(1 - p5) * -42}px, ${(1 - p5) * 34}px, 0) scale(${lerp(0.85, 1, p5).toFixed(3)})`;
      }

      // Beat 5 (5.0s): IFSP 62,5% bar glides in smoothly
      const sb = el('s1-stat-bar');
      if (t < 4.55) {
        sb.style.opacity = '0';
        sb.style.transform = 'translate3d(0, 42px, 0)';
      } else {
        const ps = beatGlide(t, 5.0, 0.72);
        sb.style.opacity = clamp(ps * 1.4, 0, 1).toFixed(3);
        sb.style.transform = `translate3d(0, ${(1 - ps) * 38}px, 0)`;
      }

      // Right dual phones: Calculator in front at Beat 0, slowly fans open across Beats 1..5 to reveal SOS 190
      const calcP = el('s1-calc-phone');
      const sosP = el('s1-sos-phone');
      const cap = el('s1-phone-caption');
      const fan = smoothIO(prog(t, 0.6, 3.2));
      calcP.style.transform = `translate3d(${lerp(90, -35, fan).toFixed(1)}px, ${lerp(0, 18, fan).toFixed(1)}px, 0) rotate(${lerp(2, -6, fan).toFixed(2)}deg) scale(${lerp(0.98, 0.93, fan).toFixed(3)})`;
      sosP.style.opacity = lerp(0.35, 1.0, smoothIO(prog(t, 0.8, 2.2))).toFixed(3);
      sosP.style.transform = `translate3d(${lerp(-40, 22, fan).toFixed(1)}px, ${lerp(20, -10, fan).toFixed(1)}px, 0) rotate(${lerp(-2, 4.5, fan).toFixed(2)}deg) scale(${lerp(0.9, 1.0, fan).toFixed(3)})`;
      cap.style.opacity = clamp(prog(t, 0.8, 0.8), 0, 1).toFixed(3);
    }

    // =========================================================================
    // SCENE 2 (6.0s - 13.0s | Beats 6..12): PRODUCT APPEARS & UI ASSEMBLES
    // =========================================================================
    if (applySceneTransition('s2', t, 6.0, 13.0)) {
      const pHead = beatGlide(t, 6.0, 0.75);
      el('s2-tag').style.transform = `translate3d(0, ${(1 - pHead) * 24}px, 0)`;
      el('s2-title').style.transform = `translate3d(0, ${(1 - pHead) * 34}px, 0)`;
      el('s2-sub').style.transform = `translate3d(0, ${(1 - pHead) * 42}px, 0)`;

      const steps = [
        ['s2-step1', 6.0],
        ['s2-step2', 7.0],
        ['s2-step3', 8.0],
        ['s2-step4', 9.0],
        ['s2-step5', 10.0],
      ];
      for (const [id, tb] of steps) {
        const st = el(id);
        const sp = beatGlide(t, tb, 0.7);
        const active = t >= tb - 0.15;
        st.style.opacity = active ? '1' : '0.38';
        st.style.transform = `translate3d(${active ? (1 - sp) * -22 : -22}px, 0, 0) scale(${active ? lerp(0.96, 1, sp).toFixed(3) : '0.96'})`;
        st.style.borderColor = t >= tb - 0.1 && t < tb + 0.9 ? '#7e22ce' : active ? '#94a3b8' : '#e2e8f0';
      }

      const rig = el('s2-rig');
      const camZoom = t >= 10.6 ? lerp(1.0, 1.06, smoothIO(prog(t, 10.6, 1.4))) : 1.0;
      const rigRot = t >= 10.6 ? lerp(0, -2.5, smoothIO(prog(t, 10.6, 1.4))) : lerp(-6, 0, smoothIO(prog(t, 6.0, 4.0)));
      rig.style.transform = `rotate(${rigRot.toFixed(2)}deg) scale(${camZoom.toFixed(3)})`;

      // 5 real cropped pieces start in an exploded 3D architectural layout and glide in on Beats 6, 7, 8, 9, 10
      const p1 = beatGlide(t, 6.0, 0.75);
      el('s2-p-header').style.transform = `translate3d(${(1 - p1) * -170}px, ${(1 - p1) * -75}px, 0) rotate(${((1 - p1) * -8).toFixed(2)}deg)`;

      const p2 = beatGlide(t, 7.0, 0.78);
      el('s2-p-status').style.transform = `translate3d(${(1 - p2) * 155}px, ${(1 - p2) * -40}px, 0) rotate(${((1 - p2) * 7).toFixed(2)}deg)`;

      const p3 = beatGlide(t, 8.0, 0.82);
      el('s2-p-sos').style.transform = `translate3d(${(1 - p3) * -200}px, ${(1 - p3) * 15}px, 0) scale(${lerp(0.82, 1, p3).toFixed(3)}) rotate(${((1 - p3) * -6).toFixed(2)}deg)`;

      const p4 = beatGlide(t, 9.0, 0.78);
      el('s2-p-aviso').style.transform = `translate3d(${(1 - p4) * 165}px, ${(1 - p4) * 50}px, 0) rotate(${((1 - p4) * 8).toFixed(2)}deg)`;

      const p5 = beatGlide(t, 10.0, 0.78);
      el('s2-p-nav').style.transform = `translate3d(${(1 - p5) * -130}px, ${(1 - p5) * 105}px, 0) rotate(${((1 - p5) * -5).toFixed(2)}deg)`;

      // Beats 11 (11.0s) & 12 (12.0s): Smooth guided highlight scan
      const fb = el('s2-focus-box');
      const fbd = el('s2-focus-badge');
      if (t < 10.55) {
        fb.style.opacity = '0';
        fbd.style.opacity = '0';
      } else {
        const fp = beatGlide(t, 11.0, 0.65);
        fb.style.opacity = clamp(fp * 1.4, 0, 1).toFixed(3);
        fbd.style.opacity = clamp(fp * 1.4, 0, 1).toFixed(3);
        const scan = smoothIO(prog(t, 11.2, 0.75));
        fb.style.top = `${lerp(18, 665, scan).toFixed(1)}px`;
        fb.style.height = `${lerp(635, 268, scan).toFixed(1)}px`;
        fbd.style.top = `${lerp(310, 740, scan).toFixed(1)}px`;
        fbd.textContent =
          t < 11.6
            ? 'CAMADA 01 • DISFARCE IMEDIATO & NÚCLEO SOS 1,5s'
            : 'CAMADA 02 • REDE DE APOIO, MEDIDA TJSP & PROVAS';
      }
    }

    // =========================================================================
    // SCENE 3A (13.0s - 19.0s | Beats 13..18): FEATURE 1 — CAMOUFLAGE CALCULATOR
    // =========================================================================
    if (applySceneTransition('s3a', t, 13.0, 19.0)) {
      const disp = el('s3a-calc-disp');
      if (t < 12.95) disp.src = 'assets/calc-display-0.png';
      else if (t < 13.45) disp.src = 'assets/calc-display-9.png';
      else if (t < 13.95) disp.src = 'assets/calc-display-94.png';
      else if (t < 14.45) disp.src = 'assets/calc-display-948.png';
      else disp.src = 'assets/calc-display-9482.png';

      const khl = el('s3a-key-hl');
      if (t >= 12.9 && t < 13.42) {
        // Key '9'
        khl.style.opacity = '1';
        khl.style.left = '200px';
        khl.style.top = '86px';
      } else if (t >= 13.42 && t < 13.92) {
        // Key '4'
        khl.style.opacity = '1';
        khl.style.left = '2px';
        khl.style.top = '172px';
      } else if (t >= 13.92 && t < 14.42) {
        // Key '8'
        khl.style.opacity = '1';
        khl.style.left = '101px';
        khl.style.top = '86px';
      } else if (t >= 14.42 && t < 14.88) {
        // Key '2'
        khl.style.opacity = '1';
        khl.style.left = '101px';
        khl.style.top = '258px';
      } else if (t >= 14.88 && t < 15.6) {
        // Key '='
        khl.style.opacity = '1';
        khl.style.left = '298px';
        khl.style.top = '344px';
      } else {
        khl.style.opacity = '0';
      }

      const calcPhone = el('s3a-calc-phone');
      const appPhone = el('s3a-app-phone');
      const appImg = el('s3a-app-img');
      const badge = el('s3a-action-badge');
      const coacaoCrop = el('s3a-coacao-crop');

      const enterCalc = beatGlide(t, 13.0, 0.72);
      calcPhone.style.transform = `translate3d(0, ${(1 - enterCalc) * 45}px, 0) scale(${lerp(0.93, 1, enterCalc).toFixed(3)})`;

      if (t < 14.9) {
        appPhone.style.opacity = '0.28';
        appPhone.style.transform = 'translate3d(36px, 20px, 0) scale(0.93)';
        appImg.src = 'assets/screen-calculadora-9482.png';
        badge.textContent = t < 13.9 ? 'PASSO 1 • DIGITANDO PIN SECRETO: 94...' : 'PASSO 1 • DIGITANDO PIN SECRETO: 9482';
        badge.style.background = '#334155';
        coacaoCrop.style.opacity = '0';
      } else if (t < 16.9) {
        const up = beatGlide(t, 15.0, 0.72);
        appPhone.style.opacity = '1';
        appPhone.style.transform = `translate3d(0, ${(1 - up) * 28}px, 0) scale(${lerp(0.93, 1, up).toFixed(3)})`;
        appImg.src = 'assets/screen-sos-idle.png';
        badge.textContent = t < 15.8 ? 'PIN 9482= • PAINEL SEMP DESBLOQUEADO!' : 'PERIGO? CURSOR VAI AO BOTÃO DISFARÇAR';
        badge.style.background = '#7e22ce';
        coacaoCrop.style.opacity = '0';
      } else {
        const dp = beatGlide(t, 17.0, 0.68);
        appPhone.style.opacity = '1';
        appPhone.style.transform = `scale(${lerp(1.05, 1, dp).toFixed(3)})`;
        appImg.src = 'assets/screen-calculadora-coacao.png';
        badge.textContent =
          t < 17.8
            ? 'CLIQUE EM DISFARÇAR • VOLTA À CALCULADORA!'
            : 'PIN 1900= • SOCORRO SILENCIOSO (MEMÓRIA OK)';
        badge.style.background = '#dc2626';

        if (t >= 17.55) {
          const cp = beatGlide(t, 18.0, 0.7);
          coacaoCrop.style.opacity = clamp(cp * 1.4, 0, 1).toFixed(3);
          coacaoCrop.style.transform = `translate3d(0, ${(1 - cp) * 32}px, 0) scale(${lerp(0.9, 1, cp).toFixed(3)})`;
        } else {
          coacaoCrop.style.opacity = '0';
        }
      }

      if (t >= 12.8 && t < 18.5) {
        const pos = moveWaypoints(t, [
          { t: 12.8, x: 1065, y: 500 }, // Key '9' at 13.0s
          { t: 13.1, x: 1065, y: 500 },
          { t: 13.45, x: 878, y: 585 }, // Key '4' at 13.5s
          { t: 13.95, x: 972, y: 500 }, // Key '8' at 14.0s
          { t: 14.45, x: 972, y: 670 }, // Key '2' at 14.5s
          { t: 14.95, x: 1162, y: 760 }, // Key '=' at 15.0s
          { t: 15.35, x: 1162, y: 760 },
          { t: 16.0, x: 1650, y: 125 }, // Hover 'Disfarçar' on Beat 16 (16.0s)
          { t: 17.0, x: 1650, y: 125 }, // Click 'Disfarçar' on Beat 17 (17.0s)
          { t: 18.0, x: 380, y: 880 },  // Point at Memória OK crop on Beat 18 (18.0s)
        ]);
        const clickP = pulseAt(t, [13.0, 13.5, 14.0, 14.5, 15.0, 17.0], 0.32);
        setCursor(pos.x, pos.y, true, clickP);
      }
    }

    // =========================================================================
    // SCENE 3B (19.0s - 24.0s | Beats 19..23): FEATURE 2 — 1.5s HOLD SOS & MEDIDA
    // =========================================================================
    if (applySceneTransition('s3b', t, 19.0, 24.0)) {
      const statusImg = el('s3b-status-img');
      const sosImg = el('s3b-sos-img');
      const timerLabel = el('s3b-timer-label');
      const timerVal = el('s3b-timer-val');
      const timerBar = el('s3b-timer-bar');
      const sosPhone = el('s3b-sos-phone');
      const medidaCol = el('s3b-medida-col');
      const medidaAutos = el('s3b-medida-autos');

      if (t < 20.9) {
        const holdP = clamp((t - 18.7) / 2.2, 0.18, 0.96);
        statusImg.src = 'assets/ui-status-pill.png';
        sosImg.src = 'assets/ui-sos-holding.png';
        timerLabel.textContent = 'SEGURANDO GATILHO SOS...';
        timerLabel.style.color = '#c084fc';
        timerVal.textContent = `${(holdP * 1.5).toFixed(1).replace('.', ',')}s / 1,5s`;
        timerBar.style.width = `${(holdP * 100).toFixed(1)}%`;
        timerBar.style.background = '#7e22ce';
        const pressScale = lerp(1.0, 0.96, holdP);
        sosPhone.style.transform = `scale(${pressScale.toFixed(3)})`;
      } else {
        const pop = beatGlide(t, 21.0, 0.68);
        statusImg.src = 'assets/ui-status-active.png';
        sosImg.src = 'assets/ui-sos-active.png';
        timerLabel.textContent = 'ALERTA POLICIAL 190 DISPARADO!';
        timerLabel.style.color = '#f87171';
        timerVal.textContent = '1,5s • ATIVO';
        timerBar.style.width = '100%';
        timerBar.style.background = '#dc2626';
        sosPhone.style.transform = `scale(${lerp(1.05, 1.0, pop).toFixed(3)})`;
      }

      // Medida column emphasizes on Beat 22 (22.0s) and copies on Beat 23 (23.0s)
      const mFocus = t >= 21.6 ? smoothIO(prog(t, 21.6, 0.6)) : 0;
      medidaCol.style.transform = `translate3d(0, ${(1 - mFocus) * 18}px, 0) scale(${lerp(0.96, 1.02, mFocus).toFixed(3)})`;

      if (t < 22.9) {
        medidaAutos.src = 'assets/medida-card-autos.png';
        medidaAutos.style.transform = 'scale(1)';
      } else {
        const cp = beatGlide(t, 23.0, 0.65);
        medidaAutos.src = 'assets/medida-card-copied.png';
        medidaAutos.style.transform = `scale(${lerp(1.05, 1.0, cp).toFixed(3)})`;
      }

      if (t >= 18.8 && t < 23.6) {
        const pos = moveWaypoints(t, [
          { t: 18.8, x: 970, y: 495 }, // Press & hold SOS center (Beats 19, 20, 21)
          { t: 21.2, x: 970, y: 495 },
          { t: 22.0, x: 1755, y: 222 }, // Glide to Copy Process Number on Beat 22
          { t: 23.5, x: 1755, y: 222 }, // Click Copy on Beat 23
        ]);
        const holdPulse =
          t >= 18.9 && t < 20.9
            ? ((t - 18.9) * 1.8) % 1
            : pulseAt(t, [21.0, 23.0], 0.36);
        setCursor(pos.x, pos.y, true, holdPulse);
      }
    }

    // =========================================================================
    // SCENE 3C (24.0s - 29.0s | Beats 24..28): FEATURE 3 — CENTRAL 190 TÁTICO
    // =========================================================================
    if (applySceneTransition('s3c', t, 24.0, 29.0)) {
      const btnImg = el('s3c-btn-img');
      const phoneImg = el('s3c-phone-img');
      const btnWrap = el('s3c-btn-wrap');
      const rightPhone = el('s3c-right-phone');
      const mapImg = el('s3c-map-img');

      const enterP = beatGlide(t, 24.0, 0.72);
      el('s3c-map-col').style.transform = `translate3d(0, ${(1 - enterP) * 36}px, 0)`;

      // Beat 25 (25.0s): highlight radar map
      const mapZoom = t >= 24.6 && t < 26.4 ? lerp(1.0, 1.035, smoothIO(prog(t, 24.6, 0.6))) : 1.0;
      mapImg.style.transform = `scale(${mapZoom.toFixed(3)})`;
      mapImg.style.borderColor = t >= 24.6 && t < 26.4 ? '#ef4444' : '#334155';

      if (t < 26.9) {
        btnImg.src = 'assets/tatico-btn-confirmar.png';
        btnWrap.style.transform = t >= 25.6 ? 'scale(1.03)' : 'scale(1)';
        phoneImg.src = 'assets/screen-tatico.png';
        rightPhone.style.transform = 'scale(1)';
      } else {
        const kp = beatGlide(t, 27.0, 0.68);
        btnImg.src = 'assets/tatico-btn-nolocal.png';
        btnWrap.style.transform = `scale(${lerp(1.06, 1.0, kp).toFixed(3)})`;
        phoneImg.src = t >= 27.85 ? 'assets/screen-historico-pdf.png' : 'assets/screen-tatico-nolocal.png';
        rightPhone.style.transform = `scale(${lerp(1.04, 1.0, kp).toFixed(3)})`;
      }

      if (t >= 23.8 && t < 28.6) {
        const pos = moveWaypoints(t, [
          { t: 24.0, x: 1040, y: 340 }, // Radar 300m on Beat 24
          { t: 25.0, x: 380, y: 740 },  // Live Audio AES-256 on Beat 25
          { t: 26.0, x: 380, y: 905 },  // Hover Confirmar Viatura on Beat 26
          { t: 27.0, x: 380, y: 905 },  // Click Confirmar Viatura on Beat 27
          { t: 28.0, x: 1605, y: 520 }, // Point to ICP-Brasil PDF Dossier on Beat 28
        ]);
        const clickP = pulseAt(t, [25.0, 27.0, 28.0], 0.36);
        setCursor(pos.x, pos.y, true, clickP);
      }
    }

    // =========================================================================
    // SCENE 4 (29.0s - 34.0s | Beats 29..33): ONE NUMBER THAT PROVES IT WORKS
    // =========================================================================
    if (applySceneTransition('s4', t, 29.0, 34.0)) {
      const partA = el('s4-partA');
      const partB = el('s4-partB');

      if (t < 30.85) {
        partA.style.display = 'block';
        partB.style.display = 'none';
        const p = beatGlide(t, 29.0, 0.75);
        el('s4-big-num').style.transform = `translate3d(0, ${(1 - p) * 45}px, 0) scale(${lerp(0.84, 1.0, p).toFixed(3)})`;

        const pBar1 = quartOut(prog(t, 28.7, 0.8));
        const pBar2 = quartOut(prog(t, 29.2, 1.1));
        el('s4-bar-semp').style.width = `${lerp(24, 120, pBar1).toFixed(1)}px`;
        el('s4-bar-trad').style.width = `${lerp(24, 680, pBar2).toFixed(1)}px`;

        const pStamp = beatGlide(t, 30.0, 0.68);
        el('s4-stamp-10x').style.opacity = clamp(pStamp * 1.4, 0, 1).toFixed(3);
        el('s4-stamp-10x').style.transform = `scale(${lerp(0.78, 1.0, pStamp).toFixed(3)})`;

        const pA1 = beatGlide(t, 29.0, 0.72);
        const pA2 = beatGlide(t, 30.0, 0.72);
        el('s4-proofA-1').style.transform = `translate3d(${(1 - pA1) * 80}px, 0, 0) rotate(${((1 - pA1) * 4).toFixed(2)}deg)`;
        el('s4-proofA-2').style.opacity = clamp(pA2 * 1.4, 0, 1).toFixed(3);
        el('s4-proofA-2').style.transform = `translate3d(${(1 - pA2) * 80}px, 0, 0)`;
      } else {
        partA.style.display = 'none';
        partB.style.display = 'block';
        const p = beatGlide(t, 31.0, 0.75);
        el('s4-big-pct').style.transform = `translate3d(0, ${(1 - p) * 45}px, 0) scale(${lerp(0.84, 1.0, p).toFixed(3)})`;

        const pB1 = beatGlide(t, 31.0, 0.7);
        const pB2 = beatGlide(t, 32.0, 0.7);
        const pB3 = beatGlide(t, 33.0, 0.7);

        el('s4-proofB-1').style.transform = `translate3d(${(1 - pB1) * 85}px, 0, 0)`;
        el('s4-proofB-2').style.opacity = clamp(pB2 * 1.4, 0, 1).toFixed(3);
        el('s4-proofB-2').style.transform = `translate3d(${(1 - pB2) * 85}px, 0, 0)`;
        el('s4-proofB-3').style.opacity = clamp(pB3 * 1.4, 0, 1).toFixed(3);
        el('s4-proofB-3').style.transform = `translate3d(${(1 - pB3) * 85}px, 0, 0)`;
        el('s4-zero-trace').style.opacity = clamp(pB3 * 1.4, 0, 1).toFixed(3);
        el('s4-zero-trace').style.transform = `scale(${lerp(0.86, 1.0, pB3).toFixed(3)})`;
      }
    }

    // =========================================================================
    // SCENE 5 (34.0s - 40.0s | Beats 34..39): VERY BIG LOGO AND TITLE WITH
    // PURPLE GRADIENT BACKGROUND FILLING ALL SCREEN
    // =========================================================================
    if (applySceneTransition('s5', t, 34.0, 40.0)) {
      const pLogo = beatGlide(t, 34.0, 0.75);
      el('s5-big-logo').style.transform = `translate3d(0, ${(1 - pLogo) * 35}px, 0) scale(${lerp(0.88, 1.0, pLogo).toFixed(3)})`;
      el('s5-big-title').style.transform = `translate3d(${(1 - pLogo) * 30}px, 0, 0) scale(${lerp(0.9, 1.0, pLogo).toFixed(3)})`;

      const pSub = beatGlide(t, 34.4, 0.7);
      el('s5-big-subtitle').style.opacity = clamp(pSub * 1.4, 0.7, 1).toFixed(3);
      el('s5-headline').style.opacity = clamp(pSub * 1.4, 0.7, 1).toFixed(3);
      el('s5-headline').style.transform = `translate3d(0, ${(1 - pSub) * 26}px, 0)`;
      el('s5-sub').style.opacity = clamp(pSub * 1.4, 0.65, 1).toFixed(3);

      // 3 hero phones fan out smoothly across Beats 35, 36, 37, and float on 38..39
      const pPhone1 = beatGlide(t, 34.8, 0.78);
      const pPhone2 = beatGlide(t, 35.6, 0.78);
      const pPhone3 = beatGlide(t, 36.4, 0.78);
      const floatBoost = t >= 37.5 ? smoothIO(prog(t, 37.5, 1.8)) * -20 : 0;

      el('s5-p1').style.opacity = clamp(pPhone1 * 1.35, 0, 1).toFixed(3);
      el('s5-p1').style.transform = `translate3d(${(1 - pPhone1) * 90}px, ${(1 - pPhone1) * 60 + floatBoost * 0.6}px, 0) rotate(${lerp(4, -7, pPhone1).toFixed(2)}deg)`;

      el('s5-p2').style.opacity = clamp(pPhone2 * 1.35, 0, 1).toFixed(3);
      el('s5-p2').style.transform = `translate3d(0, ${(1 - pPhone2) * 75 + floatBoost}px, 0) scale(${lerp(0.86, 1.03, pPhone2).toFixed(3)})`;

      el('s5-p3').style.opacity = clamp(pPhone3 * 1.35, 0, 1).toFixed(3);
      el('s5-p3').style.transform = `translate3d(${(1 - pPhone3) * -90}px, ${(1 - pPhone3) * 60 + floatBoost * 0.6}px, 0) rotate(${lerp(-4, 7, pPhone3).toFixed(2)}deg)`;

      const ctaWrap = el('s5-cta-wrap');
      const ctaText = el('s5-cta-text');
      const ctaPill = el('s5-cta-pill');
      const pCta = beatGlide(t, 37.0, 0.72);

      if (t < 37.9) {
        ctaWrap.style.opacity = clamp(pCta * 1.4, 0.2, 1).toFixed(3);
        ctaWrap.style.background = '#0f172a';
        ctaWrap.style.borderColor = '#ffffff';
        ctaText.textContent = 'ACESSE O PROTÓTIPO SEMP';
        ctaPill.textContent = 'IFSP • PICO 2026';
        ctaWrap.style.transform = `scale(${lerp(0.9, 1.0, pCta).toFixed(3)})`;
      } else {
        const pClick = beatGlide(t, 38.0, 0.65);
        ctaWrap.style.opacity = '1';
        ctaWrap.style.background = '#059669';
        ctaWrap.style.borderColor = '#fde047';
        ctaText.textContent = 'PROTEÇÃO ATIVA • SEMP PRONTO';
        ctaPill.textContent = '190 • 1,5s';
        ctaWrap.style.transform = `scale(${lerp(1.07, 1.0, pClick).toFixed(3)})`;
      }

      if (t >= 36.6) {
        const pos = moveWaypoints(t, [
          { t: 36.6, x: 1360, y: 460 },
          { t: 37.8, x: 410, y: 895 },
          { t: 39.9, x: 410, y: 895 },
        ]);
        const clickP = pulseAt(t, [38.0], 0.4);
        setCursor(pos.x, pos.y, true, clickP);
      }
    }
  }

  window.seek = seek;
  seek(0);
})();
