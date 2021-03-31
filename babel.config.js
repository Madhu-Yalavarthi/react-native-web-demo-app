
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.NODE_ENV = 'development';

module.exports = {
  presets: ['@babel/preset-env']
};
// module.exports = {
//   presets: ['module:metro-react-native-babel-preset'],
//   plugins: [
//     ["module-resolver", {
//       "alias": {
//         "stream": "stream-browserify",
//         "path": "path-webpack"
//       }
//     }],
//     "transform-inline-environment-variables"
//   ]
// };
