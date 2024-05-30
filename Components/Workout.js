import React, { useEffect, useState,memo,useMemo,useCallback } from 'react'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withRepeat,
  } from 'react-native-reanimated';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeart } from '@fortawesome/free-regular-svg-icons'
import { debounce } from 'lodash';
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator, ViewBase } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc,updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import IndividualWorkout from './IndividualWorkout';
import { getStorage, ref,uploadBytes,getDownloadURL } from "firebase/storage";
import { useFonts } from 'expo-font';
import { v4 as uuidv4 } from 'uuid';

const Workout = ({showNavbar,searchParams,uid,hideUserNavbar,searchBar,userProfile}) => {
    const [showWorkoutBox,setShowWorkoutBox] = useState(false);
    const [clickedWorkoutID,setClickedWorkoutID] = useState();
    const [isLoading,setIsLoading] = useState(false);
    
    const [followingUserArray,setFollowingUserArray] = useState([]);
    const [allUsers,setAllUsers] = useState([]);
    const [searchUsers,setSearchUsers] = useState([]);

    const [newUid,setNewUid] = useState('');
    const [newUidBool,setNewUidBool] = useState(false);
    const [showLikesBool,setShowLikesBool] = useState(false);
    const [likedUsers,setLikedUsers] = useState([]);
    const storage = getStorage();

    const [fontsLoaded, fontError] = useFonts({
        'JosefinSans': require('../assets/fonts/JosefinSans-Regular.ttf'),
        'JosefinSans-Bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
        'SignikaNegative': require('../assets/fonts/SignikaNegative-Medium.ttf'),
        'LeagueSpartan': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
        'LeagueSpartan-Medium': require('../assets/fonts/LeagueSpartan-Medium.ttf'),
        'LeagueSpartan-SemiBold': require('../assets/fonts/LeagueSpartan-SemiBold.ttf'),
        'LeagueSpartan-Bold': require('../assets/fonts/LeagueSpartan-Bold.ttf'),
        'Inter': require('../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
        'Futura-Condensed': require('../assets/fonts/Futura_Condensed_Extra_Bold.otf'),
    });

    const months = new Map;
    const dateSuffix = new Map;
    const dateGroup = new Map;
    const followingDateGroup = new Map;
    const UserGroup = new Map;

    months.set('01','January');
    months.set('02','February');
    months.set('03','March');
    months.set('04','April');
    months.set('05','May');
    months.set('06','June');
    months.set('07','July');
    months.set('08','August');
    months.set('09','September');
    months.set('10','October');
    months.set('11','November');
    months.set('12','December');

    dateSuffix.set('01','st');
    dateSuffix.set('02','nd');
    dateSuffix.set('03','rd');

    const navigation = useNavigation();
    const auth = getAuth();
    const route = useRoute();
    var userID = auth.currentUser.uid;

    const getMyWorkouts = async () => {
        try {
            const q = query(collection(FIREBASE_DB, `${userID}`));
            const querySnapshot = await getDocs(q);
    
            let newAllUsers = await getAllUsers();

            let loggedUser = newAllUsers.length>0 ? newAllUsers.find(user => user.uid==userID) : "";
            let loggedUserName = "";
            let loggedProfileUrl = "";

            if(loggedUser!="" && loggedUser!=undefined){
                loggedProfileUrl = loggedUser.profileUrl
                loggedUserName = loggedUser.name
            }

            const newArray = [];
            querySnapshot.forEach(doc => {
                newArray.push({
                    timeStamp: doc.data().timeStamp,
                    workout: doc.data(),
                    uid: userID,
                    name: loggedUserName,
                    likes: doc.data().likes,
                    comments: doc.data().comments,
                    profileUrl: loggedProfileUrl
                });
            });
    
            return newArray;
        } catch (error) {
            console.error("Error fetching my workouts: ", error);
            return [];
        }
    };
    
    const getFollowingWorkouts = async () => {
        try {
            const docRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
            const docSnap = await getDoc(docRef);

            const getUsers = await getAllUsers();
            let followingArray = getUsers.length>0 ? getUsers.find(user => user.uid==auth.currentUser.uid) : "";

            if(followingArray!="" && followingArray!=undefined){
                followingArray = followingArray.followingArr
            }
    
            const followingPromises = followingArray.map(async following => {
                const q = query(collection(FIREBASE_DB, `${following}`));

                let follUser = getUsers.length>0 ? getUsers.find(user => user.uid==following) : "";

                let name = follUser.name;
                let profileUrl = follUser.profileUrl;

                const querySnapshot = await getDocs(q);
                const workouts = [];
                querySnapshot.forEach(doc => {
                    workouts.push({
                        timeStamp: doc.data().timeStamp,
                        workout: doc.data(),
                        uid: following,
                        name: name,
                        likes: doc.data().likes,
                        comments: doc.data().comments,
                        profileUrl: profileUrl
                    });
                });
                return workouts;
            });

            return Promise.all(followingPromises);
        } catch (error) {
            console.error("Error fetching following workouts: ", error);
            return [];
        }
    };

    const searchWorkouts = async () => {
        try{
            setIsLoading(true);

            const q = query(collection(FIREBASE_DB, `${userID}`));
            
            let newAllUsers = await getAllUsers();

            let loggedUser = newAllUsers.length>0 ? newAllUsers.find(user => user.uid==userID) : "";
            let loggedUserName = "";
            let loggedProfileUrl = "";

            if(loggedUser!="" && loggedUser!=undefined){
                loggedProfileUrl = loggedUser.profileUrl
                loggedUserName = loggedUser.name
            }

            const allWorkouts = [];
        
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                allWorkouts.push({
                    timeStamp: doc.data().timeStamp,
                    workout: doc.data(),
                    uid: userID,
                    name: loggedUserName,
                    likes: doc.data().likes,
                    comments: doc.data().comments,
                    profileUrl: loggedProfileUrl
                });
            });
        
            const followingArray = loggedUser!=undefined && loggedUser!="" ? loggedUser.followingArr : [];
        
            await Promise.all(followingArray.map(async (following) => {
                const q = query(collection(FIREBASE_DB, `${following}`));

                let follUser = newAllUsers.length>0 ? newAllUsers.find(user => user.uid==following) : "";

                let name = follUser.name;
                let profileUrl = follUser.profileUrl;
    
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    allWorkouts.push({
                        timeStamp: doc.data().timeStamp,
                        workout: doc.data(),
                        uid: following,
                        name: name,
                        likes: doc.data().likes,
                        comments: doc.data().comments,
                        profileUrl: profileUrl
                    });
                });
            }));
    
            allWorkouts.sort((x, y) => y.timeStamp.toMillis() - x.timeStamp.toMillis());
    
            let updatedArray = allWorkouts;
    
            if (searchParams !== "" && searchParams!=undefined) {
                const filterBySearch = allWorkouts.filter((item) => {
                    let search = false;
                    
                    if(item.workout.workoutName!=undefined && item.name!=undefined){
                        item.workout.allWorkouts.map(workout => {
                            if (workout.exerciseName!=undefined && workout.exerciseName.toLowerCase().includes(searchParams.toLowerCase())) {
                                search = true;
                            }
                        });
                        if (item.workout.workoutName.toLowerCase().includes(searchParams.toLowerCase()) || item.name.toLowerCase().includes(searchParams.toLowerCase()) || search) {
                            return item;
                        }
                    }
                });

                const filterUsersBySearch = newAllUsers.filter((item) => {
                    if (item.name.toLowerCase().includes(searchParams.toLowerCase())) {
                        return item;
                    }
                });
    
                updatedArray = filterBySearch;
                newAllUsers = filterUsersBySearch;
            }

            setFollowingUserArray(updatedArray);
            setSearchUsers(newAllUsers);
        }
        catch(error){
            console.log("Error in search workouts",error)
        }
    };

    const getAllUsers = async () => {
        try{
            const q = query(collection(FIREBASE_DB, `Users`));
            const querySnapshot = await getDocs(q);

            const following = doc(FIREBASE_DB, "Users", `${userID}`);
            const followingSnapshot = await getDoc(following);

            var followingArr = []
            if (followingSnapshot.exists()) {
                followingArr = followingSnapshot.data().following
            }

            const newArray = [];
            
            querySnapshot.forEach(doc => {
                newArray.push({
                    uid: doc.data().uid,
                    name: doc.data().name,
                    profileUrl: doc.data().profileUrl,
                    following: followingArr.includes(doc.data().uid) ? true : false,
                    followingArr: followingArr
                })
            });

            return newArray;
        }
        catch(error){
            console.error("Error fetching users: ", error);
            return [];
        }
    }

    const openWorkoutBox = (workout,tempUid = null) => {
        if(uid==null){
            if(showNavbar!=null){
                showNavbar(false);
            }
        }

        if(tempUid!=null){
            setNewUidBool(true);
            setNewUid(tempUid)
        }

        setClickedWorkoutID(workout.id);
        setShowWorkoutBox(true);
        if(hideUserNavbar!=null){
            hideUserNavbar(true);
        }
    }

    const groupByUser = (workout,profileUid) => {
        let totalSets = 0;
        let totalVol = "0";
        let totalReps = "0";

        followingDateGroup.set(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`,'1')

        UserGroup.set(`${workout.name}`,'1')
        return(
            <View style={{display: 'flex',justifyContent: 'space-between',flexDirection: 'column',backgroundColor: '#FFFFFF',padding: 15,paddingLeft: 20,paddingRight: 20,borderWidth: 2,borderColor: '#F1F1F1'}}>
                <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center',flexDirection: 'row',marginBottom: 15}}>
                    <Pressable onPress={()=>{
                        if(profileUid!=auth.currentUser.uid){
                            navigation.navigate('IndividualUser',{
                                uid: profileUid,
                                name: workout.name,
                                profileUrl: workout.profileUrl!=undefined ? workout.profileUrl : ""
                            })
                        }
                        else{
                            navigation.navigate('UserPage')
                        }
                        }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                {
                                    workout.profileUrl=="" || workout.profileUrl==undefined
                                    ?
                                    <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd',borderWidth: 1.5,borderColor: '#DDD'}}>
                                      <FontAwesomeIcon icon="fa-solid fa-user" size={30} style={{color: '#fff'}}/>
                                    </View>
                                    :
                                    <Image src={workout.profileUrl} style={{height: 50,width: 50,borderRadius: 50,borderWidth: 1.5,borderColor: '#DDD'}}/>
                                }
                            </View>
                            <View style={{display: 'flex',flexDirection: 'column'}}>
                                <Text style={{color: '#1e1e1e',fontSize: 18,marginLeft: 10,fontFamily: 'LeagueSpartan-Medium'}}>{workout.name}</Text>
                                <Pressable onPress={()=>{
                                    openWorkoutBox(workout.workout,workout.uid);
                                }} style={{display: 'flex',flexDirection: 'row',marginLeft: 10,alignItems: 'center'}}>
                                {
                                    workout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                    ?
                                    <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toISOString().slice(8,10)}{dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)} at {workout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                    :
                                    <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toISOString().slice(8,10)}{dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)} at {workout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                }       
                                </Pressable>
                            </View>
                    </Pressable>
                </View>
                <Pressable onPress={() => {
                        openWorkoutBox(workout.workout,workout.uid);
                    }} style={{display: 'flex',flexDirection: 'column',justifyContent: 'space-between',alignItems: 'flex-start',marginBottom: 10,marginLeft: 5}}>
                    <View style={{display:'flex',alignItems: 'center',justifyContent: 'center',marginTop: 20}}>
                        <Text style={styles.workoutTitle}>{workout.workout.workoutName}</Text>
                    </View>
                    
                    <View style={{marginTop: 15,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',marginLeft: 5}}>
                        <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center'}}>
                            {
                                workout.workout.allWorkouts.length>1
                                ?
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{workout.workout.allWorkouts.length}</Text> Variations</Text>
                                :
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{workout.workout.allWorkouts.length}</Text> Variations</Text>
                            }
                        </View>
                    </View>
                    <View style={{marginTop: 15,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',marginLeft: 5}}>
                        <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center'}}>
                            {
                                workout.workout.allWorkouts.map(w => {
                                    totalSets += w.allSets.length;
                                })
                            }
                            {
                                totalSets>1
                                ?
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{totalSets}</Text> Sets</Text>
                                :
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{totalSets}</Text> Sets</Text>
                            }
                        </View>
                    </View>
                    <View style={{marginTop: 15,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',marginLeft: 5}}>
                        <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center'}}>
                            {
                                workout.workout.allWorkouts.map(w => {
                                    w.allSets.map(s => {
                                        totalReps = +totalReps + +s.reps
                                    })
                                })
                            }
                            {
                                totalReps>1
                                ?
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{totalReps}</Text> Reps</Text>
                                :
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{totalReps}</Text> Reps</Text>
                            }
                        </View>
                    </View>
                    <View style={{marginTop: 15,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',marginLeft: 5}}>
                        <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center'}}>
                            {
                                workout.workout.allWorkouts.map(w => {
                                    w.allSets.map(s => {
                                        totalVol = +totalVol + +s.weight
                                    })
                                })
                            }
                            {
                                totalVol>1
                                ?
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{totalVol} kg</Text> Volume</Text>
                                :
                                <Text style={{fontSize: 18,color: '#5f5f5f',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}><Text style={{color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{totalVol} kg</Text> Volume</Text>
                            }
                        </View>
                    </View>
                </Pressable>
                <View style={styles.interactComponent}>
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                        {
                            workout.likes.some(e => e.uid == `${userID}`)
                            ?
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                <Pressable onPress={()=>{
                                    unlikeWorkout(workout);
                                }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                    <FontAwesomeIcon icon="fa-solid fa-heart" size={22} style={{color: 'red',marginRight: 5}}/>
                                </Pressable>
                                <Pressable onPress={()=>{
                                    showLikes(workout.likes)
                                }} style={{marginLeft: 5}}>
                                    <Text style={{color: '#1e1e1e',fontSize: 20,fontFamily: 'LeagueSpartan-Medium'}}>{workout.likes.length}</Text>
                                </Pressable>
                            </View>
                            :
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                <Pressable onPress={()=>{
                                    likeWorkout(workout);
                                }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                    <FontAwesomeIcon icon={faHeart} size={22} style={{color: '#A19EA3',marginRight: 5}}/>
                                </Pressable>
                                <Pressable onPress={()=>{
                                    showLikes(workout.likes)
                                }} style={{marginLeft: 5}}>
                                    <Text style={{color: '#1e1e1e',fontSize: 20,fontFamily: 'LeagueSpartan-Medium'}}>{workout.likes.length}</Text>
                                </Pressable>
                            </View>
                            
                        }
                    </View>  
                    <Pressable onPress={()=>{
                            openWorkoutBox(workout.workout,workout.uid);
                    }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',}}>
                            <FontAwesomeIcon icon="fa-regular fa-comment" size={20} style={{color: '#A19EA3',marginRight: 5}}/>
                        </View>
                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                            <Text style={{marginLeft: 5,color: '#1e1e1e',fontSize: 20,fontFamily: 'LeagueSpartan-Medium'}}>{workout.workout.comments.length}</Text>
                        </View>
                    </Pressable>
                    
                </View>
            </View>
        )
    }

    const likeWorkout = async (userProfile) => {
        let docID = "";
        let likeArray = [];

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${userProfile.uid}`));
        querySnapshot.forEach((doc) => {
            if(userProfile.workout.id==doc.data().id){
                docID = doc.id;
                likeArray = doc.data().likes;
            }
        });

        const nameRef = doc(FIREBASE_DB, "Users", `${userID}`);
        const nameSnap = await getDoc(nameRef);
        
        let name = "";

        if(nameSnap.exists()){
            name = nameSnap.data().name;
        }

        likeArray.push({
            uid: userID,
            name: name,
        });
        
        const likeRef = doc(FIREBASE_DB, `${userProfile.uid}`, `${docID}`);

        await updateDoc(likeRef, {
            likes: likeArray
        });

        setFollowingUserArray(followingUserArray.map(user => {
            if(user.uid==userProfile.uid && user.workout.id==userProfile.workout.id){
                return{
                    ...user,
                    workout: {
                        ...user.workout,
                        likes: likeArray,
                    },
                    likes: likeArray
                }
            }
            else{
                return user;
            }
        }))
    }

    const unlikeWorkout = async (userProfile) => {
        let docID = "";
        let likeArray = [];

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${userProfile.uid}`));
        querySnapshot.forEach((doc) => {
            if(userProfile.workout.id==doc.data().id){
                docID = doc.id;
                likeArray = doc.data().likes;
            }
        });

        let newLikeArray = likeArray.filter((like) => {
            return like.uid != userID;
        });
        
        const likeRef = doc(FIREBASE_DB, `${userProfile.uid}`, `${docID}`);

        await updateDoc(likeRef, {
            likes: newLikeArray
        });
        

        setFollowingUserArray(followingUserArray.map(user => {
            if(user.uid==userProfile.uid && user.workout.id==userProfile.workout.id){
                return{
                    ...user,
                    workout: {
                        ...user.workout,
                        likes: newLikeArray,
                    },
                    likes: newLikeArray
                }
            }
            else{
                return user;
            }
        }))
    }

    const updateWorkouts = async () => {
        var allWorkouts = followingUserArray;
    
        await Promise.all(allWorkouts.map(async (workout) => {
            let docID = "";
            let docUid = "";

            if (clickedWorkoutID == workout.workout.id) {
                docUid = workout.uid;
            }

            if (docUid !== "") {
                const querySnapshot = await getDocs(collection(FIREBASE_DB, `${docUid}`));
                querySnapshot.forEach((doc) => {
                    if(clickedWorkoutID == doc.data().id){
                        docID = doc.id;
                    }
                });

                const getClickedDoc = doc(FIREBASE_DB, `${docUid}`, `${docID}`);
                const getClickedDocSnap = await getDoc(getClickedDoc);

                if (getClickedDocSnap.exists()) {  
                    allWorkouts = allWorkouts.map(user => {
                        if (user.workout.id === getClickedDocSnap.data().id) {
                            return {
                                ...user,
                                workout: getClickedDocSnap.data(),
                                likes: getClickedDocSnap.data().likes,
                                comments: getClickedDocSnap.data().comments
                            };
                        } else {
                            return user;
                        }
                    });
                    setFollowingUserArray(allWorkouts);
                }
            }
        }));
    };

    const followBackUser = async (uid) => {
        const followingRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
        const followingSnap = await getDoc(followingRef);
        
        let followingArr = [...followingSnap.data().following,uid];

        const followerRef = doc(FIREBASE_DB, "Users", `${uid}`);
        const followerSnap = await getDoc(followerRef);

        let followerArr = [...followerSnap.data().followers,auth.currentUser.uid];

        await updateDoc(followingRef, {
            following: followingArr
        });

        await updateDoc(followerRef, {
            followers: followerArr
        });

        setAllUsers(allUsers.map(user => {
            if(user.uid==uid){
                return{
                    ...user,
                    following: true
                }
            }
            else{
                return user;
            }
        }))
    }

    const unfollowUser = async (uid) => {
        const followingRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
        const followingSnap = await getDoc(followingRef);
        
        let followingArr = followingSnap.data().following;
        followingArr = followingArr.filter(arr => arr != uid);

        const followerRef = doc(FIREBASE_DB, "Users", `${uid}`);
        const followerSnap = await getDoc(followerRef);

        let followerArr = followerSnap.data().followers;
        followerArr = followerArr.filter(arr => arr != auth.currentUser.uid);

        await updateDoc(followingRef, {
            following: followingArr
        });

        await updateDoc(followerRef, {
            followers: followerArr
        });

        setAllUsers(allUsers.map(user => {
            if(user.uid==uid){
                return{
                    ...user,
                    following: false
                }
            }
            else{
                return user;
            }
        }))
    }

    const showLikes = async (likes) => {
        setShowLikesBool(true);
        setLikedUsers(likes);
    }

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
        const fetchData = async () => {
            await updateWorkouts();
        };
    
        fetchData()
    }, [showWorkoutBox]);

    // Rendered 6 times

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

        if(uid!=null && uid!=auth.currentUser.uid){
            userID = uid;
        }

        const fetchData = async () => {
            try {
                const myWorkouts = await getMyWorkouts();
                const followingWorkouts = uid==null ? await getFollowingWorkouts() : [];
                const combinedWorkouts = myWorkouts.concat(...followingWorkouts);
                const getUsers = await getAllUsers();

                setFollowingUserArray(combinedWorkouts.sort((x, y) => y.timeStamp.toMillis() - x.timeStamp.toMillis()));
                setAllUsers(getUsers);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        const myWorkoutsQuery = query(collection(FIREBASE_DB, `${userID}`));
        const unsubscribeMyWorkouts = onSnapshot(myWorkoutsQuery, (querySnapshot) => {
            setIsLoading(true);
            const timeout = setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                }
            }, 1000); // Adjust the timeout duration as needed

            fetchData();

            return () => clearTimeout(timeout);
        });

        const followingWorkoutsQuery = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
        const unsubscribeFollowingWorkouts = onSnapshot(followingWorkoutsQuery, (querySnapshot) => {
            setIsLoading(true);
            const timeout = setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                }
            }, 1000); // Adjust the timeout duration as needed

            fetchData();

            return () => clearTimeout(timeout);
        });

    }, []);
 
    //Rendered 4 times

    const debouncedSearchWorkouts = debounce(searchWorkouts, 300);

    useEffect(() => {
        debouncedSearchWorkouts();

        return () => {
            debouncedSearchWorkouts.cancel();
        };
    }, [searchParams]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
            }
        }, 500);
    
        return () => clearTimeout(timeout);
    }, [followingUserArray]);

    if(isLoading){
        return(
            <View style={{height: '100%',minWidth:'100%',display: 'flex',justifyContent: 'flex-start',alignItems: 'center',minHeight: 500}}>
                <View style={{padding: 20,minWidth:'90%',borderRadius: 10}}>
                    <View style={{backgroundColor: '#f5f4f4',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',}}>
                        <Animated.View style={[styles.box, animatedDefault,{minWidth:40}]}/>
                    </View>
                    <View style={{padding: 10,backgroundColor: '#f5f4f4',borderRadius: 10,height: 200,marginTop: 20,display: 'flex',flexDirection: 'column',justifyContent: 'space-around',alignItems: 'center',}}>
                        <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
                            <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
                        </View>
                            <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
                            <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
                        </View>
                        <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
                            <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
                        </View>
                    </View>
                </View>
                <View style={{padding: 20,minWidth:'90%',borderRadius: 10}}>
                    <View style={{backgroundColor: '#f5f4f4',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',}}>
                        <Animated.View style={[styles.box, animatedDefault,{minWidth:40}]}/>
                    </View>
                    <View style={{padding: 10,backgroundColor: '#f5f4f4',borderRadius: 10,height: 200,marginTop: 20,display: 'flex',flexDirection: 'column',justifyContent: 'space-around',alignItems: 'center',}}>
                        <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
                            <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
                        </View>
                            <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
                            <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
                        </View>
                        <View style={{backgroundColor: '#DDD',borderRadius: 10,display: 'flex',justifyContent: 'center',alignItems: 'center',minWidth:'90%'}}>
                            <Animated.View style={[styles.box, animatedColumn,{minWidth:40,backgroundColor:'#E0E0E0'}]}/>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
    else{
        return (
            <View style={{display: 'flex',marginTop: 0,flex: 1,minWidth: '100%'}}>
                {
                    !showLikesBool
                    ?
                    <ScrollView contentContainerStyle={styles.workoutContainer}  showsVerticalScrollIndicator={false}>
                        {
                            !showWorkoutBox
                            ?
                            <View style={styles.workoutList}>
                                <View style={{height: '100%',marginTop: 20}}>
                                    {
                                        searchBar && searchUsers.length>0 && searchParams!=""
                                        ?
                                        <View>
                                            <View style={{marginBottom: 10}}>
                                                <Text style={{fontFamily: 'LeagueSpartan-Medium',marginLeft: 5,fontSize: 23,alignSelf: 'flex-start'}}>Users</Text>
                                            </View>
                                            <View style={{width: '100%',height: 220,marginBottom: 20}}>
                                                <ScrollView horizontal={true} style={{width: '100%',height: '100%',padding: 10,paddingLeft: 0,paddingRight: 0,display: 'flex',flexDirection: 'row',overflow: 'scroll'}}>
                                                    {searchUsers.map(user => {
                                                        if(user.uid!=auth.currentUser.uid){
                                                            return(
                                                                <Pressable onPress={()=>{
                                                                    navigation.navigate('IndividualUser',{
                                                                        uid: user.uid,
                                                                        name: user.name,
                                                                        profileUrl: user.profileUrl
                                                                    })
                                                                }} key={user.uid} style={{height: '100%',width: 170,backgroundColor: '#1e1e1e',borderRadius: 10,marginRight: 10,display: 'flex',flexDirection: 'column',justifyContent: 'space-around',alignItems: 'center',padding: 10,paddingLeft: 0,paddingRight: 0}}>
                                                                    {
                                                                        user.profileUrl=="" || user.profileUrl==undefined
                                                                        ?
                                                                        <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                                          {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                                                          <FontAwesomeIcon icon="fa-solid fa-user" size={40} style={{color: '#fff'}}/>
                                                                        </View>
                                                                        :
                                                                        <Image src={user.profileUrl} style={{height: 60,width: 60,borderRadius: 50,borderWidth: 2,borderColor: '#fff'}}/>
                                                                    }
                                                                    <Text style={{fontFamily: 'LeagueSpartan',fontSize: 18,color: '#fff',textAlign: 'center',textAlignVertical: 'center'}}>{user.name}</Text>
                                                                    {
                                                                        user.following
                                                                        ?
                                                                        <Pressable onPress={()=>{
                                                                            unfollowUser(user.uid)
                                                                        }} style={{width: '60%',backgroundColor: '#303030',borderRadius: 5,padding: 5,borderWidth: 2,borderColor: '#404040'}}>
                                                                            <Text style={{fontFamily: 'LeagueSpartan',fontSize: 16,color: '#fff',textAlign: 'center',textAlignVertical: 'center'}}>Unfollow</Text>
                                                                        </Pressable>
                                                                        :
                                                                        <Pressable onPress={()=>{
                                                                            followBackUser(user.uid)
                                                                        }} style={{width: '60%',backgroundColor: '#2B8CFF',borderRadius: 5,padding: 5}}>
                                                                            <Text style={{fontFamily: 'LeagueSpartan',fontSize: 16,color: '#fff',textAlign: 'center',textAlignVertical: 'center'}}>Follow</Text>
                                                                        </Pressable>
                                                                    }
                                                                </Pressable>
                                                            )
                                                        }
                                                    })}
                                                </ScrollView>
                                            </View>
                                        </View>
                                        :
                                        null
                                    }
                                    <View style={{width: '100%',height: '100%',paddingBottom: 20,}}>
                                        {/* {
                                            searchBar
                                            ?
                                            <Text style={{fontFamily: 'LeagueSpartan-Medium',marginLeft: 5,fontSize: 23,marginBottom: 20,alignSelf: 'flex-start',color: '#E3E3E3'}}>Workouts</Text>
                                            :
                                            null
                                        } */}
                                        <Text style={{fontFamily: 'LeagueSpartan',fontSize: 20,marginTop: 10,marginBottom: 30,alignSelf: 'flex-start',color: '#8F8F8F',borderBottomColor: '#E3E3E3',borderBottomWidth: 2,paddingBottom: 5}}>Workouts</Text>
                                        {
                                            followingUserArray.length>0 && !isLoading
                                            ?
                                            <View style={{width: '100%'}}>
                                                {
                                                    followingUserArray.map(userProfile => {
                                                        let randomID = uuidv4();
                                                        return(
                                                            <View style={{}}  key={randomID}>

                                                                {
                                                                    groupByUser(userProfile,userProfile.uid)
                                                                }
                                                                
                                                                <View style={{marginBottom: 30}} key={userProfile.workout.id}>
                                                                    
                                                                </View>
                                                                
                                                                
                                                            </View>
                                                        )
                                                    })
                                                }
                                            </View>
                                            :
                                            <View  style={[styles.emptyWorkoutContainer,{paddingTop: 25,paddingBottom: 25,minHeight: 180,display: 'flex',justifyContent: 'space-around'}]}>
                                                <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',borderBottomColor: '#2B8CFF',borderBottomWidth: 2,paddingBottom: 5,alignSelf: 'center'}}>
                                                    <Text style={{color: 'white',fontSize:20,fontFamily: 'LeagueSpartan'}}>No Workouts Found</Text>
                                                </View>
                                                {
                                                    userProfile
                                                    ?
                                                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                        <Text style={{color: 'black',marginLeft: 10,fontSize: 18,color: '#fff',fontFamily: 'LeagueSpartan'}}>Please add new workouts to view them here :)</Text>
                                                    </View>
                                                    :
                                                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                        <Text style={{color: 'black',marginLeft: 10,fontSize: 18,color: '#fff',fontFamily: 'LeagueSpartan'}}>Please start following people to view their workouts here :)</Text>
                                                    </View>
                                                }
                                            </View>
                                        } 
                                    </View>
                                </View>
                            </View>
                            :
                            <IndividualWorkout ID={clickedWorkoutID} showWorkoutBox={setShowWorkoutBox} showNavbar={showNavbar} uid={newUidBool? newUid : uid} hideUserNavbar={hideUserNavbar} followingUserArray={followingUserArray} setFollowingUserArray={setFollowingUserArray} allUsers={allUsers}/>
                        }
                    </ScrollView>
                    :
                    <ScrollView contentContainerStyle={{width: '100%',backgroundColor: '#1e1e1e',display: 'flex',marginTop: 40,marginBottom: 50,minHeight: 500,borderRadius: 10,padding: 20}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginBottom: 20}}>
                            <View style={{position: 'absolute',left: 0}}>
                                <Pressable onPress={()=>{
                                    setShowLikesBool(false);
                                }} >
                                    <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{color: '#fff'}}/>
                                </Pressable>
                            </View>
                            <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                                <Text style={{display: 'flex',textAlign: 'center',fontSize: 22,fontWeight: '500',borderBottomColor: '#2B8CFF',borderBottomWidth: 2,color: '#fff',fontFamily:'LeagueSpartan'}}>Likes</Text>
                            </View>
                        </View>
                        {
                            likedUsers.length>0
                            ?
                            likedUsers.map(user => {
                                let userPfp = allUsers.length>0 ? allUsers.find(arr => arr.uid==user.uid) : "";
                                if(userPfp!="" && userPfp!=undefined){
                                    userPfp = userPfp.profileUrl;
                                }
                                if(userPfp==undefined) userPfp = "";

                                return(
                                    <View key={user.uid} style={{marginTop: 15,width: '100%'}}>
                                        <View  style={{display: 'flex',flexDirection: 'row',alignItems: 'center',padding: 10,backgroundColor: '#3e3e3e',margin: 7.5,borderRadius: 10,paddingLeft: 15,paddingRight: 15,alignItems: 'center',justifyContent: 'space-between'}}>
                                            <Pressable onPress={() => {
                                                navigation.navigate('IndividualUser',{
                                                    uid: user.uid,
                                                    name: user.name,
                                                    profileUrl: userPfp
                                                })
                                            }} style={{display:'flex',flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                                                <View>
                                                    {
                                                        userPfp=="" || userPfp==undefined
                                                        ?
                                                        <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                          <FontAwesomeIcon icon="fa-solid fa-user" size={30} style={{color: '#fff'}}/>
                                                        </View>
                                                        :
                                                        <Image src={userPfp} style={{height: 50,width: 50,borderRadius: 50,borderWidth: 2,borderColor: '#DDD'}}/>
                                                    }
                                                </View>
                                                <Text style={{textAlign: 'center',marginLeft: 10,fontSize: 17,color: '#fff',fontWeight: '500',fontFamily:'LeagueSpartan'}}>{user.name}</Text>
                                            </Pressable>
                                            <View style={{marginRight: 10}}>
                                                <FontAwesomeIcon icon="fa-solid fa-heart" size={22} style={{color: 'red',marginRight: 5}}/>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                            :
                            <View style={{display: 'flex',justifyContent: 'center',height: 400,alignItems: 'center',paddingLeft: 10,paddingRight: 10}}>
                                <Text style={{fontSize: 20,color: '#fff',fontFamily: 'LeagueSpartan'}}>No one has liked this workout yet.</Text>
                            </View>
                        }
                    </ScrollView>
                }
            </View>
        )
    }
}

const MemoizedWorkout = memo(Workout);

const MemoizedWorkoutWrapper = ({ searchParams, showNavbar, setShowNavbar, uid, hideUserNavbar, setHideUserNavbar, searchBar, userProfile }) => {
    return useMemo(() => (
        <MemoizedWorkout
            searchParams={searchParams}
            showNavbar={showNavbar}
            setShowNavbar={setShowNavbar}
            uid={uid}
            hideUserNavbar={hideUserNavbar}
            setHideUserNavbar={setHideUserNavbar}
            searchBar={searchBar}
            userProfile={userProfile}
        />
    ), [searchParams, uid]);
};

export default MemoizedWorkoutWrapper;

const styles = StyleSheet.create({
    workoutContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        width: '100%',
        overflow: 'scroll',
        // marginBottom: 50,
        
    },
    emptyWorkoutBox: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        paddingTop: 20,
    },
    workoutList: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    emptyWorkoutList: {
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    date: {
        fontSize: 20,
        color: '#fff',
        alignSelf: 'center',
        backgroundColor: 'black',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 15,
        fontWeight: '500'
    },
    dateContainer: {
        display: 'flex',
        alignSelf: 'flex-start',
    },
    workout: {
        marginTop: 10,
        height: 'auto',
        display: 'flex',
    },
    workoutTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
        fontWeight: '600',
        paddingBottom: 0,
        // borderBottomWidth:2,
        // borderBottomColor: "white"
    },
    workoutTitle: {
        fontSize: 32,
        color: '#343434',
        textAlign: 'center',
        textAlignVertical: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'LeagueSpartan-Bold',
        // borderWidth: 2,
        // borderColor: "#444444",
        // borderRadius: 10,
        marginTop: -5
    },
    workoutTime: {
        fontSize: 13,
        color: '#949494',
        fontFamily: 'LeagueSpartan'
    },
    exerciseList:{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'scroll',
        height: '100%',
    },
    exerciseName:{
        // paddingTop: 5,
        // paddingBottom: 5,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e1e',
        alignSelf: 'flex-start',
        padding: 20,
        // maxWidth: 160,
        minWidth: 150,
        borderRadius: 10,
        height: '100%',
        borderWidth: 1,
        borderColor: '#E6E6E6'
        // justifyContent: 'center',
        // alignItems: 'center',
        
    },
    exerciseReps: {
        // borderColor: '#f5f4f4'
    },
    workoutIcon: {
        height: 20,
        width: 25,
    },
    interactComponent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 10,
        marginTop: 15
    },
    likeIcon: {
        height: 22,
        width: 22,
        marginRight: 5
    },
    commentIcon: {
        height: 22,
        width: 22,
    },
    emptyWorkoutContainer: {
        borderWidth: 1,
        borderColor: '#DDD',
        display: 'flex',
        width: '100%',
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 20,
        justifyContent: 'center',
    },
    box: {
        height: 40,
        width: 15,
        backgroundColor: '#F7F6F6'
    }
})