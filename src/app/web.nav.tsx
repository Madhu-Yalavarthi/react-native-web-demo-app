import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './home/home.screen';
import { CameraWebScreen } from './camera/camera.web';

const Stack = createStackNavigator();

export function AppNavigation() {
    return (
        <Stack.Navigator initialRouteName="Home" mode={'card'} >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Camera" options={{ headerShown: true }} component={CameraWebScreen} />
            <Stack.Screen name="Qrcode" options={{ headerShown: true }} component={CameraWebScreen} />
            <Stack.Screen name="Result" options={{ headerShown: true }} component={CameraWebScreen} />
        </Stack.Navigator>
    )
}
