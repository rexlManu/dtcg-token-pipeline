import StyleDictionary from 'style-dictionary'
import { selectBrand } from './scripts/brands.mjs'

StyleDictionary.registerTransform({
  name: 'name/dot',
  type: 'name',
  transform: (token) => token.path.join('.')
})

export function createConfig(requestedBrand) {
  const brand = selectBrand(requestedBrand)
  return {
    usesDtcg: true,
    source: [`brands/${brand}/*.tokens.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `dist/${brand}/`,
        options: { showFileHeader: false },
        files: [{ destination: 'variables.css', format: 'css/variables' }]
      },
      json: {
        transformGroup: 'css',
        transforms: ['name/dot'],
        buildPath: `dist/${brand}/`,
        files: [{ destination: 'tokens.json', format: 'json/flat' }]
      }
    }
  }
}

export default createConfig()
