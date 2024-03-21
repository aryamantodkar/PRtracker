import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator, ViewBase } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import IndividualWorkout from './IndividualWorkout';
import { getStorage, ref,uploadBytes,getDownloadURL } from "firebase/storage";
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';



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


const Workout = ({showNavbar,searchParams,uid}) => {
    const [workoutsArray,setWorkoutsArray] = useState([]);
    const [showWorkoutBox,setShowWorkoutBox] = useState(false);
    const [clickedWorkoutID,setClickedWorkoutID] = useState();
    const [isLoading,setIsLoading] = useState(true);
    
    const [myWorkouts,setMyWorkouts] = useState([]);
    const [followingWorkouts,setFollowingWorkouts] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [followingUserArray,setFollowingUserArray] = useState([]);

    const [newUid,setNewUid] = useState('');
    const [newUidBool,setNewUidBool] = useState(false);
    const [showLikesBool,setShowLikesBool] = useState(false);
    const [likedUsers,setLikedUsers] = useState([]);
    const [goToCommentBox,setGoToCommentBox] = useState(false);

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

    const navigation = useNavigation();
    const auth = getAuth();
    const route = useRoute();
    var userID = auth.currentUser.uid;

    // useEffect(() => {
    //     if(uid!=null){
    //         userID = uid;
    //     }
    //     const unsubscribe = navigation.addListener('focus', () => {
    //         setIsLoading(true);
    //         const q = query(collection(FIREBASE_DB, `${userID}`));

    //         const newArray = [];
    
    //         const querySnapshot = getDocs(q)
    //         .then(snap => {
    //             snap.forEach((doc) => {
    //                 newArray.push(doc.data());
    //             });
    //             newArray.sort((x,y) => {
    //                 return y.timeStamp.toMillis() - x.timeStamp.toMillis();
    //             })
    
    //             setWorkoutsArray(newArray);
    //             setIsLoading(false);
    //         })
    //     });
    
    //     return () => {
    //       unsubscribe;
    //     };
    // }, [navigation]);

    const getMyWorkouts = async () => {
        try {
            const q = query(collection(FIREBASE_DB, `${userID}`));
            var array = [];
    
            const userNameRef = doc(FIREBASE_DB, "Users", `${userID}`);
            const userNameRefSnap = await getDoc(userNameRef);
    
            let loggedUserName = "";
            let loggedProfileUrl = "";
    
            if (userNameRefSnap.exists()) {
                loggedUserName = userNameRefSnap.data().name;
                loggedProfileUrl = userNameRefSnap.data().profileUrl;
            }
    
            const querySnapshot = await getDocs(q); // Await the result
            querySnapshot.forEach((doc) => {
                array.push({
                    timeStamp: doc.data().timeStamp,
                    workout: doc.data(),
                    uid: userID,
                    name: loggedUserName,
                    likes: doc.data().likes,
                    comments: doc.data().comments,
                    profileUrl: loggedProfileUrl
                });
            });
            setMyWorkouts(array);
        } catch (error) {
            console.error("Error fetching my workouts: ", error);
        }
    };
    
    const getFollowingWorkouts = async () => {
        try {
            const docRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
            const docSnap = await getDoc(docRef);
    
            var array = [];
            if (docSnap.exists()) {
                let followingArray = docSnap.data().following;
    
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
    
                    const querySnapshot = await getDocs(q); // Await the result
                    querySnapshot.forEach((doc) => {
                        array.push({
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
                setFollowingWorkouts(array);
            }
        } catch (error) {
            console.error("Error fetching following workouts: ", error);
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([getMyWorkouts(), getFollowingWorkouts()]);
            setDataLoaded(true);
        };

        fetchData().then(() => {
            setIsLoading(false); // Set loading to false after both functions have completed
        });
    }, []);
    
    useEffect(() => {
        if (dataLoaded) {
            setFollowingUserArray([...myWorkouts, ...followingWorkouts].sort((x, y) => y.timeStamp.toMillis() - x.timeStamp.toMillis()));
        }
    }, [myWorkouts, followingWorkouts, dataLoaded]);

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
        const fetchData = async () => {
            setIsLoading(true);
            await searchWorkouts();
            setIsLoading(false);
        };
    
        fetchData();
    }, [searchParams]);
    
    

    const openWorkoutBox = (workout,tempUid = null) => {
        if(uid==null){
            showNavbar(false);
        }

        if(tempUid!=null){
            setNewUidBool(true);
            setNewUid(tempUid)
        }

        setClickedWorkoutID(workout.id);
        setShowWorkoutBox(true);
    }

    const groupByDate = (workout) => {
        dateGroup.set(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`,'1')
        return(
            <View style={{marginTop: 15,borderColor: '#E7E7E7',borderWidth: 1,padding: 10,paddingLeft: 15,paddingRight: 15,alignSelf: 'flex-start',borderRadius: 15,backgroundColor: '#f5f4f4'}}>
                <Text style={{fontSize: 15,color: '#444444',fontWeight: '500'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
                    {/* last digit(1,2,3,...9) ? st/nd/rd : th */}
                    {dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)}
                </Text>
            </View>
        )
    }

    const followingGroupByDate = (workout) => {
        followingDateGroup.set(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`,'1')
        UserGroup.clear();
        return(
            <View style={{marginBottom: 20,padding: 10,paddingLeft: 15,paddingRight: 15,alignSelf: 'flex-start',borderRadius: 5,backgroundColor: '#f6f6f7'}}>
                <Text style={{fontSize: 15,color: '#353F4E',fontWeight: '500'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
                    {/* last digit(1,2,3,...9) ? st/nd/rd : th */}
                    {dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)}
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
                <Pressable onPress={()=>{
                    navigation.navigate('IndividualUser',{
                        uid: profileUid,
                        name: workout.name,
                        })
                    }} style={{position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between',marginBottom: 15}}>
                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                            {
                                workout.profileUrl=="" || workout.profileUrl==undefined
                                ?
                                <Image source={pfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 1.5,borderColor: '#DDD'}}/>
                                :
                                <Image src={workout.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 1.5,borderColor: '#DDD'}}/>
                            }
                            <Text style={{color: '#fff',fontSize: 18,marginLeft: 10,fontWeight: '500',fontFamily: 'LeagueSpartan-Medium'}}>{workout.name}</Text>
                        </View>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                            {
                                workout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                ?
                                <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                :
                                <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                            }       
                        </View>
                </Pressable>
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
            setIsLoading(true);
            await updateWorkouts();
            setIsLoading(false);
        };
    
        fetchData();
    }, [showWorkoutBox]);

    // console.log("foll",followingUserArray)

    const returnProfilePic = (url,margin) => {
        if(url=="" || url==undefined){
            return <Image source={pfp} style={{height: 22,width: 22,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7',marginLeft: margin}}/>
        }
        else{
            return <Image src={url} style={{height: 22,width: 22,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7',marginLeft: margin}}/>
        }
    }

    const showLikes = async (likes) => {
        setShowLikesBool(true);
        setLikedUsers(likes);
    }

    

    if(isLoading){
        return(
            <View >
                <ActivityIndicator size="large" color="#000"/>
            </View>
        )
    }
    else{
        return (
            <View style={{display: 'flex',justifyContent: 'center',marginTop: 'auto',marginBottom: 'auto',marginTop: 0,flex: 1}}>
                {
                    !showLikesBool
                    ?
                    <ScrollView contentContainerStyle={workoutsArray!=undefined && workoutsArray.length>0 ? styles.workoutContainer : styles.emptyWorkoutBox}  showsVerticalScrollIndicator={false}>
                        {
                            !showWorkoutBox
                            ?
                            <View style={workoutsArray!=undefined && workoutsArray.length>0 ? styles.workoutList : styles.emptyWorkoutList}>
                                <View style={{marginTop: 20}}>
                                    <View style={{width: '100%',paddingBottom: 20,}}>
                                        {
                                            followingUserArray.length>0
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
                                            <View  style={[styles.emptyWorkoutContainer,{width: '80%',backgroundColor: '#f5f4f4',paddingTop: 25,paddingBottom: 25,marginTop: 150}]}>
                                                <Image source={sadSmiley} style={{height: 40, width: 40,marginLeft: 'auto',marginRight: 'auto',marginBottom: 10}}/>
                                                <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                    <Text style={{color: 'black',marginLeft: 10,fontSize: 15,fontWeight: '400',color: '#000'}}>Please start following people to view their workouts here :)</Text>
                                                </View>
                                            </View>
                                            
                                        }
                                    </View>
                                </View>
                            </View>
                            :
                            <IndividualWorkout ID={clickedWorkoutID} showWorkoutBox={setShowWorkoutBox} showNavbar={showNavbar} uid={newUidBool? newUid : uid}/>
                        }
                    </ScrollView>
                    :
                    <ScrollView contentContainerStyle={{width: '100%',display: 'flex',marginTop: 20,marginBottom: 50,minHeight: 500,borderRadius: 10,padding: 20}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginBottom: 20}}>
                            <View style={{position: 'absolute',left: 0}}>
                                <Pressable onPress={()=>{
                                    setShowLikesBool(false);
                                }} >
                                    <Image source={backIconBlack} style={{height: 30,width: 30,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                                </Pressable>
                            </View>
                            <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                                <Text style={{display: 'flex',textAlign: 'center',fontSize: 20,fontWeight: '500',borderBottomColor: 'black',borderBottomWidth: 2,color: 'black'}}>Likes</Text>
                            </View>
                        </View>
                        {
                            likedUsers.length>0
                            ?
                            likedUsers.map(user => {
                                return(
                                    <View key={user.uid} style={{marginTop: 15,borderRadius:25,backgroundColor: '#f5f4f4',borderWidth: 1,borderColor: '#DDD',width: '100%'}}>
                                        <View  style={{display: 'flex',flexDirection: 'row',alignItems: 'center',padding: 7.5,backgroundColor: 'white',margin: 7.5,borderRadius: 20,elevation: 5,paddingLeft: 10,paddingRight: 10,alignItems: 'center',justifyContent: 'space-between'}}>
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
                                                <Text style={{textAlign: 'center',marginLeft: 10,fontSize: 15,color: '#444444',fontWeight: '500'}}>{user.name}</Text>
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
        marginTop: 10,
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
        backgroundColor: '#f5f4f4',
        borderRadius: 20,
        marginTop: 125,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 20,
        justifyContent: 'center',
    },
    
})