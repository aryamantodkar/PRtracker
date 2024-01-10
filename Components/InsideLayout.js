import { StyleSheet, Text, View, Keyboard } from 'react-native';
import React, { useState,useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import NewWorkout from './NewWorkout';
import AppNavbar from './AppNavbar';
import { SafeAreaProvider} from 'react-native-safe-area-context';
import IndividualWorkout from './IndividualWorkout';


const InsideStack = createNativeStackNavigator();

export default function InsideLayout({navigation}) {
  return (
      <SafeAreaProvider style={styles.container}> 
        <InsideStack.Navigator screenOptions={{headerShown: false}}>
          <InsideStack.Screen name="Home" component={Home} />
          <InsideStack.Screen name="NewWorkout" component={NewWorkout} />
        </InsideStack.Navigator>
        {/* <AppNavbar/> */}
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff'
  },
});
