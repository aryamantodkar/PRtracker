import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput } from 'react-native'
import React, { useContext, useEffect, useState,useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import Workout from './Workout';
import AppNavbar from './AppNavbar';
import { getAuth, reload } from "firebase/auth";
import { useNavigation,useIsFocused} from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref,uploadBytes,getDownloadURL,deleteObject  } from "firebase/storage";
import {LinearGradient} from 'expo-linear-gradient';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';

const logout = require("../assets/logout.png");
const bellIcon = require("../assets/bell-icon.png");
const searchIcon = require("../assets/search-icon.png");
const searchIconBlack = require("../assets/search-icon-black.png");
const crossIcon = require("../assets/cross-icon-white.png");
const usersIcon = require("../assets/findUsers.png");
const pfp = require("../assets/pfp.jpg");
const settingsIcon = require("../assets/settings-icon.png");

export default function Home() {
  const [showNavbar,setShowNavbar] = useState(true);
  const [searchBar,setSearchBar] = useState(false);
  const [searchText,setSearchText] = useState("");
  const [searchParams,setSearchParams] = useState("");
  const [profilePic,setProfilePic] = useState("");
  const [hideUserNavbar,setHideUserNavbar] = useState(false);

  const navigation = useNavigation();
  
  const route = useRoute();
  const isReload = route.params ? route.params.isReload : undefined;
  const isFocused = useIsFocused();

  const auth = getAuth();
  const user = auth.currentUser;
  const inputRef = useRef(null);
  const storage = getStorage();

  const getProfileImage = async () => {
    getDownloadURL(ref(storage, `${user.uid}`))
    .then((url) => {
      setProfilePic(url);
    })
    .catch((error) => {
      // Handle any errors
      console.log("error",error)
      setProfilePic("");
    });
  }

  
  useEffect(()=>{
    getProfileImage();
  },[])

  useEffect(()=>{
    if(isFocused){
      getProfileImage();
    }
  },[isFocused])

  return (
    <View style={{height: '100%',width: '100%',flex: 1,paddingTop: 20}}>
        <ScrollView style={styles.home}>
            <ScrollView contentContainerStyle ={[styles.home,{padding: 30,paddingLeft: 15,paddingRight: 15,display:'flex',justifyContent: 'space-between',alignItems: 'center',height: '100%',flexDirection: 'column'}]}>
                {
                  !hideUserNavbar
                  ?
                  <View style={{width: '100%'}}>
                    {
                      !searchBar
                      ?
                      <View style={{display:'flex',flexDirection: 'row',marginTop: 10,justifyContent: 'space-between',width: '100%',marginBottom: 0}}>
                        <View style={{display:'flex',flexDirection: 'row'}}>
                          <View style={{borderColor: '#ddd',borderWidth: 2,borderRadius: 50}}>
                            {
                              profilePic==""
                              ?
                              <Pressable onPress={()=>{

                              }}>
                                <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/>
                              </Pressable>
                              :
                              <Pressable onPress={()=>{

                              }}>
                                <Image src={profilePic} style={{height: 50,width: 50,borderRadius: 50,}}/>
                              </Pressable>
                            }
                          </View>
                          <View style={{marginLeft:10,display: 'flex',flexDirection: 'row',justifyContent: 'center'}}>
                            <View style={{display: 'flex',justifyContent: 'center'}}>
                              <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 20,color: '#869AAF',textAlignVertical: 'center',fontFamily: 'SignikaNegative'}]}>Hi, </Text>
                            </View>
                            <View style={{display: 'flex',justifyContent: 'center'}}>
                              <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 20,color: '#000',textAlignVertical: 'center',fontFamily: 'SignikaNegative'}]}>{user.displayName.split(" ")[0]} {user.displayName.split(" ").length>1 ? user.displayName.split(" ")[1][0] : null}.</Text>
                            </View>
                          </View>
                        </View>
                        <View style={{display: 'flex',flexDirection: 'row'}}>
                          <Pressable onPress={()=>{
                            setSearchBar(true);
                          }} style={styles.headingTitleContainer}>
                            <Image source={searchIconBlack} style={{height: 25,width: 25,marginRight: 15,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                          </Pressable>
                          <View style={{justifyContent: 'center', borderRadius: 50,backgroundColor: '#353F4E',alignSelf: 'center',padding: 7.5}}>
                            <Image source={bellIcon} style={{height: 22,width: 22}}/>
                          </View>
                        </View>
                      </View>
                      :
                      <View style={{borderColor: '#455366',borderWidth: 1,display: 'flex',justifyContent: 'space-between',flexDirection: 'row',alignItems: 'center',backgroundColor: '#1e1e1e',padding: 5,paddingLeft: 10,paddingRight: 15,borderRadius: 15,elevation: 5,width: '100%',marginBottom: 0}}>
                          <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                            <Image source={searchIcon} style={{height: 25,width: 25,display: 'flex',alignItems: 'center',marginRight: 5}}/>
                            <TextInput ref={inputRef} value={searchText} placeholderTextColor='#ddd' placeholder='Search Workouts' onChangeText={(text)=>{
                                setSearchText(text);
                                setSearchParams(text);
                                inputRef.current.focus();
                            }} style={{height: 40,fontSize: 14,color: '#fff',fontWeight: '500',textAlignVertical: 'center',width: '80%'}}/>
                          </View>
                          <Pressable onPress={()=>{
                            setSearchBar(false);
                            setSearchParams("");
                            setSearchText("");
                          }}>
                            <Image source={crossIcon} style={{height: 15,width: 15,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                          </Pressable>
                      </View> 
                    }
                  </View>
                  :
                  null
                }
                
                <Workout searchParams={searchParams} showNavbar={setShowNavbar} uid={null} hideUserNavbar={setHideUserNavbar} searchBar={searchBar} isReload={isReload} userProfile={false}/>
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
    paddingBottom: 100,
    fontFamily: 'SignikaNegative',
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