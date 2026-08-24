import { readdirSync, readFileSync } from 'node:fs'

const tokens = {}
for (const file of readdirSync('tokens').filter((f) => f.endsWith('.tokens.json'))) {
  const walk = (node, path) => {
    for (const [key, value] of Object.entries(node)) {
      const next = [...path, key]
      if (value && typeof value === 'object' && '$value' in value) tokens[next.join('.')] = value.$value
      else if (value && typeof value === 'object') walk(value, next)
    }
  }
  walk(JSON.parse(readFileSync(`tokens/${file}`, 'utf8')), [])
}

const pairs = JSON.parse(readFileSync('tokens/contrast-pairs.json', 'utf8'))
const hex = (v) => v.replace('#', '')
const lum = (h) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

let failed = 0
for (const [fg, bg, min] of pairs) {
  const value = ratio(tokens[fg], tokens[bg])
  const ok = value >= min
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${fg} on ${bg}: ${value.toFixed(2)} (min ${min})`)
}
process.exit(failed ? 1 : 0)
