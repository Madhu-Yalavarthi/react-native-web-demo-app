import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App.web';

if (module.hot) {
	module.hot.accept();
}
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
	initialProps: {},
	rootTag: document.getElementById('root'),
});

// console.log(process.env.PUBLIC_URL);
// if(process.env.NODE_ENV === 'development'){
// 		console.log(process.env.NODE_ENV);
// 		console.log(process.env.PUBLIC_URL);
// } else {
// 		console.log(process.env.NODE_ENV);
// 		console.log(process.env.PUBLIC_URL);
// }

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/service-worker.js').then(registration => {
			console.log('SW registered: ', registration);
		}).catch(registrationError => {
			console.log('SW registration failed: ', registrationError);
		});
	});
}
