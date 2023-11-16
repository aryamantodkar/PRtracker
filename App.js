import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from './Components/LandingPage';
import Login from './Components/Login';
import Register from './Components/Register';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import InsideLayout from './Components/InsideLayout';
import AppNavbar from './Components/AppNavbar';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user,setUser] = useState(null);

  useEffect(()=>{
    onAuthStateChanged(FIREBASE_AUTH,(user)=>{
      setUser(user);
    })
  },[])
  return (
    <NavigationContainer>
        {user
          ?
            <Stack.Navigator screenOptions={{headerShown: false}}>
              <Stack.Screen name="InsideLayout" component={InsideLayout} />
            </Stack.Navigator>
          :
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="LandingPage" component={LandingPage} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </Stack.Navigator> 
        }
      
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
