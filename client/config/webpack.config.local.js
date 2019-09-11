// Core
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

// Plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(commonConfig, opts = {}) {
    const { paths } = opts;
    const package = require(paths.appPackageJson);

    const inDocker = (opts.runner || '') === 'docker';
    const runnerOpts = inDocker
        ? {
              host: '0.0.0.0',
              disableHostCheck: true,
              open: false
          }
        : {
              host: 'expenses.test',
              open: true
          };

    const webpackConfig = merge.smart(commonConfig, {
        mode: 'development',
        optimization: {
            minimize: false
        },
        output: {
            path: path.join(paths.appBuild, 'dev'),
            filename: '[name].js',
            publicPath: '/',
            globalObject: 'this'
        },
        devtool: 'source-map',
        devServer: Object.assign(
            {
                port: 9000,
                compress: true,
                historyApiFallback: true,
                hot: true,
                contentBase: paths.appDirectory,
                https: {
                    key: fs.readFileSync(paths.appSSLKey),
                    cert: fs.readFileSync(paths.appSSLCert)
                }
            },
            runnerOpts
        ),
        plugins: [new webpack.EnvironmentPlugin({ APP_STAGE: 'development' })]
    });

    return webpackConfig;
};
