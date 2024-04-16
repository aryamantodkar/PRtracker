import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View,Pressable, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { getStorage, ref,getDownloadURL } from "firebase/storage";

export const LandingPage = () => {
  const [bgImage,setBgImage] = useState("");
  const [isLoading,setIsLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'JosefinSans': require('../assets/fonts/JosefinSans-Regular.ttf'),
    'JosefinSans-Bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
    'SignikaNegative': require('../assets/fonts/SignikaNegative-Medium.ttf'),
    'LeagueSpartan': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
    'LeagueSpartan-Medium': require('../assets/fonts/LeagueSpartan-Medium.ttf'),
  });

  // const onLayoutRootView = useCallback(async () => {
  //   if (fontsLoaded || fontError) {
  //     await SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, fontError]);

  // if (!fontsLoaded && !fontError) {
  //   return null;
  // }

  useEffect(()=>{
    const getProfileImage = async () => {
        await getDownloadURL(ref(storage, `bgImage.jpg`))
        .then((url) => {
          setBgImage(url);
          setIsLoading(false)
        })
        .catch((error) => {
          // Handle any errors
          console.log(error)
        });
    }

    getProfileImage()
  },[])

  

  const storage = getStorage();
  const navigation = useNavigation();
  const route = useRoute();

  const goToLogin = () => {
    navigation.navigate('Login');
  }

  const goToRegister = () => {
    navigation.navigate('Register');
  }


  if(isLoading){
    <ActivityIndicator size="large" color="#000" />
  }
  else{
    return (
      <SafeAreaView style={styles.homepage}>
          <Image src={bgImage} style={styles.bgImage}/>
          <View style={styles.homecontent}>
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>Track your workouts.</Text>
              <Text style={styles.subHeading}>Simple and Fast.</Text>
            </View>
            <View style={styles.btnContainer}>
              <Pressable style={styles.btn} onPress={goToLogin}>
                <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10,fontFamily: 'LeagueSpartan'}}>Sign In</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={goToRegister}>
                <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10,fontFamily: 'LeagueSpartan'}}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
    homepage: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        height: '100%',
        width: '100%',
        paddingTop: 30,
  },
    homecontent: {
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
    },
    btnContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 70,
      left: 0,
      right: 0,
      margin: 'auto',
    },
    btn: {
      backgroundColor: '#000',
      color: '#fff',
      borderRadius: 30,
      fontSize: 20,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      fontFamily: 'LeagueSpartan',
      alignItems: 'center',
      
    },
    headingContainer: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      position: 'absolute',
      top: 40,
      left: 40,
    },
    heading: {
      fontFamily: 'LeagueSpartan-Medium',
      fontSize: 50,
      paddingBottom: 10,
    },
    subHeading: {
      fontFamily: 'LeagueSpartan',
      fontSize: 18,
      paddingBottom: 10,
      color: '#696969',
    },
    bgImage: {
      position: 'absolute',
      width: 300,
      height: 300,
    }
});
