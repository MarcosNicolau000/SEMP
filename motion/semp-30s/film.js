// SEMP 30s Showreel — Pure Function of Time: window.seek(t)
// Obeys motion/AGENTS.md:
// - No CSS transitions, no requestAnimationFrame in render mode, no Math.random
// - Custom spring/overshoot curves (no linear, no generic ease-in-out)
// - Every element uses real Playwright-cropped UI PNGs & real SVG logo

(function () {
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const prog = (t, t0, dur) => clamp((t - t0) / dur, 0, 1);
  const lerp = (a, b, p) => a + (b - a) * p;

  function expOut(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return 1 - Math.pow(2, -10 * p);
  }

  function springSnap(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    return 1 - Math.exp(-6.5 * p) * Math.cos(9.5 * p);
  }

  function beatEnter(t, tBeat, dur = 0.34) {
    return springSnap(prog(t, tBeat - 0.08, dur));
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
      const rSc = lerp(0.35, 1.85, expOut(clickPulse));
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
        const p = expOut(prog(t, a.t, Math.max(0.001, b.t - a.t)));
        return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) };
      }
    }
    const last = pts[pts.length - 1];
    return { x: last.x, y: last.y };
  }

  function pulseAt(t, clickTimes, dur = 0.24) {
    let best = 0;
    for (const ct of clickTimes) {
      if (t >= ct && t <= ct + dur) {
        best = Math.max(best, (t - ct) / dur);
      }
    }
    return best;
  }

  function seek(t) {
    const scenes = ['s1', 's2', 's3a', 's3b', 's3c', 's4', 's5'];
    for (const id of scenes) {
      el(id).style.display = 'none';
    }
    setCursor(0, 0, false, 0);

    // =========================================================================
    // SCENE 1 (0.0s - 4.0s): HOOK — 5 WORDS OF HUGE KINETIC TYPE
    // "PEDIR SOCORRO NÃO PODE ESPERAR."
    // =========================================================================
    if (t < 4.0) {
      el('s1').style.display = 'block';

      const kP = beatEnter(t, 0.0, 0.32);
      el('s1-kicker').style.opacity = clamp(kP, 0, 1).toFixed(3);
      el('s1-kicker').style.transform = `translate3d(0, ${(1 - kP) * 24}px, 0)`;

      const words = [
        ['s1-w1', 0.0],
        ['s1-w2', 0.5],
        ['s1-w3', 1.0],
        ['s1-w4', 1.5],
      ];
      for (const [id, tb] of words) {
        const node = el(id);
        if (t < tb - 0.06) {
          node.style.opacity = '0';
          node.style.transform = 'translate3d(0, 55px, 0) scale(0.84)';
        } else {
          const p = beatEnter(t, tb, 0.34);
          node.style.opacity = '1';
          node.style.transform = `translate3d(0, ${(1 - p) * 48}px, 0) scale(${lerp(0.86, 1, p).toFixed(3)})`;
        }
      }

      const w5Wrap = el('s1-w5-wrap');
      if (t < 1.92) {
        w5Wrap.style.opacity = '0';
        w5Wrap.style.transform = 'translate3d(-60px, 40px, 0) scale(0.78)';
      } else {
        const p5 = beatEnter(t, 2.0, 0.38);
        w5Wrap.style.opacity = '1';
        w5Wrap.style.transform = `translate3d(${(1 - p5) * -45}px, ${(1 - p5) * 30}px, 0) scale(${lerp(0.84, 1, p5).toFixed(3)})`;
      }

      const sb = el('s1-stat-bar');
      if (t < 2.4) {
        sb.style.opacity = '0';
        sb.style.transform = 'translate3d(0, 36px, 0)';
      } else {
        const ps = beatEnter(t, 2.5, 0.38);
        sb.style.opacity = '1';
        sb.style.transform = `translate3d(0, ${(1 - ps) * 32}px, 0)`;
      }

      const gw = el('s1-ghost-wrap');
      const gp = expOut(prog(t, 0.0, 1.4));
      const rot = lerp(11, -3, prog(t, 0, 4));
      const sc = t >= 3.0 ? lerp(1.0, 1.08, expOut(prog(t, 3.0, 0.9))) : lerp(0.9, 1.0, gp);
      gw.style.opacity = lerp(0.32, 0.94, prog(t, 1.2, 2.0)).toFixed(3);
      gw.style.transform = `translate3d(${(1 - gp) * 90}px, ${(1 - gp) * 40}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      return;
    }

    // =========================================================================
    // SCENE 2 (4.0s - 8.0s): THE PRODUCT APPEARS, UI ASSEMBLES PIECE BY PIECE
    // All 5 real cropped pieces start in an exploded 3D layout at 4.0s and lock
    // into the chassis on beats 4.0, 4.5, 5.0, 5.5, 6.0, then focus scan 6.5..7.5s
    // =========================================================================
    if (t < 8.0) {
      el('s2').style.display = 'block';
      const lt = t - 4.0;

      const pHead = beatEnter(t, 4.0, 0.4);
      el('s2-tag').style.transform = `translate3d(0, ${(1 - pHead) * 24}px, 0)`;
      el('s2-title').style.transform = `translate3d(0, ${(1 - pHead) * 34}px, 0)`;
      el('s2-sub').style.transform = `translate3d(0, ${(1 - pHead) * 42}px, 0)`;

      const steps = [
        ['s2-step1', 4.0],
        ['s2-step2', 4.5],
        ['s2-step3', 5.0],
        ['s2-step4', 5.5],
      ];
      for (const [id, tb] of steps) {
        const st = el(id);
        const sp = beatEnter(t, tb, 0.36);
        const active = t >= tb - 0.05;
        st.style.opacity = active ? '1' : '0.42';
        st.style.transform = `translate3d(${active ? (1 - sp) * -18 : -18}px, 0, 0) scale(${active ? lerp(0.96, 1, sp).toFixed(3) : '0.96'})`;
        st.style.borderColor = t >= tb && t < tb + 0.65 ? '#7e22ce' : active ? '#94a3b8' : '#e2e8f0';
      }

      const rig = el('s2-rig');
      const camZoom = t >= 6.5 ? lerp(1.0, 1.07, expOut(prog(t, 6.5, 1.2))) : 1.0;
      const rigRot = t >= 6.5 ? lerp(0, -3.5, expOut(prog(t, 6.5, 1.2))) : lerp(-6, 0, expOut(prog(lt, 0, 2.2)));
      rig.style.transform = `rotate(${rigRot.toFixed(2)}deg) scale(${camZoom.toFixed(3)})`;

      // Piece 1: ui-header.png snaps from (-160, -70, -8deg) at 4.0s
      const p1 = beatEnter(t, 4.0, 0.42);
      el('s2-p-header').style.opacity = '1';
      el('s2-p-header').style.transform = `translate3d(${(1 - p1) * -160}px, ${(1 - p1) * -70}px, 0) rotate(${((1 - p1) * -8).toFixed(2)}deg)`;

      // Piece 2: ui-status-pill.png floats exploded at (+140, -35, +7deg) then snaps in at 4.5s
      const p2 = beatEnter(t, 4.5, 0.42);
      el('s2-p-status').style.opacity = '1';
      el('s2-p-status').style.transform = `translate3d(${(1 - p2) * 140}px, ${(1 - p2) * -35}px, 0) rotate(${((1 - p2) * 7).toFixed(2)}deg)`;

      // Piece 3: ui-sos-idle.png floats exploded at (-190, 10, scale 0.82, -6deg) then snaps in at 5.0s
      const p3 = beatEnter(t, 5.0, 0.46);
      el('s2-p-sos').style.opacity = '1';
      el('s2-p-sos').style.transform = `translate3d(${(1 - p3) * -190}px, ${(1 - p3) * 10}px, 0) scale(${lerp(0.82, 1, p3).toFixed(3)}) rotate(${((1 - p3) * -6).toFixed(2)}deg)`;

      // Piece 4: ui-aviso-card.png floats exploded at (+150, 45, +8deg) then snaps in at 5.5s
      const p4 = beatEnter(t, 5.5, 0.42);
      el('s2-p-aviso').style.opacity = '1';
      el('s2-p-aviso').style.transform = `translate3d(${(1 - p4) * 150}px, ${(1 - p4) * 45}px, 0) rotate(${((1 - p4) * 8).toFixed(2)}deg)`;

      // Piece 5: ui-bottom-nav.png floats exploded at (-120, 95, -5deg) then snaps in at 6.0s
      const p5 = beatEnter(t, 6.0, 0.42);
      el('s2-p-nav').style.opacity = '1';
      el('s2-p-nav').style.transform = `translate3d(${(1 - p5) * -120}px, ${(1 - p5) * 95}px, 0) rotate(${((1 - p5) * -5).toFixed(2)}deg)`;

      // Focus highlight box & badge at 6.5s..8.0s so beats 6.5, 7.0, 7.5 have distinct visual action
      const fb = el('s2-focus-box');
      const fbd = el('s2-focus-badge');
      if (t < 6.4) {
        fb.style.opacity = '0';
        fbd.style.opacity = '0';
      } else {
        const fp = beatEnter(t, 6.5, 0.36);
        fb.style.opacity = '1';
        fbd.style.opacity = '1';
        if (t < 7.0) {
          fb.style.top = '10px';
          fb.style.height = '155px';
          fbd.textContent = 'MÓDULO 01 • DISFARCE & STATUS ATIVO';
          fbd.style.top = '60px';
        } else if (t < 7.5) {
          fb.style.top = '215px';
          fb.style.height = '440px';
          fbd.textContent = 'MÓDULO 02 • NÚCLEO SOS 1,5 SEGUNDO';
          fbd.style.top = '390px';
        } else {
          fb.style.top = '668px';
          fb.style.height = '265px';
          fbd.textContent = 'MÓDULO 03 • REDE 190 & MEDIDA TJSP';
          fbd.style.top = '740px';
        }
        fbd.style.transform = `scale(${lerp(0.9, 1, fp).toFixed(3)})`;
      }
      return;
    }

    // =========================================================================
    // SCENE 3A (8.0s - 12.0s): FEATURE 1 — CAMOUFLAGE CALCULATOR & DISFARÇAR
    // =========================================================================
    if (t < 12.0) {
      el('s3a').style.display = 'block';

      const disp = el('s3a-calc-disp');
      if (t < 8.25) disp.src = 'assets/calc-display-0.png';
      else if (t < 8.50) disp.src = 'assets/calc-display-9.png';
      else if (t < 8.75) disp.src = 'assets/calc-display-94.png';
      else if (t < 9.00) disp.src = 'assets/calc-display-948.png';
      else disp.src = 'assets/calc-display-9482.png';

      // Key highlight box on real keypad (relative to keypad container 398x430)
      const khl = el('s3a-key-hl');
      if (t >= 8.18 && t < 8.45) {
        // Key '9' (col 3, row 2)
        khl.style.opacity = '1';
        khl.style.left = '200px';
        khl.style.top = '86px';
      } else if (t >= 8.45 && t < 8.70) {
        // Key '4' (col 1, row 3)
        khl.style.opacity = '1';
        khl.style.left = '2px';
        khl.style.top = '172px';
      } else if (t >= 8.70 && t < 8.95) {
        // Key '8' (col 2, row 2)
        khl.style.opacity = '1';
        khl.style.left = '101px';
        khl.style.top = '86px';
      } else if (t >= 8.95 && t < 9.40) {
        // Key '2' (col 2, row 4)
        khl.style.opacity = '1';
        khl.style.left = '101px';
        khl.style.top = '258px';
      } else if (t >= 9.40 && t < 9.95) {
        // Key '=' (col 4, row 5)
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

      const enterCalc = beatEnter(t, 8.0, 0.38);
      calcPhone.style.transform = `translate3d(0, ${(1 - enterCalc) * 50}px, 0) scale(${lerp(0.92, 1, enterCalc).toFixed(3)})`;

      if (t < 9.45) {
        appPhone.style.opacity = '0.28';
        appPhone.style.transform = 'translate3d(40px, 20px, 0) scale(0.93)';
        appImg.src = 'assets/screen-calculadora-9482.png';
        badge.textContent = 'DIGITANDO PIN SECRETO: 9482=';
        badge.style.background = '#334155';
      } else if (t < 11.0) {
        const up = beatEnter(t, 9.5, 0.38);
        appPhone.style.opacity = '1';
        appPhone.style.transform = `translate3d(0, ${(1 - up) * 30}px, 0) scale(${lerp(0.92, 1, up).toFixed(3)})`;
        appImg.src = 'assets/screen-sos-idle.png';
        badge.textContent = 'PIN 9482= • PAINEL SEMP DESBLOQUEADO';
        badge.style.background = '#7e22ce';
      } else {
        const dp = beatEnter(t, 11.0, 0.34);
        appPhone.style.opacity = '1';
        appPhone.style.transform = `scale(${lerp(1.06, 1, dp).toFixed(3)})`;
        appImg.src = 'assets/screen-calculadora-coacao.png';
        badge.textContent = 'CLIQUE EM DISFARÇAR • FUGA EM 1 FRAME (1900=)';
        badge.style.background = '#dc2626';
      }

      const pos = moveWaypoints(t, [
        { t: 8.0,  x: 1140, y: 420 },
        { t: 8.22, x: 1070, y: 500 },
        { t: 8.47, x: 880,  y: 585 },
        { t: 8.72, x: 975,  y: 500 },
        { t: 8.97, x: 975,  y: 670 },
        { t: 9.46, x: 1165, y: 760 },
        { t: 10.1, x: 1520, y: 380 },
        { t: 10.95, x: 1655, y: 125 },
        { t: 11.8, x: 1655, y: 125 },
      ]);
      const clickP = pulseAt(t, [8.25, 8.5, 8.75, 9.0, 9.5, 11.0], 0.22);
      setCursor(pos.x, pos.y, true, clickP);
      return;
    }

    // =========================================================================
    // SCENE 3B (12.0s - 16.0s): FEATURE 2 — 1.5s HOLD SOS & MEDIDA PROTETIVA
    // =========================================================================
    if (t < 16.0) {
      el('s3b').style.display = 'block';

      const statusImg = el('s3b-status-img');
      const sosImg = el('s3b-sos-img');
      const timerLabel = el('s3b-timer-label');
      const timerVal = el('s3b-timer-val');
      const timerBar = el('s3b-timer-bar');
      const sosPhone = el('s3b-sos-phone');
      const medidaAutos = el('s3b-medida-autos');

      if (t < 13.5) {
        const holdP = clamp((t - 12.0) / 1.5, 0, 1);
        statusImg.src = 'assets/ui-status-pill.png';
        sosImg.src = holdP > 0.15 ? 'assets/ui-sos-holding.png' : 'assets/ui-sos-idle.png';
        timerLabel.textContent = 'SEGURANDO GATILHO SOS...';
        timerLabel.style.color = '#c084fc';
        timerVal.textContent = `${(holdP * 1.5).toFixed(1).replace('.', ',')}s / 1,5s`;
        timerBar.style.width = `${(holdP * 100).toFixed(1)}%`;
        timerBar.style.background = '#7e22ce';
        const pressScale = lerp(1.0, 0.965, holdP);
        sosPhone.style.transform = `scale(${pressScale.toFixed(3)})`;
      } else {
        const pop = beatEnter(t, 13.5, 0.38);
        statusImg.src = 'assets/ui-status-active.png';
        sosImg.src = 'assets/ui-sos-active.png';
        timerLabel.textContent = 'ALERTA POLICIAL DISPARADO!';
        timerLabel.style.color = '#f87171';
        timerVal.textContent = '1,5s • ATIVO';
        timerBar.style.width = '100%';
        timerBar.style.background = '#dc2626';
        sosPhone.style.transform = `scale(${lerp(1.06, 1.0, pop).toFixed(3)})`;
      }

      if (t < 15.0) {
        medidaAutos.src = 'assets/medida-card-autos.png';
        medidaAutos.style.transform = 'scale(1)';
      } else {
        const cp = beatEnter(t, 15.0, 0.34);
        medidaAutos.src = 'assets/medida-card-copied.png';
        medidaAutos.style.transform = `scale(${lerp(1.05, 1.0, cp).toFixed(3)})`;
      }

      const pos = moveWaypoints(t, [
        { t: 12.0, x: 975,  y: 495 },
        { t: 13.6, x: 975,  y: 495 },
        { t: 14.8, x: 1755, y: 225 },
        { t: 15.9, x: 1755, y: 225 },
      ]);
      const holdPulse = t >= 12.0 && t <= 13.5 ? ((t - 12.0) * 2.5) % 1 : pulseAt(t, [13.5, 15.0], 0.28);
      setCursor(pos.x, pos.y, true, holdPulse);
      return;
    }

    // =========================================================================
    // SCENE 3C (16.0s - 20.0s): FEATURE 3 — CENTRAL 190 SEMP TÁTICO
    // =========================================================================
    if (t < 20.0) {
      el('s3c').style.display = 'block';

      const btnImg = el('s3c-btn-img');
      const phoneImg = el('s3c-phone-img');
      const btnWrap = el('s3c-btn-wrap');
      const rightPhone = el('s3c-right-phone');

      const enterP = beatEnter(t, 16.0, 0.4);
      el('s3c-map-col').style.transform = `translate3d(0, ${(1 - enterP) * 40}px, 0)`;

      if (t < 18.5) {
        btnImg.src = 'assets/tatico-btn-confirmar.png';
        btnWrap.style.transform = 'scale(1)';
        phoneImg.src = 'assets/screen-tatico.png';
        rightPhone.style.transform = 'scale(1)';
      } else {
        const kp = beatEnter(t, 18.5, 0.36);
        btnImg.src = 'assets/tatico-btn-nolocal.png';
        btnWrap.style.transform = `scale(${lerp(1.06, 1.0, kp).toFixed(3)})`;
        phoneImg.src = t >= 19.2 ? 'assets/screen-historico-pdf.png' : 'assets/screen-tatico-nolocal.png';
        rightPhone.style.transform = `scale(${lerp(1.04, 1.0, kp).toFixed(3)})`;
      }

      const pos = moveWaypoints(t, [
        { t: 16.0, x: 1080, y: 360 },
        { t: 17.2, x: 1020, y: 420 },
        { t: 18.4, x: 380,  y: 910 },
        { t: 19.9, x: 380,  y: 910 },
      ]);
      const clickP = pulseAt(t, [17.0, 18.5], 0.28);
      setCursor(pos.x, pos.y, true, clickP);
      return;
    }

    // =========================================================================
    // SCENE 4 (20.0s - 25.0s): ONE NUMBER THAT PROVES IT WORKS: [METRIC]
    // =========================================================================
    if (t < 25.0) {
      el('s4').style.display = 'block';
      const partA = el('s4-partA');
      const partB = el('s4-partB');

      if (t < 22.5) {
        partA.style.display = 'block';
        partB.style.display = 'none';
        const p = beatEnter(t, 20.0, 0.42);
        el('s4-big-num').style.transform = `translate3d(0, ${(1 - p) * 50}px, 0) scale(${lerp(0.82, 1.0, p).toFixed(3)})`;

        // Progressive comparison bars on beats 20.5, 21.0, 21.5
        const pBar1 = expOut(prog(t, 20.3, 0.5));
        const pBar2 = expOut(prog(t, 20.8, 0.8));
        el('s4-bar-semp').style.width = `${lerp(20, 120, pBar1).toFixed(1)}px`;
        el('s4-bar-trad').style.width = `${lerp(20, 680, pBar2).toFixed(1)}px`;

        const pStamp = t < 21.3 ? 0 : beatEnter(t, 21.5, 0.36);
        el('s4-stamp-10x').style.opacity = clamp(pStamp * 1.5, 0, 1).toFixed(3);
        el('s4-stamp-10x').style.transform = `scale(${lerp(0.7, 1.0, pStamp).toFixed(3)})`;

        // Staggered right proof cards on beats 20.5 and 21.0
        const pA1 = beatEnter(t, 20.5, 0.4);
        const pA2 = t < 20.9 ? 0 : beatEnter(t, 21.0, 0.4);
        el('s4-proofA-1').style.transform = `translate3d(${(1 - pA1) * 90}px, 0, 0) rotate(${((1 - pA1) * 5).toFixed(2)}deg)`;
        el('s4-proofA-2').style.opacity = clamp(pA2 * 1.5, 0, 1).toFixed(3);
        el('s4-proofA-2').style.transform = `translate3d(${(1 - pA2) * 90}px, 0, 0)`;
      } else {
        partA.style.display = 'none';
        partB.style.display = 'block';
        const p = beatEnter(t, 22.5, 0.42);
        el('s4-big-pct').style.transform = `translate3d(0, ${(1 - p) * 50}px, 0) scale(${lerp(0.82, 1.0, p).toFixed(3)})`;

        // Staggered proof cards on beats 22.5, 23.0, 23.5, and badge at 24.0
        const pB1 = beatEnter(t, 22.5, 0.38);
        const pB2 = t < 22.9 ? 0 : beatEnter(t, 23.0, 0.38);
        const pB3 = t < 23.4 ? 0 : beatEnter(t, 23.5, 0.38);
        const pZT = t < 23.9 ? 0 : beatEnter(t, 24.0, 0.38);

        el('s4-proofB-1').style.transform = `translate3d(${(1 - pB1) * 90}px, 0, 0)`;
        el('s4-proofB-2').style.opacity = clamp(pB2 * 1.5, 0, 1).toFixed(3);
        el('s4-proofB-2').style.transform = `translate3d(${(1 - pB2) * 90}px, 0, 0)`;
        el('s4-proofB-3').style.opacity = clamp(pB3 * 1.5, 0, 1).toFixed(3);
        el('s4-proofB-3').style.transform = `translate3d(${(1 - pB3) * 90}px, 0, 0)`;
        el('s4-zero-trace').style.opacity = clamp(pZT * 1.5, 0, 1).toFixed(3);
        el('s4-zero-trace').style.transform = `scale(${lerp(0.84, 1.0, pZT).toFixed(3)})`;
      }
      return;
    }

    // =========================================================================
    // SCENE 5 (25.0s - 30.0s): LOGO LOCKUP + [CTA]
    // =========================================================================
    el('s5').style.display = 'block';
    const pLogo = beatEnter(t, 25.0, 0.44);
    el('s5-logo-row').style.transform = `translate3d(0, ${(1 - pLogo) * 35}px, 0) scale(${lerp(0.9, 1, pLogo).toFixed(3)})`;
    el('s5-headline').style.transform = `translate3d(0, ${(1 - pLogo) * 45}px, 0)`;

    const ctaWrap = el('s5-cta-wrap');
    const ctaText = el('s5-cta-text');
    const ctaPill = el('s5-cta-pill');

    if (t < 28.5) {
      const pCta = t < 27.4 ? expOut(prog(t, 25.4, 0.5)) : beatEnter(t, 27.5, 0.4);
      ctaWrap.style.background = '#7e22ce';
      ctaWrap.style.borderColor = '#c084fc';
      ctaText.textContent = 'ACESSE O PROTÓTIPO SEMP';
      ctaPill.textContent = 'IFSP • PICO 2026';
      ctaWrap.style.transform = `scale(${lerp(0.9, 1.0, pCta).toFixed(3)})`;
    } else {
      const pClick = beatEnter(t, 28.5, 0.36);
      ctaWrap.style.background = '#059669';
      ctaWrap.style.borderColor = '#6ee7b7';
      ctaText.textContent = 'PROTEÇÃO ATIVA • SEMP PRONTO';
      ctaPill.textContent = '190 • 1,5s';
      ctaWrap.style.transform = `scale(${lerp(1.08, 1.0, pClick).toFixed(3)})`;
    }

    // 3 hero phones fan out on beats 25.0, 25.5, 26.0, and elevate on 27.0
    const pPhone1 = beatEnter(t, 25.0, 0.45);
    const pPhone2 = t < 25.4 ? 0 : beatEnter(t, 25.5, 0.45);
    const pPhone3 = t < 25.9 ? 0 : beatEnter(t, 26.0, 0.45);
    const floatBoost = t >= 27.0 ? expOut(prog(t, 27.0, 1.2)) * -18 : 0;

    el('s5-p1').style.opacity = clamp(pPhone1 * 1.4, 0, 1).toFixed(3);
    el('s5-p1').style.transform = `translate3d(${(1 - pPhone1) * 110}px, ${(1 - pPhone1) * 60 + floatBoost * 0.6}px, 0) rotate(${lerp(4, -7, pPhone1).toFixed(2)}deg)`;

    el('s5-p2').style.opacity = clamp(pPhone2 * 1.4, 0, 1).toFixed(3);
    el('s5-p2').style.transform = `translate3d(0, ${(1 - pPhone2) * 80 + floatBoost}px, 0) scale(${lerp(0.86, 1.03, pPhone2).toFixed(3)})`;

    el('s5-p3').style.opacity = clamp(pPhone3 * 1.4, 0, 1).toFixed(3);
    el('s5-p3').style.transform = `translate3d(${(1 - pPhone3) * -110}px, ${(1 - pPhone3) * 60 + floatBoost * 0.6}px, 0) rotate(${lerp(-4, 7, pPhone3).toFixed(2)}deg)`;

    if (t >= 27.0) {
      const pos = moveWaypoints(t, [
        { t: 27.0, x: 1420, y: 480 },
        { t: 28.4, x: 420,  y: 785 },
        { t: 29.9, x: 420,  y: 785 },
      ]);
      const clickP = pulseAt(t, [28.5], 0.3);
      setCursor(pos.x, pos.y, true, clickP);
    }
  }

  window.seek = seek;
  seek(0);
})();
