import { Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput } from 'react-native'
import React, {useEffect, useState,useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Workout from './Workout';
import AppNavbar from './AppNavbar';
import { getAuth } from "firebase/auth";
import { useNavigation,useIsFocused} from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { getStorage, ref,getDownloadURL  } from "firebase/storage";

export default function Home() {
  const [showNavbar,setShowNavbar] = useState(true);
  const [searchBar,setSearchBar] = useState(false);
  const [searchText,setSearchText] = useState("");
  const [searchParams,setSearchParams] = useState("");
  const [profilePic,setProfilePic] = useState("");
  const [hideUserNavbar,setHideUserNavbar] = useState(false);
  const [isLoading,setIsLoading] = useState(true);

  const navigation = useNavigation();
  
  const route = useRoute();
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
      // console.log("error",error)
      setProfilePic("");
    });
  }
  
  useEffect(()=>{
    getProfileImage();
  },[])

  useEffect(()=>{
    const timeout = setTimeout(() => {
        setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
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
                  !hideUserNavbar && !isLoading
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
                              <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                <FontAwesomeIcon icon="fa-solid fa-user" size={32} style={{color: '#fff'}}/>
                              </View>
                              :
                              <View>
                                <Image src={profilePic} style={{height: 50,width: 50,borderRadius: 50,}}/>
                              </View>
                            }
                          </View>
                          <View style={{marginLeft:10,display: 'flex',flexDirection: 'row',justifyContent: 'center'}}>
                            <View style={{display: 'flex',justifyContent: 'center'}}>
                              <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 20,color: '#869AAF',textAlignVertical: 'center',fontFamily: 'SignikaNegative'}]}>Hi, </Text>
                            </View>
                            {
                              user.displayName!=null
                              ?
                              <View style={{display: 'flex',justifyContent: 'center'}}>
                                <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 20,color: '#000',textAlignVertical: 'center',fontFamily: 'SignikaNegative'}]}>{user.displayName.split(" ")[0]} {user.displayName.split(" ").length>1 ? user.displayName.split(" ")[1][0] : null}.</Text>
                              </View>
                              :
                              null
                            }
                          </View>
                        </View>
                        <View style={{display: 'flex',flexDirection: 'row'}}>
                          <Pressable onPress={()=>{
                            setSearchBar(true);
                          }} style={styles.headingTitleContainer}>
                            {/* <Image source={searchIconBlack} style={{height: 25,width: 25,marginRight: 15,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/> */}
                            <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" size={20} style={{marginRight: 15}}/>
                          </Pressable>
                          <View style={{justifyContent: 'center', borderRadius: 50,backgroundColor: '#353F4E',alignSelf: 'center',padding: 7.5}}>
                            {/* <Image source={bellIcon} style={{height: 22,width: 22}}/> */}
                            <FontAwesomeIcon icon="fa-solid fa-bell" size={20} style={{color: '#fff'}}/>
                          </View>
                        </View>
                      </View>
                      :
                      <View style={{display: 'flex',flexDirection: 'row',width: '100%',flex: 1,justifyContent: 'space-between'}}>
                        <View style={{borderColor: '#455366',borderWidth: 1,display: 'flex',justifyContent: 'space-between',flexDirection: 'row',alignItems: 'center',flex: 0.9,backgroundColor: '#1e1e1e',padding: 5,paddingLeft: 15,paddingRight: 15,borderRadius: 15,elevation: 5,marginBottom: 0}}>
                          <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                            {/* <Image source={searchIcon} style={{height: 25,width: 25,display: 'flex',alignItems: 'center',marginRight: 5}}/> */}
                            <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" size={18} style={{marginRight: 10,color: '#fff',}}/>
                            <TextInput ref={inputRef} value={searchText} placeholderTextColor='#ddd' placeholder='Search Workouts or Users' onChangeText={(text)=>{
                                setSearchText(text);
                                setSearchParams(text);
                                inputRef.current.focus();
                            }} style={{height: 40,fontSize: 16,color: '#fff',fontWeight: '500',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}/>
                          </View>
                          {
                            searchParams!=""
                            ?
                            <Pressable onPress={()=>{
                              setSearchParams("");
                              setSearchText("");
                            }} style={{backgroundColor: '#3e3e3e',padding: 5,borderRadius: 10}}>
                              <Text style={{fontFamily: 'LeagueSpartan',color: '#fff'}}>Clear</Text>
                            </Pressable>
                            :
                            null
                          }
                        </View>
                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flex: 0.1,marginLeft:5}}>
                          <Pressable onPress={()=>{
                            setSearchBar(false);
                            setSearchParams("");
                            setSearchText("");
                          }} style={{backgroundColor: '#1e1e1e',padding: 7.5,borderRadius: 50}}>
                            <FontAwesomeIcon icon="fa-solid fa-xmark" size={20} style={{color: '#fff'}}/>
                          </Pressable>
                        </View>
                      </View> 
                    }
                  </View>
                  :
                  null
                }
                
                <Workout searchParams={searchParams} showNavbar={setShowNavbar} uid={null} hideUserNavbar={setHideUserNavbar} searchBar={searchBar} userProfile={false}/>
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