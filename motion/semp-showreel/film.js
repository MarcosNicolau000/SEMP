// SEMP 20s Motion Graphics Showreel — pure function of time: window.seek(t)
// Obeys motion/AGENTS.md:
// - Pure function of t, zero state carried between frames, mulberry32 seeded RNG only
// - No CSS transitions, no setTimeout, no requestAnimationFrame in render mode
// - One display face (Unbounded), one UI face (Inter), one accent color (#7E22CE)
// - No centered title on gradient, no fade-ins, no corner labels/frame borders, no UI glow, no particle bursts
// - Hits locked to measured beat grid (120 BPM, 0.5s beat period from beats.json)

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x))
const ss = (a, b, t) => clamp((t - a) / (b - a))
const eOut = (x) => 1 - Math.pow(1 - clamp(x), 3)
const eIn = (x) => Math.pow(clamp(x), 3)
const eIO = (x) => {
  const c = clamp(x)
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}
const eBack = (x, s = 1.85) => {
  const c = clamp(x)
  if (c === 0) return 0
  if (c === 1) return 1
  const u = c - 1
  return 1 + (s + 1) * u * u * u + s * u * u
}
// Beat-locked pop: starts slightly before beat or from 0.82 scale so the beat frame itself is crisp and readable
const popBeat = (t, tBeat, d = 0.22, s = 1.75) => {
  if (t < tBeat - 0.08) return 0
  return eBack((t - (tBeat - 0.08)) / d, s)
}

function mulberry32(seed) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let z = Math.imul(a ^ (a >>> 15), 1 | a)
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296
  }
}
const noiseAt = (idx, slot = 0) => {
  const r = mulberry32(9482 + idx * 131 + slot * 997)
  r()
  return r() * 2 - 1
}

const SHIELD_SVG = (fill = '#7E22CE', inner = '#FAF8FF') => `
<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block">
  <rect width="100" height="100" rx="24" fill="${fill}" />
  <path d="M50 18 L78 29 V51 C78 68 65 81 50 87 C35 81 22 68 22 51 V29 Z" fill="${inner}" fill-opacity="0.22"/>
  <path d="M50 25 L71 33 V49 C71 63 61 73 50 79 C39 73 29 63 29 49 V33 Z" fill="${inner}"/>
  <path d="M50 42 C45 35 36 38 36 45 C36 53 50 64 50 64 C50 64 64 53 64 45 C64 38 55 35 50 42 Z" fill="${fill}"/>
</svg>`

const stage = document.getElementById('stage')

