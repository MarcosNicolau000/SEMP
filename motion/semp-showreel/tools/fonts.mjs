// Downloads the two faces locally so renders never depend on the network.
// Display: Unbounded (wide, heavy). UI: Inter (the app's own face). Plus Material Symbols for icons.
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const dir = join(here, '..', 'assets', 'fonts')
mkdirSync(dir, { recursive: true })

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const families = [
  'Unbounded:wght@500;700;800;900',
  'Inter:wght@400;500;600;700;800;900',
  'JetBrains+Mono:wght@500;700',
  'Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,1,0',
]

let css = ''
let n = 0
for (const fam of families) {
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${fam}&display=block`, {
    headers: { 'User-Agent': UA },
  })
  let text = await res.text()
  const urls = [...text.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1])
  for (const u of urls) {
    const file = `f${n++}.woff2`
    const buf = Buffer.from(await (await fetch(u)).arrayBuffer())
    writeFileSync(join(dir, file), buf)
    text = text.replace(u, `fonts/${file}`)
  }
  css += text + '\n'
}
writeFileSync(join(here, '..', 'assets', 'fonts.css'), css)
console.log('fonts:', n)
