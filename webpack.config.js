const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = [
    {
        target: "electron-main",
        entry: {
            main: "./src/node/main.ts"
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/i,
                    exclude: /node_modules/,
                    use: "ts-loader",
                },
            ]
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
                "./src/client/index.ts",
                "./src/client/index.css"
            ]
        },
        resolve: {
            extensions: [".tsx", ".ts", ".jsx", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/i,
                    exclude: /node_modules/,
                    use: "ts-loader",
                },
                {
                    resourceQuery: /raw/,
                    type: 'asset/source',
                },
                {
                    test: /\.html$/i,
                    exclude: /index\.html/,
                    loader: "html-loader",
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/inline",
                },
                {
                    test: /\.css$/i,
                    resourceQuery: { not: [/raw/] },
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