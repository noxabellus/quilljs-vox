import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    {
        mode: "development",
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
            // clean: true,
        },
        optimization: {
            minimize: false
        }
    },
    {
        mode: "development",
        target: "electron-renderer",
        entry: {
            index: [
                "./src/client/index.tsx",
                "./src/client/index.css"
            ]
        },
        resolve: {
            alias: {
                Assets: path.resolve(__dirname, "src/assets/"),
                Document: path.resolve(__dirname, "src/document/"),
                Client: path.resolve(__dirname, "src/client/"),
                "Document$": path.resolve(__dirname, "src/document/index.ts"),
                Elements: path.resolve(__dirname, "src/elements/"),
                Support: path.resolve(__dirname, "src/support/"),
                Extern: path.resolve(__dirname, "src/extern/"),
                Experimental: path.resolve(__dirname, "src/experimental/"),
            },
            extensions: [".tsx", ".ts", ".jsx", ".js"],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/i,
                    exclude: /node_modules/,
                    use: "ts-loader",
                },
                {
                    resourceQuery: /raw/,
                    type: "asset/source",
                },
                {
                    resourceQuery: { not: [/raw/] },
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
