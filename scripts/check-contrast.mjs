import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { selectBrand } from './brands.mjs'
import { assessContrast, contrastRatio } from './contrast.mjs'

// Check the resolved build output and save a report, including failed pairs.
export function checkBrand(requestedBrand) {
  const brand = selectBrand(requestedBrand)
  const output = new URL(`../dist/${brand}/`, import.meta.url)
  const tokensFile = new URL('tokens.json', output)
  if (!existsSync(tokensFile)) {
    throw new Error(`Missing dist/${brand}/tokens.json. Run BRAND=${brand} pnpm build first.`)
  }
  const tokens = JSON.parse(readFileSync(tokensFile, 'utf8'))
  const pairs = JSON.parse(readFileSync(new URL(`../brands/${brand}/pairs.json`, import.meta.url), 'utf8'))
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error(`${brand}/pairs.json must contain at least one contrast pair.`)
  }

  const results = pairs.map((pair, index) => {
    if (!Array.isArray(pair) || pair.length !== 3 ||
        typeof pair[0] !== 'string' || typeof pair[1] !== 'string' ||
        ![3, 4.5, 7].includes(pair[2])) {
      throw new Error(`${brand}/pairs.json pair ${index + 1} must be [foreground, background, minimum] with a minimum of 3, 4.5, or 7.`)
    }
    const [foreground, background, minimum] = pair
    for (const name of [foreground, background]) {
      if (!Object.hasOwn(tokens, name)) throw new Error(`${brand}: unknown colour token "${name}".`)
    }
    const foregroundColor = tokens[foreground]
    const backgroundColor = tokens[background]
    return {
      foreground,
      background,
      foregroundColor,
      backgroundColor,
      ...assessContrast(contrastRatio(foregroundColor, backgroundColor), minimum)
    }
  })

  const failed = results.filter((pair) => !pair.passes).length
  const report = { brand, total: results.length, passed: results.length - failed, failed, pairs: results }
  writeFileSync(new URL('contrast-report.json', output), JSON.stringify(report, null, 2) + '\n')
  return report
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: node scripts/check-contrast.mjs [brand]')
    const report = checkBrand(process.argv[2])
    console.table(report.pairs.map((pair) => ({
      foreground: pair.foreground,
      background: pair.background,
      ratio: pair.ratio.toFixed(2),
      minimum: pair.minimum,
      WCAG: pair.wcagLevel,
      result: pair.passes ? 'PASS' : 'FAIL'
    })))
    console.log(`${report.brand}: ${report.passed}/${report.total} pairs pass. Report: dist/${report.brand}/contrast-report.json`)
    process.exitCode = report.failed > 0 ? 1 : 0
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
