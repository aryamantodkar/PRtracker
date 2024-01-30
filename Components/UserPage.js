import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import AppNavbar from './AppNavbar';
import { collection, getDocs,doc,updateDoc, getDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";

const pfp = require("../assets/pfp.jpg");
const settingsIcon = require("../assets/settings-icon.png");

const UserPage = () => {
    const [showNavbar,setShowNavbar] = useState(true);
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);

    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;


    const getFollowStats = async () => {
      const docRef = doc(FIREBASE_DB, "Users", `${user.uid}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
          setFollowingArray(docSnap.data().following);
          setFollowersArray(docSnap.data().followers);
      }
    }

    useEffect(() => {
      getFollowStats();
    },[])

  return (
    <View style={styles.home}>
      <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
            <Image source={pfp} style={{height: 60,width: 60,borderRadius: 50}}/>
            <View style={{display: 'flex',flexDirection: 'column',marginLeft: 15}}>
                <Text style={{fontSize: 18,fontWeight: '600',color: '#404040'}}>{user.displayName}</Text>
                <Text style={{fontSize: 12,fontWeight: '400',color: '#696969'}}>Pune, Maharashtra</Text>
            </View>
        </View>
        <Pressable style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
            <Image source={settingsIcon} style={{height: 35,width: 35}}/>
        </Pressable>
      </View>
      <View style={{display: 'flex',flexDirection: 'row',marginTop: 20}}>
          <Text style={{fontSize: 14.5,fontWeight: '400',color: '#696969',display: 'flex',flexDirection: 'row'}}>
            <Pressable onPress={()=>{
              navigation.navigate('ViewFollowers',{
                followersTab: true
              });
            }} style={{display: 'flex',flexDirection: 'row'}}> 
              <Text style={{fontWeight: '600',color:'black'}}>{followersArray.length} </Text>
              <Text>Followers | </Text>
            </Pressable>
            <Pressable onPress={()=>{
              navigation.navigate('ViewFollowers',{
                followersTab: false,
              });
            }} style={{display: 'flex',flexDirection: 'row'}}>
              <Text style={{fontWeight: '600',color:'black'}}>{followingArray.length} </Text>
              <Text>Following</Text>
            </Pressable>
          </Text>
      </View>
      <View style={{width: '100%',borderBottomWidth: 1,borderBottomColor: '#EBEAEA',marginTop: 15}}></View>
      <View style={{position: 'absolute',bottom: 0,left: 0,right: 0}}>
        <AppNavbar showNavbar={showNavbar}/>
      </View>
    </View>
  )
}

export default UserPage

const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: 30,
        backgroundColor: '#fff',
        paddingTop: 50,
        position: 'relative'
    }
})