import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput } from 'react-native'
import React, { useContext, useEffect, useState,useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Workout from './Workout';
import AppNavbar from './AppNavbar';
import { getAuth } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from "firebase/firestore";

const logout = require("../assets/logout.png");
const searchIcon = require("../assets/search-icon.png");
const crossIcon = require("../assets/cross-icon-black.png");
const usersIcon = require("../assets/findUsers.png");

export default function Home() {
  const handleLogout = () =>{
    FIREBASE_AUTH.signOut();
  }

  const [showNavbar,setShowNavbar] = useState(true);
  const [searchBar,setSearchBar] = useState(false);
  const [searchText,setSearchText] = useState("");
  const [searchParams,setSearchParams] = useState("");

  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;
  const inputRef = useRef(null);

  return (
    <View style={{height: '100%',width: '100%'}}>
        <ScrollView style={styles.home}>
            <ScrollView contentContainerStyle ={[styles.home,{padding: 30}]}>
                {
                  !searchBar
                  ?
                  <View style={styles.header}>
                    <View style={{display: 'flex',flexDirection: 'row'}}>
                      <Pressable onPress={()=>{
                        setSearchBar(true);
                      }} style={styles.headingTitleContainer}>
                        {/* <Text style={[styles.headingTitle,{fontWeight: 400,fontSize: 28,color: '#676767'}]}>Welcome,</Text>
                        <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 22,color: '#404040'}]}>{user.displayName.split(/(\s+)/)[0]}</Text> */}
                        <Image source={searchIcon} style={{height: 35,width: 35,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                      </Pressable>
                      <Pressable onPress={()=>{
                        navigation.navigate('FindUsers');
                      }} style={styles.headingTitleContainer}>
                        <Image source={usersIcon} style={{height: 55,width: 55,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                      </Pressable>
                    </View>
                    <View>
                      <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                        <Image source={logout} style={styles.logoutIcon}/>
                      </Pressable>
                    </View>
                  </View>
                  :
                  <View style={{borderBottomColor: '#000',borderBottomWidth: 2,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'}}>
                      <TextInput ref={inputRef} value={searchText} placeholder='Search Workouts' onChangeText={(text)=>{
                          setSearchText(text);
                          setSearchParams(text);
                          inputRef.current.focus();
                      }} style={{height: 50,fontSize: 15}}/>
                      <Pressable onPress={()=>{
                        setSearchBar(false);
                        setSearchParams("");
                        setSearchText("");
                      }}>
                        <Image source={crossIcon} style={{height: 18,width: 18,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                      </Pressable>
                  </View>
                }
                <Workout searchParams={searchParams} showNavbar={setShowNavbar} uid={null}/>
            </ScrollView>
            
        </ScrollView>
        <AppNavbar showNavbar={showNavbar}/>
    </View>
  )
}

const styles = StyleSheet.create({
  home: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 100
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