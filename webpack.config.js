const path = require("path");

const moduleName = 'frontend';

module.exports = {
  entry: `./${moduleName}/src/index.js`,
  output: {
    path: path.resolve(__dirname, `${moduleName}/static/${moduleName}/js/`),
    filename: 'main.js',

  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
