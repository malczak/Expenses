// Core
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

// Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = function(commonConfig, opts = {}) {
    const { stage } = opts;

    const webpackConfig = merge.smart(commonConfig, {
        mode: 'development',
        optimization: {
            minimize: false,
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
            }
        },
        devtool: 'source-map',
        plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.NamedChunksPlugin(),
            new CleanWebpackPlugin([path.resolve(__dirname, `env-${stage}`)]),
            new webpack.EnvironmentPlugin({ APP_STAGE: 'development' })
            // new MiniCssExtractPlugin({ filename: '[name].css' })
        ],
        output: {
            path: path.resolve(__dirname, `env-${stage}`),
            filename: '[name].[chunkhash].js'
        }
    });

    return webpackConfig;
};
