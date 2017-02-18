const pkg = require('./package.json')

export default {
  entry: 'index.js',
  moduleName: 'globalMercator',
  sourceMap: true,
  legacy: true,
  targets: [
    { dest: pkg['main'], format: 'umd' }
  ]
}
