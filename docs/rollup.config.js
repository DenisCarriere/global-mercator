import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'index.js',
  dest: 'docs/global-mercator.min.js',
  format: 'umd',
  plugins: [
    commonjs()
  ],
  useStrict: false,
  moduleName: 'mercator'
}
