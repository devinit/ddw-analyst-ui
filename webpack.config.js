const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: { frontend: `./frontend/src/index.ts` },
  output: {
    path: path.resolve(__dirname, 'frontend/static/frontend/'),
    filename: 'js/bundle.js',

  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader'
      },
      {
          test: /\.(c|sc)ss$/,
          use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader' ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/bundle.css'
    }),
]
};
