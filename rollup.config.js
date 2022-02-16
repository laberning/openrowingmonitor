// Import rollup plugins
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import html from '@web/rollup-plugin-html'
import copy from 'rollup-plugin-copy'
import summary from 'rollup-plugin-summary'
import { terser } from 'rollup-plugin-terser'

// Configure an instance of @web/rollup-plugin-html
const htmlPlugin = html({
  rootDir: 'app/client',
  flattenOutput: false
})

export default {
  // Entry point for application build; can specify a glob to build multiple
  // HTML files for non-SPA app
  input: 'index.html',
  plugins: [
    copy({
      targets: [
        { src: 'app/client/assets/*', dest: 'build/assets' }
      ]
    }),
    htmlPlugin,
    // transpile decorators so we can use the upcoming ES decorator syntax
    babel({
      babelrc: true,
      babelHelpers: 'bundled'
    }),
    // convert modules with commonJS syntax to ESM
    commonjs(),
    // resolve bare module specifiers to relative paths
    resolve(),
    // minify JS
    terser({
      ecma: 2020,
      module: true,
      mangle: {
        properties: {
          regex: /^__/
        }
      }
    }),
    summary({})
  ],
  output:
    {
      format: 'es',
      chunkFileNames: '[name]-[hash].js',
      entryFileNames: '[name]-[hash].js',
      dir: 'build'
    },
  preserveEntrySignatures: false
}
