import { Button, Pressable, StyleSheet, Text, View,KeyboardAvoidingView, ScrollView, Image, TextInput,ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState,useRef,useMemo,memo,useCallback } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const [enlargePfp,setEnlargePfp] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;
    const navigation = useNavigation();
    const route = useRoute();

    const { uid, name, profileUrl} = route.params;

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

    if(enlargePfp){
        return(
            <View style={{height: '100%',width: '100%'}}>
                <Pressable onPress={()=>{
                    setEnlargePfp(false);
                }}>
                    <FontAwesomeIcon icon="fa-solid fa-xmark" size={30} style={{position: 'absolute',right: 30,top: 80,color: '#000'}}/>
                </Pressable>
                <View style={{position: 'absolute',top: 0,bottom: 0,left: 0,right: 0,margin:'auto',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                    {
                        profileUrl==""
                        ?
                        <View>
                            <FontAwesomeIcon icon="fa-solid fa-user" size={200} style={{color: '#fff'}}/>
                        </View>
                        :
                        <View style={{borderRadius: 50}}>
                            <Image src={profileUrl} style={{height: 300,width: 300,borderRadius: 250,}}/>
                        </View>
                    }
                    <Text style={{fontSize: 25,marginTop: 20,fontFamily: 'LeagueSpartan-Medium',color: '#1e1e1e'}}>{name}</Text>
                </View>
            </View>
        )
    }
    else{
        return(
            <View>
                {
                    !loading
                    ?
                    <ScrollView style={styles.home}>
                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',width: '100%',height: '100%',maxHeight: 150,marginTop: 50}}>
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',height: '100%'}}>
                                <Pressable onPress={()=>{
                                    navigation.goBack();
                                }} style={{margin: 0,padding: 0,display: 'flex'}}>
                                    <FontAwesomeIcon icon="fa-solid fa-chevron-left" size={25} style={{marginRight: 10}}/>
                                </Pressable>
                                <Pressable onPress={()=>{
                                    setEnlargePfp(true);
                                }}>
                                    {
                                        profileUrl==""
                                        ?
                                        <View style={{padding: 15,borderRadius: 50,backgroundColor: '#ddd'}}>
                                            <FontAwesomeIcon icon="fa-solid fa-user" size={70} style={{color: '#fff'}}/>
                                        </View>
                                        :
                                        <View style={{borderRadius: 50}}>
                                            <Image src={profileUrl} style={{height: 100,width: 100,borderRadius: 50,}}/>
                                        </View>
                                    }
                                </Pressable>
                            </View>
                            <View style={{width: '100%',height: '100%',flex: 1,alignItems: 'center',justifyContent: 'center'}}>
                                <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'space-around',height: '100%'}}>
                                    <View style={{display: 'flex'}}>
                                        <Text style={{fontSize: 22,color: '#000',fontFamily:'LeagueSpartan-Medium'}}>{name}</Text>
                                    </View>
                                    <View style={{}}>
                                        <View style={{display: 'flex',flexDirection: 'row',borderBottomWidth: 1,borderBottomColor: '#EBEAEA',paddingBottom: 10}}>
                                            <Text style={{fontSize: 17,color: '#696969',fontFamily: 'LeagueSpartan'}}><Text style={{color: 'black'}}>{followersArray.length}</Text> Followers | <Text style={{fontWeight: '600',color: 'black'}}>{followingArray.length}</Text> Following</Text>
                                        </View>
                                    </View>
                                    <View>
                                        {
                                            following
                                            ?
                                            <Pressable onPress={()=>{
                                                removeFollower();
                                            }}>
                                                <Text style={{color: '#949494',fontSize: 16,textAlign:'center',backgroundColor: '#E5E5E5',padding: 15,paddingTop: 7.5,paddingBottom: 7.5,borderRadius: 5,fontFamily: 'LeagueSpartan-Medium'}}>Unfollow</Text>
                                            </Pressable>
                                            :
                                            <Pressable onPress={()=>{
                                                followUser();
                                            }}>
                                                <Text style={{color: 'white',fontSize: 16,textAlign:'center',backgroundColor: '#343434',padding: 15,paddingTop: 7.5,paddingBottom: 7.5,borderRadius: 5,fontFamily: 'LeagueSpartan-Medium'}}>Follow</Text>
                                            </Pressable>
                                        }
                                    </View>
                                </View>
                            </View>
                        </View>
                        <ScrollView style={{paddingTop: 0,paddingBottom: 30,width: '100%',paddingLeft: 10,paddingRight: 10}}>
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
}

const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: 15,
        backgroundColor: '#F6F6F6',
        position: 'relative',
    }
})