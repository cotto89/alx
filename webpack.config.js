/* eslint-disable import/no-extraneous-dependencies, no-console */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackNotifierPlugin = require('webpack-notifier');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

/* NODE_ENV */
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
const isDev = !isProd;

console.info(`
:--------- process.env.NODE_ENV: ${NODE_ENV} ---------:
`);

let config = {
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
            {
                test: /\.s?css$/,
                loader: ExtractTextPlugin.extract('css!postcss!sass')
            }
        ]
    },
    ts: {
        compilerOptions: {
            "declaration": false
        }
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    postcss: [autoprefixer({ browsers: ['last 2 versions'] })],
    plugins: [
        new WebpackNotifierPlugin({ title: 'Webpack' }),
        new ExtractTextPlugin('bundle.css'),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV)
            }
        })
    ]
};

if (isDev) {
    config = merge(config, { devtool: 'inline-source-map' });
}

if (isProd) {
    config = merge(config, {
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: false }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.AggressiveMergingPlugin()
        ]
    });
}


const counterConf = () => {
    const base = path.join(process.cwd(), 'docs/example/counter/');
    return merge({}, config, {
        entry: [path.join(base, 'index.tsx'), path.join(base, 'index.scss')],
        output: {
            path: base,
            filename: 'bundle.js'
        },
        devServer: {
            contentBase: base,
            inline: true,
            noInfo: true
        }
    });
};

module.exports = [counterConf()];
