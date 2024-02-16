import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image,TouchableOpacity,SafeAreaView,Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { FIREBASE_AUTH, FIREBASE_DB, firebaseConfig } from '../FirebaseConfig';
import AppNavbar from './AppNavbar';
import { collection, getDocs,doc,updateDoc, getDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import { getStorage, ref,uploadBytes,getDownloadURL } from "firebase/storage";

const settingsIcon = require("../assets/settings-icon.png");
const pfp = require("../assets/pfp.jpg");

const UserPage = () => {
    const [showNavbar,setShowNavbar] = useState(true);
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);

    const [image,setImage] = useState(null);
    const [uploading,setUploading] = useState(false);
    const [profilePic,setProfilePic] = useState("");

    const storage = getStorage();
    const storageRef = ref(storage);
    
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;

    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [1,1],
        quality: 1,
      })

      if(!result.canceled){
        setImage(result.assets[0].uri);
      }
    }

    const uploadMedia = async () => {
      setUploading(true);

      try{
        const {uri} = await FileSystem.getInfoAsync(image);
        const blob = await new Promise((resolve,reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (e) => {
            reject(new TypeError("Network request failed"));
            
          }
          xhr.responseType = 'blob';
          xhr.open('GET',uri,true);
          xhr.send(null);
        });
  
        const filename = image.substring(image.lastIndexOf('/')+1);
        const imageRef = ref(storage, `${user.uid}`);

        uploadBytes(imageRef, blob).then((snapshot) => {
          getUserPfp(user.uid);
        });
        // const ref = firebaseConfig.storage().ref.child(filename)
  
        // await ref.put(blob);
        setUploading(false);
        alert('Successful upload');
        setImage(null);
      }
      catch(error){
        console.error(error);
        setUploading(false);
      }
    }

    const getUserPfp = async (uid) => {
      getDownloadURL(ref(storage, `${uid}`))
      .then(async (url) => {
        const updateUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
            
        await updateDoc(updateUser, {
            profileUrl: url
        });
      })
      .catch((error) => {
        
      });
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
      getProfileImage();
    },[])

  return (
    <View style={styles.home}>
      <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
            {
                profilePic==""
                ?
                <Image source={pfp} style={{height: 60,width: 60,borderRadius: 50}}/>
                :
                <Image src={profilePic} style={{height: 60,width: 60,borderRadius: 50}}/>
            }
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
      <Pressable onPress={()=>{
        pickImage()
      }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: 100,borderColor: '#DDD',borderWidth: 2,alignSelf: 'center',padding: 10,borderRadius: 10}}>
        <Text>Select Image</Text>
      </Pressable>
      <Pressable onPress={()=>{
        uploadMedia()
      }}  style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: 100,borderColor: '#404040',borderWidth: 2,alignSelf: 'center',padding: 10,borderRadius: 10}}>
        <Text>Upload Image</Text>
      </Pressable>
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