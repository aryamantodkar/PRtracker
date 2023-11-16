import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import NewWorkout from './NewWorkout';
import AppNavbar from './AppNavbar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

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
