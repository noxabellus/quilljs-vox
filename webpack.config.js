const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = [
    {
        target: "electron-main",
        entry: {
            main: "./src/node/main.js"
        },
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, "dist/"),
            clean: true,
        },
        optimization: {
            minimize: false
        }
    },
    {
        target: "electron-renderer",
        entry: {
            index: [
                "./src/client/index.js",
                "./src/client/index.css"
            ]
        },
        module: {
            rules: [
                {
                    test: /\.html$/i,
                    exclude: /index\.html/,
                    loader: "html-loader",
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "src/client/index.html",
                inject: "body",
            }),
            new MiniCssExtractPlugin({
                insert: "head"
            }),
        ],
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname, "dist/client"),
        },
        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
            ],
        },
    },
];