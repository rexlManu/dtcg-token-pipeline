import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import StyleDictionary from 'style-dictionary'
import { createConfig } from '../style-dictionary.config.mjs'
import { listBrands } from '../scripts/brands.mjs'
import { checkBrand } from '../scripts/check-contrast.mjs'
import { assessContrast, contrastRatio, relativeLuminance } from '../scripts/contrast.mjs'

test('identical colours have a ratio of 1', () => {
  for (const color of ['#000000', '#ffffff', '#0f62fe', '#0f766e']) {
    assert.equal(contrastRatio(color, color), 1)
  }
})

test('black on white has a ratio of 21 in either order', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21)
  assert.equal(contrastRatio('#ffffff', '#000000'), 21)
})

test('sRGB primary colours use the WCAG luminance weights', () => {
  assert.equal(relativeLuminance('#ff0000'), 0.2126)
  assert.equal(relativeLuminance('#00ff00'), 0.7152)
  assert.equal(relativeLuminance('#0000ff'), 0.0722)
})

test('dark channels use the linear and gamma branches at the sRGB boundary', () => {
  assert.ok(Math.abs(relativeLuminance('#0a0a0a') - 0.003035269835488375) < 1e-15)
  assert.ok(Math.abs(relativeLuminance('#0b0b0b') - 0.003346535763899161) < 1e-15)
})

for (const [minimum, level, lowerLevel] of [[3, 'AA large', 'Fail'], [4.5, 'AA', 'AA large'], [7, 'AAA', 'AA']]) {
  test(`the ${minimum}:1 threshold includes the boundary and rejects values below it`, () => {
    const below = assessContrast(minimum - 1e-10, minimum)
    assert.equal(below.passes, false)
    assert.equal(below.wcagLevel, lowerLevel)
    assert.equal(assessContrast(minimum, minimum).passes, true)
    assert.equal(assessContrast(minimum, minimum).wcagLevel, level)
    assert.equal(assessContrast(minimum + 1e-10, minimum).passes, true)
  })
}

test('a ratio that rounds to 4.50 still fails below 4.5', () => {
  const ratio = contrastRatio('#6e7978', '#ffffff')
  assert.ok(Math.abs(ratio - 4.4975956603938485) < 1e-12)
  assert.equal(ratio.toFixed(2), '4.50')
  const result = assessContrast(ratio, 4.5)
  assert.equal(result.ratio, ratio)
  assert.equal(result.passes, false)
  assert.equal(result.wcagLevel, 'AA large')
})

test('unsupported colours fail instead of producing a passing ratio', () => {
  for (const color of ['#gggggg', '#ffffff80', 'transparent', '{color.text}', undefined]) {
    assert.throws(() => contrastRatio(color, '#ffffff'), /opaque six-digit sRGB/)
  }
})

test('every shipped brand builds and passes its contrast pairs', async () => {
  for (const brand of listBrands()) {
    const dictionary = new StyleDictionary({ ...createConfig(brand), log: { verbosity: 'silent' } })
    await dictionary.buildAllPlatforms()
    const report = checkBrand(brand)
    assert.ok(report.total > 0, `${brand} must define contrast pairs`)
    assert.equal(report.failed, 0, `${brand} has failed contrast pairs`)
    assert.equal(report.passed, report.total)
    const saved = JSON.parse(readFileSync(new URL(`../dist/${brand}/contrast-report.json`, import.meta.url), 'utf8'))
    assert.deepEqual(saved, report)
  }
})