stage.innerHTML = `
  <!-- SCENE 1: 0.0 - 2.0s | HOOK: CALCULADORA CAMUFLADA -> PIN 9482= -->
  <section id="s1" class="scene" style="background:var(--paper)">
    <div style="position:absolute;top:0;right:0;width:780px;height:1080px;background:var(--ink)"></div>
    <div style="position:absolute;top:0;right:780px;width:40px;height:1080px;background:var(--accent)"></div>

    <div style="position:absolute;left:88px;top:84px;width:960px">
      <div class="pill" style="background:var(--ink);color:var(--paper);margin-bottom:28px">
        <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--accent-mid)"></span>
        CAMUFLAGEM UTILITÁRIA • MODO FURTIVO
      </div>
      <div id="s1-l1" class="display" style="font-size:92px;color:var(--ink)">PARECE SÓ</div>
      <div id="s1-l2" class="display" style="font-size:92px;color:var(--accent);margin-top:6px">UMA CALCULADORA.</div>

      <div id="s1-subbox" class="card-solid" style="margin-top:38px;padding:26px 34px;background:var(--ink);color:var(--paper);width:820px">
        <div class="ui-bold" style="font-size:21px;color:var(--accent-mid);letter-spacing:0.06em">MAS É UM ESCUDO DE EMERGÊNCIA</div>
        <div id="s1-subline" class="display" style="font-size:48px;margin-top:8px;color:var(--paper)">DIGITE O PIN <span style="color:var(--accent-mid)">9482=</span></div>
      </div>

      <div style="display:flex;gap:18px;margin-top:36px">
        <div id="s1-k0" class="card-solid display" style="width:118px;height:118px;display:flex;align-items:center;justify-content:center;font-size:54px">9</div>
        <div id="s1-k1" class="card-solid display" style="width:118px;height:118px;display:flex;align-items:center;justify-content:center;font-size:54px">4</div>
        <div id="s1-k2" class="card-solid display" style="width:118px;height:118px;display:flex;align-items:center;justify-content:center;font-size:54px">8</div>
        <div id="s1-k3" class="card-solid display" style="width:118px;height:118px;display:flex;align-items:center;justify-content:center;font-size:54px">2</div>
        <div id="s1-k4" class="card-solid display" style="width:154px;height:118px;display:flex;align-items:center;justify-content:center;font-size:58px;background:var(--accent);color:var(--paper)">=</div>
      </div>
    </div>

    <div id="s1-phone" class="phone" style="left:1270px;top:100px">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="assets/screens/calc.png" alt="Calculadora SEMP" />
        <!-- Covers the full calculator display box cleanly -->
        <div id="s1-calc-readout" class="ui-bold" style="position:absolute;top:54px;left:16px;right:16px;height:152px;background:#eef0ff;display:flex;align-items:flex-end;justify-content:flex-end;padding:20px 24px;font-size:64px;color:var(--ink);border-radius:20px">9</div>
        <div id="s1-tap" style="position:absolute;width:86px;height:86px;border-radius:24px;border:6px solid var(--accent);background:rgba(126,34,206,0.28);transform:translate(-50%,-50%) scale(0);pointer-events:none"></div>
      </div>
    </div>

    <div id="s1-shutter" style="position:absolute;inset:0;background:var(--accent);transform-origin:left center;transform:scaleX(0)"></div>
  </section>

  <!-- SCENE 2: 2.0 - 4.0s | REVEAL: SEMP — SEGURANÇA EFETIVA + MODO DISFARÇAR -->
  <section id="s2" class="scene" style="background:var(--ink)">
    <div style="position:absolute;top:0;right:0;width:880px;height:1080px;background:var(--accent);clip-path:polygon(14% 0,100% 0,100% 100%,0% 100%)"></div>

    <div style="position:absolute;left:88px;top:82px;width:960px">
      <div style="display:flex;align-items:center;gap:28px">
        <div id="s2-logo" style="width:128px;height:128px">${SHIELD_SVG('#7E22CE', '#FAF8FF')}</div>
        <div>
          <div class="pill" style="background:var(--accent);color:var(--paper);margin-bottom:10px">LEI 11.340/06 • MARIA DA PENHA</div>
          <div id="s2-title" class="display" style="font-size:128px;color:var(--paper);line-height:0.92">SEMP</div>
        </div>
      </div>

      <div id="s2-h1" class="display" style="font-size:64px;color:var(--paper);margin-top:32px">SEGURANÇA EFETIVA</div>
      <div id="s2-h2" class="display" style="font-size:64px;color:var(--accent-mid);margin-top:6px">PARA MULHERES.</div>

      <div id="s2-card1" class="card-solid" style="margin-top:36px;padding:24px 30px;width:860px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="ui-bold" style="font-size:19px;color:var(--accent);letter-spacing:0.05em">01 • ACESSO PROTEGIDO</div>
            <div class="display" style="font-size:34px;color:var(--ink);margin-top:4px">PAINEL DE PROTEÇÃO ATIVA</div>
          </div>
          <div class="pill" style="background:var(--ink);color:var(--paper);font-size:20px">PIN 9482=</div>
        </div>
      </div>

      <div id="s2-card2" class="card-solid" style="margin-top:22px;padding:24px 30px;width:860px;background:var(--accent-soft)">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="ui-bold" style="font-size:19px;color:var(--ink);letter-spacing:0.05em">02 • SAÍDA DE EMERGÊNCIA</div>
            <div class="display" style="font-size:34px;color:var(--ink);margin-top:4px">1 TOQUE → VOLTA À CALCULADORA</div>
          </div>
          <div class="pill" style="background:var(--accent);color:var(--paper);font-size:20px">DISFARÇAR</div>
        </div>
      </div>
    </div>

    <div id="s2-phone" class="phone" style="left:1255px;top:95px">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img id="s2-phone-img" src="assets/screens/sos.png" alt="Painel SOS SEMP" />
      </div>
    </div>

    <div id="s2-callout" class="card-solid" style="position:absolute;left:995px;top:142px;padding:18px 26px;background:var(--paper)">
      <div id="s2-callout-title" class="ui-bold" style="font-size:22px;color:var(--ink)">BOTÃO DISFARÇAR →</div>
      <div id="s2-callout-sub" style="font-size:18px;font-weight:700;color:var(--accent)">Oculta o app em 0,1s</div>
    </div>
  </section>

  <!-- SCENE 3: 4.0 - 6.0s | PROBLEMA & PESQUISA DE CAMPO (IFSP) -->
  <section id="s3" class="scene" style="background:var(--paper)">
    <div style="position:absolute;top:0;left:0;right:0;height:120px;background:var(--ink);display:flex;align-items:center;justify-content:space-between;padding:0 88px">
      <div class="display" style="font-size:38px;color:var(--paper)">PESQUISA DE CAMPO • IFSP</div>
      <div id="s3-top-pill" class="pill" style="background:var(--accent);color:var(--paper)">POR QUE APPS COMUNS FALHAM?</div>
    </div>

    <!-- Left stat block: 62,5% -->
    <div id="s3-col1" class="card-solid" style="position:absolute;left:88px;top:156px;width:850px;height:560px;padding:42px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div class="pill" style="background:var(--accent-soft);color:var(--accent)">BARREIRA 01 • MEDO DE EXPOSIÇÃO</div>
        <div id="s3-stat1" class="display" style="font-size:156px;color:var(--accent);margin-top:18px;line-height:0.9">62,5%</div>
      </div>
      <div>
        <div class="display" style="font-size:40px;color:var(--ink);line-height:1.1">TEMEM QUE O AGRESSOR PERCEBA O CELULAR.</div>
        <div class="ui-bold" style="font-size:24px;color:var(--muted);margin-top:12px">Solução SEMP: Camuflagem total como calculadora real.</div>
      </div>
    </div>

    <!-- Right stat block: 25% -->
    <div id="s3-col2" class="card-solid" style="position:absolute;left:982px;top:156px;width:850px;height:560px;padding:42px;background:var(--ink);color:var(--paper);display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div class="pill" style="background:var(--accent);color:var(--paper)">BARREIRA 02 • BLOQUEIO SOB ESTRESSE</div>
        <div id="s3-stat2" class="display" style="font-size:156px;color:var(--accent-mid);margin-top:18px;line-height:0.9">25,0%</div>
      </div>
      <div>
        <div class="display" style="font-size:40px;color:var(--paper);line-height:1.1">TRAVAM E ESQUECEM O QUE FAZER NA EMERGÊNCIA.</div>
        <div class="ui-bold" style="font-size:24px;color:var(--accent-soft);margin-top:12px">Solução SEMP: Zero menus. Acionamento único em 1,5s.</div>
      </div>
    </div>

    <!-- Bottom comparison bar -->
    <div id="s3-bottom" class="card-solid" style="position:absolute;left:88px;top:752px;width:1744px;height:264px;background:var(--accent);color:var(--paper);padding:32px 48px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div class="ui-bold" style="font-size:22px;color:var(--accent-soft);letter-spacing:0.06em">ENGENHARIA IHC DE LATÊNCIA MÍNIMA</div>
        <div id="s3-bot-headline" class="display" style="font-size:58px;color:var(--paper);margin-top:8px">1 GESTO SUBSTITUI 5 ETAPAS.</div>
      </div>
      <div style="display:flex;gap:22px;align-items:center">
        <div style="background:var(--ink);padding:20px 32px;border-radius:20px;text-align:center">
          <div class="ui-bold" style="font-size:18px;color:var(--accent-mid)">APPS COMUNS</div>
          <div class="display" style="font-size:44px;color:var(--paper);margin-top:4px">15,0s</div>
        </div>
        <div class="display" style="font-size:52px;color:var(--paper)">→</div>
        <div id="s3-fast-box" style="background:var(--paper);padding:20px 36px;border-radius:20px;text-align:center;border:4px solid var(--ink)">
          <div class="ui-bold" style="font-size:18px;color:var(--accent)">NO SEMP (10x)</div>
          <div class="display" style="font-size:48px;color:var(--ink);margin-top:4px">1,5s</div>
        </div>
      </div>
    </div>
  </section>

  <!-- SCENE 4: 6.0 - 9.0s | SOS 1,5s HOLD -> DISPARO DA TRÍADE SIMULTÂNEA -->
  <section id="s4" class="scene" style="background:var(--paper)">
    <div id="s4-bg-dark" style="position:absolute;inset:0;background:var(--ink);opacity:0"></div>

    <!-- Left phone showing real SOS screen -->
    <div id="s4-phone" class="phone" style="left:88px;top:100px">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="assets/screens/sos.png" alt="SOS Screen" />
      </div>
    </div>

    <!-- Center/Right Hold Gauge + Tríade -->
    <div style="position:absolute;left:564px;top:84px;width:1268px;height:912px">
      <div id="s4-badge" class="pill" style="background:var(--accent);color:var(--paper)">ACIONAMENTO DE EMERGÊNCIA • ANTI-TOQUE ACIDENTAL</div>
      <div id="s4-headline" class="display" style="font-size:74px;color:var(--ink);margin-top:18px;white-space:nowrap">SEGURE POR 1,5s</div>
      <div id="s4-sub" class="ui-bold" style="font-size:28px;color:var(--muted);margin-top:10px">Envio simultâneo de GPS + Rede Familiar + Polícia 190</div>

      <!-- Radial Hold Progress Ring -->
      <div id="s4-ring-wrap" style="position:absolute;left:0px;top:240px;width:420px;height:420px;display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 320 320" width="420" height="420">
          <circle cx="160" cy="160" r="136" fill="var(--ink)" stroke="#334155" stroke-width="18" />
          <circle id="s4-arc" cx="160" cy="160" r="136" fill="none" stroke="#7E22CE" stroke-width="22" stroke-linecap="round"
            stroke-dasharray="854.5" stroke-dashoffset="854.5" transform="rotate(-90 160 160)" />
        </svg>
        <div style="position:absolute;text-align:center">
          <div id="s4-timer" class="display" style="font-size:78px;color:var(--paper)">0,0s</div>
          <div id="s4-ring-label" class="ui-bold" style="font-size:20px;color:var(--accent-mid);margin-top:8px;letter-spacing:0.08em">PRESSIONANDO</div>
        </div>
      </div>

      <!-- Tríade Simultânea Cards -->
      <div style="position:absolute;left:456px;top:240px;width:812px;display:flex;flex-direction:column;gap:22px">
        <div id="s4-tri1" class="card-solid" style="padding:24px 30px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="ui-bold" style="font-size:18px;color:var(--accent)">CANAL 01 • GEOLOCALIZAÇÃO EM TEMPO REAL</div>
            <div class="display" style="font-size:32px;color:var(--ink);margin-top:4px">PRECISÃO GPS ±3 METROS</div>
          </div>
          <div id="s4-pill1" class="pill" style="background:var(--accent);color:var(--paper);font-size:19px">PRONTO</div>
        </div>

        <div id="s4-tri2" class="card-solid" style="padding:24px 30px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="ui-bold" style="font-size:18px;color:var(--accent)">CANAL 02 • REDE DE APOIO FAMILIAR</div>
            <div class="display" style="font-size:32px;color:var(--ink);margin-top:4px">MÃE & IRMÃ NOTIFICADAS</div>
          </div>
          <div id="s4-pill2" class="pill" style="background:var(--ink);color:var(--paper);font-size:19px">SMS + ZAP</div>
        </div>

        <div id="s4-tri3" class="card-solid" style="padding:24px 30px;display:flex;align-items:center;justify-content:space-between;background:var(--accent);color:var(--paper)">
          <div>
            <div class="ui-bold" style="font-size:18px;color:var(--accent-soft)">CANAL 03 • CENTRAL 190 & PATRULHA</div>
            <div class="display" style="font-size:32px;color:var(--paper);margin-top:4px">VIATURA 24M DESPACHADA</div>
          </div>
          <div id="s4-pill3" class="pill" style="background:var(--paper);color:var(--ink);font-size:19px">CÓDIGO 3</div>
        </div>
      </div>
    </div>
  </section>

  <!-- SCENE 5: 9.0 - 11.5s | SEMP TÁTICO: PATRULHA MARIA DA PENHA AO VIVO -->
  <section id="s5" class="scene" style="background:var(--ink);color:var(--paper)">
    <div style="position:absolute;left:88px;top:68px;right:88px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div class="pill" style="background:var(--accent);color:var(--paper);margin-bottom:12px">VISÃO POLICIAL • PATRULHA MARIA DA PENHA</div>
        <div id="s5-title" class="display" style="font-size:74px;color:var(--paper)">SEMP TÁTICO • #082</div>
      </div>
      <div id="s5-eta-box" class="card-solid" style="padding:18px 34px;background:var(--paper);color:var(--ink);text-align:right">
        <div class="ui-bold" style="font-size:18px;color:var(--accent)">TEMPO DE RESPOSTA VIATURA 24M</div>
        <div id="s5-eta" class="display" style="font-size:50px;color:var(--ink)">2 MIN • 800m</div>
      </div>
    </div>

    <!-- Left: Real Tactical Screen -->
    <div id="s5-phone" class="phone" style="left:88px;top:238px;width:400px;height:780px">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="assets/screens/tatico.png" alt="Painel Tático SEMP" />
      </div>
    </div>

    <!-- Right: Vector Tactical Radar Map + Encrypted Audio Stream -->
    <div id="s5-map-card" class="card-solid" style="position:absolute;left:532px;top:238px;width:1300px;height:496px;background:#162038;border-color:var(--accent);overflow:hidden">
      <svg viewBox="0 0 1300 496" width="1300" height="496" style="display:block">
        <g stroke="#293548" stroke-width="2">
          <line x1="0" y1="120" x2="1300" y2="120" />
          <line x1="0" y1="248" x2="1300" y2="248" stroke-width="8" stroke="#334155" />
          <line x1="0" y1="376" x2="1300" y2="376" />
          <line x1="280" y1="0" x2="280" y2="496" />
          <line x1="640" y1="0" x2="640" y2="496" stroke-width="6" stroke="#334155" />
          <line x1="960" y1="0" x2="960" y2="496" />
        </g>
        <circle id="s5-perim-outer" cx="920" cy="220" r="155" fill="rgba(126,34,206,0.18)" stroke="#C084FC" stroke-width="4" stroke-dasharray="14 10" />
        <circle cx="920" cy="220" r="82" fill="rgba(126,34,206,0.28)" />
        <path d="M 220 390 C 480 390, 620 220, 920 220" fill="none" stroke="#475569" stroke-width="10" stroke-linecap="round" />
        <path id="s5-route" d="M 220 390 C 480 390, 620 220, 920 220" fill="none" stroke="#C084FC" stroke-width="10" stroke-linecap="round" stroke-dasharray="820" stroke-dashoffset="820" />
        <circle cx="920" cy="220" r="18" fill="#FAF8FF" stroke="#7E22CE" stroke-width="8" />
        <g id="s5-car" transform="translate(220,390)">
          <circle r="24" fill="#7E22CE" stroke="#FAF8FF" stroke-width="5" />
        </g>
      </svg>
      <div class="pill" style="position:absolute;top:24px;left:24px;background:var(--ink);color:var(--paper)">AV. PAULISTA, 1200 • PERÍMETRO 300m VIOLADO</div>
      <div class="pill" style="position:absolute;top:172px;left:954px;background:var(--paper);color:var(--ink)">VÍTIMA: MARIANA S.</div>
      <div id="s5-car-tag" class="pill" style="position:absolute;top:330px;left:180px;background:var(--accent);color:var(--paper)">VIATURA 24M</div>
      <div id="s5-cerco" class="pill" style="position:absolute;bottom:24px;right:24px;background:var(--accent);color:var(--paper);font-size:22px">CERCO TÁTICO CONFIRMADO</div>
    </div>

    <!-- Encrypted Ambient Audio Waveform Bar -->
    <div id="s5-audio-card" class="card-solid" style="position:absolute;left:532px;top:762px;width:1300px;height:216px;background:var(--paper);color:var(--ink);padding:26px 36px;display:flex;align-items:center;justify-content:space-between">
      <div style="width:520px">
        <div class="ui-bold" style="font-size:19px;color:var(--accent)">ESCUTA AMBIENTE AO VIVO • ICP-BRASIL</div>
        <div class="display" style="font-size:36px;color:var(--ink);margin-top:6px">PROVA FORENSE CRIPTOGRAFADA</div>
        <div class="ui-bold" style="font-size:20px;color:var(--muted);margin-top:6px">Aparelho da vítima permanece camuflado</div>
      </div>
      <div id="s5-bars" style="display:flex;align-items:center;gap:10px;height:120px;padding:0 20px">
        ${Array.from({ length: 24 }, (_, i) => `<div class="s5-bar" data-i="${i}" style="width:14px;height:40px;border-radius:99px;background:${i % 3 === 0 ? 'var(--accent)' : 'var(--ink)'}"></div>`).join('')}
      </div>
    </div>
  </section>

  <!-- SCENE 6: 11.5 - 14.0s | PROTEÇÃO JURÍDICA 360° (MEDIDA + REDE + HISTÓRICO) -->
  <section id="s6" class="scene" style="background:var(--paper)">
    <div style="position:absolute;left:88px;top:64px;right:88px;display:flex;align-items:flex-end;justify-content:space-between">
      <div>
        <div class="pill" style="background:var(--ink);color:var(--paper);margin-bottom:14px">ECOSSISTEMA COMPLETO DE PROTEÇÃO</div>
        <div id="s6-title" class="display" style="font-size:48px;color:var(--ink);white-space:nowrap">DA MEDIDA JUDICIAL À REDE DE APOIO.</div>
      </div>
      <div class="pill" style="background:var(--accent);color:var(--paper);font-size:21px;white-space:nowrap">TJSP • AUTOS Nº 0823412-44</div>
    </div>

    <div id="s6-c1" class="card-solid" style="position:absolute;left:88px;top:228px;width:552px;height:780px;padding:28px;background:#ffffff;overflow:hidden">
      <div class="pill" style="background:var(--accent-soft);color:var(--accent);font-size:18px">01 • MEDIDA PROTETIVA</div>
      <div class="display" style="font-size:30px;color:var(--ink);margin-top:12px;white-space:nowrap">PERÍMETRO 300m ATIVO</div>
      <div style="margin-top:18px;width:100%;height:610px;border-radius:24px;overflow:hidden;border:3px solid var(--ink)">
        <img src="assets/screens/medida.png" style="width:100%;height:100%;object-fit:cover;object-position:top" />
      </div>
    </div>

    <div id="s6-c2" class="card-solid" style="position:absolute;left:684px;top:228px;width:552px;height:780px;padding:28px;background:var(--ink);color:var(--paper);overflow:hidden">
      <div class="pill" style="background:var(--accent);color:var(--paper);font-size:18px">02 • REDE DE CONFIANÇA</div>
      <div class="display" style="font-size:30px;color:var(--paper);margin-top:12px;white-space:nowrap">ALERTA EM 1 TOQUE</div>
      <div style="margin-top:18px;width:100%;height:610px;border-radius:24px;overflow:hidden;border:3px solid var(--accent-mid)">
        <img src="assets/screens/contatos.png" style="width:100%;height:100%;object-fit:cover;object-position:top" />
      </div>
    </div>

    <div id="s6-c3" class="card-solid" style="position:absolute;left:1280px;top:228px;width:552px;height:780px;padding:28px;background:var(--accent-soft);overflow:hidden">
      <div class="pill" style="background:var(--ink);color:var(--paper);font-size:18px">03 • HISTÓRICO & PROVAS</div>
      <div class="display" style="font-size:30px;color:var(--ink);margin-top:12px;white-space:nowrap">CADEIA DE CUSTÓDIA</div>
      <div style="margin-top:18px;width:100%;height:610px;border-radius:24px;overflow:hidden;border:3px solid var(--ink)">
        <img src="assets/screens/historico.png" style="width:100%;height:100%;object-fit:cover;object-position:top" />
      </div>
    </div>
  </section>

  <!-- SCENE 7: 14.0 - 16.0s | KINETIC BEAT MONTAGE (4 CUTS ON THE BEAT: 14.0, 14.5, 15.0, 15.5) -->
  <section id="s7" class="scene" style="background:var(--ink)">
    <div id="s7-left" style="position:absolute;left:0;top:0;width:1020px;height:1080px;padding:88px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div id="s7-step" class="pill" style="background:var(--accent);color:var(--paper);font-size:22px">01 / 04 • ARQUITETURA FRONT-END</div>
        <div id="s7-big" class="display" style="font-size:80px;color:var(--paper);margin-top:28px;line-height:0.98">DISFARCE PERFEITO.</div>
        <div id="s7-desc" class="ui-bold" style="font-size:32px;color:var(--accent-mid);margin-top:22px">Fluxo completo da vítima ao despacho policial</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:14px">
        <div class="pill" style="background:var(--paper);color:var(--ink)">REACT 19</div>
        <div class="pill" style="background:var(--paper);color:var(--ink)">TYPESCRIPT 5.7</div>
        <div class="pill" style="background:var(--paper);color:var(--ink)">TAILWIND CSS 4</div>
        <div class="pill" style="background:var(--accent);color:var(--paper)">ZUSTAND 5</div>
        <div class="pill" style="background:var(--paper);color:var(--ink)">PWA OFFLINE-FIRST</div>
      </div>
    </div>

    <div id="s7-right" style="position:absolute;right:0;top:0;width:900px;height:1080px;background:var(--accent);padding:64px;display:flex;align-items:center;justify-content:center;gap:32px">
      <div id="s7-p1" class="phone" style="position:relative;left:0;top:0;width:360px;height:760px">
        <div class="phone-notch"></div>
        <div class="phone-screen"><img id="s7-img1" src="assets/screens/calc.png" /></div>
      </div>
      <div id="s7-p2" class="phone" style="position:relative;left:0;top:0;width:360px;height:760px">
        <div class="phone-notch"></div>
        <div class="phone-screen"><img id="s7-img2" src="assets/screens/sos.png" /></div>
      </div>
    </div>
  </section>

  <!-- SCENE 8: 16.0 - 18.0s | MODO COAÇÃO: PIN SILENCIOSO 1900= -->
  <section id="s8" class="scene" style="background:var(--paper)">
    <div style="position:absolute;top:0;right:0;width:780px;height:1080px;background:var(--ink)"></div>
    <div style="position:absolute;top:0;right:780px;width:40px;height:1080px;background:var(--accent)"></div>

    <div style="position:absolute;left:88px;top:84px;width:960px">
      <div class="pill" style="background:var(--ink);color:var(--paper);margin-bottom:24px">PROTOCOLO ANTI-COAÇÃO • ALERTA INVISÍVEL</div>
      <div id="s8-h1" class="display" style="font-size:88px;color:var(--ink)">OBRIGADA A</div>
      <div id="s8-h2" class="display" style="font-size:88px;color:var(--accent);margin-top:4px">DESBLOQUEAR?</div>

      <div id="s8-pin-box" class="card-solid" style="margin-top:34px;padding:28px 36px;background:var(--ink);color:var(--paper);width:880px">
        <div class="ui-bold" style="font-size:21px;color:var(--accent-mid)">PIN DE PÂNICO COAGIDO</div>
        <div class="display" style="font-size:76px;color:var(--paper);margin-top:6px">DIGITE <span id="s8-digits" style="color:var(--accent-mid)">1900=</span></div>
      </div>

      <div id="s8-xray" class="card-solid" style="margin-top:26px;padding:26px 34px;background:var(--accent);color:var(--paper);width:880px">
        <div class="display" style="font-size:34px">A CALCULADORA NÃO ABRE O PAINEL.</div>
        <div class="ui-bold" style="font-size:23px;color:var(--accent-soft);margin-top:8px">Mostra "0" na tela enquanto dispara GPS + 190 em silêncio absoluto.</div>
      </div>
    </div>

    <div id="s8-phone" class="phone" style="left:1270px;top:100px">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <img src="assets/screens/calc.png" alt="Coação 1900=" />
        <div id="s8-calc-readout" class="ui-bold" style="position:absolute;top:54px;left:16px;right:16px;height:152px;background:#eef0ff;display:flex;align-items:flex-end;justify-content:flex-end;padding:20px 24px;font-size:64px;color:var(--ink);border-radius:20px">1900</div>
        <div id="s8-silent-pill" class="pill" style="position:absolute;bottom:28px;left:20px;right:20px;justify-content:center;background:var(--ink);color:var(--paper);font-size:17px">
          SOS SILENCIOSO ENVIADO • TELA MANTIDA
        </div>
      </div>
    </div>
  </section>

  <!-- SCENE 9: 18.0 - 20.0s | END CARD SHOWREEL: SEMP -->
  <section id="s9" class="scene" style="background:var(--ink);color:var(--paper)">
    <div style="position:absolute;top:0;right:0;width:860px;height:1080px;background:var(--accent);clip-path:polygon(16% 0,100% 0,100% 100%,0% 100%)"></div>

    <div style="position:absolute;left:88px;top:76px;width:960px;height:928px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div style="display:flex;align-items:center;gap:26px">
          <div id="s9-logo" style="width:124px;height:124px">${SHIELD_SVG('#7E22CE', '#FAF8FF')}</div>
          <div>
            <div class="pill" style="background:var(--accent);color:var(--paper);margin-bottom:8px;font-size:20px">IFSP • CIÊNCIA DA COMPUTAÇÃO • PICO</div>
            <div id="s9-title" class="display" style="font-size:128px;color:var(--paper);line-height:0.9">SEMP</div>
          </div>
        </div>

        <div id="s9-sub1" class="display" style="font-size:48px;color:var(--paper);margin-top:28px;line-height:1.08">
          SEGURANÇA EFETIVA PARA MULHERES COM MEDIDAS PROTETIVAS.
        </div>
        <div id="s9-sub2" class="ui-bold" style="font-size:28px;color:var(--accent-mid);margin-top:16px">
          Rápido na crise. Invisível na rotina. Conectado à Patrulha.
        </div>
      </div>

      <div id="s9-pills" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;width:900px">
        <div id="s9-c0" class="card-solid" style="padding:18px 24px;background:var(--paper);color:var(--ink)">
          <div id="s9-c0-sub" class="ui-bold" style="font-size:16px;color:var(--accent)">DISFARCE REAL</div>
          <div class="display" style="font-size:28px;margin-top:4px">PIN 9482=</div>
        </div>
        <div id="s9-c1" class="card-solid" style="padding:18px 24px;background:var(--paper);color:var(--ink)">
          <div id="s9-c1-sub" class="ui-bold" style="font-size:16px;color:var(--accent)">MODO COAÇÃO</div>
          <div class="display" style="font-size:28px;margin-top:4px">PIN 1900=</div>
        </div>
        <div id="s9-c2" class="card-solid" style="padding:18px 24px;background:var(--paper);color:var(--ink)">
          <div id="s9-c2-sub" class="ui-bold" style="font-size:16px;color:var(--accent)">LATÊNCIA ZERO</div>
          <div class="display" style="font-size:28px;margin-top:4px">SEGURE 1,5s</div>
        </div>
        <div id="s9-c3" class="card-solid" style="padding:18px 24px;background:var(--paper);color:var(--ink)">
          <div id="s9-c3-sub" class="ui-bold" style="font-size:16px;color:var(--accent)">DESPACHO 190</div>
          <div class="display" style="font-size:28px;margin-top:4px">SEMP TÁTICO</div>
        </div>
      </div>
    </div>

    <!-- 3-Phone Hero Fan on Right -->
    <div id="s9-p-left" class="phone" style="left:1080px;top:170px;width:340px;height:720px">
      <div class="phone-notch"></div>
      <div class="phone-screen"><img src="assets/screens/calc.png" /></div>
    </div>
    <div id="s9-p-right" class="phone" style="left:1470px;top:170px;width:340px;height:720px">
      <div class="phone-notch"></div>
      <div class="phone-screen"><img src="assets/screens/tatico.png" /></div>
    </div>
    <div id="s9-p-center" class="phone" style="left:1265px;top:110px;width:370px;height:780px">
      <div class="phone-notch"></div>
      <div class="phone-screen"><img src="assets/screens/sos.png" /></div>
    </div>
  </section>
`

