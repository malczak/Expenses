// Core
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

// Webpack Utils
const autoprefixer = require('autoprefixer');

// Webpack Plugins
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Settings
const settings = {
    browsers: ['last 2 versions', 'ie > 11']
};

module.exports = function(commonConfig, opts = {}) {
    const { stage, paths, stageConfig } = opts;

    const webpackConfig = merge.smart(commonConfig, {
        mode: 'production',
        devtool: 'source-map',
        stats: {
            colors: false,
            hash: true,
            timings: true,
            assets: true,
            chunks: true,
            chunkModules: true,
            modules: true,
            children: true
        },
        stats: {
            children: false
        },
        optimization: {
            runtimeChunk: false,
            splitChunks: {
                cacheGroups: {
                    default: false,
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all',
                        minChunks: 1
                    }
                }
            },
            minimizer: [
                new UglifyJsWebpackPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        preset: [
                            'advanced',
                            {
                                autoprefixer: {
                                    browsers: settings.browsers
                                },
                                zindex: false,
                                mergeIdents: false,
                                reduceIdents: false,
                                discardUnused: false
                            }
                        ]
                    },
                    canPrint: true
                })
            ]
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.NamedChunksPlugin(),
            new CleanWebpackPlugin([path.resolve(__dirname, `env-${stage}`)]),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new webpack.EnvironmentPlugin({ APP_STAGE: 'production' })
        ],
        output: {
            path: path.resolve(__dirname, `env-${stage}`),
            filename: '[name].[chunkhash].js'
        }
    });

    return webpackConfig;
};
