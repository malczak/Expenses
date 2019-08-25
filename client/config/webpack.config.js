// Core
const path = require('path');
const webpack = require('webpack');
const { execSync } = require('child_process');
const autoprefixer = require('autoprefixer');

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Git Info
const gitCommit = execSync('git log --format="%H" -n 1')
    .toString()
    .replace(/\s+/g, '');
const gitBranch = execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .replace(/\s+/g, '');

// Webpack Plugins
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;

// Api consts
const endpoints = {
    local: {
        webpack: 'local',
        config: {
            env: 'local',
            server: require('../.config.json')
        }
    },
    dev: {
        webpack: 'prod',
        config: {
            env: 'dev',
            server: {}
        }
    },
    prod: {
        webpack: 'prod',
        config: {
            env: 'prod',
            server: {}
        }
    }
};

const babelLoader = {
    loader: 'babel-loader',
    options: {
        sourceType: 'unambiguous',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        plugins: [
            [
                '@babel/plugin-proposal-decorators',
                {
                    legacy: true
                }
            ],
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true
                }
            ],
            [
                '@babel/plugin-transform-runtime',
                {
                    helpers: true
                }
            ]
        ]
    }
};

module.exports = function(env = {}) {
    const stage = Array.isArray(env.stage) ? env.stage.pop() : env.stage;
    const paths = require('./paths')(stage);
    const stageConfig = endpoints[stage || 'local'];
    const clientConfig = stageConfig.config || {};
    const package = require(paths.appPackageJson);

    console.log(
        `Building for '${stage}': \n${JSON.stringify(stageConfig, null, 2)}`
    );

    let webpackConfig = {
        entry: {
            app: paths.appIndexJs
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
            alias: {
                app: paths.appSrc,
                common: paths.commonSrc
            },
            modules: [paths.appSrc, paths.appNodeModules],
            symlinks: false
        },
        target: 'web',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules(?!\/webpack-dev-server)/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: path.resolve(
                                paths.appDirectory,
                                'tsconfig.json'
                            )
                        }
                    }
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules(?!\/webpack-dev-server)/,
                    use: babelLoader
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: false,
                                sourceMap: false
                            }
                        },
                        {
                            loader: 'postcss-loader'
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                sourceMap: true,
                                importLoaders: 1
                            }
                        },
                        {
                            loader: 'less-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg|eot|woff|woff2|ttf|mp4|mp3|cur|)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                limit: 4096,
                                name:
                                    'assets/[name]-[sha512:hash:base64:7].[ext]'
                            }
                        }
                    ]
                }
            ]
        },
        node: {
            fs: 'empty',
            tls: 'empty'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: paths.appHtml,
                inject: true
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    BROWSER: JSON.stringify(true),
                    config: JSON.stringify(clientConfig)
                }
            }),
            new webpack.ProvidePlugin({
                inject: ['mobx-react', 'inject'],
                observer: ['mobx-react', 'observer'],
                observable: ['mobx', 'observable'],
                action: ['mobx', 'action'],
                computed: ['mobx', 'computed'],
                React: 'react'
            }),
            new webpack.DefinePlugin({
                BUILD_TAG: JSON.stringify(env.tag || gitBranch),
                BUILD_DATE: JSON.stringify(new Date().toUTCString()),

                GIT_COMMIT: JSON.stringify(gitCommit),
                GIT_BRANCH: JSON.stringify(gitBranch)
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new MiniCssExtractPlugin({ filename: '[name].css' }),
            new WebpackBuildNotifierPlugin({
                title: `${package.name} @ ${stage}`
            })
        ]
    };

    // Display bundle analyzer
    if ((env.analyzeBundle || stageConfig.analyze) === true) {
        webpackConfig.plugins.push(new BundleAnalyzerPlugin());
    }

    // run stage specific config
    const stageWebpackBuilder = require(`./webpack.config.${stageConfig.webpack}`);
    webpackConfig = stageWebpackBuilder(webpackConfig, {
        ...env,
        stage,
        paths,
        stageConfig,
        clientConfig
    });

    return webpackConfig;
};
