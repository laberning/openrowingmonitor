// Rollup bundling is currently not used any more since the experimental esbuild included in
// snowpack does seem to work just fine with Open Rowing Monitor and produces bundles of similar size
// If you want to use rollup bundling, make sure that you install the following dev dependencies
// @rollup/plugin-commonjs
// @rollup/plugin-node-resolve
// @rollup/plugin-typescript
// @web/rollup-plugin-html
// rollup
// rollup-plugin-copy
// rollup-plugin-summary
// rollup-plugin-terser

// Import rollup plugins
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import html from '@web/rollup-plugin-html'
import copy from 'rollup-plugin-copy'
import summary from 'rollup-plugin-summary'
import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

// Configure an instance of @web/rollup-plugin-html
const htmlPlugin = html({
  rootDir: 'app-webclient',
  flattenOutput: false
})

export default {
  // Entry point for application build; can specify a glob to build multiple
  // HTML files for non-SPA app
  input: 'index.html',
  plugins: [
    copy({
      targets: [
        { src: 'app-webclient/assets/*', dest: 'build/assets' }
      ]
    }),
    htmlPlugin,
    typescript({
      tsconfig: './app-webclient/tsconfig.json',
      compilerOptions: {
        outDir: 'build/ts'
      }
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
