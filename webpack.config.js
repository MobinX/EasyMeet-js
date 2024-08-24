const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
// const NpmDtsPlugin = require('npm-dts-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const { log } = require("console");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  output: {
    filename: "./index.js",
    path: path.resolve(__dirname, "dist"),
    // libraryTarget: "module", // Set to 'module' for ES6 module output
    library: 'WebrtcBase',  // The global variable name
    libraryTarget: 'umd',
  },
  // experiments: {
  //   outputModule: true, // This is necessary for module output in Webpack
  // },
  devServer: {
    static: {
      directory: path.join(__dirname, "/"),
    },
    compress: true,
    port: 9000,
    allowedHosts: "all",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        // { from: 'src', to: 'src' },
        { from: "package.json" },
      ],
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },

  // Other options...
  optimization: {
    minimize: false,
  },
};
