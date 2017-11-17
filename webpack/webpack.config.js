const path = require("path");

const webpack = require("webpack");
const htmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: {
        index: "./index",
        content: "./content",
    },
    output: {
        path:  path.resolve(__dirname, 'dist'),
		filename: "[name].js"
    },
    module: {
        rules: [
            
        ]
    },
    resolve: {

    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ["common"],
            chunks: ["index", "content"],
            minChunks: 2
        }),

        new htmlWebpackPlugin({
            filename: "index.html",
            template: "./index.tpl"
        }),

        new htmlWebpackPlugin({
            filename: "content.html",
            template: "./content.tpl"
        }),

    ]
};