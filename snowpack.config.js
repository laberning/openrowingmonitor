// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration
import proxy from 'http2-proxy'

// todo: might add a proxy for websockets here so we can use snowpack dev server with HMR
export default {
  mount: {
    // the web frontend is located in this directory
    './app/client': { url: '/' }
    // mount "public" to the root URL path ("/*") and serve files with zero transformations:
    // './public': { url: '/', static: true, resolve: false }
  },
  plugins: ['@snowpack/plugin-babel'],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    open: 'none',
    output: 'stream'
  },
  buildOptions: {
    out: 'build'
  },
  // add a proxy for websocket requests for the dev setting
  routes: [
    {
      src: '/websocket',
      upgrade: (req, socket, head) => {
        const defaultWSHandler = (err, req, socket, head) => {
          if (err) {
            console.error('proxy error', err)
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
