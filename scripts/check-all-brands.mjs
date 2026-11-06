import { rmSync } from 'node:fs'
import StyleDictionary from 'style-dictionary'
import { createConfig } from '../style-dictionary.config.mjs'
import { listBrands } from './brands.mjs'
import { checkBrand } from './check-contrast.mjs'

const summary = []
for (const brand of listBrands()) {
  try {
    // Remove generated output so a failed build cannot leave a stale passing report.
    rmSync(new URL(`../dist/${brand}/`, import.meta.url), { recursive: true, force: true })
    const dictionary = new StyleDictionary(createConfig(brand))
    await dictionary.buildAllPlatforms()
    const report = checkBrand(brand)
    summary.push({ brand, pairs: report.total, passed: report.passed, failed: report.failed, result: report.failed ? 'FAIL' : 'PASS' })
  } catch (error) {
    console.error(`${brand}: ${error.message}`)
    summary.push({ brand, pairs: '-', passed: '-', failed: '-', result: 'ERROR' })
  }
}

console.table(summary)
const passed = summary.filter((entry) => entry.result === 'PASS').length
console.log(`${passed}/${summary.length} brands pass.`)
process.exitCode = passed === summary.length ? 0 : 1