const $ = (id) => document.getElementById(id)
const scenes = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'].map($)
const s5Bars = [...document.querySelectorAll('.s5-bar')]

const KEY_POS = {
  '9': [242, 430],
  '4': [64, 520],
  '8': [153, 430],
  '2': [153, 610],
  '=': [330, 700],
}

function seek(rawT) {
  const t = clamp(rawT, 0, 20)

  let active = 0
  if (t < 2.0) active = 0
  else if (t < 4.0) active = 1
  else if (t < 6.0) active = 2
  else if (t < 9.0) active = 3
  else if (t < 11.5) active = 4
  else if (t < 14.0) active = 5
  else if (t < 16.0) active = 6
  else if (t < 18.0) active = 7
  else active = 8

  for (let i = 0; i < scenes.length; i++) {
    scenes[i].style.display = i === active ? 'block' : 'none'
  }

  const beatPhase = (t % 0.5) / 0.5
  const beatBump = Math.exp(-beatPhase * 9)

  // ==================== SCENE 1 (0.0 - 2.0s) ====================
  if (active === 0) {
    // Open mid-action at t=0: headline and keypad are already on-screen, snapping with energy
    const p1 = eOut(clamp((t + 0.16) / 0.24))
    $('s1-l1').style.transform = `translateY(${(1 - p1) * 18}px)`
    $('s1-l2').style.transform = `translateY(${(1 - p1) * 26}px)`

    // PIN sequence: 9 (0.0s), 4 (0.25s), 8 (0.5s), 2 (0.75s), = (1.5s)
    const keyTimes = [0.0, 0.25, 0.5, 0.75, 1.5]
    const keyChars = ['9', '4', '8', '2', '=']
    let disp = '9'
    if (t >= 0.25) disp = '94'
    if (t >= 0.5) disp = '948'
    if (t >= 0.75) disp = '9482'
    if (t >= 1.5) disp = 'SEMP'
    $('s1-calc-readout').textContent = disp
    $('s1-calc-readout').style.background = t >= 1.5 ? '#7E22CE' : '#eef0ff'
    $('s1-calc-readout').style.color = t >= 1.5 ? '#FAF8FF' : '#0f172a'

    let tapScale = 0
    let tapXY = [242, 430]
    for (let k = 0; k < 5; k++) {
      const el = $(`s1-k${k}`)
      const kt = keyTimes[k]
      const pressed = t >= kt
      const activeKey = t >= kt && t < kt + 0.22
      const s = pressed ? 0.92 + 0.08 * popBeat(t, kt, 0.2, 2.0) : 0.92
      el.style.transform = `translateY(${activeKey ? -14 : 0}px) scale(${s})`
      if (k < 4) {
        el.style.background = pressed ? '#0f172a' : '#ffffff'
        el.style.color = pressed ? '#faf8ff' : '#0f172a'
      }
      if (activeKey) {
        const u = (t - kt) / 0.22
        tapScale = 0.65 + Math.sin(u * Math.PI) * 0.55
        tapXY = KEY_POS[keyChars[k]]
      }
    }
    const tap = $('s1-tap')
    tap.style.left = `${tapXY[0]}px`
    tap.style.top = `${tapXY[1]}px`
    tap.style.transform = `translate(-50%,-50%) scale(${tapScale})`

    // Sub-box is visible from t=0, and at Beat 2 (1.0s) flips to highlight PIN CONFIRMADO
    const subB = popBeat(t, 1.0, 0.22, 1.8)
    $('s1-subbox').style.background = t >= 1.0 ? '#7E22CE' : '#0F172A'
    $('s1-subline').innerHTML =
      t >= 1.5
        ? 'PAINEL <span style="color:#FAF8FF">DESBLOQUEADO!</span>'
        : 'DIGITE O PIN <span style="color:#F0DBFF">9482=</span>'
    $('s1-subbox').style.transform = `scale(${t >= 1.0 ? 0.96 + 0.04 * subB : 1})`

    const unlockP = ss(1.5, 1.95, t)
    const phoneRot = -4 + unlockP * 4
    const phoneScale = 1 + beatBump * 0.018 + eIn(unlockP) * 0.1
    $('s1-phone').style.transform = `rotate(${phoneRot}deg) scale(${phoneScale})`

    const sh = eIO(ss(1.86, 2.0, t))
    $('s1-shutter').style.transform = `scaleX(${sh})`
  }

  // ==================== SCENE 2 (2.0 - 4.0s) ====================
  if (active === 1) {
    const lt = t - 2.0
    const enter = 0.85 + 0.15 * eOut(clamp((lt + 0.08) / 0.22))
    $('s2-logo').style.transform = `scale(${enter})`
    $('s2-title').style.transform = `translateX(${(1 - enter) * -40}px)`

    // Card 1 present on Beat 4 (2.0s), Card 2 snaps in on Beat 5 (2.5s), Callout on Beat 6 (3.0s)
    const c1 = 0.88 + 0.12 * popBeat(lt, 0.0, 0.22, 1.7)
    $('s2-card1').style.transform = `scale(${c1})`

    const c2 = popBeat(lt, 0.5, 0.24, 1.75)
    $('s2-card2').style.transform = `translateX(${(1 - c2) * -120}px) scale(${0.85 + 0.15 * c2})`
    $('s2-card2').style.opacity = lt >= 0.42 ? '1' : '0.25'

    const call = popBeat(lt, 1.0, 0.24, 1.9)
    $('s2-callout').style.transform = `scale(${0.85 + 0.15 * call})`
    $('s2-callout').style.background = lt >= 1.5 ? '#0F172A' : '#FAF8FF'
    $('s2-callout-title').style.color = lt >= 1.5 ? '#FAF8FF' : '#0F172A'
    $('s2-callout-title').textContent = lt >= 1.5 ? 'DISFARCE ATIVADO!' : 'BOTÃO DISFARÇAR →'
    $('s2-callout-sub').style.color = lt >= 1.5 ? '#C084FC' : '#7E22CE'
    $('s2-callout-sub').textContent = lt >= 1.5 ? 'Tela voltou à Calculadora' : 'Oculta o app em 0,1s'

    // Beat 7 (t=3.5s, lt=1.5s): Phone flips to Calculator
    const flip = eIO(ss(1.38, 1.52, lt))
    const rotY = flip * 180
    const showCalc = rotY > 90
    $('s2-phone-img').src = showCalc ? 'assets/screens/calc.png' : 'assets/screens/sos.png'
    $('s2-phone-img').style.transform = showCalc ? 'scaleX(-1)' : 'scaleX(1)'
    $('s2-phone').style.transform = `perspective(1200px) rotateY(${rotY}deg) rotate(${3 - flip * 6}deg) scale(${1 + beatBump * 0.02})`
  }

  // ==================== SCENE 3 (4.0 - 6.0s) ====================
  if (active === 2) {
    const lt = t - 4.0
    // Beat 8 (4.0s): Left column 62,5% already readable on beat
    const c1 = 0.9 + 0.1 * popBeat(lt, 0.0, 0.22, 1.6)
    $('s3-col1').style.transform = `scale(${c1})`

    // Beat 9 (4.5s, lt=0.5s): Right column 25,0% snaps into full focus
    const c2 = popBeat(lt, 0.5, 0.24, 1.7)
    $('s3-col2').style.transform = `translateY(${(1 - c2) * 48}px) scale(${0.92 + 0.08 * c2})`
    $('s3-col2').style.opacity = lt >= 0.42 ? '1' : '0.35'

    // Beat 10 (5.0s, lt=1.0s): Bottom comparison bar snaps in
    const bot = popBeat(lt, 1.0, 0.24, 1.75)
    $('s3-bottom').style.transform = `translateY(${(1 - bot) * 70}px) scale(${0.94 + 0.06 * bot})`
    $('s3-bottom').style.opacity = lt >= 0.92 ? '1' : '0.25'

    // Beat 11 (5.5s, lt=1.5s): 10x speed highlight on bottom bar
    const fast = popBeat(lt, 1.5, 0.22, 2.0)
    $('s3-fast-box').style.transform = `scale(${1 + 0.08 * fast})`
    $('s3-bot-headline').textContent = lt >= 1.5 ? '10x MAIS RÁPIDO SOB ESTRESSE.' : '1 GESTO SUBSTITUI 5 ETAPAS.'
  }

  // ==================== SCENE 4 (6.0 - 9.0s) ====================
  if (active === 3) {
    const lt = t - 6.0
    const holdP = clamp(lt / 1.5, 0, 1)
    const triggered = t >= 7.5

    $('s4-bg-dark').style.opacity = triggered ? '1' : '0'
    $('s4-headline').textContent = triggered ? 'SOCORRO DISPARADO!' : 'SEGURE POR 1,5s'
    $('s4-headline').style.color = triggered ? '#FAF8FF' : '#0F172A'
    $('s4-sub').style.color = triggered ? '#C084FC' : '#64748B'
    $('s4-sub').textContent = triggered
      ? 'Tríade simultânea confirmada em 3 canais independentes'
      : 'Envio simultâneo de GPS + Rede Familiar + Polícia 190'

    const circ = 854.5
    $('s4-arc').setAttribute('stroke-dashoffset', (circ * (1 - holdP)).toFixed(1))
    $('s4-arc').setAttribute('stroke', triggered ? '#C084FC' : '#7E22CE')
    $('s4-timer').textContent = triggered ? 'ATIVO' : `${(holdP * 1.5).toFixed(1).replace('.', ',')}s`
    $('s4-ring-label').textContent = triggered ? 'TRANSMITINDO' : 'MANTENHA PRESSIONADO'

    const ringPulse = triggered ? 1 + beatBump * 0.04 : 1 + holdP * 0.06
    $('s4-ring-wrap').style.transform = `scale(${ringPulse})`
    $('s4-phone').style.transform = `rotate(${triggered ? -2 : 2}deg) scale(${1 + beatBump * 0.02})`

    // Tríade cards: visible during hold as queued channels, then lock & activate on Beats 15 (7.5s), 16 (8.0s), 17 (8.5s)
    const tr1 = popBeat(t, 7.5, 0.22, 1.8)
    const tr2 = popBeat(t, 8.0, 0.22, 1.8)
    const tr3 = popBeat(t, 8.5, 0.22, 1.8)
    $('s4-tri1').style.transform = `translateX(${t >= 7.42 ? (1 - tr1) * 90 : 0}px) scale(${t >= 7.42 ? 0.95 + 0.05 * tr1 : 0.95})`
    $('s4-tri2').style.transform = `translateX(${t >= 7.92 ? (1 - tr2) * 90 : 0}px) scale(${t >= 7.92 ? 0.95 + 0.05 * tr2 : 0.95})`
    $('s4-tri3').style.transform = `translateX(${t >= 8.42 ? (1 - tr3) * 90 : 0}px) scale(${t >= 8.42 ? 0.95 + 0.05 * tr3 : 0.95})`
    $('s4-tri1').style.opacity = t >= 7.42 ? '1' : '0.55'
    $('s4-tri2').style.opacity = t >= 7.92 ? '1' : '0.4'
    $('s4-tri3').style.opacity = t >= 8.42 ? '1' : '0.3'
    $('s4-pill1').textContent = t >= 7.5 ? 'ENVIADO ✓' : 'FILA 01'
    $('s4-pill2').textContent = t >= 8.0 ? 'ALERTADAS ✓' : 'FILA 02'
    $('s4-pill3').textContent = t >= 8.5 ? 'EM ROTA ✓' : 'FILA 03'
  }

  // ==================== SCENE 5 (9.0 - 11.5s) ====================
  if (active === 4) {
    const lt = t - 9.0
    const pEnter = 0.9 + 0.1 * popBeat(lt, 0.0, 0.22, 1.65)
    $('s5-phone').style.transform = `scale(${pEnter}) rotate(-2deg)`

    const prog = eIO(clamp(lt / 2.1, 0, 1))
    $('s5-route').setAttribute('stroke-dashoffset', ((1 - prog) * 820).toFixed(1))

    const u = 1 - prog
    const cx = u * u * u * 220 + 3 * u * u * prog * 480 + 3 * u * prog * prog * 620 + prog * prog * prog * 920
    const cy = u * u * u * 390 + 3 * u * u * prog * 390 + 3 * u * prog * prog * 220 + prog * prog * prog * 220
    $('s5-car').setAttribute('transform', `translate(${cx.toFixed(1)},${cy.toFixed(1)})`)
    $('s5-car-tag').style.left = `${(cx - 70).toFixed(1)}px`
    $('s5-car-tag').style.top = `${(cy - 68).toFixed(1)}px`

    $('s5-perim-outer').setAttribute('transform', `rotate(${(lt * 28).toFixed(1)} 920 220)`)

    const dist = Math.round(1200 - prog * 900)
    const mins = dist > 600 ? 2 : 1
    $('s5-eta').textContent = `${mins} MIN • ${dist}m`

    const cerco = popBeat(t, 11.0, 0.22, 1.9)
    $('s5-cerco').style.transform = `scale(${cerco})`

    const frameSlot = Math.floor(t * 24)
    for (let i = 0; i < s5Bars.length; i++) {
      const n = Math.abs(noiseAt(i, frameSlot))
      const h = 24 + Math.round(n * 92)
      s5Bars[i].style.height = `${h}px`
    }
  }

  // ==================== SCENE 6 (11.5 - 14.0s) ====================
  if (active === 5) {
    const lt = t - 11.5
    // Beat 23 (11.5s): Col 1 active; Beat 24 (12.0s): Col 2 snaps; Beat 25 (12.5s): Col 3 snaps; Beat 26-27: highlight
    const c1 = 0.92 + 0.08 * popBeat(lt, 0.0, 0.22, 1.7)
    const c2 = popBeat(lt, 0.5, 0.24, 1.75)
    const c3 = popBeat(lt, 1.0, 0.24, 1.75)
    $('s6-c1').style.transform = `scale(${c1}) translateY(${t >= 13.0 ? -10 : 0}px)`
    $('s6-c2').style.transform = `translateY(${(1 - c2) * 90 + (t >= 13.5 ? -10 : 0)}px) scale(${0.88 + 0.12 * c2})`
    $('s6-c2').style.opacity = lt >= 0.42 ? '1' : '0.3'
    $('s6-c3').style.transform = `translateY(${(1 - c3) * 90 + (t >= 13.5 ? -10 : 0)}px) scale(${0.88 + 0.12 * c3})`
    $('s6-c3').style.opacity = lt >= 0.92 ? '1' : '0.3'
  }

  // ==================== SCENE 7 (14.0 - 16.0s) ====================
  if (active === 6) {
    const lt = t - 14.0
    const beatIdx = Math.min(3, Math.floor(lt / 0.5))
    const subT = lt - beatIdx * 0.5
    const bPop = 0.88 + 0.12 * eBack(clamp((subT + 0.06) / 0.2), 1.8)

    const configs = [
      {
        step: '01 / 04 • CAMUFLAGEM & CADASTRO',
        big: 'DISFARCE PERFEITO.',
        desc: 'Calculadora funcional + Gestão de contatos seguros',
        img1: 'assets/screens/calc.png',
        img2: 'assets/screens/novo.png',
      },
      {
        step: '02 / 04 • RESPOSTA À CRISE',
        big: 'ACIONAMENTO EM 1,5s.',
        desc: 'Botão SOS de alta precisão + Autos da Medida Protetiva',
        img1: 'assets/screens/sos.png',
        img2: 'assets/screens/medida.png',
      },
      {
        step: '03 / 04 • REDE & PROVAS FORENSES',
        big: 'REDE DE APOIO ATIVA.',
        desc: 'Notificação familiar automática + Histórico de ocorrências',
        img1: 'assets/screens/contatos.png',
        img2: 'assets/screens/historico.png',
      },
      {
        step: '04 / 04 • INTEGRAÇÃO POLICIAL',
        big: 'DESPACHO CÓDIGO 3.',
        desc: 'Painel SEMP Tático com telemetria GPS e áudio ao vivo',
        img1: 'assets/screens/tatico.png',
        img2: 'assets/screens/sos.png',
      },
    ]
    const cfg = configs[beatIdx]
    $('s7-step').textContent = cfg.step
    $('s7-big').textContent = cfg.big
    $('s7-desc').textContent = cfg.desc
    $('s7-img1').src = cfg.img1
    $('s7-img2').src = cfg.img2

    $('s7-big').style.transform = `scale(${bPop})`
    $('s7-p1').style.transform = `scale(${bPop}) rotate(-4deg)`
    $('s7-p2').style.transform = `scale(${bPop}) rotate(4deg)`
  }

  // ==================== SCENE 8 (16.0 - 18.0s) ====================
  if (active === 7) {
    const lt = t - 16.0
    const h1 = 0.9 + 0.1 * popBeat(lt, 0.0, 0.22, 1.7)
    $('s8-h1').style.transform = `scale(${h1})`
    $('s8-h2').style.transform = `scale(${h1})`

    const pb = 0.88 + 0.12 * popBeat(lt, 0.5, 0.22, 1.75)
    $('s8-pin-box').style.transform = `scale(${pb})`

    // Progressive coercion PIN typing across the 4 beats of Scene 8:
    // Beat 32 (16.0s): idle '0', Beat 33 (16.5s): '19', Beat 34 (17.0s): '1900', Beat 35 (17.5s): '=' pressed -> resets to '0' with silent alert!
    let typed = '1900='
    let calcRead = '0'
    if (t >= 16.5 && t < 17.0) { typed = '19___'; calcRead = '19' }
    else if (t >= 17.0 && t < 17.5) { typed = '1900_'; calcRead = '1900' }
    else if (t >= 17.5) { typed = '1900='; calcRead = '0' }
    $('s8-digits').textContent = typed
    $('s8-calc-readout').textContent = calcRead

    const xr = popBeat(lt, 1.0, 0.24, 1.8)
    $('s8-xray').style.transform = `translateY(${(1 - xr) * 40}px) scale(${0.92 + 0.08 * xr})`
    $('s8-xray').style.opacity = lt >= 0.92 ? '1' : '0.35'

    const sp = popBeat(t, 17.5, 0.22, 1.9)
    $('s8-silent-pill').style.transform = `scale(${t >= 17.42 ? sp : 0.85})`
    $('s8-silent-pill').style.background = t >= 17.5 ? '#7E22CE' : '#0F172A'
    $('s8-phone').style.transform = `rotate(-3deg) scale(${1 + beatBump * 0.02})`
  }

  // ==================== SCENE 9 (18.0 - 20.0s) ====================
  if (active === 8) {
    const lt = t - 18.0
    const beatIdx = Math.min(3, Math.floor(lt / 0.5))
    const e1 = 0.9 + 0.1 * popBeat(lt, 0.0, 0.24, 1.75)
    $('s9-logo').style.transform = `scale(${e1})`
    $('s9-title').style.transform = `scale(${e1})`

    // Highlight each of the 4 pillar cards in sequence across Beats 36, 37, 38, 39
    for (let k = 0; k < 4; k++) {
      const card = $(`s9-c${k}`)
      const sub = $(`s9-c${k}-sub`)
      const isHi = k === beatIdx
      card.style.background = isHi ? '#7E22CE' : '#FAF8FF'
      card.style.color = isHi ? '#FAF8FF' : '#0F172A'
      sub.style.color = isHi ? '#F0DBFF' : '#7E22CE'
      card.style.transform = `scale(${isHi ? 1.04 : 0.98})`
    }

    const f1 = 0.88 + 0.12 * popBeat(lt, 0.0, 0.26, 1.75)
    const f2 = 0.88 + 0.12 * popBeat(lt, 0.5, 0.26, 1.75)
    const f3 = 0.88 + 0.12 * popBeat(lt, 1.0, 0.26, 1.85)
    $('s9-p-left').style.transform = `translateY(${beatIdx === 0 || beatIdx === 1 ? -18 : 0}px) scale(${f1}) rotate(-8deg)`
    $('s9-p-right').style.transform = `translateY(${beatIdx === 3 ? -18 : 0}px) scale(${f2}) rotate(8deg)`
    $('s9-p-center').style.transform = `translateY(${beatIdx === 2 ? -18 : 0}px) scale(${f3})`
  }
}

window.seek = seek
seek(0)
