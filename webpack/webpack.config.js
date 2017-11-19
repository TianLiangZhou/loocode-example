const path = require("path");

const webpack = require("webpack");
const htmlWebpackPlugin = require("html-webpack-plugin");

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractLess = new ExtractTextPlugin({
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

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
            {
                test: /\.less$/, //区配文件是以.less结尾就style-loader, css-loader, less-loader来转换
                use:extractLess.extract({
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }],
                    // use style-loader in development
                    fallback: "style-loader"
                })
            }
        ]
    },
    resolve: {

    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            names: ["common", "manifest"],
        }),
        new htmlWebpackPlugin({
            filename: "index.html",
            template: "./index.tpl",
            chunks: ["manifest","common","index"],
        }),
        new htmlWebpackPlugin({
            filename: "content.html",
            template: "./content.tpl",
            chunks: ["manifest","common", "content"],
        }),
        extractLess
    ]
};