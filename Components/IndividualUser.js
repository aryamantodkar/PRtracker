import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput,ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState,useRef } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavbar from './AppNavbar';
import { getAuth } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs,doc,updateDoc, getDoc } from "firebase/firestore";
import Workout from './Workout';

const pfp = require("../assets/pfp.jpg");
const settingsIcon = require("../assets/settings-icon.png");
const upArrowIcon = require("../assets/up-arrow-icon.png");
const downArrowIconWhite = require("../assets/down-arrow-icon-white.png");
const backIconBlack = require("../assets/back-arrow-icon.png");


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

    const { uid, name } = route.params;

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
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',position: 'relative'}}>
                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',marginLeft: -10}}>
                            <Pressable onPress={()=>{
                                navigation.goBack();
                            }} style={{margin: 0,padding: 0}}>
                                <Image source={backIconBlack} style={{height: 35,width: 35}}/>
                            </Pressable>
                            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                <Image source={pfp} style={{height: 55,width: 55,borderRadius: 50}}/>
                                <View style={{display: 'flex',flexDirection: 'column',marginLeft: 10}}>
                                    <Text style={{fontSize: 18,fontWeight: '600',color: '#404040'}}>{name}</Text>
                                    <Text style={{fontSize: 12,fontWeight: '400',color: '#696969'}}>Pune, Maharashtra</Text>
                                </View>
                            </View>
                        </View>
                        {
                            following
                            ?
                            <View>
                                {
                                    !tooltip
                                    ?
                                    <Pressable onPress={()=>{
                                        setTooltip(true);
                                    }} style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',alignItems: 'center',backgroundColor: 'black',height: 30,width: 90,paddingLeft:5,paddingRight: 5,borderRadius: 5}}>
                                        <Text style={{color: 'white',fontSize: 13,fontWeight: '600',textAlign:'center'}}>Following</Text>
                                        <Image source={downArrowIconWhite} style={{height: 18,width: 18,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                                    </Pressable>
                                    :
                                    <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'space-around',alignItems: 'center',height: 75,width: 90}}>
                                        <Pressable onPress={()=>{
                                            setTooltip(false);
                                        }} style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',alignItems: 'center',borderWidth: 1.5,borderColor: '#DDD',padding: 5,borderRadius: 5,width: 90}}>
                                            <Text style={{color: 'black',fontSize: 13,fontWeight: '600',textAlign:'center'}}>Following</Text>
                                            <Image source={upArrowIcon} style={{height: 18,width: 18,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                                        </Pressable>
                                        <Pressable onPress={()=>{
                                            removeFollower();
                                        }}>
                                            <Text style={{color: 'white',fontSize: 13,fontWeight: '600',textAlign:'center',backgroundColor: 'black',padding: 5,borderRadius: 5,width: 90}}>Unfollow</Text>
                                        </Pressable>
                                    </View>
                                }
                            </View>
                            :
                            <Pressable onPress={()=>{
                                followUser();
                            }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',backgroundColor: 'black',height: 30,paddingLeft: 10,paddingRight: 10,borderRadius: 5}}>
                                <Text style={{color: 'white',fontSize: 13,fontWeight: '600'}}>Follow</Text>
                            </Pressable>
                        }
                    </View>
                    <View style={{paddingLeft: 10,paddingRight: 10}}>
                        <View style={{display: 'flex',flexDirection: 'row',marginTop: 20}}>
                            <Text style={{fontSize: 14.5,fontWeight: '400',color: '#696969'}}><Text style={{fontWeight: '600',color: 'black'}}>{followersArray.length}</Text> Followers | <Text style={{fontWeight: '600',color: 'black'}}>{followingArray.length}</Text> Following</Text>
                        </View>
                        <View style={{width: '100%',borderBottomWidth: 1,borderBottomColor: '#EBEAEA',marginTop: 15}}></View>
                    </View>
                    <ScrollView style={{paddingTop: 20,paddingBottom: 30,width: '100%',paddingLeft: 10,paddingRight: 10}}>
                        <Text style={{fontSize: 20,fontWeight: '500',borderBottomWidth: 2,alignSelf: 'flex-start'}}>Workouts</Text>
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
        paddingTop: 50,
        position: 'relative',
    }
})