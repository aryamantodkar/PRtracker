import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingPage } from './Components/LandingPage';
import Login from './Components/Login';
import Register from './Components/Register';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import InsideLayout from './Components/InsideLayout';
import { LogBox } from 'react-native';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser,faArrowLeft,faBell,faArrowUp,faXmark,faTrash,faAngleDown,faPen,faAt,faHouse,faDumbbell,faHeart,faArrowRightFromBracket,faGear,faLock,faPlus,faAngleUp,faCheck,faMagnifyingGlass,faImage } from '@fortawesome/free-solid-svg-icons'
import {faComment,faEye,faEyeSlash} from '@fortawesome/free-regular-svg-icons'

library.add(faUser,faArrowLeft,faBell,faArrowUp,faComment,faXmark,faTrash,faAngleDown,faPen,faAt,faEye,faEyeSlash,faHouse,faDumbbell,faHeart,faArrowRightFromBracket,faGear,faLock,faPlus,faAngleUp,faCheck,faMagnifyingGlass,faImage)

const Stack = createNativeStackNavigator();

export default function App() {
  
  // Ignore log notification by message
  LogBox.ignoreLogs(['Warning: ...']);

  //Ignore all log notifications
  LogBox.ignoreAllLogs();

  const [user,setUser] = useState(null);
  console.disableYellowBox = true;

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
