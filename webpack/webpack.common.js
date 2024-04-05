const path = require('path');
const srcDir = path.join(__dirname, "..", "src");
const distDir = path.join(__dirname, "..", "dist");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    bundle: path.join(srcDir, 'main.js'),
    popup: path.join(srcDir, 'popup.js'),
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: '[name].js',
    path: distDir,
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()]
};