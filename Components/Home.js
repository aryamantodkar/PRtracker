import { Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput } from 'react-native'
import React, {useEffect, useState,useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Workout from './Workout';
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
    <View style={{height: '100%',width: '100%',flex: 1}}>
        <ScrollView style={styles.home}>
            <ScrollView contentContainerStyle ={[styles.home,{padding: 30,paddingLeft: 25,paddingRight: 25,display:'flex',justifyContent: 'space-between',alignItems: 'center',height: '100%',flexDirection: 'column'}]}>
                {
                  !hideUserNavbar && !isLoading
                  ?
                  <View style={{width: '100%'}}>
                    {
                      !searchBar
                      ?
                      <View style={{display:'flex',flexDirection: 'row',marginTop: 10,justifyContent: 'space-between',width: '100%',marginBottom: 0}}>
                        <View style={{display:'flex',flexDirection: 'row'}}>
                          <View style={{marginLeft:0,display: 'flex',flexDirection: 'column',justifyContent: 'center'}}>
                            <View style={{display: 'flex',justifyContent: 'center'}}>
                              <Text style={[styles.headingTitle,{fontWeight: 500,fontSize: 30,color: '#8F8F8F',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}]}>Hello, </Text>
                            </View>
                            {
                              user.displayName!=null
                              ?
                              <View style={{display: 'flex',justifyContent: 'center'}}>
                                <Text style={[styles.headingTitle,{fontSize: 35,color: '#1e1e1e',textAlignVertical: 'center',fontFamily: 'LeagueSpartan-Bold'}]}>{user.displayName.split(" ")[0]} {user.displayName.split(" ").length>1 ? user.displayName.split(" ")[1][0] : null}.</Text>
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
                            <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" size={20} style={{marginRight: 15,color: '#1e1e1e'}}/>
                          </Pressable>
                          <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                            {
                              profilePic==""
                              ?
                              <Pressable onPress={()=>{
                                navigation.navigate('UserPage');
                              }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd',borderColor: '#ddd',borderWidth: 2,borderRadius: 50,}}>
                                <FontAwesomeIcon icon="fa-solid fa-user" size={32} style={{color: '#fff'}}/>
                              </Pressable>
                              :
                              <Pressable onPress={()=>{
                                navigation.navigate('UserPage');
                              }} style={{borderColor: '#ddd',borderWidth: 2,borderRadius: 50,}}>
                                <Image src={profilePic} style={{height: 50,width: 50,borderRadius: 50,}}/>
                              </Pressable>
                            }
                          </View>
                        </View>
                      </View>
                      :
                      <View style={{display: 'flex',flexDirection: 'row',width: '100%',flex: 1,justifyContent: 'space-between'}}>
                        <View style={{display: 'flex',justifyContent: 'space-between',flexDirection: 'row',alignItems: 'center',backgroundColor: '#fff',flex: 0.9,padding: 5,paddingLeft: 15,paddingRight: 15,borderRadius: 5,marginBottom: 0,paddingBottom: 0,paddingTop: 0}}>
                          <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                            <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" size={18} style={{marginRight: 10,color: '#343434',}}/>
                            <TextInput ref={inputRef} value={searchText} placeholderTextColor='#949494' placeholder='Search Workouts or Users' onChangeText={(text)=>{
                                setSearchText(text);
                                setSearchParams(text);
                                inputRef.current.focus();
                            }} 
                            style={{height: 50,fontSize: 16,color: '#343434',textAlignVertical: 'center',fontFamily: 'LeagueSpartan-Medium',flex: 1}}/>
                          </View>
                          {
                            searchParams!=""
                            ?
                            <Pressable onPress={()=>{
                              setSearchParams("");
                              setSearchText("");
                            }} style={{backgroundColor: '#F5F4F4',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,position: 'absolute',right: 10}}>
                              <Text style={{fontFamily: 'LeagueSpartan-Medium',color: '#949494'}}>Clear</Text>
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
                          }} style={{}}>
                            <FontAwesomeIcon icon="fa-solid fa-xmark" size={20} style={{color: '#343434'}}/>
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
        <Pressable onPress={()=>{
          navigation.navigate('NewWorkout');
        }} style={{position: 'absolute',bottom: 25,right: 25,borderRadius: 50,backgroundColor: '#1e1e1e',elevation: 10,height: 60,width: 60,display: 'flex',justifyContent: 'center',alignItems: 'center',borderWidth: 2,borderColor: '#F6F6F6'}}>
          <FontAwesomeIcon icon="fa-solid fa-plus" size={30} style={{color: '#fff'}}/>
        </Pressable>
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
    backgroundColor: '#F6F6F6',
    paddingTop: 30,
    paddingBottom: 100,
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
    color: '#E3E3E3',
    textAlign: 'left',
    textAlignVertical: 'center',
    fontWeight: 'bold',
  },
  logoutIcon: {
    height: 25,
    width: 25
  },
})