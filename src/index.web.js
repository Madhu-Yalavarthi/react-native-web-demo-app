import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App.web';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

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
serviceWorkerRegistration.register();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// console.log(process.env.PUBLIC_URL);
// if(process.env.NODE_ENV === 'development'){
// 		console.log(process.env.NODE_ENV);
// 		console.log(process.env.PUBLIC_URL);
// } else {
// 		console.log(process.env.NODE_ENV);
// 		console.log(process.env.PUBLIC_URL);
// }

// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', () => {
// 		navigator.serviceWorker.register('/service-worker.js').then(registration => {
// 			console.log('SW registered: ', registration);
// 		}).catch(registrationError => {
// 			console.log('SW registration failed: ', registrationError);
// 		});
// 	});
// }
