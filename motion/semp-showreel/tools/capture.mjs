// Captures the real SEMP app screens (dev server on :5199) as phone-size PNGs
// used inside the showreel. Run once: node tools/capture.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'assets', 'screens')
mkdirSync(out, { recursive: true })

const BASE = process.env.SEMP_URL ?? 'http://localhost:5199'
const routes = [
  ['calc', '/'],
  ['sos', '/app'],
  ['medida', '/app/medida'],
  ['contatos', '/app/contatos'],
  ['novo', '/app/contatos/novo'],
  ['historico', '/app/historico'],
  ['tatico', '/tatico'],
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 })
for (const [name, path] of routes) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(out, `${name}.png`) })
  await page.screenshot({ path: join(out, `${name}-full.png`), fullPage: true })
  console.log('captured', name)
}
await browser.close()
