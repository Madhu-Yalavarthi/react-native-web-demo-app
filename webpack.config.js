const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const resolve = require('resolve');
const WorkboxPlugin = require('workbox-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');
const postcssNormalize = require('postcss-normalize');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const webpackDevClientEntry = require.resolve(
	'react-dev-utils/webpackHotDevClient'
);
const reactRefreshOverlayEntry = require.resolve(
	'react-dev-utils/refreshOverlayInterop'
);

const appDirectory = path.resolve(__dirname);
const appPath = path.resolve(appDirectory, '.');
const appPackageJson = require(path.resolve(__dirname, 'package.json'));
const appSrc = path.resolve(appDirectory, 'src');
const appHtml = path.resolve(appDirectory, 'public/index.html');
const appDist = path.resolve(appDirectory, 'dist');
const appNodeModules = path.resolve(appDirectory, 'node_modules');
const appTsConfig = path.resolve(appDirectory, 'tsconfig.json');
const { presets } = require(`${appDirectory}/babel.config.js`);

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';

const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === 'true';
const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';

const imageInlineSizeLimit = parseInt(
	process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

const publicUrlOrPath = getPublicUrlOrPath(
	process.env.NODE_ENV === 'development',
	appPackageJson.homepage,
	process.env.PUBLIC_URL
);

const useTypeScript = fs.existsSync(path.resolve(appDirectory, 'tsconfig.json'));


const moduleFileExtensions = [
	'web.mjs',
	'mjs',
	'web.js',
	'js',
	'web.ts',
	'ts',
	'web.tsx',
	'tsx',
	'json',
	'web.jsx',
	'jsx',
];

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

module.exports = function (webpackEnv) {
	const isEnvDevelopment = webpackEnv === 'development';
	const isEnvProduction = webpackEnv === 'production';

	// Variable used for enabling profiling in Production
	// passed into alias object. Uses a flag if passed into the build command
	const isEnvProductionProfile =
		isEnvProduction && process.argv.includes('--profile');


	// common function to get style loaders
	const getStyleLoaders = (cssOptions, preProcessor) => {
		const loaders = [
			isEnvDevelopment && require.resolve('style-loader'),
			isEnvProduction && {
				loader: MiniCssExtractPlugin.loader,
				// css is located in `static/css`, use '../../' to locate index.html folder
				// in production `publicUrlOrPath` can be a relative path
				options: publicUrlOrPath.startsWith('.')
					? { publicPath: '../../' }
					: {},
			},
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
					sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
				},
			},
		].filter(Boolean);
		if (preProcessor) {
			loaders.push(
				{
					loader: require.resolve('resolve-url-loader'),
					options: {
						sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
						root: appSrc,
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
		entry: {
			app: path.join(__dirname, 'src/index.web.js'),
			// 'service-worker': path.join(__dirname, 'src/service-worker.ts'),
		},
		output: {
			// path: path.resolve(appDirectory, 'dist'),
			// publicPath: '/',
			// filename: '[name].bundle.js',
			clean: true,
			// The build folder.
			path: isEnvProduction ? appDist : undefined,
			// Add /* filename */ comments to generated require()s in the output.
			pathinfo: isEnvDevelopment,
			// There will be one main bundle, and one file per asynchronous chunk.
			// In development, it does not produce real files.
			filename: () => {
				return isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js';
			},
			// TODO: remove this when upgrading to webpack 5
			// futureEmitAssets: true,
			// There are also additional JS chunk files if you use code splitting.
			chunkFilename: (pathData) => {
				return isEnvProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js';
			},
			// webpack uses `publicPath` to determine where the app is being served from.
			// It requires a trailing slash, or the file assets will get an incorrect path.
			// We inferred the "public path" (such as / or /my-project) from homepage.
			publicPath: '/',
			// Point sourcemap entries to original disk location (format as URL on Windows)
			devtoolModuleFilenameTemplate: (info) => {
				return isEnvProduction ? path
					.relative(appSrc, info.absoluteResourcePath)
					.replace(/\\/g, '/') : path.resolve(info.absoluteResourcePath).replace(/\\/g, '/');
			},
			// Prevents conflicts when multiple webpack runtimes (from different apps)
			// are used on the same page.
			// jsonpFunction: `webpackJsonp${appPackageJson.name}`,
			// this defaults to 'window', but by setting it to 'this' then
			// module chunks which are built will work in web workers as well.
			globalObject: 'this',
		},
		optimization: {
			minimize: isEnvProduction,
			minimizer: [
				// This is only used in production mode
				new TerserPlugin({
					terserOptions: {
						parse: {
							// We want terser to parse ecma 8 code. However, we don't want it
							// to apply any minification steps that turns valid ecma 5 code
							// into invalid ecma 5 code. This is why the 'compress' and 'output'
							// sections only apply transformations that are ecma 5 safe
							// https://github.com/facebook/create-react-app/pull/4234
							ecma: 8,
						},
						compress: {
							ecma: 5,
							warnings: false,
							// Disabled because of an issue with Uglify breaking seemingly valid code:
							// https://github.com/facebook/create-react-app/issues/2376
							// Pending further investigation:
							// https://github.com/mishoo/UglifyJS2/issues/2011
							comparisons: false,
							// Disabled because of an issue with Terser breaking valid code:
							// https://github.com/facebook/create-react-app/issues/5250
							// Pending further investigation:
							// https://github.com/terser-js/terser/issues/120
							inline: 2,
						},
						mangle: {
							safari10: true,
						},
						// Added for profiling in devtools
						keep_classnames: isEnvProductionProfile,
						keep_fnames: isEnvProductionProfile,
						output: {
							ecma: 5,
							comments: false,
							// Turned on because emoji and regex is not minified properly using default
							// https://github.com/facebook/create-react-app/issues/2488
							ascii_only: true,
						},
					},
					sourceMap: shouldUseSourceMap,
				}),

				// This is only used in production mode
				new OptimizeCSSAssetsPlugin({
					cssProcessorOptions: {
						parser: safePostCssParser,
						map: shouldUseSourceMap
							? {
								// `inline: false` forces the sourcemap to be output into a
								// separate file
								inline: false,
								// `annotation: true` appends the sourceMappingURL to the end of
								// the css file, helping the browser find the sourcemap
								annotation: true,
							}
							: false,
					},
					cssProcessorPluginOptions: {
						preset: ['default', { minifyFontValues: { removeQuotes: false } }],
					},
				}),
			],
			splitChunks: {
				chunks: 'all',
				name: isEnvDevelopment,
			},
			// Keep the runtime chunk separated to enable long term caching
			// https://twitter.com/wSokra/status/969679223278505985
			// https://github.com/facebook/create-react-app/issues/5358
			runtimeChunk: {
				name: entrypoint => `runtime-${entrypoint.name}`,
			},
		},
		resolve: {
			extensions: moduleFileExtensions
				.map(ext => `.${ext}`)
				.filter(ext => useTypeScript || !ext.includes('ts')),
			alias: {
				'react-native$': 'react-native-web',
				// Allows for better profiling with ReactDevTools
				// ...(isEnvProductionProfile && {
				// 	'react-dom$': 'react-dom/profiling',
				// 	'scheduler/tracing': 'scheduler/tracing-profiling',
				// }),
				process: "process/browser"
			},
			plugins: [
				// Adds support for installing with Plug'n'Play, leading to faster installs and adding
				// guards against forgotten dependencies and such.
				PnpWebpackPlugin,
				// Prevents users from importing files from outside of src/ (or node_modules/).
				// This often causes confusion because we only process files within src/ with babel.
				// To fix this, we prevent you from importing files out of src/ -- if you'd like to,
				// please link the files into your node_modules/ and let module-resolution kick in.
				// Make sure your source files are compiled, as they will not be processed in any way.
				new ModuleScopePlugin(appSrc, [
					path.resolve(__dirname, 'package.json'),
					reactRefreshOverlayEntry,
				]),
			],
		},
		resolveLoader: {
			plugins: [
				// Also related to Plug'n'Play, but this time it tells webpack to load its loaders
				// from the current package.
				PnpWebpackPlugin.moduleLoader(module),
			],
		},
		module: {
			rules: [

				// Disable require.ensure as it's not a standard language feature.
				// { parser: { requireEnsure: false } },
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. When no loader matches it will fall
					// back to the "file" loader at the end of the loader list.
					oneOf: [
						// TODO: Merge this config once `image/avif` is in the mime-db
						// https://github.com/jshttp/mime-db
						{
							test: [/\.avif$/],
							loader: require.resolve('url-loader'),
							options: {
								limit: imageInlineSizeLimit,
								mimetype: 'image/avif',
								name: 'static/media/[name].[hash:8].[ext]',
							},
						},
						// "url" loader works like "file" loader except that it embeds assets
						// smaller than specified limit in bytes as data URLs to avoid requests.
						// A missing `test` is equivalent to a match.
						{
							test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
							loader: require.resolve('url-loader'),
							options: {
								limit: imageInlineSizeLimit,
								name: 'static/media/[name].[hash:8].[ext]',
							},
						},
						// Process application JS with Babel.
						// The preset includes JSX, Flow, TypeScript, and some ESnext features.
						{
							test: /\.(js|mjs|jsx|ts|tsx)$/,
							include: appSrc,
							loader: require.resolve('babel-loader'),
							options: {
								customize: require.resolve(
									'babel-preset-react-app/webpack-overrides'
								),
								presets: [
									[
										require.resolve('babel-preset-react-app'),
										{
											runtime: hasJsxRuntime ? 'automatic' : 'classic',
										},
									],
								],
								// @remove-on-eject-begin
								babelrc: false,
								configFile: false,
								// Make sure we have a unique cache identifier, erring on the
								// side of caution.
								// We remove this when the user ejects because the default
								// is sane and uses Babel options. Instead of options, we use
								// the react-scripts and babel-preset-react-app versions.
								cacheIdentifier: getCacheIdentifier(
									isEnvProduction
										? 'production'
										: isEnvDevelopment && 'development',
									[
										'babel-plugin-named-asset-import',
										'babel-preset-react-app',
										'react-dev-utils',
										'react-scripts',
									]
								),
								// @remove-on-eject-end
								plugins: [
									[
										require.resolve('babel-plugin-named-asset-import'),
										{
											loaderMap: {
												svg: {
													ReactComponent:
														'@svgr/webpack?-svgo,+titleProp,+ref![path]',
												},
											},
										},
									],
									isEnvDevelopment &&
									shouldUseReactRefresh &&
									require.resolve('react-refresh/babel'),
								].filter(Boolean),
								// This is a feature of `babel-loader` for webpack (not Babel itself).
								// It enables caching results in ./node_modules/.cache/babel-loader/
								// directory for faster rebuilds.
								cacheDirectory: true,
								// See #6846 for context on why cacheCompression is disabled
								cacheCompression: false,
								compact: isEnvProduction,
							},
						},
						// Process any JS outside of the app with Babel.
						// Unlike the application JS, we only compile the standard ES features.
						{
							test: /\.(js|mjs)$/,
							exclude: /@babel(?:\/|\\{1,2})runtime/,
							loader: require.resolve('babel-loader'),
							options: {
								babelrc: false,
								configFile: false,
								compact: false,
								presets: [
									[
										require.resolve('babel-preset-react-app/dependencies'),
										{ helpers: true },
									],
								],
								cacheDirectory: true,
								// See #6846 for context on why cacheCompression is disabled
								cacheCompression: false,
								// @remove-on-eject-begin
								cacheIdentifier: getCacheIdentifier(
									isEnvProduction
										? 'production'
										: isEnvDevelopment && 'development',
									[
										'babel-plugin-named-asset-import',
										'babel-preset-react-app',
										'react-dev-utils',
										'react-scripts',
									]
								),
								// @remove-on-eject-end
								// Babel sourcemaps are needed for debugging into node_modules
								// code.  Without the options below, debuggers like VSCode
								// show incorrect code and set breakpoints on the wrong lines.
								sourceMaps: shouldUseSourceMap,
								inputSourceMap: shouldUseSourceMap,
							},
						},
						// "postcss" loader applies autoprefixer to our CSS.
						// "css" loader resolves paths in CSS and adds assets as dependencies.
						// "style" loader turns CSS into JS modules that inject <style> tags.
						// In production, we use MiniCSSExtractPlugin to extract that CSS
						// to a file, but in development "style" loader enables hot editing
						// of CSS.
						// By default we support CSS Modules with the extension .module.css
						{
							test: cssRegex,
							exclude: cssModuleRegex,
							use: getStyleLoaders({
								importLoaders: 1,
								sourceMap: isEnvProduction
									? shouldUseSourceMap
									: isEnvDevelopment,
							}),
							// Don't consider CSS imports dead code even if the
							// containing package claims to have no side effects.
							// Remove this when webpack adds a warning or an error for this.
							// See https://github.com/webpack/webpack/issues/6571
							sideEffects: true,
						},
						// Adds support for CSS Modules (https://github.com/css-modules/css-modules)
						// using the extension .module.css
						{
							test: cssModuleRegex,
							use: getStyleLoaders({
								importLoaders: 1,
								sourceMap: isEnvProduction
									? shouldUseSourceMap
									: isEnvDevelopment,
								modules: {
									getLocalIdent: getCSSModuleLocalIdent,
								},
							}),
						},
						// Opt-in support for SASS (using .scss or .sass extensions).
						// By default we support SASS Modules with the
						// extensions .module.scss or .module.sass
						{
							test: sassRegex,
							exclude: sassModuleRegex,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									sourceMap: isEnvProduction
										? shouldUseSourceMap
										: isEnvDevelopment,
								},
								'sass-loader'
							),
							// Don't consider CSS imports dead code even if the
							// containing package claims to have no side effects.
							// Remove this when webpack adds a warning or an error for this.
							// See https://github.com/webpack/webpack/issues/6571
							sideEffects: true,
						},
						// Adds support for CSS Modules, but using SASS
						// using the extension .module.scss or .module.sass
						{
							test: sassModuleRegex,
							use: getStyleLoaders(
								{
									importLoaders: 3,
									sourceMap: isEnvProduction
										? shouldUseSourceMap
										: isEnvDevelopment,
									modules: {
										getLocalIdent: getCSSModuleLocalIdent,
									},
								},
								'sass-loader'
							),
						},
						babelLoaderConfiguration,
						imageLoaderConfiguration,
						svgLoaderConfiguration,
						// "file" loader makes sure those assets get served by WebpackDevServer.
						// When you `import` an asset, you get its (virtual) filename.
						// In production, they would get copied to the `build` folder.
						// This loader doesn't use a "test" so it will catch all modules
						// that fall through the other loaders.
						// {
						// 	loader: require.resolve('file-loader'),
						// 	// Exclude `js` files to keep "css" loader working as it injects
						// 	// its runtime that would otherwise be processed through "file" loader.
						// 	// Also exclude `html` and `json` extensions so they get processed
						// 	// by webpacks internal loaders.
						// 	exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
						// 	options: {
						// 		name: 'static/media/[name].[hash:8].[ext]',
						// 	},
						// },
						// ** STOP ** Are you adding a new loader?
						// Make sure to add the new loader(s) before the "file" loader.
					],
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin(
				Object.assign(
					{},
					{
						inject: true,
						template: path.join(__dirname, 'public/index.html'),
					},
					isEnvProduction
						? {
							minify: {
								removeComments: true,
								collapseWhitespace: true,
								removeRedundantAttributes: true,
								useShortDoctype: true,
								removeEmptyAttributes: true,
								removeStyleLinkTypeAttributes: true,
								keepClosingSlash: true,
								minifyJS: true,
								minifyCSS: true,
								minifyURLs: true,
							},
						}
						: undefined
				)
			),
			// new HtmlWebpackPlugin({
			// 	template: path.join(__dirname, 'public/index.html'),
			// }),
			// Inlines the webpack runtime script. This script is too small to warrant
			// a network request.
			// https://github.com/facebook/create-react-app/issues/5358
			isEnvProduction &&
			shouldInlineRuntimeChunk &&
			new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
			new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
				NODE_ENV: "production" | "development" | "test",
				PUBLIC_URL: '/',
				// WDS_SOCKET_HOST: string,
				// WDS_SOCKET_PATH: string,
				// WDS_SOCKET_PORT: string,
				// FAST_REFRESH: boolean,
			}),
			// This gives some necessary context to module not found errors, such as
			// the requesting resource.
			new ModuleNotFoundPlugin(appPath),
			isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
			// new WorkboxPlugin.GenerateSW({
			// 	// these options encourage the ServiceWorkers to get in there fast
			// 	// and not allow any straggling "old" SWs to hang around
			// 	clientsClaim: true,
			// 	skipWaiting: true,
			// }),
			// new webpack.HotModuleReplacementPlugin(),
			isEnvDevelopment &&
			shouldUseReactRefresh &&
			new ReactRefreshWebpackPlugin({
				overlay: {
					entry: webpackDevClientEntry,
					// The expected exports are slightly different from what the overlay exports,
					// so an interop is included here to enable feedback on module-level errors.
					module: reactRefreshOverlayEntry,
					// Since we ship a custom dev client and overlay integration,
					// the bundled socket handling logic can be eliminated.
					sockIntegration: false,
				},
			}),
			// Watcher doesn't work well if you mistype casing in a path so we use
			// a plugin that prints an error when you attempt to do this.
			// See https://github.com/facebook/create-react-app/issues/240
			isEnvDevelopment && new CaseSensitivePathsPlugin(),
			isEnvDevelopment &&
			new WatchMissingNodeModulesPlugin(appNodeModules),
			isEnvProduction &&
			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: 'static/css/[name].[contenthash:8].css',
				chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
			}),

			// new ManifestPlugin({
			// 	fileName: 'asset-manifest.json',
			// 	publicPath: publicUrlOrPath,
			// 	generate: (seed, files, entrypoints) => {
			// 		const manifestFiles = files.reduce((manifest, file) => {
			// 			manifest[file.name] = file.path;
			// 			return manifest;
			// 		}, seed);
			// 		const entrypointFiles = entrypoints.main.filter(
			// 			fileName => !fileName.endsWith('.map')
			// 		);

			// 		return {
			// 			files: manifestFiles,
			// 			entrypoints: entrypointFiles,
			// 		};
			// 	},
			// }),
			useTypeScript &&
			// new ForkTsCheckerWebpackPlugin({
			// 	typescript: resolve.sync('typescript', {
			// 		basedir: appNodeModules,
			// 	}),
			// 	async: isEnvDevelopment,
			// 	checkSyntacticErrors: true,
			// 	resolveModuleNameModule: process.versions.pnp
			// 		? `${__dirname}/pnpTs.js`
			// 		: undefined,
			// 	resolveTypeReferenceDirectiveModule: process.versions.pnp
			// 		? `${__dirname}/pnpTs.js`
			// 		: undefined,
			// 	tsconfig: appTsConfig,
			// 	reportFiles: [
			// 		// This one is specifically to match during CI tests,
			// 		// as micromatch doesn't match
			// 		// '../cra-template-typescript/template/src/App.tsx'
			// 		// otherwise.
			// 		'../**/src/**/*.{ts,tsx}',
			// 		'**/src/**/*.{ts,tsx}',
			// 		'!**/src/**/__tests__/**',
			// 		'!**/src/**/?(*.)(spec|test).*',
			// 		'!**/src/setupProxy.*',
			// 		'!**/src/setupTests.*',
			// 	],
			// 	silent: true,
			// 	// The formatter is invoked directly in WebpackDevServerUtils during development
			// 	formatter: isEnvProduction ? typescriptFormatter : undefined,
			// }),
			// !disableESLintPlugin &&
			// new ESLintPlugin({
			// 	// Plugin options
			// 	extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
			// 	formatter: require.resolve('react-dev-utils/eslintFormatter'),
			// 	eslintPath: require.resolve('eslint'),
			// 	failOnError: !(isEnvDevelopment && emitErrorsAsWarnings),
			// 	context: appSrc,
			// 	cache: true,
			// 	cacheLocation: path.resolve(
			// 		appNodeModules,
			// 		'.cache/.eslintcache'
			// 	),
			// 	// ESLint class options
			// 	cwd: appPath,
			// 	resolvePluginsRelativeTo: __dirname,
			// 	baseConfig: {
			// 		extends: [require.resolve('eslint-config-react-app/base')],
			// 		rules: {
			// 			...(!hasJsxRuntime && {
			// 				'react/react-in-jsx-scope': 'error',
			// 			}),
			// 		},
			// 	},
			// }),
			// Moment.js is an extremely popular library that bundles large locale files
			// by default due to how webpack interprets its code. This is a practical
			// solution that requires the user to opt into importing specific locales.
			// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
			// You can remove this if you don't use Moment.js:
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
			// Generate a service worker script that will precache, and keep up to date,
			// the HTML & assets that are part of the webpack build.
			new webpack.ProvidePlugin({
				process: 'process/browser',
			}),
			new webpack.DefinePlugin({
				// See: https://github.com/necolas/react-native-web/issues/349
				__DEV__: JSON.stringify(true),
				'process.env.NODE_ENV': JSON.stringify('production'),
				'process.env.PUBLIC_PATH': JSON.stringify('/')
			}),
		].filter(Boolean),
		// Some libraries import Node modules but don't use them in the browser.
		// Tell webpack to provide empty mocks for them so importing them works.
		// node: {
		// 	module: 'empty',
		// 	dgram: 'empty',
		// 	dns: 'mock',
		// 	fs: 'empty',
		// 	http2: 'empty',
		// 	net: 'empty',
		// 	tls: 'empty',
		// 	child_process: 'empty',
		// },
	}
};
