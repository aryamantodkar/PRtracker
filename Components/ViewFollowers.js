import React, { useEffect, useState } from 'react'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withRepeat,
  } from 'react-native-reanimated';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export default function ViewFollowers() {
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);
    const [isLoading,setIsLoading] = useState(true);

    const navigation = useNavigation();
    const route = useRoute();

    const { followersTab } = route.params;
    const [tabBool,setTabBool] = useState(followersTab);

    const auth = getAuth();
    const user = auth.currentUser;
   
    const duration = 500;

    const defaultAnim = useSharedValue(120);
    const defaultColumn = useSharedValue(100);

    const animatedDefault = useAnimatedStyle(() => ({
        transform: [{ translateX: -(defaultAnim.value+10) }],
    }));

    const animatedColumn = useAnimatedStyle(() => ({
        transform: [{ translateX: -defaultColumn.value }],
    }));

    useEffect(() => {
        defaultAnim.value = withRepeat(
          withTiming(-defaultAnim.value, {
            duration,
          }),
          -1,
          false
        );
        defaultColumn.value = withRepeat(
            withTiming(-defaultColumn.value, {
              duration,
            }),
            -1,
            false
        );
    }, []);

    const getFollowers = async () => {
        try{
            const followersUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
            const docSnapfollowers = await getDoc(followersUser);

            if(docSnapfollowers.exists()){
                const newArray = [];

                docSnapfollowers.data().followers.forEach(async (user) => {
                    const userNameRef = doc(FIREBASE_DB, "Users", `${user}`);
                    const userNameRefSnap = await getDoc(userNameRef);

                    if(userNameRefSnap.exists()){
                        newArray.push({
                            uid: userNameRefSnap.data().uid,
                            name: userNameRefSnap.data().name,
                            profileUrl: userNameRefSnap.data().profileUrl
                        })
                    }
                })
                return newArray;
            }
        }
        catch(error){
            console.error("Error fetching my workouts: ", error);
            return [];
        }
    }

    const getFollowing = async () => {
        try{
            const followingUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
            const docSnapfollowing = await getDoc(followingUser);

            if(docSnapfollowing.exists()){
                const newArray = [];

                docSnapfollowing.data().following.forEach(async (user) => {
                    const userNameRef = doc(FIREBASE_DB, "Users", `${user}`);
                    const userNameRefSnap = await getDoc(userNameRef);

                    if(userNameRefSnap.exists()){
                        newArray.push({
                            uid: userNameRefSnap.data().uid,
                            name: userNameRefSnap.data().name,
                            profileUrl: userNameRefSnap.data().profileUrl
                        })
                    }
                })
                return newArray;
            }
        }
        catch(error){
            console.error("Error fetching my workouts: ", error);
            return [];
        }
    }

    const unfollowUser = async (uid) => {
        const followingUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
        const docSnapFollowing = await getDoc(followingUser);

        if (docSnapFollowing.exists()) {
            var newArray = docSnapFollowing.data().following.filter(arr => arr!=uid);

            const tempArray = await Promise.all(newArray.map(async (userId) => {
                const userNameRef = doc(FIREBASE_DB, "Users", `${userId}`);
                const userNameRefSnap = await getDoc(userNameRef);
    
                if (userNameRefSnap.exists()) {
                    return {
                        uid: userNameRefSnap.data().uid,
                        name: userNameRefSnap.data().name,
                        profileUrl: userNameRefSnap.data().profileUrl
                    };
                }
            }));

            await updateDoc(followingUser, {
                following: newArray
            });

            setFollowingArray(tempArray);
        }
    }

    const followBackUser = async (uid) => {
        const followUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
        const docSnapfollow = await getDoc(followUser);

        if (docSnapfollow.exists()) {
            var newArray = [...docSnapfollow.data().following,uid]
            
            const tempArray = await Promise.all(newArray.map(async (userId) => {
                const userNameRef = doc(FIREBASE_DB, "Users", `${userId}`);
                const userNameRefSnap = await getDoc(userNameRef);
    
                if (userNameRefSnap.exists()) {
                    return {
                        uid: userNameRefSnap.data().uid,
                        name: userNameRefSnap.data().name,
                        profileUrl: userNameRefSnap.data().profileUrl
                    };
                }
            }));

            await updateDoc(followUser, {
                following: newArray
            });

            setFollowingArray(tempArray);
        }
    }

    const removeFollower = async (uid) => {
        const followUser = doc(FIREBASE_DB, "Users", `${user.uid}`);
        const docSnapfollow = await getDoc(followUser);

        if (docSnapfollow.exists()) {
            var newArray = docSnapfollow.data().followers.filter(arr => arr!=uid);

            const tempArray = await Promise.all(newArray.map(async (userId) => {
                const userNameRef = doc(FIREBASE_DB, "Users", `${userId}`);
                const userNameRefSnap = await getDoc(userNameRef);
    
                if (userNameRefSnap.exists()) {
                    return {
                        uid: userNameRefSnap.data().uid,
                        name: userNameRefSnap.data().name,
                        profileUrl: userNameRefSnap.data().profileUrl
                    };
                }
            }));

            await updateDoc(followUser, {
                followers: newArray
            });

            setFollowersArray(tempArray);
        }
    }

    useEffect(()=>{
        const fetchData = async () => {
            const following = await getFollowing();
            const followers = await getFollowers();
    
            setFollowingArray(following);
            setFollowersArray(followers);
        }

        fetchData();
    },[])

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    
        return () => clearTimeout(timeout);
    }, []);

    if(isLoading){
        // return(
        //     <View style={{height: '100%',minWidth:'100%',display: 'flex',justifyContent: 'center',alignItems: 'center',minHeight: 500,backgroundColor: '#fff'}}>
        //         <View style={{padding: 20,minWidth:'90%',borderRadius: 10}}>
        //             <View style={{backgroundColor: '#f5f4f4',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',}}>
        //                 <Animated.View style={[styles.box, animatedDefault,{minWidth:40}]}/>
        //             </View>
        //             <View style={{padding: 10,backgroundColor: '#f5f4f4',borderRadius: 10,height: 200,marginTop: 20,display: 'flex',flexDirection: 'column',justifyContent: 'space-around',alignItems: 'center',}}>
        //                 <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
        //                     <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
        //                 </View>
        //                 <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
        //                     <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
        //                 </View>
        //                 <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
        //                     <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
        //                 </View>
        //             </View>
        //         </View>
        //         <View style={{padding: 20,minWidth:'90%',borderRadius: 10}}>
        //             <View style={{backgroundColor: '#f5f4f4',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',}}>
        //                 <Animated.View style={[styles.box, animatedDefault,{minWidth:40}]}/>
        //             </View>
        //             <View style={{padding: 10,backgroundColor: '#f5f4f4',borderRadius: 10,height: 200,marginTop: 20,display: 'flex',flexDirection: 'column',justifyContent: 'space-around',alignItems: 'center',}}>
        //                 <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
        //                     <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
        //                 </View>
        //                 <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
        //                     <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
        //                 </View>
        //                 <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
        //                     <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
        //                 </View>
        //             </View>
        //         </View>
        //     </View>
        // )
        return(
            <View style={{height: '100%',minWidth: '100%',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        )
    }
    else{
        return (
            <View style={styles.home}>
                {
                    tabBool
                    ?
                    <View style={{display: 'flex',flexDirection: 'column',paddingTop: 10}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 10,marginTop: 10,alignItems: 'center'}}>
                            <Pressable onPress={()=>{
                                navigation.goBack();
                            }} style={{position: 'absolute',left: 10}}>
                                <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{}}/>
                            </Pressable>
                            <Pressable style={{display: 'flex',flexDirection: 'row',borderBottomWidth: 2,borderBottomColor: '#343434',paddingBottom: 10,marginLeft: 20}}>
                                <Text style={{color: '#000',fontSize: 20,fontFamily: 'LeagueSpartan-SemiBold',marginRight: 10}}>{followersArray.length}</Text>
                                <View style={{}}>
                                    <Text style={{color: '#343434',fontSize: 20,fontFamily: 'LeagueSpartan'}}>Followers</Text>
                                </View>
                            </Pressable>
                            <Pressable onPress={()=>{
                                setTabBool(false);
                            }} style={{display: 'flex',flexDirection: 'row'}}>
                                <Text style={{color: '#696969',fontSize: 20,fontFamily: 'LeagueSpartan-Medium',marginRight: 10}}>{followingArray.length}</Text>
                                <View style={{paddingBottom: 10,}}>
                                    <Text style={{color: '#696969',fontSize: 20,fontFamily: 'LeagueSpartan'}}>Following</Text>
                                </View>
                            </Pressable>
                        </View>
                        <View style={{height: '90%',display: 'flex',justifyContent: 'center'}}>
                            {
                                followersArray.length>0
                                ?
                                <View style={{display: 'flex',flexDirection: 'column',width: '100%',height: '100%',marginTop: 20}}>
                                    {
                                        followersArray.map(user => {
                                            return(
                                                <Pressable onPress={()=>{
                                                    navigation.navigate('IndividualUser',{
                                                        uid: user.uid,
                                                        name: user.name,
                                                    })
                                                }} key={user.uid} style={{width: '100%',display: 'flex',padding: 12.5,flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',paddingLeft: 20,backgroundColor: '#fff',borderRadius: 5,marginTop: 10,marginBottom: 10,borderWidth: 1,borderColor: '#f1f1f1'}}>
                                                    <View style={{display:'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                        {
                                                            user.profileUrl=="" || user.profileUrl==undefined
                                                            ?
                                                            <Pressable onPress={()=>{

                                                            }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                              <FontAwesomeIcon icon="fa-solid fa-user" size={35} style={{color: '#fff'}}/>
                                                            </Pressable>
                                                            :
                                                            <Image src={user.profileUrl} style={{height: 45,width: 45,borderRadius: 50,borderColor: '#DDD',borderWidth: 2}}/>
                                                        }
                                                        <View style={{marginLeft: 10,display: 'flex',flexDirection: 'column'}}>
                                                            <Text style={{color: '#343434',fontSize: 18,fontWeight: '500',fontFamily: 'LeagueSpartan-Medium'}}>{user.name}</Text>
                                                        </View>
                                                    </View>
                                                    {
                                                        !followingArray.some(e => e.uid == `${user.uid}`)
                                                        ?
                                                        <View style={{display: 'flex',flexDirection: 'row'}}>
                                                            <Pressable onPress={()=>{
                                                                followBackUser(user.uid)
                                                            }} style={{marginRight: 5,padding: 5,paddingLeft: 12.5,paddingRight: 12.5,borderRadius: 5,backgroundColor: '#343434'}}>
                                                                <Text style={{color: '#fff',fontFamily: 'LeagueSpartan',fontSize: 16}}>Follow</Text>
                                                            </Pressable>
                                                            <Pressable onPress={()=>{
                                                                removeFollower(user.uid);
                                                            }} style={{padding: 5,paddingLeft: 7.5,paddingRight: 7.5,borderRadius: 50,backgroundColor: '#f5f4f4',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                <FontAwesomeIcon icon="fa-solid fa-xmark" size={20} style={{color: '#747474'}}/>
                                                            </Pressable>
                                                        </View>
                                                        :
                                                        <View style={{display: 'flex',flexDirection: 'row'}}>
                                                            <Pressable onPress={()=>{
                                                                unfollowUser(user.uid)
                                                            }} style={{marginRight: 5,padding: 5,paddingLeft: 12.5,paddingRight: 12.5,borderRadius: 5,backgroundColor: '#f5f4f4'}}>
                                                                <Text style={{color: '#747474',fontFamily: 'LeagueSpartan',fontSize: 16}}>Unfollow</Text>
                                                            </Pressable>
                                                            <Pressable onPress={()=>{
                                                                removeFollower(user.uid);
                                                            }} style={{padding: 5,paddingLeft: 7.5,paddingRight: 7.5,borderRadius: 50,backgroundColor: '#f5f4f4',display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                <FontAwesomeIcon icon="fa-solid fa-xmark" size={20} style={{color: '#747474'}}/>
                                                            </Pressable>
                                                        </View>
                                                    }
                                                </Pressable>
                                            )
                                        })
                                    }
                                </View>
                                :
                                <View style={{backgroundColor: '#fff',height: 150,padding: 20,width: '90%',display: 'flex',justifyContent: 'space-around',alignItems: 'center',borderRadius: 5,marginLeft: 'auto',marginRight: 'auto',borderWidth: 1,borderColor: '#f1f1f1'}}>
                                    <View>
                                        <Text style={{color: '#343434',borderBottomColor: '#f1f1f1',borderBottomWidth: 2,paddingBottom: 5,fontFamily: 'LeagueSpartan-Medium',fontSize: 18}}>No Users Found</Text>
                                    </View>
                                    <View>
                                        <Text style={{color: '#949494',fontFamily: 'LeagueSpartan',fontSize: 18}}>You don't have any followers yet :(</Text>
                                    </View>
                                </View>
                            }
                        </View>
                    </View>
                    :
                    <View style={{display: 'flex',flexDirection: 'column',paddingTop: 10}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 10,marginTop: 10,alignItems: 'center'}}>
                            <Pressable onPress={()=>{
                                navigation.goBack();
                            }} style={{position: 'absolute',left: 10}}>
                                <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{}}/>
                            </Pressable>
                            <Pressable onPress={()=>{
                                setTabBool(true);
                            }} style={{display: 'flex',flexDirection: 'row',marginLeft: 20}}>
                                <Text style={{color: '#696969',fontSize: 20,fontFamily: 'LeagueSpartan-SemiBold',marginRight: 10}}>{followersArray.length}</Text>
                                <View style={{paddingBottom: 10,}}>
                                    <Text style={{color: '#696969',fontSize: 20,fontFamily: 'LeagueSpartan'}}>Followers</Text>
                                </View>
                            </Pressable>
                            <Pressable style={{display: 'flex',flexDirection: 'row',borderBottomWidth: 2,borderBottomColor: '#343434',paddingBottom: 10,}}>
                                <Text style={{color: '#000',fontSize: 20,fontFamily: 'LeagueSpartan-SemiBold',marginRight: 10}}>{followingArray.length}</Text>
                                <View style={{}}>
                                    <Text style={{color: '#343434',fontSize: 20,fontFamily: 'LeagueSpartan'}}>Following</Text>
                                </View>
                            </Pressable>
                        </View>
                        <View style={{height: '80%',display: 'flex',justifyContent: 'center'}}>
                            {
                                followingArray.length>0
                                ?
                                <View style={{display: 'flex',flexDirection: 'column',width: '100%',height: '100%',marginTop: 20}}>
                                    {
                                        followingArray.map(user => {
                                            return(
                                                <Pressable onPress={()=>{
                                                    navigation.navigate('IndividualUser',{
                                                        uid: user.uid,
                                                        name: user.name,
                                                    })
                                                }} key={user.uid} style={{width: '100%',display: 'flex',padding: 12.5,flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',paddingLeft: 20,backgroundColor: '#fff',borderRadius: 5,marginTop: 10,marginBottom: 10}}>
                                                    <View style={{display:'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                        {
                                                            user.profileUrl=="" || user.profileUrl==undefined
                                                            ?
                                                            <Pressable onPress={()=>{

                                                            }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                              <FontAwesomeIcon icon="fa-solid fa-user" size={35} style={{color: '#fff'}}/>
                                                            </Pressable>
                                                            :
                                                            <Image src={user.profileUrl} style={{height: 45,width: 45,borderRadius: 50,borderColor: '#DDD',borderWidth: 2}}/>
                                                        }
                                                        <View style={{marginLeft: 10,display: 'flex',flexDirection: 'column'}}>
                                                            <Text style={{color: '#343434',fontSize: 18,fontWeight: '500',fontFamily: 'LeagueSpartan-Medium'}}>{user.name}</Text>
                                                        </View>
                                                    </View>
                                                    <Pressable onPress={()=>{
                                                        unfollowUser(user.uid);
                                                    }} style={{marginRight: 5,padding: 5,paddingLeft: 12.5,paddingRight: 12.5,borderRadius: 5,backgroundColor: '#f5f4f4'}}>
                                                        <Text style={{color: '#747474',fontFamily: 'LeagueSpartan',fontSize: 16}}>Unfollow</Text>
                                                    </Pressable>
                                                </Pressable>
                                            )
                                        })
                                    }
                                </View>
                                :
                                <View style={{backgroundColor: '#fff',height: 150,padding: 20,width: '90%',display: 'flex',justifyContent: 'space-around',alignItems: 'center',borderRadius: 10,marginLeft: 'auto',marginRight: 'auto',borderWidth: 1,borderColor: '#f1f1f1'}}>
                                    <View>
                                        <Text style={{color: '#343434',borderBottomColor: '#f1f1f1',borderBottomWidth: 2,paddingBottom: 5,fontFamily: 'LeagueSpartan-Medium',fontSize: 18}}>No Users Found</Text>
                                    </View>
                                    <View>
                                        <Text style={{color: '#949494',fontFamily: 'LeagueSpartan',fontSize: 18}}>You don't follow anyone yet :(</Text>
                                    </View>
                                </View>
                            }
                        </View>
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
        backgroundColor: '#f6f6f6',
        paddingTop: 50,
        position: 'relative'
    },
    box: {
        height: 40,
        width: 15,
        backgroundColor: '#F7F6F6'
    }
})