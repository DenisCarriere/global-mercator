import nodeResolve from 'rollup-plugin-node-resolve'
const pkg = require('./package.json')

export default {
  entry: 'index.js',
  moduleName: 'globalMercator',
  sourceMap: true,
  plugins: [nodeResolve({jsnext: true})],
  targets: [
    { dest: pkg['main'], format: 'cjs' },
    { dest: pkg['browser'], format: 'umd' },
    { dest: pkg['jsnext:main'], format: 'es' }
  ]
}
