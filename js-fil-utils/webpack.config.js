const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './commp.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module', // Output as an ES module
    },
  },
  experiments: {
    outputModule: true, // Allow outputting ES modules
  },
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      process: require.resolve('process'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  mode: 'production',
};


