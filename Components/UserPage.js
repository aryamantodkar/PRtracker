import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image,TouchableOpacity,SafeAreaView,Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { FIREBASE_AUTH, FIREBASE_DB, firebaseConfig } from '../FirebaseConfig';
import AppNavbar from './AppNavbar';
import { collection, getDocs,doc,updateDoc, getDoc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import { getStorage, ref,uploadBytes,getDownloadURL,deleteObject  } from "firebase/storage";

const settingsIcon = require("../assets/settings-icon.png");
const pfp = require("../assets/pfp.jpg");
const addPfp = require("../assets/add-image.png");
const crossIcon = require("../assets/cross-icon-black.png");
const addPfpBlack = require("../assets/add-image-black.png");
const deleteIcon = require("../assets/delete-icon.png");

const UserPage = () => {
    const [showNavbar,setShowNavbar] = useState(true);
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);

    const [image,setImage] = useState(null);
    const [uploading,setUploading] = useState(false);
    const [profilePic,setProfilePic] = useState("");
    const [enlargePfp,setEnlargePfp] = useState(false);
    const [deletePfp,setDeletePfp] = useState(false);

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
        setProfilePic(image);
        setImage(null);
      }
      catch(error){
        console.log(error);
        setUploading(false);
      }
    }

    const deleteMedia = async () => {
      const imageRef = ref(storage, `${user.uid}`);
      deleteObject(imageRef).then(() => {
        alert('Successful upload');
      }).catch((error) => {
        console.log(error);
      });
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

    const showPfp = () => {
      setEnlargePfp(true);
    }

    useEffect(() => {
      getFollowStats();
      getProfileImage();
    },[])

  return (
    <View style={styles.home}>
      {
        enlargePfp
        ?
        <View style={{height: '100%',width: '100%'}}>
          <Pressable onPress={()=>{
            setEnlargePfp(false);
          }}>
            <Image source={crossIcon} style={{position: 'absolute',right: 0,height: 30,width: 30,borderRadius: 250}}/>
          </Pressable>
          <View style={{position: 'absolute',left: 0,right: 0,top: 0,bottom: 0,margin:'auto',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
            {
                profilePic==""
                ?
                <View>
                  {
                    image!=null
                    ?
                    <Image src={image} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: 300,width: 300,borderRadius: 250}}/>
                    :
                    <Image source={pfp} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: 300,width: 300,borderRadius: 250}}/>
                  }
                  <View style={{display: 'flex',flexDirection: 'row',marginTop: 40,justifyContent: 'center'}}>
                    <Pressable onPress={()=>{
                      pickImage()
                    }} style={{backgroundColor: '#000',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                      <Image source={addPfp} style={{height: 30,width: 30}}/>
                    </Pressable>
                    {
                      image!=null || deletePfp
                      ?
                      <Pressable onPress={()=>{
                        if(deletePfp){
                          deleteMedia()
                        }
                        else{
                          uploadMedia()
                        }
                      }} style={{backgroundColor: '#000',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5}}>Upload Image</Text>
                      </Pressable>
                      :
                      <Pressable style={{backgroundColor: '#DDD',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5}}>Upload Image</Text>
                      </Pressable>
                    }
                  </View>
                </View>
                :
                <View>
                  {
                    image!=null
                    ?
                    <Image src={image} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: 300,width: 300,borderRadius: 250}}/>
                    :
                    <Image src={profilePic} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: 300,width: 300,borderRadius: 250}}/>
                  }
                  <View style={{display: 'flex',flexDirection: 'row',marginTop: 40,justifyContent: 'center'}}>
                    <Pressable onPress={()=>{
                      pickImage()
                    }} style={{backgroundColor: '#000',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                      <Image source={addPfp} style={{height: 30,width: 30}}/>
                    </Pressable>
                    <Pressable onPress={()=>{
                      setImage(null);
                      setProfilePic("");
                      setDeletePfp(true);
                    }} style={{backgroundColor: '#000',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                      <Image source={deleteIcon} style={{height: 25,width: 25}}/>
                    </Pressable>
                    {
                      image!=null || deletePfp
                      ?
                      <Pressable onPress={()=>{
                        if(deletePfp){
                          deleteMedia()
                        }
                        else{
                          uploadMedia()
                        }
                      }} style={{backgroundColor: '#000',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5}}>Upload Image</Text>
                      </Pressable>
                      :
                      <Pressable onPress={()=>{
                      }} style={{backgroundColor: '#DDD',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5}}>Upload Image</Text>
                      </Pressable>
                    }
                  </View>
                </View>
            }
          </View>

        </View>
        :
        <View style={{height: '100%',width: '100%'}}>
          <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                {
                    profilePic==""
                    ?
                    <Pressable onPress={()=>{
                      showPfp();
                    }} style={{position: 'relative'}}>
                      <Image source={pfp} style={{height: 60,width: 60,borderRadius: 50}}/>
                    </Pressable>
                    :
                    <Pressable onPress={()=>{
                      showPfp();
                    }} style={{position: 'relative'}}>
                      <Image src={profilePic} style={{height: 60,width: 60,borderRadius: 50}}/>
                    </Pressable>
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
          {/* <Pressable onPress={()=>{
            pickImage()
          }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: 100,borderColor: '#DDD',borderWidth: 2,alignSelf: 'center',padding: 10,borderRadius: 10}}>
            <Text>Select Image</Text>
          </Pressable> */}
          {/* <Pressable onPress={()=>{
            uploadMedia()
          }}  style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: 100,borderColor: '#404040',borderWidth: 2,alignSelf: 'center',padding: 10,borderRadius: 10}}>
            <Text>Upload Image</Text>
          </Pressable> */}
        </View>
      }
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