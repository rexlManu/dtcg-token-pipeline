import { readFileSync } from 'node:fs'
import { selectBrand } from './brands.mjs'
import { contrastRatio } from './contrast.mjs'

const brand = selectBrand(process.argv[2])
const tokens = JSON.parse(readFileSync(new URL(`../dist/${brand}/tokens.json`, import.meta.url), 'utf8'))
const pairs = JSON.parse(readFileSync(new URL('../tokens/contrast-pairs.json', import.meta.url), 'utf8'))
let failed = 0
for (const [foreground, background, minimum] of pairs) {
  const ratio = contrastRatio(tokens[foreground], tokens[background])
  const passes = ratio >= minimum
  if (!passes) failed++
  console.log(`${passes ? 'ok' : 'FAIL'} ${foreground} on ${background}: ${ratio.toFixed(2)} (min ${minimum})`)
}
process.exitCode = failed ? 1 : 0
