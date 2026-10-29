// SEMP 40s (60 BPM) Showreel Renderer — obeys motion/AGENTS.md contract:
// - Drives window.seek(t) deterministically in headless Chromium
// - `node render.mjs sheet` -> renders 1 frame per beat (all 40 beats at 60 BPM) into out/sheet.jpg
// - `node render.mjs`       -> renders full 40s 60fps H.264 yuv420p CRF 16 video + -14 LUFS audio -> out/semp-40s.mp4
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, 'out');
mkdirSync(OUT, { recursive: true });

const mode = process.argv[2] ?? 'full';
const beatsData = JSON.parse(readFileSync(join(here, 'beats.json'), 'utf8'));
const filmUrl = pathToFileURL(join(here, 'film.html')).href;

async function openFilmPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(filmUrl, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = [...document.querySelectorAll('img')];
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            }),
      ),
    );
  });
  return page;
}

if (mode === 'sheet') {
  const browser = await chromium.launch();
  const page = await openFilmPage(browser);
  const beatDir = join(OUT, 'beats');
  mkdirSync(beatDir, { recursive: true });

  // Render all 40 musical beats at 60 BPM (0.0s, 1.0s, ..., 39.0s)
  const beatTimes = beatsData.beats.filter((t) => t < 40.0);
  for (let i = 0; i < beatTimes.length; i++) {
    const t = beatTimes[i];
    await page.evaluate((time) => window.seek(time), t);
    const f = join(beatDir, `b${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: f });
  }

  // Verify determinism: seek(21.0) after seek(38.0) must match seek(21.0) after seek(0.0)
  await page.evaluate(() => window.seek(0.0));
  await page.evaluate(() => window.seek(21.0));
  const bufA = await page.screenshot();
  await page.evaluate(() => window.seek(38.0));
  await page.evaluate(() => window.seek(21.0));
  const bufB = await page.screenshot();
  if (!bufA.equals(bufB)) {
    throw new Error('Determinism check failed: window.seek(21.0) depends on prior state!');
  }
  console.log('Determinism check PASSED (pure function of t).');
  await browser.close();

  // Assemble 5x8 contact sheet of all 40 beats (out/sheet.jpg)
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      '2',
      '-i',
      join(beatDir, 'b%03d.png'),
      '-vf',
      'scale=480:270,drawbox=x=0:y=0:w=480:h=270:color=black@0.25:t=2,tile=5x8:margin=6:padding=6:color=0x0f172a',
      '-frames:v',
      '1',
      '-q:v',
      '2',
      join(OUT, 'sheet.jpg'),
    ],
    { stdio: 'inherit' },
  );

  console.log('Contact sheet (40 beats, 5x8) written to out/sheet.jpg');
  process.exit(0);
}

// Full render mode: 60 fps, 40 seconds = 2400 frames, H.264 yuv420p CRF 16 + -14 LUFS audio
const FPS = 60;
const DUR = 40;
const TOTAL = FPS * DUR;
const WORKERS = 6;

console.log(`Rendering ${TOTAL} frames at ${FPS} fps with ${WORKERS} parallel pages...`);
const browser = await chromium.launch();
const pages = await Promise.all(Array.from({ length: WORKERS }, () => openFilmPage(browser)));

const silentMp4 = join(OUT, 'video-silent.mp4');
const ff = spawn(
  'ffmpeg',
  [
    '-y',
    '-f',
    'image2pipe',
    '-vcodec',
    'mjpeg',
    '-framerate',
    String(FPS),
    '-i',
    '-',
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '16',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    silentMp4,
  ],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);

const t0 = Date.now();
for (let base = 0; base < TOTAL; base += WORKERS) {
  const count = Math.min(WORKERS, TOTAL - base);
  const buffers = await Promise.all(
    Array.from({ length: count }, async (_, w) => {
      const frameIdx = base + w;
      const t = frameIdx / FPS;
      const p = pages[w];
      await p.evaluate((time) => window.seek(time), t);
      return p.screenshot({ type: 'jpeg', quality: 96 });
    }),
  );
  for (const buf of buffers) {
    if (!ff.stdin.write(buf)) {
      await new Promise((res) => ff.stdin.once('drain', res));
    }
  }
  if ((base + count) % 240 === 0 || base + count === TOTAL) {
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`  ${base + count}/${TOTAL} frames (${elapsed}s)`);
  }
}
ff.stdin.end();
await new Promise((res, rej) => {
  ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`))));
});
await browser.close();

// Normalize mix.wav to -14 LUFS and mux into final H.264 yuv420p CRF 16 master
const finalMp4 = join(OUT, 'semp-40s.mp4');
const rootMp4 = join(here, '..', 'semp-40s.mp4');
if (!existsSync(join(OUT, 'mix.wav'))) {
  execFileSync('node', [join(here, 'score.mjs')], { stdio: 'inherit' });
}

execFileSync(
  'ffmpeg',
  [
    '-y',
    '-i',
    silentMp4,
    '-i',
    join(OUT, 'mix.wav'),
    '-filter_complex',
    '[1:a]loudnorm=I=-14:TP=-1.5:LRA=11[aout]',
    '-map',
    '0:v:0',
    '-map',
    '[aout]',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-shortest',
    '-movflags',
    '+faststart',
    finalMp4,
  ],
  { stdio: 'inherit' },
);

copyFileSync(finalMp4, rootMp4);
console.log(`Master rendered: ${finalMp4} and ${rootMp4}`);
