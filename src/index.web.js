import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App.web';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
// import reportWebVitals from './reportWebVitals';

if (module.hot) {
	module.hot.accept();
}
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
	initialProps: {},
	rootTag: document.getElementById('root'),
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.unregister();
serviceWorkerRegistration.register();
console.log(process.env.NODE_ENV);
console.log(process.env.PUBLIC_URL);
// if(process.env.NODE_ENV === 'development'){
//     serviceWorkerRegistration.unregister();
// 		console.log(process.env.NODE_ENV);
// 		console.log(process.env.PUBLIC_URL);
// } else {
//     serviceWorkerRegistration.register();
// 		console.log(process.env.NODE_ENV);
// 		console.log(process.env.PUBLIC_URL);
// }
