import React, { useEffect, useState } from 'react'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withRepeat,
  } from 'react-native-reanimated';
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator, ViewBase } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import IndividualWorkout from './IndividualWorkout';
import { getStorage, ref,uploadBytes,getDownloadURL } from "firebase/storage";
import { useFonts } from 'expo-font';
import CalendarStrip from 'react-native-calendar-strip';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LinearGradient } from 'expo-linear-gradient';

const dumbell = require("../assets/dumbell.png");
const dumbellWhite = require("../assets/workout-icon-white.png");
const like = require("../assets/like-icon-outline.png");
const likeBlack = require("../assets/like-icon-outline-black.png");
const likeBlue = require("../assets/like-icon-blue.png");
const comment = require("../assets/comment-icon.png");
const workoutBlack = require("../assets/workout-icon-black.png");
const sadSmiley = require("../assets/sad-smiley-icon.jpg");
const pfp = require("../assets/pfp.jpg");
const crossIcon = require("../assets/cross-icon-black.png");
const backIconBlack = require("../assets/back-arrow-icon.png");
const backIconWhite = require("../assets/back-arrow-icon-white.png");


const Workout = ({showNavbar,searchParams,uid,hideUserNavbar,searchBar,isReload,userProfile}) => {
    const [workoutsArray,setWorkoutsArray] = useState([]);
    const [showWorkoutBox,setShowWorkoutBox] = useState(false);
    const [clickedWorkoutID,setClickedWorkoutID] = useState();
    const [isLoading,setIsLoading] = useState(true);
    
    const [myWorkouts,setMyWorkouts] = useState([]);
    const [followingWorkouts,setFollowingWorkouts] = useState([]);
    const [followingUserArray,setFollowingUserArray] = useState([]);

    const [newUid,setNewUid] = useState('');
    const [newUidBool,setNewUidBool] = useState(false);
    const [showLikesBool,setShowLikesBool] = useState(false);
    const [likedUsers,setLikedUsers] = useState([]);
    const [goToCommentBox,setGoToCommentBox] = useState(false);

    const [currentDay,setCurrentDay] = useState((new Date().getDay()));
    const [currentDate,setCurrentDate] = useState((new Date()).getDate());
    const [currentMonth,setCurrentMonth] = useState((new Date()).getMonth()+1);
    const [currentYear,setCurrentYear] = useState((new Date()).getFullYear());

    const storage = getStorage();

    const [fontsLoaded, fontError] = useFonts({
        'JosefinSans': require('../assets/fonts/JosefinSans-Regular.ttf'),
        'JosefinSans-Bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
        'SignikaNegative': require('../assets/fonts/SignikaNegative-Medium.ttf'),
        'LeagueSpartan': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
        'LeagueSpartan-Medium': require('../assets/fonts/LeagueSpartan-Medium.ttf'),
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

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const navigation = useNavigation();
    const auth = getAuth();
    const route = useRoute();
    var userID = auth.currentUser.uid;

    const getMyWorkouts = async () => {
        try {
            const q = query(collection(FIREBASE_DB, `${userID}`));
            const querySnapshot = await getDocs(q);
    
            const userNameRef = doc(FIREBASE_DB, "Users", `${userID}`);
            const userNameRefSnap = await getDoc(userNameRef);
    
            let loggedUserName = "";
            let loggedProfileUrl = "";
    
            if (userNameRefSnap.exists()) {
                loggedUserName = userNameRefSnap.data().name;
                loggedProfileUrl = userNameRefSnap.data().profileUrl;
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
    
            if (docSnap.exists()) {
                let followingArray = docSnap.data().following;
    
                const followingPromises = followingArray.map(async following => {
                    const q = query(collection(FIREBASE_DB, `${following}`));
                    const nameRef = doc(FIREBASE_DB, "Users", `${following}`);
                    const nameSnap = await getDoc(nameRef);
    
                    let name = "";
                    if (nameSnap.exists()) {
                        name = nameSnap.data().name;
                    }
    
                    let profileUrl = "";
                    const profilePicRef = doc(FIREBASE_DB, "Users", `${following}`);
                    const profilePicSnap = await getDoc(profilePicRef);
    
                    if (profilePicSnap.exists()) {
                        profileUrl = profilePicSnap.data().profileUrl;
                    }
    
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
            }
            return [];
        } catch (error) {
            console.error("Error fetching following workouts: ", error);
            return [];
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const myWorkouts = await getMyWorkouts();
                
                const followingWorkouts = uid==null ? await getFollowingWorkouts() : [];
    
                const combinedWorkouts = myWorkouts.concat(...followingWorkouts);
                setFollowingUserArray(combinedWorkouts.sort((x, y) => y.timeStamp.toMillis() - x.timeStamp.toMillis()));
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
    
        fetchData();
    }, []);

    const searchWorkouts = async () => {
        setIsLoading(true);
    
        const q = query(collection(FIREBASE_DB, `${userID}`));
    
        const userNameRef = doc(FIREBASE_DB, "Users", `${userID}`);
        const userNameRefSnap = await getDoc(userNameRef);
    
        let loggedUserName = "";
        let loggedProfileUrl = "";
    
        if (userNameRefSnap.exists()) {
            loggedUserName = userNameRefSnap.data().name;
            loggedProfileUrl = userNameRefSnap.data().profileUrl;
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
    
        const docRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
            const followingArray = docSnap.data().following;
    
            await Promise.all(followingArray.map(async (following) => {
                const q = query(collection(FIREBASE_DB, `${following}`));
                const nameRef = doc(FIREBASE_DB, "Users", `${following}`);
                const nameSnap = await getDoc(nameRef);
    
                let name = "";
    
                if (nameSnap.exists()) {
                    name = nameSnap.data().name;
                }
    
                let profileUrl = "";
    
                const profilePicRef = doc(FIREBASE_DB, "Users", `${following}`);
                const profilePicSnap = await getDoc(profilePicRef);
    
                if (profilePicSnap.exists()) {
                    profileUrl = profilePicSnap.data().profileUrl;
                }
    
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
    
            if (searchParams !== "") {
                const filterBySearch = allWorkouts.filter((item) => {
                    let search = false;
                    item.workout.allWorkouts.map(workout => {
                        if (workout.exerciseName.toLowerCase().includes(searchParams.toLowerCase())) {
                            search = true;
                        }
                    });
                    if (item.workout.workoutName.toLowerCase().includes(searchParams.toLowerCase()) || search) {
                        return item;
                    }
                });
    
                updatedArray = filterBySearch;
            }
    
            setFollowingUserArray(updatedArray);
        }
    
        
    };
    
    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            await searchWorkouts();
        };

    
        fetchData()
    }, [searchParams]);
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
            }
        }, 2500); // Adjust the timeout duration as needed
    
        return () => clearTimeout(timeout);
    }, [followingUserArray]);

    useEffect(() => {
        if(searchBar && searchParams!=""){
            const timeout = setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                }
            }, 500); // Adjust the timeout duration as needed
        
            return () => clearTimeout(timeout);
        }
    }, [searchBar]);

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

    // const groupByDate = (workout) => {
    //     dateGroup.set(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`,'1')
    //     return(
    //         <View style={{marginTop: 15,borderColor: '#E7E7E7',borderWidth: 1,padding: 10,paddingLeft: 15,paddingRight: 15,alignSelf: 'flex-start',borderRadius: 15,backgroundColor: '#f5f4f4'}}>
    //             <Text style={{fontSize: 15,color: '#444444',fontWeight: '500'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
    //                 {/* last digit(1,2,3,...9) ? st/nd/rd : th */}
    //                 {dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)}
    //             </Text>
    //         </View>
    //     )
    // }

    const followingGroupByDate = (workout) => {
        followingDateGroup.set(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`,'1')
        UserGroup.clear();
        return(
            <View style={{marginBottom: 20,padding: 10,paddingLeft: 15,paddingRight: 15,alignSelf: 'flex-start',borderRadius: 5,backgroundColor: '#f6f6f7'}}>
                <Text style={{fontSize: 18,color: '#1e1e1e',fontFamily: 'LeagueSpartan'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
                    {/* last digit(1,2,3,...9) ? st/nd/rd : th */}
                    {dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(8,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)}
                </Text>
            </View>
        )
    }

    const groupByUser = (workout,profileUid) => {
        UserGroup.set(`${workout.name}`,'1')
        return(
            <Pressable onPress={() => {
                openWorkoutBox(workout.workout,workout.uid);
            }} style={{display: 'flex',justifyContent: 'space-between',flexDirection: 'column',backgroundColor: '#1e1e1e',padding: 15,paddingLeft: 20,paddingRight: 20,borderRadius: 10,elevation: 5,borderWidth: 1,borderColor: '#A5A5A5'}}>
                <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center',flexDirection: 'row',marginBottom: 15}}>
                    <Pressable onPress={()=>{
                        navigation.navigate('IndividualUser',{
                            uid: profileUid,
                            name: workout.name,
                            })
                        }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                {
                                    workout.profileUrl=="" || workout.profileUrl==undefined
                                    ?
                                    <Image source={pfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 1.5,borderColor: '#DDD'}}/>
                                    :
                                    <Image src={workout.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 1.5,borderColor: '#DDD'}}/>
                                }
                            </View>
                            <Text style={{color: '#fff',fontSize: 18,marginLeft: 10,fontWeight: '500',fontFamily: 'LeagueSpartan-Medium'}}>{workout.name}</Text>
                    </Pressable>
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                        {
                            workout.timeStamp.toDate().toTimeString().slice(0,2)<12
                            ?
                            <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                            :
                            <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                        }       
                    </View>
                </View>
                <Pressable onPress={() => {
                        openWorkoutBox(workout.workout,workout.uid);
                    }} style={{display: 'flex',flexDirection: 'column',justifyContent: 'space-between',alignItems: 'flex-start'}}>
                    <View style={{display:'flex',alignItems: 'center',justifyContent: 'center',marginTop: 20}}>
                        <Text style={styles.workoutTitle}>{workout.workout.workoutName}</Text>
                    </View>
                    
                    <View style={{marginTop: 20,display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%'}}>
                        <View style={{display: 'flex',justifyContent: 'space-between',alignItems: 'center'}}>
                            {
                                workout.workout.allWorkouts.length>1
                                ?
                                <Text style={{fontSize: 15,color: '#DDD',fontWeight: '500',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}>{workout.workout.allWorkouts.length} Exercises</Text>
                                :
                                <Text style={{fontSize: 15,color: '#DDD',fontWeight: '500',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan'}}>{workout.workout.allWorkouts.length} Exercise</Text>
                            }
                        </View>
                    </View>

                    {
                        workout.workout.allWorkouts.map(exercise => {
                            return(
                                <View key={exercise.id} style={{marginTop: 10,display: 'flex',flexDirection: 'row'}}>
                                    <View style={{borderBottomWidth: 2,borderColor: '#2B8CFF'}}>
                                        <Text style={{color: '#fff',fontSize: 18,fontFamily: 'LeagueSpartan',marginTop: 10,paddingBottom: 5}}>{exercise.exerciseName}</Text>
                                    </View>
                                    <View>
                                        <Text style={{color: '#fff',fontSize: 18,fontFamily: 'LeagueSpartan',marginTop: 10}}> x {exercise.allSets.length}</Text>
                                    </View>
                                </View>
                            )
                        })
                    }

                    
                </Pressable>
                <View style={styles.interactComponent}>
                    {/* display likes */}
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                        {
                            workout.likes.length>2
                            ?
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                <View style={{display: 'flex',marginRight: 5}}>
                                    <Pressable onPress={()=>{
                                        showLikes(workout.likes);
                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                        
                                            {
                                                workout.likes.some(e => e.uid == `${userID}`)
                                                ?
                                                <Pressable onPress={()=>{
                                                    unlikeWorkout(workout);
                                                }}>
                                                    <Image source={likeBlue} style={styles.likeIcon}/>
                                                </Pressable>
                                                :
                                                <Pressable onPress={()=>{
                                                    likeWorkout(workout);
                                                }}>
                                                    <Image source={like} style={styles.likeIcon}/>
                                                </Pressable>
                                            }
                                            {
                                                returnProfilePic(workout.likes[0].profileUrl,0)
                                            }
                                            {
                                                returnProfilePic(workout.likes[1].profileUrl,-10)
                                            }
                                            {
                                                returnProfilePic(workout.likes[2].profileUrl,-10)
                                            }
                                    </Pressable>
                                </View>
                            
                                
                                {/* {
                                    workout.likes.some(e => e.uid == `${userID}`)
                                    ?
                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {workout.likes.length-1} others like this</Text>
                                    :
                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name.split(" ")[0]} and {workout.likes.length-1} others like this</Text>
                                } */}
                                
                            </View>
                            :
                            <View style={{}}>
                            {
                                workout.likes.length>1
                                ?
                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                    <View style={{display: 'flex',marginRight: 5}}>
                                        <Pressable onPress={()=>{
                                            showLikes(workout.likes);
                                        }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                            <View style={{display: 'flex',flexDirection: 'row'}}>
                                                {
                                                    workout.likes.some(e => e.uid == `${userID}`)
                                                    ?
                                                    <Pressable onPress={()=>{
                                                        unlikeWorkout(workout);
                                                    }}>
                                                        <Image source={likeBlue} style={styles.likeIcon}/>
                                                    </Pressable>
                                                    :
                                                    <Pressable onPress={()=>{
                                                        likeWorkout(workout);
                                                    }}>
                                                        <Image source={like} style={styles.likeIcon}/>
                                                    </Pressable>
                                                }
                                                {
                                                    returnProfilePic(workout.likes[0].profileUrl,0)
                                                }
                                                {
                                                    returnProfilePic(workout.likes[1].profileUrl,-10)
                                                }
                                            </View>
                                            
                                            {/* {
                                                workout.likes.some(e => e.uid == `${userID}`)
                                                ?
                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {workout.likes.length-1} others like this</Text>
                                                :
                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name.split(" ")[0]} and {workout.likes.length-1} others like this</Text>
                                            }  */}
                                        </Pressable>
                                    </View>
                                </View>
                                :
                                <View style={{}}>
                                    {
                                        workout.likes.length>0
                                        ?
                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                            <View style={{display: 'flex',marginRight: 5}}>
                                                <Pressable onPress={()=>{
                                                    showLikes(workout.likes);
                                                }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                    <View style={{display: 'flex',flexDirection: 'row'}}>
                                                        {
                                                            workout.likes.some(e => e.uid == `${userID}`)
                                                            ?
                                                            <Pressable onPress={()=>{
                                                                unlikeWorkout(workout);
                                                            }}>
                                                                <Image source={likeBlue} style={styles.likeIcon}/>
                                                            </Pressable>
                                                            :
                                                            <Pressable onPress={()=>{
                                                                likeWorkout(workout);
                                                            }}>
                                                                <Image source={like} style={styles.likeIcon}/>
                                                            </Pressable>
                                                        }
                                                        {
                                                            returnProfilePic(workout.likes[0].profileUrl,0)
                                                        }
                                                    </View>
                                                    
                                                    {/* {
                                                        workout.likes.some(e => e.uid == `${userID}`)
                                                        ?
                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {workout.likes.length-1} others like this</Text>
                                                        :
                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name.split(" ")[0]} and {workout.likes.length-1} others like this</Text>
                                                    }  */}
                                                </Pressable>
                                            </View>
                                        </View>
                                        :
                                        <View style={{}}>
                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                <View style={{display: 'flex',marginRight: 5}}>
                                                    <Pressable onPress={()=>{
                                                        showLikes(workout.likes);
                                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                        <View style={{display: 'flex',flexDirection: 'row'}}>
                                                            {
                                                                workout.likes.some(e => e.uid == `${userID}`)
                                                                ?
                                                                <Pressable onPress={()=>{
                                                                    unlikeWorkout(workout);
                                                                }}>
                                                                    <Image source={likeBlue} style={styles.likeIcon}/>
                                                                </Pressable>
                                                                :
                                                                <Pressable onPress={()=>{
                                                                    likeWorkout(workout);
                                                                }}>
                                                                    <Image source={like} style={styles.likeIcon}/>
                                                                </Pressable>
                                                            }
                                                        </View>
                                                        
                                                        {/* {
                                                            workout.likes.some(e => e.uid == `${userID}`)
                                                            ?
                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {workout.likes.length-1} others like this</Text>
                                                            :
                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name.split(" ")[0]} and {workout.likes.length-1} others like this</Text>
                                                        }  */}
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    }
                                </View>
                            }     
                            </View>
                        }
                        
                    </View>  
                    <View style={{display: 'flex',marginLeft: 5}}>
                        <Pressable onPress={()=>{
                            openWorkoutBox(workout.workout,workout.uid);
                        }}>
                            <Image source={comment} style={styles.commentIcon}/>
                        </Pressable>
                    </View>
                </View>
                
            </Pressable>
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
        let profileUrl = "";

        if(nameSnap.exists()){
            name = nameSnap.data().name;
            profileUrl = nameSnap.data().profileUrl;
        }

        likeArray.push({
            uid: userID,
            name: name,
            profileUrl
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
    
    useEffect(() => {
        const fetchData = async () => {
            await updateWorkouts();
        };
    
        fetchData()
    }, [showWorkoutBox]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const myWorkouts = await getMyWorkouts();
                const followingWorkouts = uid==null ? await getFollowingWorkouts() : [];
    
                const combinedWorkouts = myWorkouts.concat(...followingWorkouts);
                setFollowingUserArray(combinedWorkouts.sort((x, y) => y.timeStamp.toMillis() - x.timeStamp.toMillis()));
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
    
        if(isReload!==undefined){
            fetchData()
        }
    }, [isReload]);

    const returnProfilePic = (url,margin) => {
        if(url=="" || url==undefined){
            return <Image source={pfp} style={{height: 22,width: 22,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7'}}/>
        }
        else{
            return <Image src={url} style={{height: 22,width: 22,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7'}}/>
        }
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
        
        setCurrentDay((new Date()).getDay());
        setCurrentDate((new Date()).getDate())
        setCurrentMonth((new Date()).getMonth()+1)
        setCurrentYear((new Date()).getFullYear())
    }, []);

    const updateCalendarDate = (date) => {
        setCurrentDay(date.day());
        setCurrentDate(date.date())
        setCurrentMonth(date.month()+1)
        setCurrentYear(date.year())
    }
    
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
                {/* <CalendarStrip
                    scrollable
                    style={{height:170,marginTop: 40,marginBottom: 0}}
                    calendarColor={'#fff'}
                    dateNumberStyle={{color: '#898989',fontFamily: 'LeagueSpartan',fontWeight: '600'}}
                    dateNameStyle={{color: '#898989',fontFamily: 'LeagueSpartan',fontSize: 15,marginBottom: 5,fontWeight: '500',borderBottomColor: '#898989',borderBottomWidth: 2,paddingBottom: 4}}
                    numDaysInWeek={5}
                    calendarHeaderContainerStyle={{position: 'absolute',left: 30}}
                    calendarHeaderStyle={{fontFamily: 'LeagueSpartan',fontSize: 20,color: '#1e1e1e',fontWeight: '600'}}
                    startingDate={Date.now()}
                    selectedDate={Date.now()}
                    dayContainerStyle={{backgroundColor: '#f6f6f7',borderRadius: 10,display: 'flex'}}
                    highlightDateContainerStyle={{backgroundColor: '#1e1e1e'}}
                    highlightDateNameStyle={{color: '#fff',fontSize: 15,marginBottom: 7.5,fontWeight: '600',borderBottomColor: '#2B8CFF',borderBottomWidth: 2,paddingBottom: 4}}
                    highlightDateNumberStyle={{color: '#fff'}}
                    dayComponentHeight={75}
                    headerText={`${weekday[currentDay]} ${currentDate} ${months.get(`${currentMonth}`)}, ${currentYear}`}
                    onDateSelected={(date)=>{
                        updateCalendarDate(date);
                    }}
                /> */}
                {
                    !showLikesBool
                    ?
                    <ScrollView contentContainerStyle={styles.workoutContainer}  showsVerticalScrollIndicator={false}>
                        {
                            !showWorkoutBox
                            ?
                            <View style={styles.workoutList}>
                                <View style={{height: '100%',marginTop: 20}}>
                                    <View style={{width: '100%',height: '100%',paddingBottom: 20,}}>
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
                                                                    // check if date is already present in dateGroup in ddmmyyyy format ->
                                                                    !followingDateGroup.has(`${userProfile.timeStamp.toDate().toISOString().slice(8,10)}${userProfile.timeStamp.toDate().toISOString().slice(5,7)}${userProfile.timeStamp.toDate().toISOString().slice(0,4)}`)
                                                                    ?
                                                                    followingGroupByDate(userProfile)
                                                                    :
                                                                    null
                                                                }

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
                                            <View  style={[styles.emptyWorkoutContainer,{paddingTop: 25,paddingBottom: 25,minHeight: 180,display: 'flex',justifyContent: 'space-around',marginTop: 100}]}>
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
                            <IndividualWorkout ID={clickedWorkoutID} showWorkoutBox={setShowWorkoutBox} showNavbar={showNavbar} uid={newUidBool? newUid : uid} hideUserNavbar={hideUserNavbar} followingUserArray={followingUserArray} setFollowingUserArray={setFollowingUserArray}/>
                        }
                    </ScrollView>
                    :
                    <ScrollView contentContainerStyle={{width: '100%',backgroundColor: '#1e1e1e',display: 'flex',marginTop: 40,marginBottom: 50,minHeight: 500,borderRadius: 10,padding: 20}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginBottom: 20}}>
                            <View style={{position: 'absolute',left: 0}}>
                                <Pressable onPress={()=>{
                                    setShowLikesBool(false);
                                }} >
                                    <Image source={backIconWhite} style={{height: 30,width: 30,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
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
                                return(
                                    <View key={user.uid} style={{marginTop: 15,width: '100%'}}>
                                        <View  style={{display: 'flex',flexDirection: 'row',alignItems: 'center',padding: 10,backgroundColor: '#3e3e3e',margin: 7.5,borderRadius: 10,paddingLeft: 15,paddingRight: 15,alignItems: 'center',justifyContent: 'space-between'}}>
                                            <View style={{display:'flex',flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                                                <Pressable onPress={() => {
                                                    navigation.navigate('UserPage')
                                                }}>
                                                    {
                                                        user.profileUrl=="" || user.profileUrl==undefined
                                                        ?
                                                        <Image source={pfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#DDD'}}/>
                                                        :
                                                        <Image src={user.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#DDD'}}/>
                                                    }
                                                </Pressable>
                                                <Text style={{textAlign: 'center',marginLeft: 10,fontSize: 17,color: '#fff',fontWeight: '500',fontFamily:'LeagueSpartan'}}>{user.name}</Text>
                                            </View>
                                            <View style={{marginRight: 10}}>
                                                <Pressable>
                                                    <Image source={likeBlue} style={{height: 20,width: 20}}/>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })
                            :
                            <View style={{display: 'flex',justifyContent: 'center',height: 400,alignItems: 'center',paddingLeft: 10,paddingRight: 10}}>
                                <Text style={{fontSize: 20}}>No one has liked this workout yet.</Text>
                            </View>
                        }
                    </ScrollView>
                }
            </View>
        )
    }
}

export default Workout

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
        color: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Futura-Condensed',
        // borderWidth: 2,
        // borderColor: "#444444",
        // borderRadius: 10,
        fontWeight: '500',
        marginTop: -5
    },
    workoutTime: {
        fontWeight: '500',
        fontSize: 15,
        color: '#DDD',
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
        backgroundColor: '#1e1e1e',
        padding: 10,
        borderRadius: 10,
        marginTop: 10
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