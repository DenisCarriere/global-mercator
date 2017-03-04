import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import json from 'rollup-plugin-json'

module.exports = {
  entry: 'index.js',
  dest: 'docs/global-mercator.min.js',
  format: 'umd',
  plugins: [
    json(),
    resolve(),
    commonjs(),
    globals(),
    builtins()
  ],
  useStrict: false,
  moduleName: 'mercator'
}
