const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WebpackNotifierPlugin = require('webpack-notifier')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const { NODE_ENV, PORT } = process.env
const isDevelopment = NODE_ENV === 'development'
const isStaging = NODE_ENV === 'staging'
const isProduction = NODE_ENV === 'production'
const isDeploy = isStaging || isProduction

const config = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    webpack: [
      'webpack-hot-middleware/client?reload=true',
      './src/client/apps/webpack/client.js'
    ],
    ...getEntrypoints()
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/assets'),
    publicPath: '/assets',
    sourceMapFilename: '[file].map?[contenthash]'
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        include: /src/,
        loader: 'coffee-loader'
      },
      {
        test: /\.jade$/,
        include: /src/,
        loader: 'jade-loader'
      },
      {
        test: /\.(js|ts)x?$/,
        include: /src/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.json$/,
        include: /src/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        include: /src/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      },
      {
        test: /\.styl$/,
        include: /src/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'stylus-loader' }
        ]
      }
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      formatter: 'codeframe',
      formatterOptions: 'highlightCode',
      tslint: false,
      checkSyntacticErrors: true,
      watch: ['./src']
    }),
    new ForkTsCheckerNotifierWebpackPlugin({
      excludeWarnings: true,
      skipFirstNotification: true
    }),
    new FriendlyErrorsWebpackPlugin({
      clearConsole: false,
      compilationSuccessInfo: {
        messages: [`[Positron] Listening on http://localhost:${PORT} \n`]
      }
    }),
    new ProgressBarPlugin(),
    new WebpackNotifierPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(NODE_ENV)
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    })
  ],
  resolve: {
    extensions: [
      '.mjs',
      '.coffee',
      '.js',
      '.jsx',
      '.json',
      '.styl',
      '.ts',
      '.tsx'
    ],
    modules: [
      'node_modules',
      'src'
    ],
    symlinks: false
  }
}

// Development
if (isDevelopment) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin())

  // Staging
} else if (isDeploy) {
  config.devtool = 'source-map'

  // Prod
  if (isProduction) {
    config.plugins.push(
      new UglifyJsPlugin({
        cache: true,
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: false
          }
        }
      })
    )
  }
}

// Helpers

function getEntrypoints () {
  return findAssets('src/client/assets')
}

function findAssets (basePath) {
  const files = fs.readdirSync(path.join(process.cwd(), basePath))

  // Filter out .styl files
  const validAssets = (file) => {
    const whitelist = [ '.js', '.coffee' ]
    const isValid = whitelist.some(extension => extension === path.extname(file))
    return isValid
  }

  /**
   * Construct key/value pairs representing Webpack entrypoints; e.g.,
   * { desktop: [ path/to/subapp.asset.js ] }
   */
  const assets = files
    .filter(validAssets)
    .reduce((assetMap, file) => {
      const fileName = path.basename(file, path.extname(file))
      const asset = {
        [fileName]: [
          path.join(__dirname, basePath, file)
        ]
      }
      if (isDevelopment) {
        asset[fileName].unshift(
          'webpack-hot-middleware/client?reload=true'
        )
      }

      return {
        ...assetMap,
        ...asset
      }
    }, {})

  return assets
}

module.exports = config
