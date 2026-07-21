const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const DEV_PORT = 3001;

// Function form lets us read argv.mode directly — more reliable than process.env.NODE_ENV
// which depends on the shell environment rather than the actual --mode flag.
module.exports = (env, argv) => {
  // true when built with: webpack --mode production  (i.e. npm run build / Docker)
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      // In dev mode the remote is injected cross-origin from the spin-core host.
      // publicPath: 'auto' relies on document.currentScript which is unreliable for
      // async cross-origin scripts — webpack may resolve chunks against the host
      // (localhost:3000) instead of the module server.  An explicit full URL fixes this.
      publicPath: isProduction ? 'auto' : `http://localhost:${DEV_PORT}/`,
      uniqueName: 'spinDocs',
      clean: true,
    },
    // Production (Docker/federated): the host sets window.React / window.ReactDOM before
    // loading remoteEntry.js, so we share the host's single React 19 instance.
    // react/jsx-runtime is intentionally NOT externalized — window.React doesn't expose .jsx;
    // the bundled jsx-runtime creates elements via Symbol.for('react.element') which the
    // host's React 19 reconciler recognises correctly.
    // Dev (standalone npm run start): bundle everything; React 19 has no UMD build.
    externals: isProduction ? {
      react: 'React',
      'react-dom': 'ReactDOM',
      'react-dom/client': 'ReactDOM',
    } : {},
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          // mermaid ships its own CSS; bundle it into the JS chunk
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'spinDocs',           // → window.spinDocs (scope in spin-core modules table)
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App',     // → component: "./App" in spin-core
        },
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new CopyPlugin({ patterns: [{ from: 'public/manifest.json', to: 'manifest.json' }] }),
    ],
    devServer: {
      port: DEV_PORT,
      headers: {
        'Access-Control-Allow-Origin': '*', // required for cross-origin federation loading
      },
    },
  };
};
