const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TemplateBannerPlugin = require('template-banner-webpack-plugin');

const babelConfig = {
    cacheDirectory: true,
    presets: [
        ['env', {
            'modules': false,
            'targets': {
                'browsers': ['> 2%'],
                uglify: true
            },
        }]
    ],
    plugins: [
        'transform-object-rest-spread',
        ['transform-runtime', {
            'polyfill': false,
            'helpers': false
        }]
    ]
};

module.exports = {
    entry: path.resolve(__dirname + '/TemplateBannerPlugin.js'),
    output: {
        path: path.resolve(__dirname + '/'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
        library: 'TemplateBannerPlugin',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                // include: path.resolve(__dirname + '/src'),
                // exclude: /node_modules/,
                use: [{loader: 'babel-loader', options: babelConfig}]
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            uglifyOptions: {
                // ie8: false,
                // ecma: 8,
                // parse: {...options},
                // mangle: {
                //     ...options,
                //     properties: {
                //         // mangle property options
                //     }
                // },
                // output: {
                //     comments: false,
                //     beautify: true,
                //     ...options
                // },
                // compress: {...options},
                // warnings: false
            }
        }),
        new TemplateBannerPlugin({
            banner: `{name} v{version}
(c) 2018 {author}
Released under the {license} License.`,
            default: {
                year: (new Date()).getFullYear(),
            },
        }),
    ]
};