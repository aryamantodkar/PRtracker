import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Workout from './Workout';
import AppNavbar from './AppNavbar';
const logout = require("../assets/logout.png");

export default function Home({navigation}) {
  const handleLogout = () =>{
    FIREBASE_AUTH.signOut();
  }

  return (
    <SafeAreaView style={styles.home}>
        <ScrollView contentContainerStyle ={[styles.home,{padding: 30}]}>
            <View style={styles.header}>
              <View style={styles.headingTitleContainer}>
                <Text style={styles.headingTitle}>Workouts</Text>
              </View>
              <View>
                <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                  <Image source={logout} style={styles.logoutIcon}/>
                </Pressable>
              </View>
            </View>
            <Workout/>
        </ScrollView>
        <AppNavbar/>
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
    alignItems: 'center',
    alignContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'black'
  },
  headingTitle: {
    fontSize: 30,
    color: 'black',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    
  },
  logoutIcon: {
    height: 25,
    width: 25
  },
})