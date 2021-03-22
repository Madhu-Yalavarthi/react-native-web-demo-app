import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar
} from 'react-native';


import { NavigationContainer } from '@react-navigation/native';
import { AppNavigation } from './src/app/mobile.nav';
declare const global: { HermesInternal: null | {} };

const App = () => {
  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({

});

export default App;