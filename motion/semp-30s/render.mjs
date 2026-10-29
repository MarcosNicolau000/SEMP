// SEMP 30s Showreel Renderer — obeys motion/AGENTS.md contract:
// - Drives window.seek(t) deterministically in headless Chromium
// - `node render.mjs sheet` -> renders 1 frame per beat into out/sheet.jpg & out/sheet-60beats.jpg
// - `node render.mjs`       -> renders full 30s 60fps H.264 yuv420p CRF 16 video + -14 LUFS audio -> out/semp-30s.mp4
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
  const storyDir = join(OUT, 'story-beats');
  mkdirSync(beatDir, { recursive: true });
  mkdirSync(storyDir, { recursive: true });

  // 1) Render 15 story beats (one frame per story beat across the 30s arc)
  const storyBeats = beatsData.storyBeats ?? [];
  for (let i = 0; i < storyBeats.length; i++) {
    const t = storyBeats[i].t;
    await page.evaluate((time) => window.seek(time), t);
    const f = join(storyDir, `s${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: f });
  }

  // 2) Render all 60 musical beats (0.0s .. 29.5s)
  const beatTimes = beatsData.beats.filter((t) => t < 30.0);
  for (let i = 0; i < beatTimes.length; i++) {
    const t = beatTimes[i];
    await page.evaluate((time) => window.seek(time), t);
    const f = join(beatDir, `b${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: f });
  }

  // Verify determinism: seek(13.5) after seek(28.0) must match seek(13.5) after seek(0.0)
  await page.evaluate(() => window.seek(0.0));
  await page.evaluate(() => window.seek(13.5));
  const bufA = await page.screenshot();
  await page.evaluate(() => window.seek(28.0));
  await page.evaluate(() => window.seek(13.5));
  const bufB = await page.screenshot();
  if (!bufA.equals(bufB)) {
    throw new Error('Determinism check failed: window.seek(13.5) depends on prior state!');
  }
  console.log('Determinism check PASSED (pure function of t).');
  await browser.close();

  // Assemble 3x5 story-beat contact sheet (out/sheet.jpg)
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      '2',
      '-i',
      join(storyDir, 's%03d.png'),
      '-vf',
      'scale=640:360,drawbox=x=0:y=0:w=640:h=360:color=black@0.25:t=2,tile=3x5:margin=8:padding=8:color=0x0f172a',
      '-frames:v',
      '1',
      '-q:v',
      '2',
      join(OUT, 'sheet.jpg'),
    ],
    { stdio: 'inherit' },
  );

  // Assemble 6x10 musical-beat contact sheet (out/sheet-60beats.jpg)
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      '2',
      '-i',
      join(beatDir, 'b%03d.png'),
      '-vf',
      'scale=384:216,drawbox=x=0:y=0:w=384:h=216:color=black@0.25:t=2,tile=6x10:margin=4:padding=4:color=0x0f172a',
      '-frames:v',
      '1',
      '-q:v',
      '2',
      join(OUT, 'sheet-60beats.jpg'),
    ],
    { stdio: 'inherit' },
  );

  console.log('Contact sheets written to out/sheet.jpg and out/sheet-60beats.jpg');
  process.exit(0);
}

// Full render mode: 60 fps, 30 seconds = 1800 frames, H.264 yuv420p CRF 16 + -14 LUFS audio
const FPS = 60;
const DUR = 30;
const TOTAL = FPS * DUR;
const WORKERS = 4;

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
  if ((base + count) % 180 === 0 || base + count === TOTAL) {
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
const finalMp4 = join(OUT, 'semp-30s.mp4');
const rootMp4 = join(here, '..', 'semp-30s.mp4');
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
