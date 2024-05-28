// Generated using webpack-cli https://github.com/webpack/webpack-cli
const webpack = require("webpack");
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { VuetifyLoaderPlugin } = require("vuetify-loader");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const isProduction = false;

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  entry: {
    app: "./src/main.ts",
    // groupContext: "./micro-apps/spinal-context-group/src/main.ts",
    // insights: "./micro-apps/spinal-env-pam-insights/src/index.ts",
    // description:
    //   "./micro-apps/spinal-env-pam-viewer-app-description/src/index.ts",
    ProfileManager:
      "./micro-apps/spinal-env-pam-app-profile-manager/src/main.ts",
    BuildingManager: "./micro-apps/spinal-env-pam-building-manager/src/main.ts",
    AppsManager: "./micro-apps/spinal-env-pam-apps-manager/src/main.ts",
    // EnvPamInsights: './micro-apps/spinal-env-pam-insights/src/index.ts',
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
  },
  devServer: {
    open: true,
    host: "0.0.0.0",
    port: 1234,
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
      title: "Portail PAM",
      template: "./htmlTemplate/app.html.ejs",
      filename: "./index.html",
      chunks: ["app"],
    }),
    // new HtmlWebpackPlugin({
    //   title: "GroupeContext",
    //   template: "./micro-apps/spinal-context-group/index.html",
    //   filename: "./micro-apps/spinal-context-group/index.html",
    //   chunks: ["groupContext"],
    // }),
    new HtmlWebpackPlugin({
      title: "ProfileManager",
      template: "./micro-apps/spinal-env-pam-app-profile-manager/index.html",
      filename: "./micro-apps/spinal-env-pam-app-profile-manager/index.html",
      chunks: ["ProfileManager"],
    }),
    new HtmlWebpackPlugin({
      title: "AppsManager",
      template: "./micro-apps/spinal-env-pam-apps-manager/index.html",
      filename: "./micro-apps/spinal-env-pam-apps-manager/index.html",
      chunks: ["AppsManager"],
    }),
    new HtmlWebpackPlugin({
      title: "BuildingManager",
      template: "./micro-apps/spinal-env-pam-building-manager/index.html",
      filename: "./micro-apps/spinal-env-pam-building-manager/index.html",
      chunks: ["BuildingManager"],
    }),
    // new HtmlWebpackPlugin({
    //   title: "Insights",
    //   template: "./micro-apps/spinal-env-pam-insights/index.html",
    //   filename: "./micro-apps/spinal-env-pam-insights/index.html",
    //   chunks: ["insights"],
    // }),
    // new HtmlWebpackPlugin({
    //   title: "Description",
    //   template: "./micro-apps/spinal-env-pam-viewer-app-description/index.html",
    //   filename: "./micro-apps/spinal-env-pam-viewer-app-description/index.html",
    //   chunks: ["description"],
    // }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin(),
    new VuetifyLoaderPlugin(),
    new Dotenv(),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
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
