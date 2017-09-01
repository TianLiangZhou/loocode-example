const path = require("path");
const webpack = require('webpack')
// importing plugins that do not come by default in webpack
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const css = new ExtractTextPlugin('app.css');

const plugins = [


];

const sourcePath = path.join(__dirname, "./src");

const buildPath = path.join(__dirname, "./public/dist");
module.exports = {
    context: sourcePath,
    //预编译入口
    entry: "./chat.js",
    //预编译输出
    output: {
        // options related to how webpack emits results

        path: buildPath, // string
        // the target directory for all output files
        // must be an absolute path (use the Node.js path module)

        filename: "bundle.js", // string
        // the filename template for entry chunks

        publicPath: "./public", // string
        // the url to the output directory resolved relative to the HTML page

        library: "", // string,
        // the name of the exported library

        libraryTarget: "umd", // universal module definition
        // the type of the exported library

        /* Advanced output configuration (click to show) */
    },

    module: {

        rules: [
            {
                test: /\.css$/,
                use: css.extract([ 'css-loader'])
            },
            {
                test: /\.(html|svg|jpe?g|png|ttf|woff2?)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'static/[name]-[hash:8].[ext]',
                    },
                },
            }
        ]
    },
    resolve: {
        extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
        modules: [path.resolve(__dirname, 'node_modules'), sourcePath],
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            async: true,
            children: true,
            minChunks: 2,
        }),
        
        // setting production environment will strip out
        // some of the development code from the app
        // and libraries
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) }
        }),
    
        // create css bundle
        css
    ]
}