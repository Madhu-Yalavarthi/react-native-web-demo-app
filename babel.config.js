const path = require('path');

process.env.PUBLIC_URL = path.resolve(__dirname, 'public');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
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
