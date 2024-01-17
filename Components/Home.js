import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Workout from './Workout';
import AppNavbar from './AppNavbar';
import { getAuth } from "firebase/auth";

const logout = require("../assets/logout.png");

export default function Home({navigation}) {
  const handleLogout = () =>{
    FIREBASE_AUTH.signOut();
  }

  const [showNavbar,setShowNavbar] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <SafeAreaView style={styles.home}>
        <ScrollView contentContainerStyle ={[styles.home,{padding: 30}]}>
            <View style={styles.header}>
              <View style={styles.headingTitleContainer}>
                <Text style={[styles.headingTitle,{fontWeight: 400,fontSize: 28,color: '#676767'}]}>Welcome,</Text>
                <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 22,color: '#404040'}]}>{user.displayName.split(/(\s+)/)[0]}</Text>
              </View>
              <View>
                <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                  <Image source={logout} style={styles.logoutIcon}/>
                </Pressable>
              </View>
            </View>
            <Workout showNavbar={setShowNavbar}/>
        </ScrollView>
        <AppNavbar showNavbar={showNavbar}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  home: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#fff'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomColor: '#EBEAEA',
    borderBottomWidth: 2
  },
  logoutBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    verticalAlign: 'middle',
  },
  headingTitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'left',
    alignContent: 'center',
  },
  headingTitle: {
    fontSize: 30,
    color: 'black',
    textAlign: 'left',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    
  },
  logoutIcon: {
    height: 25,
    width: 25
  },
})