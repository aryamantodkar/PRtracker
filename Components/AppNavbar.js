import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React,{useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
const plusWhite = require("../assets/plus-icon-white.png");
const plusBlack = require("../assets/plus-icon-black.png");
const homeWhite = require("../assets/home-icon-white.png");
const homeBlack = require("../assets/home-icon-black.png");
const accountWhite = require("../assets/account-icon-white.png");
const accountBlack = require("../assets/account-icon-black.png");


const AppNavbar = () => {
  const [plus,setPlus] = useState(false);
  const [home,setHome] = useState(true);
  const [account,setAccount] = useState(false);

  const navigation = useNavigation();

  const goToHome = () => {
    setHome(true);
    setAccount(false);
    setPlus(false);
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
  }

  return (
    <SafeAreaView>
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
                  <Image source={plusWhite} style={styles.plusIcon}/>
                </Pressable>
                :
                <Pressable style={styles.navAdd} onPress={addWorkout}>
                  <Image source={plusBlack} style={styles.plusIcon}/>
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
    </SafeAreaView>
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