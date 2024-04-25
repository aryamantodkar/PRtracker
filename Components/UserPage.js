import { Pressable, StyleSheet, Text, View, Image,Alert, TextInput, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import AppNavbar from './AppNavbar';
import { doc,updateDoc, getDoc,getDocs, onSnapshot } from "firebase/firestore";
import { getAuth,updateProfile,updatePassword,reauthenticateWithCredential,EmailAuthProvider} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { getStorage, ref,uploadBytes,getDownloadURL,deleteObject  } from "firebase/storage";
import Workout from './Workout';

const UserPage = () => {
    const [showNavbar,setShowNavbar] = useState(true);
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);

    const [image,setImage] = useState(null);
    const [uploading,setUploading] = useState(false);
    const [profilePic,setProfilePic] = useState("");
    const [enlargePfp,setEnlargePfp] = useState(false);
    const [deletePfp,setDeletePfp] = useState(false);
    const [showSettings,setShowSettings] = useState(false);
    const [changeDetails,setChangeDetails] = useState("");
    const [newUsername,setNewUsername] = useState("");
    const [newPassword,setNewPassword] = useState("");
    const [reEnterPassword,setReEnterPassword] = useState("");
    const [oldPassword,setOldPassword] = useState("");
    const [newEmail,setNewEmail] = useState("");

    const [showPassword,setShowPassword] = useState(false);
    const [showRePassword,setShowRePassword] = useState(false);
    const [showOldPassword,setShowOldPassword] = useState(false);

    const storage = getStorage();
    const storageRef = ref(storage);
    
    const navigation = useNavigation();
    const auth = getAuth();
    const user = auth.currentUser;

    const route = useRoute();

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

    const handleLogout = () =>{
      FIREBASE_AUTH.signOut();
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
        alert('Updated profile picture successfully.');
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
      deleteObject(imageRef).then(async () => {
        alert('Deleted profile picture successfully.');

        const updateUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
        await updateDoc(updateUser, {
            profileUrl: ""
        });
        
      }).catch((error) => {
        console.log("error",error);
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
        setProfilePic("");
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

    // useEffect(() => {
    //     const focusHandler = navigation.addListener('focus', () => {
    //       getFollowStats();
    //       getProfileImage();
    //     });
    //     return focusHandler;

    // }, [navigation]);

    useEffect(()=>{
      const followingWorkoutsQuery = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
      const unsubscribeFollowingWorkouts = onSnapshot(followingWorkoutsQuery, (querySnapshot) => {
          getFollowStats();
          getProfileImage();
      });
    },[])

  return (
    <View style={{height: '100%',width: '100%',flex: 1}}>
      <ScrollView style={styles.home} contentContainerStyle={{display: 'flex',flexGrow: 1,justifyContent: 'center',alignItems: 'center'}}>
        {
          enlargePfp
          ?
          <View style={{height: '100%',width: '100%'}}>
            <Pressable onPress={()=>{
              setEnlargePfp(false);
            }}>
              <FontAwesomeIcon icon="fa-solid fa-xmark" size={30} style={{position: 'absolute',right: 0,top: 20,color: '#000'}}/>
            </Pressable>
            <View style={{position: 'absolute',top: 0,bottom: 0,left: 0,right: 0,margin:'auto',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
              {
                  profilePic==""
                  ?
                  <View>
                    {
                      image!=null
                      ?
                      <Image src={image} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: 300,width: 300,borderRadius: 250}}/>
                      :
                      <Pressable style={{padding: 40,borderRadius: 500,backgroundColor: '#ddd'}}>
                        <FontAwesomeIcon icon="fa-solid fa-user" size={200} style={{color: '#fff'}}/>
                      </Pressable>
                    }
                    <View style={{display: 'flex',flexDirection: 'row',marginTop: 40,justifyContent: 'center'}}>
                      <Pressable onPress={()=>{
                        pickImage()
                      }} style={{backgroundColor: '#1e1e1e',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <FontAwesomeIcon icon="fa-solid fa-image" size={25} style={{color: '#fff'}}/>
                      </Pressable>
                      {
                        image!=null
                        ?
                        <Pressable onPress={()=>{
                          uploadMedia()
                        }} style={image==null ? {backgroundColor: '#DDD',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5} : {backgroundColor: '#1e1e1e',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                          <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5,fontFamily: 'LeagueSpartan',fontSize: 18}}>Upload Image</Text>
                        </Pressable>
                        :
                        <Pressable style={{backgroundColor: '#DDD',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                          <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5,fontFamily: 'LeagueSpartan',fontSize: 18}}>Upload Image</Text>
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
                      }} style={{backgroundColor: '#1e1e1e',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <FontAwesomeIcon icon="fa-solid fa-image" size={25} style={{color: '#fff'}}/>
                      </Pressable>
                      <Pressable onPress={()=>{
                        deleteMedia()
                        setImage(null);
                        setProfilePic("");
                        setDeletePfp(true);
                      }} style={{backgroundColor: '#000',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                        <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#fff'}}/>
                      </Pressable>
                      {
                        image!=null
                        ?
                        <Pressable onPress={()=>{
                          uploadMedia()
                        }} style={{backgroundColor: '#1e1e1e',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                          <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5,fontFamily: 'LeagueSpartan',fontSize: 18}}>Upload Image</Text>
                        </Pressable>
                        :
                        <Pressable onPress={()=>{
                        }} style={{backgroundColor: '#DDD',height: 45,padding: 10,alignSelf: 'center',borderRadius: 10,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginLeft: 5,marginRight: 5}}>
                          <Text style={{color: 'white',textAlign: 'center',fontWeight: '500',marginLeft: 5,marginRight: 5,fontFamily: 'LeagueSpartan',fontSize: 18}}>Upload Image</Text>
                        </Pressable>
                      }
                    </View>
                  </View>
              }
            </View>
          </View>
          :
          <View style={{height: '100%',width: '100%'}}>
            {
              showSettings
              ?
              <View style={{marginTop: 10,display: 'flex',flexDirection: 'column'}}>
                  {
                    changeDetails==""
                    ?
                    <View style={{height: '100%',width: '100%'}}>
                      <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',marginTop: 20,marginBottom: 10}}>
                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                          <Text style={{fontSize: 22,fontFamily: 'LeagueSpartan-Medium',paddingBottom: 5,textAlign: 'center',textAlignVertical: 'center'}}>Settings</Text>
                        </View>
                        <Pressable onPress={()=>{
                          setShowSettings(false);
                        }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                          {/* <Image source={crossIcon} style={{height: 20,width: 20}}/> */}
                          <FontAwesomeIcon icon="fa-solid fa-xmark" size={30} style={{color: '#000'}}/>
                        </Pressable>
                      </View>
                      <Pressable onPress={()=>{
                        setChangeDetails("Username")
                      }} style={{display: 'flex',marginTop: 20,flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'left',backgroundColor: '#1e1e1e',padding: 15,marginBottom: 20,borderRadius: 10}}>
                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                          {/* <Image source={accountIcon} style={{height: 20,width: 20,marginRight: 10}}/> */}
                          <FontAwesomeIcon size={20} icon="fa-solid fa-user" style={{height: 20,width: 20,marginRight: 10,color: '#fff'}}/>
                        </View>
                        <Text style={{fontSize: 17,textAlignVertical: 'center',color: '#fff',fontFamily: 'LeagueSpartan',textAlign: 'center'}}>Change Username</Text>
                      </Pressable>
                      <Pressable onPress={()=>{
                        setChangeDetails("Password")
                      }} style={{display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'left',backgroundColor: '#1e1e1e',padding: 15,marginBottom: 20,borderRadius: 10}}>
                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                          {/* <Image source={lockIcon} style={{height: 20,width: 20,marginRight: 10}}/> */}
                          <FontAwesomeIcon icon="fa-solid fa-lock" size={20} style={{color: '#fff',marginRight: 10}}/>
                        </View>
                        <Text style={{fontSize: 17,textAlignVertical: 'center',color: '#fff',fontFamily: 'LeagueSpartan'}}>Change Password</Text>
                      </Pressable>
                    </View>
                    :
                    <View style={{height: '100%',width: '100%'}}>
                      {
                        changeDetails=="Username"
                        ?
                        <View style={{display: 'flex',flexDirection: 'column'}}>
                          <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                              <Pressable onPress={()=>{
                                setChangeDetails("");
                              }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                  {/* <Image source={backIcon} style={{height: 40,width: 40}}/> */}
                                  <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{marginRight: 10}}/>
                              </Pressable>
                              <View style={{borderBottomWidth:2,borderBottomColor: '#1e1e1e',paddingBottom: 5,alignSelf: 'flex-start'}}>
                                <Text style={{color:'#000',fontSize: 20,fontFamily: 'LeagueSpartan-Medium',textAlign: 'center',textAlignVertical: 'center'}}>Change Name</Text>
                              </View>
                          </View>
                          <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center',marginTop: 40}}>
                            <TextInput placeholder='Enter New Username' value={newUsername} onChangeText={(text)=>{
                              setNewUsername(text)
                            }} style={{width: '90%',paddingLeft: 10,height: 40,borderColor: '#ddd',borderWidth: 1,borderRadius: 5,backgroundColor: '#f6f6f7',fontFamily: 'LeagueSpartan',fontSize: 17}}/>
                            {
                              newUsername==""
                              ?
                              <Pressable style={{marginTop: 40,backgroundColor: '#DDD',padding: 10,paddingTop: 5,paddingLeft: 20,paddingRight: 20,borderRadius: 25}}>
                                <Text style={{fontSize: 18,fontFamily: 'LeagueSpartan',color: '#fff'}}>Update</Text>
                              </Pressable>
                              :
                              <Pressable onPress={()=>{
                                Alert.alert('Change Name?', 'Are you sure you want to change your name?', [
                                  {
                                    text: 'Cancel',
                                    onPress: () => {},
                                    style: 'cancel',
                                  },
                                  {text: 'OK', onPress: () => {
                                    updateProfile(auth.currentUser, {
                                      displayName: newUsername,
                                    }).then(() => {
                                      alert("Username updated successfully");
                                      setNewUsername("");
                                    }).catch((error) => {
                                      alert("Error updating username")
                                    });
                                  }},
                                ]);
                              }} style={{marginTop: 40,backgroundColor: '#1e1e1e',padding: 10,paddingTop: 5,paddingLeft: 20,paddingRight: 20,borderRadius: 25}}>
                                <Text style={{fontSize: 18,fontFamily: 'LeagueSpartan',color: '#fff'}}>Update</Text>
                              </Pressable>
                            }
                          </View>
                        </View>
                        :
                        <View style={{height: '100%',width: '100%'}}>
                          {
                            changeDetails=="Password"
                            ?
                            <View style={{display: 'flex',flexDirection: 'column'}}>
                              <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center'}}>
                                  <Pressable onPress={()=>{
                                    setChangeDetails("");
                                  }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                      {/* <Image source={backIcon} style={{height: 40,width: 40}}/> */}
                                      <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{marginRight: 10}}/>
                                  </Pressable>
                                  <View style={{borderBottomWidth:2,borderBottomColor: '#1e1e1e',paddingBottom: 5,alignSelf: 'flex-start'}}>
                                    <Text style={{color:'#000',fontSize: 20,fontFamily: 'LeagueSpartan-Medium',textAlign: 'center',textAlignVertical: 'center'}}>Change Password</Text>
                                  </View>
                              </View>
                              <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center',marginTop: 40}}>
                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative'}}>
                                  <TextInput secureTextEntry={showOldPassword ? false: true}  placeholder='Enter Current Password' value={oldPassword} onChangeText={(text)=>{
                                    setOldPassword(text)
                                  }} style={{width: '90%',paddingLeft: 10,height: 40,borderColor: '#ddd',borderWidth: 1,borderRadius: 5,backgroundColor: '#f6f6f7',fontFamily: 'LeagueSpartan',fontSize: 17}}/>
                                  <Pressable onPress={()=>{
                                    setShowOldPassword(!showOldPassword)
                                  }} style={{position: 'absolute',right: 10}}>
                                    {
                                      showOldPassword
                                      ?
                                      // <Image source={hideEyeIcon} style={{height: 20,width: 20}}/>
                                      <FontAwesomeIcon icon="fa-regular fa-eye-slash" size={20} style={{}}/>
                                      :
                                      // <Image source={eyeIcon} style={{height: 20,width: 20}}/>
                                      <FontAwesomeIcon icon="fa-regular fa-eye" size={20} />
                                    }
                                  </Pressable>
                                </View>
                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginTop: 20}}>
                                  <TextInput secureTextEntry={showPassword ? false: true}  placeholder='Enter New Password' value={newPassword} onChangeText={(text)=>{
                                    setNewPassword(text)
                                  }} style={{width: '90%',paddingLeft: 10,height: 40,borderColor: '#ddd',borderWidth: 1,borderRadius: 5,backgroundColor: '#f6f6f7',fontFamily: 'LeagueSpartan',fontSize: 17}}/>
                                  <Pressable onPress={()=>{
                                    setShowPassword(!showPassword)
                                  }} style={{position: 'absolute',right: 10}}>
                                    {
                                      showPassword
                                      ?
                                      // <Image source={hideEyeIcon} style={{height: 20,width: 20}}/>
                                      <FontAwesomeIcon icon="fa-regular fa-eye-slash" size={20} style={{}}/>
                                      :
                                      // <Image source={eyeIcon} style={{height: 20,width: 20}}/>
                                      <FontAwesomeIcon icon="fa-regular fa-eye" size={20} />
                                    }
                                  </Pressable>
                                </View>
                                <View style={{display: 'flex',marginTop: 20,flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative'}}>
                                  <TextInput secureTextEntry={showRePassword ? false: true} placeholder='Re-enter New Password' value={reEnterPassword} onChangeText={(text)=>{
                                    setReEnterPassword(text)
                                  }} style={{width: '90%',paddingLeft: 10,height: 40,borderColor: '#ddd',borderWidth: 1,borderRadius: 5,backgroundColor: '#f6f6f7',fontFamily: 'LeagueSpartan',fontSize: 17}}/>
                                  <Pressable onPress={()=>{
                                    setShowRePassword(!showRePassword)
                                  }} style={{position: 'absolute',right: 10}}>
                                    {
                                      showRePassword
                                      ?
                                      // <Image source={hideEyeIcon} style={{height: 20,width: 20}}/>
                                      <FontAwesomeIcon icon="fa-regular fa-eye-slash" size={20} style={{}}/>
                                      :
                                      // <Image source={eyeIcon} style={{height: 20,width: 20}}/>
                                      <FontAwesomeIcon icon="fa-regular fa-eye" size={20} />
                                    }
                                  </Pressable>
                                </View>

                                <View style={{marginTop: 10,width: '90%',display: 'flex',justifyContent: 'left',alignItems: 'left'}}>
                                  <Text style={{fontFamily: 'LeagueSpartan',color: '#404040'}}>Password should be atleast 6 characters.</Text>
                                </View>
                                {
                                  newPassword=="" || reEnterPassword==""
                                  ?
                                  <Pressable style={{marginTop: 40,backgroundColor: '#DDD',padding: 10,paddingTop: 5,paddingLeft: 20,paddingRight: 20,borderRadius: 25}}>
                                    <Text style={{fontSize: 18,fontFamily: 'LeagueSpartan',color: '#fff'}}>Update</Text>
                                  </Pressable>
                                  :
                                  <Pressable onPress={()=>{
                                    if(newPassword==reEnterPassword){
                                      Alert.alert('Change Password?', 'Are you sure you want to change your password?', [
                                        {
                                          text: 'Cancel',
                                          onPress: () => {},
                                          style: 'cancel',
                                        },
                                        {text: 'OK', onPress: () => {
                                          const credential = EmailAuthProvider.credential(
                                            auth.currentUser.email,
                                            oldPassword
                                          )
                                          reauthenticateWithCredential(user, credential).then(() => {
                                            updatePassword(auth.currentUser, newPassword)
                                            .then(() => {
                                              alert("Password updated successfully.");
                                              setNewPassword("");
                                              setReEnterPassword("");
                                              setOldPassword("");
                                            }).catch((error) => {
                                              alert("Error updating password.");
                                              console.log(error)
                                            });
                                          }).catch((error) => {
                                            // An error ocurred
                                            // ...
                                          });
                                          }},
                                      ]);
                                    }
                                    else{
                                      alert("Passwords do not match.");
                                    }
                                  }} style={{marginTop: 40,backgroundColor: '#1e1e1e',padding: 10,paddingTop: 5,paddingLeft: 20,paddingRight: 20,borderRadius: 25}}>
                                    <Text style={{fontSize: 18,fontFamily: 'LeagueSpartan',color: '#fff'}}>Update</Text>
                                  </Pressable>
                                }
                              </View>
                            </View>
                            :
                            null
                          }
                        </View>
                      }
                    </View>
                  }
              </View>
              :
              <View style={{height: '100%',width: '100%',paddingBottom: 110}}>
                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                  <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                      {
                          profilePic==""
                          ?
                          <Pressable onPress={()=>{
                            showPfp()
                          }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                            {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                            <FontAwesomeIcon icon="fa-solid fa-user" size={35} style={{color: '#fff'}}/>
                          </Pressable>
                          :
                          <Pressable onPress={()=>{
                            showPfp();
                          }} style={{position: 'relative'}}>
                            <Image src={profilePic} style={{height: 60,width: 60,borderRadius: 50,borderWidth: 2,borderColor: '#ddd'}}/>
                          </Pressable>
                      }
                      <View style={{display: 'flex',flexDirection: 'column',marginLeft: 15}}>
                          <Text style={{fontSize: 22,color: '#1e1e1e',fontFamily: 'LeagueSpartan-Medium'}}>{user.displayName}</Text>
                      </View>
                  </View>
                  <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                    {
                      !showSettings
                      ?
                      <Pressable onPress={()=>{
                        setShowSettings(true);
                      }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginRight:7.5}}>
                        {/* <Image source={settingsIcon} style={{height: 30,width: 30}}/> */}
                        <FontAwesomeIcon icon="fa-solid fa-gear" size={25}/>
                      </Pressable>
                      :
                      null
                    }
                    <Pressable onPress={()=>{
                      handleLogout();
                    }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginLeft:7.5}}>
                        {/* <Image source={logoutIcon} style={{height: 25,width: 25}}/> */}
                        <FontAwesomeIcon icon="fa-solid fa-arrow-right-from-bracket" size={25}/>
                    </Pressable>
                  </View>
                </View>
                <View style={{display: 'flex',flexDirection: 'row',marginTop: 20}}>
                    <Text style={{fontSize: 14.5,fontWeight: '400',color: '#696969',display: 'flex',flexDirection: 'row'}}>
                      <Pressable onPress={()=>{
                        navigation.navigate('ViewFollowers',{
                          followersTab: true
                        });
                      }} style={{display: 'flex',flexDirection: 'row'}}> 
                        <Text style={{color:'black',fontFamily: 'LeagueSpartan-Medium',fontSize: 16}}>{followersArray.length} </Text>
                        <Text style={{fontFamily: 'LeagueSpartan',fontSize: 16,color: '#1e1e1e'}}>Followers | </Text>
                      </Pressable>
                      <Pressable onPress={()=>{
                        navigation.navigate('ViewFollowers',{
                          followersTab: false,
                        });
                      }} style={{display: 'flex',flexDirection: 'row'}}>
                        <Text style={{color:'black',fontFamily: 'LeagueSpartan-Medium',fontSize: 16}}>{followingArray.length} </Text>
                        <Text style={{fontFamily: 'LeagueSpartan',fontSize: 16,color: '#1e1e1e'}}>Following</Text>
                      </Pressable>
                    </Text>
                </View>
                <View style={{width: '100%',borderBottomWidth: 1,borderBottomColor: '#EBEAEA',marginTop: 15}}></View>
                <Text style={{fontSize: 22,marginTop: 20,marginBottom: 10,fontFamily: 'LeagueSpartan-Medium',paddingBottom: 5}}>My Workouts</Text>
                <Workout searchParams={null} showNavbar={null} uid={user.uid} hideUserNavbar={null} searchBar={null} userProfile={true}/>
              </View>
            }
          </View>
        }
      </ScrollView>
      <AppNavbar showNavbar={showNavbar}/>
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
        paddingTop: 60,
        position: 'relative',
    }
})