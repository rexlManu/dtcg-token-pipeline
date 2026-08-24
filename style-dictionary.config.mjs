export default {
  source: ['tokens/*.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{ destination: 'variables.css', format: 'css/variables' }]
    }
  }
}
