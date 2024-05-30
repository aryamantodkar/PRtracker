import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View,Pressable, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { getStorage } from "firebase/storage";

export const LandingPage = () => {
  

  const storage = getStorage();
  const navigation = useNavigation();
  const route = useRoute();

  const goToLogin = () => {
    navigation.navigate('Login');
  }

  const goToRegister = () => {
    navigation.navigate('Register');
  }


  return (
    <SafeAreaView style={styles.homepage}>
        <View style={styles.homecontent}>
          <View>
            <Text style={{color: '#343434',fontSize: 50,fontFamily: 'LeagueSpartan-Medium',marginBottom: 10}}>Track your workouts.</Text>
            <Text style={{color: '#949494',fontFamily: 'LeagueSpartan',fontSize: 20}}>In the most minimalist app you have ever used.</Text>
          </View>
          
          <View style={styles.btnContainer}>
            <Pressable style={[styles.btn,{marginBottom: 20}]} onPress={goToLogin}>
              <Text style={{color: '#fff', fontSize: 18,paddingLeft: 10,paddingRight: 10,fontFamily: 'LeagueSpartan'}}>Login</Text>
            </Pressable>
            <Pressable style={styles.btn} onPress={goToRegister}>
              <Text style={{color: '#fff', fontSize: 18,paddingLeft: 10,paddingRight: 10,fontFamily: 'LeagueSpartan'}}>Join Minimalism</Text>
            </Pressable>
          </View>
        </View>
    </SafeAreaView>
  );
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
        position: 'relative',
  },
    homecontent: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 30,
    },
    btnContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      margin: 'auto',
      width: '100%'
    },
    btn: {
      backgroundColor: '#343434',
      borderRadius: 30,
      fontSize: 20,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      fontFamily: 'LeagueSpartan',
      alignItems: 'center',
      width: '100%',
    },
});
