import { StyleSheet, Text, View,ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingPage } from './Components/LandingPage';
import Login from './Components/Login';
import Register from './Components/Register';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import InsideLayout from './Components/InsideLayout';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUser,faArrowLeft,faBell,faArrowUp,faXmark,faTrash,faAngleDown,faPen,faAt,faHouse,faDumbbell,faHeart,faArrowRightFromBracket,faGear,faLock,faPlus,faAngleUp,faCheck,faMagnifyingGlass,faImage,faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import {faComment,faEye,faEyeSlash} from '@fortawesome/free-regular-svg-icons'

library.add(faUser,faArrowLeft,faBell,faArrowUp,faComment,faXmark,faTrash,faAngleDown,faPen,faAt,faEye,faEyeSlash,faHouse,faDumbbell,faHeart,faArrowRightFromBracket,faGear,faLock,faPlus,faAngleUp,faCheck,faMagnifyingGlass,faImage,faChevronLeft)

const Stack = createNativeStackNavigator();

export default function App() {
  
  // Ignore log notification by message
  LogBox.ignoreLogs(['Warning: ...']);

  //Ignore all log notifications
  LogBox.ignoreAllLogs();

  const [fontsLoaded, fontError] = useFonts({
    'JosefinSans': require('./assets/fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-Bold': require('./assets/fonts/JosefinSans-Bold.ttf'),
    'SignikaNegative': require('./assets/fonts/SignikaNegative-Medium.ttf'),
    'LeagueSpartan': require('./assets/fonts/LeagueSpartan-Regular.ttf'),
    'LeagueSpartan-Medium': require('./assets/fonts/LeagueSpartan-Medium.ttf'),
    'LeagueSpartan-SemiBold': require('./assets/fonts/LeagueSpartan-SemiBold.ttf'),
    'LeagueSpartan-Bold': require('./assets/fonts/LeagueSpartan-Bold.ttf'),
  });

  const [user,setUser] = useState(null);
  console.disableYellowBox = true;

  useEffect(()=>{
    onAuthStateChanged(FIREBASE_AUTH,(user)=>{
      setUser(user);
    })
  },[])
  if(!fontsLoaded){
    return(
      <View style={{height: '100%',width:'100%',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    )
  }
  else{
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
