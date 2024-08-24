const path = require('path');
const rootDir = path.join(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(rootDir, "assets");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    bundle: path.join(srcDir, 'main.js'),
    popup: path.join(srcDir, 'popup.js'),
    background: path.join(srcDir, 'background.js')
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
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from:  path.join(rootDir, 'popup.html') },
        { from: assetsDir, to: 'assets' },
        { from:  path.join(rootDir, 'manifest.json') },
        { from:  path.join(rootDir, 'LICENSE') },
        { from:  path.join(rootDir, 'README.md') },
      ]
    })
  ]
};