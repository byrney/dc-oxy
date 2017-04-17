var webpack      = require('webpack');
var path         = require('path');
// polyfill for old version of nodejs required for css-loader
var Promise      = require('es6-promise');
// relocate libraries from packages.json into a vendor bundle
var packages     = require('./package.json');
var npmLibs      = Object.keys(packages.dependencies);
var optimize = new webpack.optimize.CommonsChunkPlugin({name: "vendor", filename: 'vendor-bundle.js'});
var Notifier     = require('webpack-error-notification');

module.exports = {

    entry: {
        app: "./main.js",
        vendor: npmLibs, // node libs will go into vendor bundle
    },

    output: {
        path: path.join(__dirname, './dist'),
        filename: "bundle.js"
    },
    resolve: {
        extensions: ['.js', "*"],
        alias: {
            crossfilter: 'crossfilter2',
            underscore: 'lodash',
            jquery: 'wlt-zepto' // nb: no jquery in app but still required for tests
        }
    },

    plugins: [ new Notifier(), optimize ],

    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: /(node_modules)/,
            },
            {
                test: /\.json$/, use: ["json-loader"]
            },
            {// underscore templates
                test: /\.ejs$/, use: ["ejs-loader"]
            },
            {// output the index file directly
                test: /main\.html$/, use: ["file-loader?name=index.html"]
            },
            {// inline or emit fonts and images depending on size
                test: /\.(png|woff|woff2|eot|ttf|svg|otf)$/, use: ['url-loader?limit=500&name=[name].[ext]']
            },
            {// load css
                test: /\.css$/, use: ["style-loader", "css-loader"]
            },
            // font-awesome loaders
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: ["url-loader?limit=10000&mimetype=application/font-woff" ]
            },
            {
                test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: ["url-loader?limit=10000&mimetype=application/font-woff" ]
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: ["url-loader?limit=10000&mimetype=application/octet-stream"]
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: ["file-loader"]
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: ["url-loader?limit=10000&mimetype=image/svg+xml"]
            }
        ],
    },

    devServer: {
        historyApiFallback: true,
        host: 'localhost',
        port: 9090,
        inline: true
    }

};
