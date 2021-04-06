'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const ESLintPlugin = require('eslint-webpack-plugin');
const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const typescriptFormatter = require('react-dev-utils/typescriptFormatter');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const postcssNormalize = require('postcss-normalize');

const appPackageJson = require(paths.appPackageJson);

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const webpackDevClientEntry = require.resolve(
	'react-dev-utils/webpackHotDevClient'
);
const reactRefreshOverlayEntry = require.resolve(
	'react-dev-utils/refreshOverlayInterop'
);

// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';
const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';

const imageInlineSizeLimit = parseInt(
	process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// Get the path to the uncompiled service worker (if it exists).
const swSrc = paths.swSrc;

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const hasJsxRuntime = (() => {
	if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
		return false;
	}

	try {
		require.resolve('react/jsx-runtime');
		return true;
	} catch (e) {
		return false;
	}
})();

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.

// const appDirectory = path.resolve(__dirname);
const { presets } = require(paths.appBable);

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
].map((moduleName) => path.resolve(paths.appPath, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
	test: /\.js$|tsx?$/,
	// Add every directory that needs to be compiled by Babel during the build.
	include: [
		path.resolve(paths.appPath, 'src/index.web.js'), // Entry to your application
		path.resolve(paths.appPath, 'src/App.web.tsx'), // Change this to your main App file
		path.resolve(paths.appPath, 'src'),
		path.resolve(paths.appPath, 'public'),
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
			name: 'static/media/[name].[hash:8].[ext]',
		},
	},
};

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function (webpackEnv) {
	console.log('------->', webpackEnv);
	const isEnvDevelopment = true;

	// We will provide `paths.publicUrlOrPath` to our app
	// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
	// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
	// Get environment variables to inject into our app.
	const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));

	const shouldUseReactRefresh = env.raw.FAST_REFRESH;

	// common function to get style loaders
	const getStyleLoaders = (cssOptions, preProcessor) => {
		const loaders = [
			require.resolve('style-loader'),
			{
				loader: require.resolve('css-loader'),
				options: cssOptions,
			},
			{
				// Options for PostCSS as we reference these options twice
				// Adds vendor prefixing based on your specified browser support in
				// package.json
				loader: require.resolve('postcss-loader'),
				options: {
					// Necessary for external CSS imports to work
					// https://github.com/facebook/create-react-app/issues/2677
					ident: 'postcss',
					plugins: () => [
						require('postcss-flexbugs-fixes'),
						require('postcss-preset-env')({
							autoprefixer: {
								flexbox: 'no-2009',
							},
							stage: 3,
						}),
						// Adds PostCSS Normalize as the reset css with default options,
						// so that it honors browserslist config in package.json
						// which in turn let's users customize the target behavior as per their needs.
						postcssNormalize(),
					],
					sourceMap: true,
				},
			},
		].filter(Boolean);
		if (preProcessor) {
			loaders.push(
				{
					loader: require.resolve('resolve-url-loader'),
					options: {
						sourceMap: true,
						root: paths.appSrc,
					},
				},
				{
					loader: require.resolve(preProcessor),
					options: {
						sourceMap: true,
					},
				}
			);
		}
		return loaders;
	};

	return {
		mode: 'development',
		// These are the "entry points" to our application.
		// This means they will be the "root" imports that are included in JS bundle.
		entry: paths.appIndexJs,
		output: {
			// The build folder.
			path: paths.appBuild,
			// There will be one main bundle, and one file per asynchronous chunk.
			// In development, it does not produce real files.
			filename: 'app.bundle.js',
			// webpack uses `publicPath` to determine where the app is being served from.
			// It requires a trailing slash, or the file assets will get an incorrect path.
			// We inferred the "public path" (such as / or /my-project) from homepage.
			publicPath: paths.publicUrlOrPath,
		},
		resolve: {
			// These are the reasonable defaults supported by the Node ecosystem.
			// We also include JSX as a common component filename extension to support
			// some tools, although we do not recommend using it, see:
			// https://github.com/facebook/create-react-app/issues/290
			// `web` extension prefixes have been added for better support
			// for React Native Web.
			extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
			alias: {
				// Support React Native Web
				// https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
				'react-native$': 'react-native-web',
				// Allows for better profiling with ReactDevTools
				// ...(modules.webpackAliases || {}),
			},
		},
		module: {
			rules: [
				babelLoaderConfiguration,
				imageLoaderConfiguration,
				svgLoaderConfiguration,
				// {
				// 	// "oneOf" will traverse all following loaders until one will
				// 	// match the requirements. When no loader matches it will fall
				// 	// back to the "file" loader at the end of the loader list.
				// 	oneOf: [
				// 		// TODO: Merge this config once `image/avif` is in the mime-db
				// 		// https://github.com/jshttp/mime-db

				// 		{
				// 			test: /\.svg$/,
				// 			use: [
				// 				{
				// 					loader: '@svgr/webpack',
				// 				},
				// 			],
				// 		},
				// 		{
				// 			test: [/\.avif$/],
				// 			loader: require.resolve('url-loader'),
				// 			options: {
				// 				limit: imageInlineSizeLimit,
				// 				mimetype: 'image/avif',
				// 				name: 'static/media/[name].[hash:8].[ext]',
				// 			},
				// 		},
				// 		// "url" loader works like "file" loader except that it embeds assets
				// 		// smaller than specified limit in bytes as data URLs to avoid requests.
				// 		// A missing `test` is equivalent to a match.
				// 		{
				// 			test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				// 			loader: require.resolve('url-loader'),
				// 			options: {
				// 				limit: imageInlineSizeLimit,
				// 				name: 'static/media/[name].[hash:8].[ext]',
				// 			},
				// 		},


				// 		// "postcss" loader applies autoprefixer to our CSS.
				// 		// "css" loader resolves paths in CSS and adds assets as dependencies.
				// 		// "style" loader turns CSS into JS modules that inject <style> tags.
				// 		// In production, we use MiniCSSExtractPlugin to extract that CSS
				// 		// to a file, but in development "style" loader enables hot editing
				// 		// of CSS.
				// 		// By default we support CSS Modules with the extension .module.css
				// 		{
				// 			test: cssRegex,
				// 			exclude: cssModuleRegex,
				// 			use: getStyleLoaders({
				// 				importLoaders: 1,
				// 				sourceMap: true,
				// 			}),
				// 			// Don't consider CSS imports dead code even if the
				// 			// containing package claims to have no side effects.
				// 			// Remove this when webpack adds a warning or an error for this.
				// 			// See https://github.com/webpack/webpack/issues/6571
				// 			sideEffects: true,
				// 		},
				// 		// Adds support for CSS Modules (https://github.com/css-modules/css-modules)
				// 		// using the extension .module.css
				// 		{
				// 			test: cssModuleRegex,
				// 			use: getStyleLoaders({
				// 				importLoaders: 1,
				// 				sourceMap: true,
				// 				modules: {
				// 					getLocalIdent: getCSSModuleLocalIdent,
				// 				},
				// 			}),
				// 		},
				// 		// Opt-in support for SASS (using .scss or .sass extensions).
				// 		// By default we support SASS Modules with the
				// 		// extensions .module.scss or .module.sass
				// 		{
				// 			test: sassRegex,
				// 			exclude: sassModuleRegex,
				// 			use: getStyleLoaders(
				// 				{
				// 					importLoaders: 3,
				// 					sourceMap: true,
				// 				},
				// 				'sass-loader'
				// 			),
				// 			// Don't consider CSS imports dead code even if the
				// 			// containing package claims to have no side effects.
				// 			// Remove this when webpack adds a warning or an error for this.
				// 			// See https://github.com/webpack/webpack/issues/6571
				// 			sideEffects: true,
				// 		},
				// 		// Adds support for CSS Modules, but using SASS
				// 		// using the extension .module.scss or .module.sass
				// 		{
				// 			test: sassModuleRegex,
				// 			use: getStyleLoaders(
				// 				{
				// 					importLoaders: 3,
				// 					sourceMap: true,
				// 					modules: {
				// 						getLocalIdent: getCSSModuleLocalIdent,
				// 					},
				// 				},
				// 				'sass-loader'
				// 			),
				// 		},
				// 	],
				// },

			],
		},
		plugins: [
			// Generates an `index.html` file with the <script> injected.
			new HtmlWebpackPlugin({
				inject: true,
				template: paths.appHtml,
			}),
			// Makes some environment variables available in index.html.
			// The public URL is available as %PUBLIC_URL% in index.html, e.g.:
			// <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
			// It will be an empty string unless you specify "homepage"
			// in `package.json`, in which case it will be the pathname of that URL.
			new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
			// This gives some necessary context to module not found errors, such as
			// the requesting resource.
			new ModuleNotFoundPlugin(paths.appPath),
			// This is necessary to emit hot updates (CSS and Fast Refresh):
			new webpack.HotModuleReplacementPlugin(),

			// Makes some environment variables available to the JS code, for example:
			// if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
			// It is absolutely essential that NODE_ENV is set to production
			// during a production build.
			// Otherwise React will be compiled in the very slow development mode.
			new webpack.DefinePlugin({
				...env.stringified,
				__DEV__: JSON.stringify(true),
			}),

			new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: paths.publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed);
          const entrypointFiles = entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          );

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          };
        },
      }),
			fs.existsSync(swSrc) &&
			new WorkboxWebpackPlugin.InjectManifest({
				swSrc,
				dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
				exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
				// Bump up the default maximum size (2mb) that's precached,
				// to make lazy-loading failure scenarios less likely.
				// See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
			}),
		].filter(Boolean),
		performance: false,
	};
};
