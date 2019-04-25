const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: [ '@babel/polyfill', './frontend/src/index.ts' ],
  output: {
    path: path.resolve(__dirname, 'frontend/static/frontend/'),
    filename: 'js/bundle.js',
    chunkFilename: 'js/[name].bundle.js',
    publicPath: '/static/frontend/'

  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
          test: /\.(c|sc)ss$/,
          use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ]
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/bundle.css'
    }),
]
};
