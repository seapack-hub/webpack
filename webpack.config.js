/**
  webpack.config.js  webpack的配置文件
    作用: 指示 webpack 干哪些活（当你运行 webpack 指令时，会加载里面的配置）
    所有构建工具都是基于nodejs平台运行的~模块化默认采用commonjs。
*/

// resolve用来拼接绝对路径的方法 node.js里面的方法
const {resolve} = require("path");
//引入html插件 HtmlWebpackPlugin 是一个函数
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 访问内置的插件 (运行时显示进度)
const webpack = require('webpack');
// 帮助提取css成单独文件
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 压缩css文件 安装css-minimizer-webpack-plugin 插件
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
//设置nodeJs环境变量
// process.env.NODE_PATH = "development";


//渐进式网络开发应用程序(离线可访问)
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');


module.exports = {
    //入口
    entry: "./src/js/index.js",
    //出口
    output: {
        // 输出文件名
        filename: "js/[name].[contenthash:10].js",
        // 输出路径
        // __dirname nodejs的变量，代表当前文件的目录绝对路径
        path: resolve(__dirname,"build"),
        // 所有资源引入公共路径前缀 --> 'imgs/a.jpg' --> '/imgs/a.jpg'
        publicPath: '/',
        chunkFilename: 'js/[name]_chunk.js', // 非入口chunk的名称
    },
    //loader，webpack 只能理解 JavaScript 和 JSON 文件，这是 webpack 开箱可用的自带能力。
    // loader 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 模块，以供应用程序使用，以及被添加到依赖图中。
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test:/\.(less|css)$/,
                        use:[
                            // 'style-loader',
                            MiniCssExtractPlugin.loader,
                            'css-loader',
                            // 将less文件编译成css文件
                            // 需要下载 less-loader和less
                            'less-loader',
                            /**
                             * css兼容性处理：postcss --> postcss-loader postcss-preset-env
                             *帮postcss找到package.json中browserslist里面的配置，通过配置加载指定的css兼容性样式
                             "browserslist": {
                      // 开发环境 --> 设置node环境变量：process.env.NODE_ENV = development
                      "development": [
                        "last 1 chrome version",
                        "last 1 firefox version",
                        "last 1 safari version"
                      ],
                      // 生产环境：默认是看生产环境
                      "production": [
                        ">0.2%",
                        "not dead",
                        "not op_mini all"
                      ]
                    }
                             */
                            // 使用loader的默认配置
                            // 'postcss-loader',
                            // 修改loader的配置
                            {
                                loader: "postcss-loader",
                                options: {
                                    postcssOptions:{
                                        plugins: ['postcss-preset-env']
                                    }
                                }
                            }
                        ]
                    },
                    //匹配jpg,png类型的图片文件
                    {
                        test:/\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
                        // 使用一个loader
                        // 下载 url-loader file-loader
                        loader: 'url-loader',
                        options: {
                            // 图片大小小于8kb，就会被base64处理
                            // 优点: 减少请求数量（减轻服务器压力）
                            // 缺点：图片体积会更大（文件请求速度更慢）
                            limit: 12 * 1024,
                            // 问题：因为url-loader默认使用es6模块化解析，而html-loader引入图片是commonjs
                            // 解析时会出问题：[object Module]
                            // 解决：关闭url-loader的es6模块化，使用commonjs解析
                            esModule: false,
                            // 给图片进行重命名
                            // [hash:10]取图片的hash的前10位
                            // [ext]取文件原来扩展名
                            name: '[hash:10].[ext]',
                            outputPath:'images'
                        },
                        type: "javascript/auto"
                    },
                    {
                        test:/\.html$/,
                        // 处理html文件的img图片（负责引入img，从而能被url-loader进行处理）
                        loader: 'html-loader'
                    },
                    /**
                     *   语法检查： eslint-loader  eslint
                     *     注意：只检查自己写的源代码，第三方的库是不用检查的
                     *     设置检查规则：
                     *       package.json中eslintConfig中设置~
                     *         "eslintConfig": {
                     *          "extends": "airbnb-base"
                     *        }
                     *       airbnb --> eslint-config-airbnb-base  eslint-plugin-import eslint
                     */
                    // {
                    //     test:/\.js$/,
                    //     exclude: /node_modules/,
                    //     loader: "eslint-loader",
                    //     options:{
                    //         // 自动修复eslint的错误
                    //         fix:true
                    //     }
                    // },
                ]
            },
            /**
            // 详细loader配置
            // 不同文件必须配置不同loader处理
            // {
            //     // 匹配哪些文件, 以css结尾
            //     test:/\.css$/,
            //     // 使用哪些loader进行处理
            //     use:[
            //         // use数组中loader执行顺序：从右到左，从下到上 依次执行
            //         // 创建style标签，将js中的样式资源插入进行，添加到head中生效
            //         // 'style-loader',
            //         MiniCssExtractPlugin.loader,
            //         // 将css文件变成commonjs模块加载js中，里面内容是样式字符串
            //         'css-loader',
            //         // 使用loader的默认配置
            //         // 'postcss-loader',
            //         // 修改loader的配置
            //     ]
            // },
             *
             */
            /**
             * js兼容性处理：babel-loader @babel/core(基本)
             * 1.基本js兼容性问题处理： @babel/preset-env
             *   问题：只能转换基本语法，如箭头函数等等，类似promise高级语法不能转换
             * 2.全部js兼容性处理：@babel/polyfill
             *   问题：我只需要解决部分兼容性问题，但将所有的兼容性代码全部引入
             * 3.需要做兼容性处理的就做：按需加载  --> core-js
             */
            // {
            //     test:/\.m?js$/,
            //     exclude:/(node_modules|bower_components)/,
            //     use:{
            //         loader:'babel-loader',
            //         options: {
            //             // exclude:[/node_modules[\\\/]core-js/,/node_modules[\\\/]webpack[\\\/]buildin/],
            //             presets:[
            //                 [
            //                     '@babel/preset-env',
            //                     // {
            //                     //     "useBuiltIns": "usage",
            //                     //     "corejs": {
            //                     //         version:3
            //                     //     },
            //                     //     targets: {
            //                     //         chrome: '60',
            //                     //         firefox: '60',
            //                     //         ie: '9',
            //                     //         safari: '10',
            //                     //         edge: '17'
            //                     //     }
            //                     // }
            //                 ]
            //             ]
            //         }
            //     },
            // }
        ]
    },
    // plugins(插件)，插件可以用于执行范围更广的任务。包括：打包优化，资源管理，注入环境变量。
    plugins: [
        new webpack.ProgressPlugin(),
        // plugins的配置
        // html-webpack-plugin
        // 功能：默认会创建一个空的HTML，自动引入打包输出的所有资源（JS/CSS）
        // 需求：需要有结构的HTML文件
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            minify:{
                collapseWhitespace:true,
                removeComments:true
            }
        }),
        new MiniCssExtractPlugin({
            // 对输出的css文件进行重命名
            filename:"./css/built.[contenthash:10].css"
        }),
        new CssMinimizerWebpackPlugin(),
        new WorkboxWebpackPlugin.GenerateSW({
            /**
             * 1. 帮助serviceworker快速启动
             * 2. 删除旧的 serviceworker
             * 生成一个 serviceworker 配置文件~
             */
            clientsClaim: true,
            skipWaiting: true
        })
    ],
    //模式 开发模式：development 生产模式：production
    mode:"development",
    // mode:"production",
    devServer:{
        //项目构建后的路径
        static:resolve(__dirname,"build"),
        //启动gzip压缩
        compress:true,
        //端口号
        port:5000,
        //域名
        host:'localhost',
        //自动打开浏览器
        open:true,
        //open: true,
        // 开启HMR功能
        // 当修改了webpack配置，新配置要想生效，必须重新webpack服务
        hot:true,
        // 不要显示启动服务器日志信息
        clientLogLevel: 'none',
        // 服务器代理 --> 解决开发环境跨域问题
        proxy:{
            // 一旦devServer(5000)服务器接受到 /api/xxx 的请求，就会把请求转发到另外一个服务器(3000)
            '/api':{
                target:'http://localhost:3000',
                // 发送请求时，请求路径重写：将 /api/xxx --> /xxx （去掉/api）
                pathRewrite:{
                    '^/api':''
                }
            }
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    //解析模块规则
    resolve:{
        // 配置解析模块路径别名: 优点简写路径 缺点路径没有提示
        alias:{
            "@":resolve(__dirname,"src")
        },
        // 配置省略文件路径的后缀名
        extensions: ['.js', '.json', '.jsx', '.css'],
        // 告诉 webpack 解析模块是去找哪个目录
        modules: [resolve(__dirname, '../../node_modules'), 'node_modules']
    },
    devtool:"source-map"
}
