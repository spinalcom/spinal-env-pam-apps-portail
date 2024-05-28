// Generated using webpack-cli https://github.com/webpack/webpack-cli
const webpack = require("webpack");
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VuetifyLoaderPlugin } = require("vuetify-loader");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");


const isProduction = process.env.IS_PRODUCTION;

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  entry: {
    groupContext: "./src/main.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
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
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "GroupeContext",
      template: "./index.html",
      filename: "./index.html",
      chunks: ["groupContext"],
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin(),
    new VuetifyLoaderPlugin(),
    new Dotenv(),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.vue\.(s?[ac]ss)$/,
        use: ["vue-style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /(?<!\.vue)\.(s?[ac]ss)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.less$/,
        use: ["vue-style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
  stats: { warnings: false },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }

  return config;
};
