import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput,ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState,useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavbar from './AppNavbar';
import { getAuth } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs,doc,updateDoc, getDoc } from "firebase/firestore";
import Workout from './Workout';


export const IndividualUser = () => {
    const [following,setFollowing] = useState(false);
    const [tooltip,setTooltip] = useState(false);
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);
    const [loading,setLoading] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;
    const navigation = useNavigation();
    const route = useRoute();

    const { uid, name, profileUrl } = route.params;

    const followUser = async () => {
        setFollowing(true);

        const followingUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
        const docSnapFollowing = await getDoc(followingUser);

        if (docSnapFollowing.exists()) {
            const updateLoggedInUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
            
            await updateDoc(updateLoggedInUser, {
                following: [...docSnapFollowing.data().following,uid]
            });
        }

        const followerUser = doc(FIREBASE_DB, "Users", `${uid}`);
        const docSnapFollower = await getDoc(followerUser);
        
        if (docSnapFollower.exists()) {
            const updateProfileOpenUser = doc(FIREBASE_DB, "Users", `${uid}`);

            await updateDoc(updateProfileOpenUser, {
                followers: [...docSnapFollower.data().followers,user.uid]
            });
        }

        getFollowStats();
    }

    const getFollowStats = async () => {
        const docRef = doc(FIREBASE_DB, "Users", `${uid}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            setFollowingArray(docSnap.data().following);
            setFollowersArray(docSnap.data().followers);

            if(docSnap.data().followers.includes(user.uid)){
                setFollowing(true);
            }
        }

        setLoading(false);
    }

    const removeFollower = async () => {
        setFollowing(false);
        setTooltip(false);

        const followingUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
        const docSnapFollowing = await getDoc(followingUser);

        if (docSnapFollowing.exists()) {
            const updateLoggedInUser = doc(FIREBASE_DB, "Users", `${user.uid}`);

            var newArray = docSnapFollowing.data().following.filter(arr => arr!=uid);;

            await updateDoc(updateLoggedInUser, {
                following: newArray
            });
        }

        const followerUser = doc(FIREBASE_DB, "Users", `${uid}`);
        const docSnapFollower = await getDoc(followerUser);
        
        if (docSnapFollower.exists()) {
            const updateProfileOpenUser = doc(FIREBASE_DB, "Users", `${uid}`);

            let newArray = docSnapFollower.data().followers.filter(arr => arr!=user.uid);

            await updateDoc(updateProfileOpenUser, {
                followers: newArray
            });
        }

        getFollowStats();
    }

    useEffect(() => {
        getFollowStats();
    },[])

    return(
        <View>
            {
                !loading
                ?
                <ScrollView style={styles.home}>
                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-around',width: '100%',height: '100%',maxHeight: 150,marginTop: 50}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',height: '100%'}}>
                            <Pressable onPress={()=>{
                                navigation.goBack();
                            }} style={{margin: 0,padding: 0}}>
                                {/* <Image source={backIconBlack} style={{height: 35,width: 35}}/> */}
                                <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{marginRight: 10}}/>
                            </Pressable>
                            <View>
                                {
                                    profileUrl==""
                                    ?
                                    <Pressable onPress={()=>{

                                    }} style={{padding: 15,borderRadius: 50,backgroundColor: '#ddd'}}>
                                    {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                        <FontAwesomeIcon icon="fa-solid fa-user" size={70} style={{color: '#fff'}}/>
                                    </Pressable>
                                    :
                                    <Pressable onPress={()=>{

                                    }} style={{borderRadius: 50}}>
                                        <Image src={profileUrl} style={{height: 100,width: 100,borderRadius: 50,}}/>
                                    </Pressable>
                                }
                            </View>
                        </View>
                        <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'space-around',height: '100%'}}>
                            <View style={{display: 'flex'}}>
                                <Text style={{fontSize: 22,color: '#000',fontFamily:'LeagueSpartan-Medium'}}>{name}</Text>
                            </View>
                            <View style={{}}>
                                <View style={{display: 'flex',flexDirection: 'row',borderBottomWidth: 1,borderBottomColor: '#EBEAEA',paddingBottom: 10}}>
                                    <Text style={{fontSize: 17,fontWeight: '400',color: '#696969',fontFamily: 'LeagueSpartan'}}><Text style={{fontWeight: '600',color: 'black'}}>{followersArray.length}</Text> Followers | <Text style={{fontWeight: '600',color: 'black'}}>{followingArray.length}</Text> Following</Text>
                                </View>
                            </View>
                            <View>
                                {
                                    following
                                    ?
                                    <Pressable onPress={()=>{
                                        removeFollower();
                                    }}>
                                        <Text style={{color: 'white',fontSize: 16,textAlign:'center',backgroundColor: 'black',padding: 15,paddingTop: 7.5,paddingBottom: 7.5,borderRadius: 5,fontFamily: 'LeagueSpartan-Medium'}}>Unfollow</Text>
                                    </Pressable>
                                    :
                                    <Pressable onPress={()=>{
                                        followUser();
                                    }}>
                                        <Text style={{color: 'white',fontSize: 16,textAlign:'center',backgroundColor: '#2B8CFF',padding: 15,paddingTop: 7.5,paddingBottom: 7.5,borderRadius: 5,fontFamily: 'LeagueSpartan-Medium'}}>Follow</Text>
                                    </Pressable>
                                }
                            </View>
                        </View>
                        {/* <View style={{height: '100%',backgroundColor: 'red',display: 'flex',flexDirection: 'column',justifyContent: 'space-around'}}>
                            <Text>HELLO</Text>
                            <Text>Yo</Text>
                        </View> */}
                    </View>
                    <ScrollView style={{paddingTop: 20,paddingBottom: 30,width: '100%',paddingLeft: 10,paddingRight: 10}}>
                        <Text style={{fontSize: 20,fontFamily: 'LeagueSpartan-Medium',alignSelf: 'flex-start'}}>Workouts</Text>
                        <Workout uid={uid}/>
                    </ScrollView>
                </ScrollView>
                :
                <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '80%',backgroundColor: 'white',height: '100%',width: '100%'}}>
                    <ActivityIndicator size="large" color="black"/>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: 15,
        backgroundColor: '#fff',
        position: 'relative',
    }
})