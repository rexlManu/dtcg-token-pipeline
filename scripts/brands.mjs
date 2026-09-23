import { readdirSync } from 'node:fs'

export function listBrands() {
  const brands = readdirSync(new URL('../brands/', import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  if (brands.length === 0) throw new Error('No brand directories found in brands/.')
  return brands
}

export function selectBrand(brand = process.env.BRAND ?? 'acme') {
  const brands = listBrands()
  if (!brands.includes(brand)) {
    throw new Error(`Unknown brand "${brand}". Choose one of: ${brands.join(', ')}.`)
  }
  return brand
}
