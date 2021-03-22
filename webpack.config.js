/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {
  mode: 'development',
  entry: ['@babel/polyfill', './frontend/src/index.ts'],
  output: {
    path: path.resolve(__dirname, 'frontend/static/frontend/'),
    filename: 'js/bundle.js',
    chunkFilename: 'js/[name].bundle.js',
    publicPath: '/static/frontend/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(c|sc)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  devtool: 'eval-source-map',
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/bundle.css',
    }),
    // new BundleAnalyzerPlugin(),
    new LiveReloadPlugin(),
  ],
};
