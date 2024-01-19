import { StyleSheet, Text, View, Pressable, Image, Keyboard, KeyboardAvoidingView,Platform } from 'react-native'
import React,{useEffect, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
const workoutWhite = require("../assets/workout-icon-white.png");
const workoutBlack = require("../assets/workout-icon-black.png");
const homeWhite = require("../assets/home-icon-white.png");
const homeBlack = require("../assets/home-icon-black.png");
const accountWhite = require("../assets/account-icon-white.png");
const accountBlack = require("../assets/account-icon-black.png");


const AppNavbar = ({showNavbar}) => {
  const [plus,setPlus] = useState(false);
  const [home,setHome] = useState(true);
  const [account,setAccount] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();


  const goToHome = () => {
    setHome(true);
    setAccount(false);
    setPlus(false);

    navigation.navigate('Home');
  }
  
  const addWorkout = () => {
    setHome(false);
    setAccount(false);
    setPlus(true);

    navigation.navigate('NewWorkout');
  }

  const goToAccount = () => {
    setHome(false);
    setAccount(true);
    setPlus(false);

    navigation.navigate('UserPage');  
  }

  const [keyboardStatus, setKeyboardStatus] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if(route.name!="UserPage"){
        goToHome();
      }
      if(route.name=='UserPage'){
        setAccount(true);
        setHome(false);
        setPlus(false);
      }
    });

    return () => {
      unsubscribe;
    };  
  }, [navigation]);


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{backgroundColor:'transparent'}}>
      {
        !keyboardStatus && showNavbar
        ?
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
          <View style={styles.navbar}>
              {
                home ?
                <Pressable style={styles.navBtnActivated} >
                  <Image source={homeWhite} style={styles.plusIcon}/>
                </Pressable>
                :
                <Pressable style={styles.navAdd} onPress={goToHome}>
                  <Image source={homeBlack} style={styles.plusIcon}/>
                </Pressable>
              }
              {
                plus ?
                <Pressable style={styles.navBtnActivated}>
                  <Image source={workoutWhite} style={{height: 40, width: 40}}/>
                </Pressable>
                :
                <Pressable style={styles.navAdd} onPress={addWorkout}>
                  <Image source={workoutBlack} style={{height: 40, width: 40}}/>
                </Pressable>
              }
              {
                account ?
                <Pressable style={styles.navBtnActivated}>
                  <Image source={accountWhite} style={styles.plusIcon}/>
                </Pressable>
                :
                <Pressable style={styles.navAdd} onPress={goToAccount}>
                  <Image source={accountBlack} style={styles.plusIcon}/>
                </Pressable>
              }
          </View>
        </View>
        :
        null
      }
    </KeyboardAvoidingView>
  )
}

export default AppNavbar

const styles = StyleSheet.create({
    navbar: {
        position: 'absolute',
        bottom: 20,
        width: '60%',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#f5f4f4',
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 30,
        elevation: 10,
        marginTop: 50
      },
      plusIcon:{
        height: 25,
        width: 25,
        // padding: 20
      },
      navBtnActivated: {
        backgroundColor: 'black',
        borderRadius: 50,
        marginBottom: 45,
        padding: 15,
        borderWidth: 2,
        borderColor: '#f5f4f4'
      },
      navAdd: {
        // backgroundColor: 'red',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 20
      }    
})