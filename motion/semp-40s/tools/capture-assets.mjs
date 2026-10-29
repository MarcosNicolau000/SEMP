import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const URL_BASE = 'http://localhost:5198';
const OUT_DIR = path.resolve('motion/semp-40s/assets');
const ROOT_ASSETS_DIR = path.resolve('assets');

async function ensureViteServer() {
  const viteProc = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5198', '--strictPort'], {
    stdio: 'ignore',
  });
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(URL_BASE);
      if (res.ok) return viteProc;
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Vite server did not start on port 5198');
}

async function saveShot(target, filename, opts = {}) {
  const outPath = path.join(OUT_DIR, filename);
  await target.screenshot({ path: outPath, ...opts });
  fs.copyFileSync(outPath, path.join(ROOT_ASSETS_DIR, filename));
  const stat = fs.statSync(outPath);
  console.log('saved', filename, stat.size);
  return { filename, bytes: stat.size };
}

async function main() {
  let viteProc = null;
  try {
    viteProc = await ensureViteServer();
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.mkdirSync(ROOT_ASSETS_DIR, { recursive: true });

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();
    const captured = [];

    // 1. CALCULADORA (/)
    console.log('visiting /');
    await page.goto(`${URL_BASE}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    await page.evaluate(() => {
      const keypad = document.querySelector('.grid-cols-4');
      const wrap = keypad?.parentElement;
      if (wrap && wrap.children.length >= 2) {
        const topGroup = wrap.children[0];
        if (topGroup && topGroup.children.length >= 2) {
          topGroup.children[0].setAttribute('data-cap', 'calc-header');
          topGroup.children[1].setAttribute('data-cap', 'calc-display');
        }
        keypad.setAttribute('data-cap', 'calc-keypad');
      }
    });

    captured.push(await saveShot(page, 'screen-calculadora.png'));
    captured.push(await saveShot(page.locator('[data-cap="calc-header"]'), 'calc-header.png'));
    captured.push(await saveShot(page.locator('[data-cap="calc-display"]'), 'calc-display-0.png'));
    captured.push(await saveShot(page.locator('[data-cap="calc-keypad"]'), 'calc-keypad.png'));

    const calcKeypad = page.locator('[data-cap="calc-keypad"]');
    const calcDisplay = page.locator('[data-cap="calc-display"]');
    const calcHeader = page.locator('[data-cap="calc-header"]');

    for (const [digit, suffix] of [
      ['9', '9'],
      ['4', '94'],
      ['8', '948'],
      ['2', '9482'],
    ]) {
      await calcKeypad.getByRole('button', { name: digit, exact: true }).click();
      await page.waitForTimeout(60);
      captured.push(await saveShot(calcDisplay, `calc-display-${suffix}.png`));
    }
    captured.push(await saveShot(page, 'screen-calculadora-9482.png'));

    // Clear and type 1900= for silent coercion mode
    await calcKeypad.getByRole('button', { name: 'C', exact: true }).click();
    for (const d of ['1', '9', '0', '0', '=']) {
      await calcKeypad.getByRole('button', { name: d, exact: true }).click();
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(120);
    captured.push(await saveShot(page, 'screen-calculadora-coacao.png'));
    captured.push(await saveShot(calcHeader, 'calc-header-coacao.png'));
    captured.push(await saveShot(calcDisplay, 'calc-display-coacao.png'));

    // 2. PAINEL SOS (/app)
    console.log('visiting /app');
    await page.goto(`${URL_BASE}/app`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const brandInfo = await page.evaluate(() => {
      const headerSvg = document.querySelector('header svg');
      const bodyStyle = getComputedStyle(document.body);
      const h1 = document.querySelector('header h1');
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const sosWrap = document.querySelector('main > div > div');
      if (sosWrap && sosWrap.children.length >= 3) {
        sosWrap.children[0].setAttribute('data-cap', 'ui-status-pill');
        sosWrap.children[1].setAttribute('data-cap', 'ui-sos-center');
        sosWrap.children[2].setAttribute('data-cap', 'ui-aviso-card');
      }
      return {
        logoSvg: headerSvg ? headerSvg.outerHTML : null,
        colors: {
          primary: '#7e22ce',
          primaryContainer: '#6b21a8',
          secondary: '#dc2626',
          tertiary: '#059669',
          surface: '#faf8ff',
          onSurface: '#0f172a',
          taticoDark: '#0f172a',
          bodyBg: bodyStyle.backgroundColor,
          bodyColor: bodyStyle.color,
        },
        fonts: {
          display: h1Style ? h1Style.fontFamily : 'Unbounded, sans-serif',
          sans: bodyStyle.fontFamily,
          mono: 'JetBrains Mono, monospace',
        },
      };
    });

    if (brandInfo.logoSvg) {
      fs.writeFileSync(path.join(OUT_DIR, 'logo.svg'), brandInfo.logoSvg);
      fs.writeFileSync(path.join(ROOT_ASSETS_DIR, 'logo.svg'), brandInfo.logoSvg);
    }

    captured.push(await saveShot(page, 'screen-sos-idle.png'));
    captured.push(await saveShot(page.locator('header').first(), 'ui-header.png'));
    captured.push(await saveShot(page.locator('[data-cap="ui-status-pill"]'), 'ui-status-pill.png'));
    captured.push(await saveShot(page.locator('[data-cap="ui-sos-center"]'), 'ui-sos-idle.png'));
    captured.push(await saveShot(page.locator('[data-cap="ui-aviso-card"]'), 'ui-aviso-card.png'));
    captured.push(await saveShot(page.locator('nav').first(), 'ui-bottom-nav.png'));

    // Hold SOS button for 1.6s to trigger real SOS state
    const sosBtn = page.locator('[data-cap="ui-sos-center"] button').first();
    const box = await sosBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(750);
      captured.push(await saveShot(page.locator('[data-cap="ui-sos-center"]'), 'ui-sos-holding.png'));
      await page.waitForTimeout(950);
      await page.mouse.up();
    }
    await page.waitForTimeout(250);

    captured.push(await saveShot(page, 'screen-sos-active.png'));
    captured.push(await saveShot(page.locator('[data-cap="ui-status-pill"]'), 'ui-status-active.png'));
    captured.push(await saveShot(page.locator('[data-cap="ui-sos-center"]'), 'ui-sos-active.png'));

    // 3. MEDIDA PROTETIVA (/app/medida)
    console.log('visiting /app/medida');
    await page.goto(`${URL_BASE}/app/medida`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const w = document.querySelector('main > div > div');
      if (w && w.children.length >= 3) {
        w.children[0].setAttribute('data-cap', 'medida-autos');
        w.children[1].setAttribute('data-cap', 'medida-regras');
        w.children[2].setAttribute('data-cap', 'medida-agressor');
      }
    });
    await page.waitForTimeout(250);

    captured.push(await saveShot(page, 'screen-medida.png'));
    captured.push(await saveShot(page.locator('[data-cap="medida-autos"]'), 'medida-card-autos.png'));
    captured.push(await saveShot(page.locator('[data-cap="medida-regras"]'), 'medida-regras.png'));
    captured.push(await saveShot(page.locator('[data-cap="medida-agressor"]'), 'medida-agressor.png'));

    await page.locator('button[title="Copiar número do processo"]').click();
    await page.waitForTimeout(120);
    captured.push(await saveShot(page.locator('[data-cap="medida-autos"]'), 'medida-card-copied.png'));

    // 4. REDE DE APOIO (/app/contatos)
    console.log('visiting /app/contatos');
    await page.goto(`${URL_BASE}/app/contatos`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const secs = document.querySelectorAll('main section');
      if (secs.length >= 3) {
        secs[0].setAttribute('data-cap', 'sec-pins');
        secs[1].setAttribute('data-cap', 'sec-contatos');
        secs[2].setAttribute('data-cap', 'sec-protocolo');
      }
    });
    await page.waitForTimeout(250);

    const secPins = page.locator('[data-cap="sec-pins"]');
    captured.push(await saveShot(secPins, 'contatos-pins-hidden.png'));
    captured.push(await saveShot(page.locator('[data-cap="sec-contatos"]'), 'contatos-lista.png'));
    captured.push(await saveShot(page.locator('[data-cap="sec-protocolo"]'), 'contatos-protocolo.png'));

    const pinButtons = secPins.locator('button');
    const count = await pinButtons.count();
    for (let i = 0; i < count; i++) {
      await pinButtons.nth(i).click();
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(120);
    captured.push(await saveShot(secPins, 'contatos-pins-revealed.png'));
    captured.push(await saveShot(page, 'screen-contatos.png'));

    // 5. HISTORICO (/app/historico)
    console.log('visiting /app/historico');
    await page.goto(`${URL_BASE}/app/historico`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const w = document.querySelector('main > div > div');
      if (w && w.children.length >= 2) {
        w.children[1].setAttribute('data-cap', 'hist-list');
      }
    });
    await page.waitForTimeout(250);
    captured.push(await saveShot(page, 'screen-historico.png'));
    captured.push(await saveShot(page.locator('[data-cap="hist-list"]'), 'historico-lista.png'));

    await page.locator('button', { hasText: 'Exportar Provas em PDF' }).click();
    await page.waitForTimeout(180);
    captured.push(await saveShot(page, 'screen-historico-pdf.png'));

    // 6. SEMP TATICO (/tatico)
    console.log('visiting /tatico');
    await page.goto(`${URL_BASE}/tatico`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const w = document.querySelector('main');
      if (w && w.children.length >= 5) {
        w.children[0].setAttribute('data-cap', 'tatico-banner');
        w.children[1].setAttribute('data-cap', 'tatico-map');
        w.children[2].setAttribute('data-cap', 'tatico-audio');
        w.children[3].setAttribute('data-cap', 'tatico-envolvidos');
        w.children[4].setAttribute('data-cap', 'tatico-actions');
      }
    });

    captured.push(await saveShot(page, 'screen-tatico.png'));
    captured.push(await saveShot(page.locator('header').first(), 'tatico-header.png'));
    captured.push(await saveShot(page.locator('[data-cap="tatico-banner"]'), 'tatico-banner.png'));
    captured.push(await saveShot(page.locator('[data-cap="tatico-map"]'), 'tatico-map.png'));
    captured.push(await saveShot(page.locator('[data-cap="tatico-audio"]'), 'tatico-audio.png'));
    captured.push(await saveShot(page.locator('[data-cap="tatico-envolvidos"]'), 'tatico-envolvidos.png'));

    const taticoActions = page.locator('[data-cap="tatico-actions"]');
    captured.push(await saveShot(taticoActions, 'tatico-btn-confirmar.png'));

    await taticoActions.locator('button').first().click();
    await page.waitForTimeout(180);
    captured.push(await saveShot(taticoActions, 'tatico-btn-nolocal.png'));
    captured.push(await saveShot(page, 'screen-tatico-nolocal.png'));

    const manifest = {
      capturedAt: new Date().toISOString(),
      sourceUrl: URL_BASE,
      viewport: { width: 390, height: 844, deviceScaleFactor: 3 },
      brand: brandInfo,
      assets: captured,
    };

    fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
    fs.writeFileSync(path.join(ROOT_ASSETS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

    await browser.close();
    console.log(`SUCCESS: Captured ${captured.length} assets`);
  } catch (err) {
    console.log('CAUGHT ERROR:', err && err.stack ? err.stack : String(err));
    process.exit(1);
  } finally {
    if (viteProc) viteProc.kill();
  }
}

main();
