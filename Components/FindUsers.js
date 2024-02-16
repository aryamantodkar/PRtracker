import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput } from 'react-native'
import React, { useContext, useEffect, useState,useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavbar from './AppNavbar';
import { getAuth } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref,uploadBytes,getDownloadURL } from "firebase/storage";

const backIconBlack = require("../assets/back-arrow-icon.png");
const pfp = require("../assets/pfp.jpg");
const searchIcon = require("../assets/search-icon-grey.png");

export const FindUsers = () => {
    const [userList,setUserList] = useState([]);
    const [searchText,setSearchText] = useState("");
    const [profilePic,setProfilePic] = useState("");

    const storage = getStorage();

    const navigation = useNavigation();
    const route = useRoute();
    const auth = getAuth();
    const user = auth.currentUser;
    const userId = user.uid;

    const searchUsers = async (text) => {
        if(text==""){
            getAllUsersList();
        }
        else{
            const filterBySearch = userList.filter((user) => {
                if (user.name.toLowerCase()
                        .includes(text.toLowerCase()) && user.uid!=userId){ return user; }
            })
            setUserList(filterBySearch);
        }
    }
  
    const getProfileImage = async () => {
        getDownloadURL(ref(storage, `${user.uid}`))
        .then((url) => {
          setProfilePic(url);
        })
        .catch((error) => {
          // Handle any errors
          console.log("error")
        });
    }

    const getAllUsersList = async () => {
      const querySnapshot = await getDocs(collection(FIREBASE_DB, "Users"));
  
      let userArray = [];
  
      querySnapshot.forEach((doc) => {
        if(doc.id!=userId){
            userArray.push(doc.data());
        }
      });
  
      setUserList(userArray);
    }
  
    useEffect(()=>{
      getAllUsersList();
      getProfileImage();
    },[])
  return (
    <View style={{height: '100%',width: '100%'}}>
        <ScrollView style={styles.home}>
            <View style={{marginTop: 30,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'}}>
                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',position: 'relative'}}>
                    <Pressable onPress={()=>{
                        navigation.navigate('Home');
                    }}>
                        <Image source={backIconBlack} style={{height: 35,width: 35}}/>
                    </Pressable>
                    <Image source={searchIcon} style={{height: 25,width: 25,position: 'absolute',left: 50}}/>
                    <TextInput onChangeText={(text)=>{
                        setSearchText(text);
                        searchUsers(text)
                    }} placeholder='Find Your Friends' style={{height: 40,marginLeft: 10,borderWidth: 2,borderColor: '#DDD',width: '75%',padding: 10,borderRadius: 10,paddingLeft: 35}}/>
                </View>
                <View style={{paddingRight: 5}}>
                    <Pressable onPress={() => {
                        navigation.navigate('UserPage')
                    }}>
                        {
                            profilePic==""
                            ?
                            <Image source={pfp} style={{height: 35,width: 35,borderRadius: 50}}/>
                            :
                            <Image src={profilePic} style={{height: 35,width: 35,borderRadius: 50}}/>
                        }
                    </Pressable>
                </View>
            </View>
            <View style={{margin: 10,marginTop: 40,height:'100%',marginBottom: 60,display: 'flex'}}>
                <Text style={{fontSize: 20,fontWeight: '600',color: '#404040'}}>All Users</Text>
                {
                    userList.length>0
                    ?
                    <View style={{display: 'flex',flexDirection: 'column',width: '100%',height: '100%',marginTop: 20}}>
                        {
                            userList.map(user => {
                                return(
                                    <Pressable onPress={()=>{
                                        navigation.navigate('IndividualUser',{
                                            uid: user.uid,
                                            name: user.name,
                                        })
                                    }} key={user.uid} style={{width: '100%',height: 80,display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',paddingLeft: 20,backgroundColor: '#f5f4f4',borderColor: '#DDD',borderWidth: 1,borderRadius: 10,marginTop: 10,marginBottom: 10}}>
                                        {
                                            user.profileUrl==""
                                            ?
                                            <Image source={pfp} style={{height: 45,width: 45,padding: 10,borderRadius: 50}}/>
                                            :
                                            <Image src={user.profileUrl} style={{height: 45,width: 45,padding: 10,borderRadius: 50}}/>
                                        }
                                        <View style={{marginLeft: 20,display: 'flex',flexDirection: 'column'}}>
                                            <Text style={{color: '#007FF4',fontSize: 16,marginBottom: 5,fontWeight: '500'}}>{user.name}</Text>
                                            <Text style={{color: '#000',fontSize: 12.5,marginBottom: 5,fontWeight: '400'}}>Pune, Maharashtra</Text>

                                        </View>
                                    </Pressable>
                                )
                            })
                        }
                    </View>
                    :
                    <View style={{backgroundColor: '#f5f4f4',height: 60,marginTop: 50,width: '60%',display: 'flex',justifyContent: 'center',alignItems: 'center',borderWidth: 1,borderColor: '#DDD',borderRadius: 10,marginLeft: 'auto',marginRight: 'auto'}}>
                        <Text style={{color: 'black'}}>No Users Found</Text>
                    </View>
                }
            </View>
        </ScrollView>
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
      padding: 20,
    },
  })