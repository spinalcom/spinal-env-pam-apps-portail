const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        open: true,
        host: "0.0.0.0",
        port: 1235,
        static: {
          directory: path.join(__dirname, "public"),
          watch: true,
        },
        historyApiFallback: true,
        client: {
          logging: "info",
          overlay: false,
          progress: true
        },
      },
})