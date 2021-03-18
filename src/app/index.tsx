import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './home/home.screen';
import { CameraScreen } from './camera/camera.screen';
import { QrcodeScreen } from './qrcode/qrcode.screen';
import { ResultScreen } from './camera/result.screen';

const Stack = createStackNavigator();


export function AppNavigation() {

    return (
        <Stack.Navigator initialRouteName="Home" mode={"modal"} >
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* <Stack.Screen name="Camera" options={{ headerShown: false }} component={CameraScreen} />
            <Stack.Screen name="Qrcode" options={{ headerShown: false }} component={QrcodeScreen} />
            <Stack.Screen name="Result" options={{ headerShown: false }} component={ResultScreen} /> */}
        </Stack.Navigator>
    )
}