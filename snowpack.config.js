// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

// todo: might add a proxy for websockets here so we can use snowpack dev server with HMR
export default {
  mount: {
    // the web frontend is located in this directory
    './app/client': { url: '/' }
    // mount "public" to the root URL path ("/*") and serve files with zero transformations:
    // './public': { url: '/', static: true, resolve: false }
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    open: 'none',
    output: 'stream'
  },
  buildOptions: {
    out: 'build'
  }
}
