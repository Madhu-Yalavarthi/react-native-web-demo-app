const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);
const {presets} = require(`${appDirectory}/babel.config.js`);

const compileNodeModules = [
  // Add every react-native package that needs compiling
  'react-native-gesture-handler',
  'react-native-camera',
  'react-native-reanimated',
  'react-native-svg',
  '@react-native-community/masked-view',
  '@react-navigation/native',
  '@react-navigation/stack',
  'react-native-safe-area-context',
	'react-native-contacts'
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.js$|tsx?$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(__dirname, 'src/index.web.js'), // Entry to your application
    path.resolve(__dirname, 'src/App.web.tsx'), // Change this to your main App file
    path.resolve(__dirname, 'src'),
		path.resolve(__dirname, 'public'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: ['react-native-web'],
    },
  },
};

const svgLoaderConfiguration = {
  test: /\.svg$/,
  use: [
    {
      loader: '@svgr/webpack',
    },
  ],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

module.exports = {
  entry: {
    app: path.join(__dirname, 'src/index.web.js'),
  },
  output: {
    path: path.resolve(appDirectory, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
	devtool: "source-map",
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: {
      'react-native$': 'react-native-web',
			process: "process/browser"
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      svgLoaderConfiguration,
			{
				test: /\.js$/,
				enforce: 'pre',
				use: ['source-map-loader'],
			},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
		new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(false),
			'process.env.NODE_ENV':  JSON.stringify('production'),
			'process.env.PUBLIC_URL':  JSON.stringify(path.resolve(__dirname, 'public'))
    }),
  ],
};
