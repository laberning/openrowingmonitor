// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration
import proxy from 'http2-proxy'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  mount: {
    // the web frontend is located in this directory
    './app/client': { url: '/' }
  },
  plugins: ['@snowpack/plugin-babel'],
  mode: 'development',
  packageOptions: {
    rollup: {
      plugins: [
        // todo: related to the lit documentation this should enable development mode
        // unfortunately this currently does not seem to work
        nodeResolve({
          exportConditions: ['development'],
          dedupe: true
        })
      ]
    }
  },
  devOptions: {
    open: 'none',
    output: 'stream'
  },
  buildOptions: {
    out: 'build'
  },
  optimize: {
    bundle: true,
    treeshake: true,
    minify: false,
    target: 'es2020',
    sourcemap: false
  },
  // add a proxy for websocket requests for the dev setting
  routes: [
    {
      src: '/websocket',
      upgrade: (req, socket, head) => {
        const defaultWSHandler = (err, req, socket, head) => {
          if (err) {
            socket.destroy()
          }
        }

        proxy.ws(
          req,
          socket,
          head,
          {
            hostname: 'localhost',
            port: 80
          },
          defaultWSHandler
        )
      }
    }
  ]
}
