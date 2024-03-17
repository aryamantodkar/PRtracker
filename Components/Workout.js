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
    const [isLoading,setIsLoading] = useState(false);
    const [myWorkoutsBool,setMyWorkoutsBool] = useState(true);
    const [originalWorkoutArray,setOriginalWorkoutArray] = useState([]);
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

    useEffect(() => {
        if(uid!=null){
            userID = uid;
        }
        const unsubscribe = navigation.addListener('focus', () => {
            setIsLoading(true);
            const q = query(collection(FIREBASE_DB, `${userID}`));

            const newArray = [];
    
            const querySnapshot = getDocs(q)
            .then(snap => {
                snap.forEach((doc) => {
                    newArray.push(doc.data());
                });
                newArray.sort((x,y) => {
                    return y.timeStamp.toMillis() - x.timeStamp.toMillis();
                })
    
                setWorkoutsArray(newArray);
                setIsLoading(false);
            })
        });
    
        return () => {
          unsubscribe;
        };
    }, [navigation]);

    useEffect(() => {
            setIsLoading(true); 
            const q = query(collection(FIREBASE_DB, `${userID}`));

            const newArray = [];
    
            const querySnapshot = getDocs(q)
            .then(snap => {
                snap.forEach((doc) => {
                    newArray.push(doc.data());
                });
                newArray.sort((x,y) => {
                    return y.timeStamp.toMillis() - x.timeStamp.toMillis();
                })
    
                setWorkoutsArray(newArray);
                setIsLoading(false);
            })
    }, []);

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
            <View style={{marginTop: 15,marginBottom: 10,padding: 10,paddingLeft: 15,paddingRight: 15,alignSelf: 'flex-start',borderRadius: 15,borderColor: '#353F4E',borderWidth: 2}}>
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
            }} style={{display: 'flex',justifyContent: 'space-between',flexDirection: 'column',backgroundColor: '#1e1e1e',padding: 15,paddingLeft: 20,paddingRight: 20,height: 130,borderRadius: 10,elevation: 5,borderWidth: 1,borderColor: '#A5A5A5'}}>
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
                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
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
                    }} style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'}}>
                    <View style={{display:'flex',alignItems: 'center',justifyContent: 'center'}}>
                        <Text style={styles.workoutTitle}>{workout.workout.workoutName}</Text>
                    </View>
                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                        {
                            workout.workout.allWorkouts.length>1
                            ?
                            <Text style={{fontSize: 14,color: '#DDD',fontWeight: '500',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center'}}>{workout.workout.allWorkouts.length} Exercises</Text>
                            :
                            <Text style={{fontSize: 14,color: '#DDD',fontWeight: '500',display: 'flex',justifyContent: 'center',alignItems: 'center',textAlignVertical: 'center'}}>{workout.workout.allWorkouts.length} Exercise</Text>
                        }
                    </View>
                </Pressable>
            </Pressable>
        )
    }

    useEffect(()=>{
        const q = query(collection(FIREBASE_DB, `${userID}`));

        const newArray = [];

        const querySnapshot = getDocs(q)
        .then(snap => {
            snap.forEach((doc) => {
                newArray.push(doc.data());
            });
            newArray.sort((x,y) => {
                return y.timeStamp.toMillis() - x.timeStamp.toMillis();
            })

            setOriginalWorkoutArray(newArray);


            if(searchParams==""){
                setWorkoutsArray(originalWorkoutArray);
            }
            else{
                const filterBySearch = originalWorkoutArray.filter((item) => {
                    let search = false;
                    item.allWorkouts.map(workout => {
                        if (workout.exerciseName.toLowerCase()
                            .includes(searchParams.toLowerCase())){search = true}
                    })
                    if (item.workoutName.toLowerCase()
                        .includes(searchParams.toLowerCase())|| search) { return item; }
                })
                setWorkoutsArray(filterBySearch);
            }
        })

        
    },[searchParams]);

    const getFollowing = async () => {
        const docRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
        const docSnap = await getDoc(docRef);

        var newArray = [];

        if (docSnap.exists()) {
            let followingArray = docSnap.data().following

            followingArray.map(async (following) => {

                const q = query(collection(FIREBASE_DB, `${following}`));
                const nameRef = doc(FIREBASE_DB, "Users", `${following}`);
                const nameSnap = await getDoc(nameRef);
                
                let name = "";

                if(nameSnap.exists()){
                    name = nameSnap.data().name;
                }

                let profileUrl = "";

                const profilePicRef = doc(FIREBASE_DB, "Users", `${following}`);
                const profilePicSnap = await getDoc(profilePicRef);

                if(profilePicSnap.exists()){
                    profileUrl = profilePicSnap.data().profileUrl;
                }

                const querySnapshot = getDocs(q)
                .then((snap) => {
                    snap.forEach((doc) => {
                        newArray.push({
                            timeStamp: doc.data().timeStamp,
                            workout: doc.data(),
                            uid: following,
                            name: name,
                            likes: doc.data().likes,
                            comments: doc.data().comments,
                            profileUrl: profileUrl
                        })
                    });
                    
                    newArray.sort((x,y) => {
                        return y.timeStamp.toMillis() - x.timeStamp.toMillis();
                    })
                })
            })
            setFollowingUserArray(newArray);
        }
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
        setIsLoading(true);
        const docRef = doc(FIREBASE_DB, "Users", `${auth.currentUser.uid}`);
        const docSnap = await getDoc(docRef);

        var newArray = [];

        if (docSnap.exists()) {
            let followingArray = docSnap.data().following

            followingArray.map(async (following) => {
                const q = query(collection(FIREBASE_DB, `${following}`));
                const nameRef = doc(FIREBASE_DB, "Users", `${following}`);
                const nameSnap = await getDoc(nameRef);
                
                let name = "";

                if(nameSnap.exists()){
                    name = nameSnap.data().name;
                }

                var newArray = followingUserArray;

                let docID = "";
                let docUid = "";

                const querySnapshot = getDocs(q)
                .then(async (snap) => {
                    snap.forEach((doc) => {
                        if(clickedWorkoutID == doc.data().id){
                            docID = doc.id;
                            docUid = following;
                        }
                    });

                    if(docID!="" && docUid!=""){
                        const getClickedDoc = doc(FIREBASE_DB, `${docUid}`, `${docID}`);
                        const getClickedDocSnap = await getDoc(getClickedDoc);

                        if (getClickedDocSnap.exists()) {
                            newArray = newArray.map(user => {
                                if(user.workout.id == getClickedDocSnap.data().id){
                                    return{
                                        ...user,
                                        workout: getClickedDocSnap.data(),
                                        likes: getClickedDocSnap.data().likes,
                                        comments: getClickedDocSnap.data().comments
                                    }
                                }
                                else{
                                    return user;
                                }
                            });
        
                        }
                    }

                    setFollowingUserArray(newArray)
                    setIsLoading(false);
                })
            })
        }
    }

    const returnProfilePic = (url,margin) => {
        if(url=="" || url==undefined){
            return <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7',marginLeft: margin}}/>
        }
        else{
            return <Image src={url} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7',marginLeft: margin}}/>
        }
    }

    const showLikes = async (likes) => {
        setShowLikesBool(true);
        setLikedUsers(likes);
    }

    useEffect(()=>{
        getFollowing();    
    },[])

    useEffect(()=>{
        if(followingUserArray.length>0){
            updateWorkouts();
        }
    },[showWorkoutBox])

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
                        {
                            uid==null
                            ?
                            <View style={{marginTop: 10,marginBottom: 10}}>
                                {
                                    myWorkoutsBool
                                    ?
                                    <View style={{display: 'flex',flexDirection: 'row',marginBottom: 20,alignItems: 'center',marginLeft: 'auto',marginRight: 'auto',backgroundColor: '#1e1e1e',borderRadius: 30}}>
                                        <View style={{paddingLeft: 30,paddingRight: 30,marginLeft: 5}}>
                                            <Pressable onPress={()=>{
                                                setMyWorkoutsBool(false);
                                            }}>
                                                <Text style={{color: '#fff',fontSize: 15,fontWeight: '500'}}>Following</Text>
                                            </Pressable>
                                        </View>
                                        <View style={{backgroundColor: '#3E3E3E',padding: 7.5,borderRadius: 30,paddingLeft: 25,paddingRight: 25,margin: 5,elevation: 5}}>
                                            <Pressable onPress={()=>{
                                                setMyWorkoutsBool(true);
                                            }}>
                                                <Text style={{color: '#fff',fontSize: 15,fontWeight: '500'}}>My Workouts</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                    :
                                    <View style={{display: 'flex',flexDirection: 'row',marginBottom: 20,alignItems: 'center',marginLeft: 'auto',marginRight: 'auto',backgroundColor: '#1e1e1e',borderRadius: 30}}>
                                        <View style={{backgroundColor: '#3E3E3E',padding: 7.5,borderRadius: 30,paddingLeft: 30,paddingRight: 30,margin: 5,elevation: 5}}>
                                            <Pressable onPress={()=>{
                                                setMyWorkoutsBool(false);
                                            }}>
                                                <Text style={{color: '#fff',fontSize: 15,fontWeight: '500'}}>Following</Text>
                                            </Pressable>
                                        </View>
                                        <View style={{marginRight: 0,paddingLeft: 30,paddingRight: 30}}>
                                            <Pressable onPress={()=>{
                                                setMyWorkoutsBool(true);
                                            }}>
                                                <Text style={{color: '#fff',fontSize: 15,fontWeight: '500'}}>My Workouts</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                }

                            </View>
                            :
                            null
                        }

                        {
                            myWorkoutsBool
                            ?
                            <View style={{width: '100%',marginTop: -10,paddingBottom: 20}}>
                                {
                                    workoutsArray!=undefined && workoutsArray.length>0
                                    ?
                                    workoutsArray.map(workout => {
                                        return(
                                            isLoading
                                            ?
                                            <View key={workout.id} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '80%'}}>
                                                <ActivityIndicator size="large" color="#000"/>
                                            </View>
                                            :
                                            <View key={workout.id}>
                                                {
                                                    // check if date is already present in dateGroup in ddmmyyyy format ->
                                                    !dateGroup.has(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`)
                                                    ?
                                                    groupByDate(workout)
                                                    :
                                                    null
                                                }
                                                
                                                <View style={styles.workout}>
                                                    <Pressable onPress={() => {
                                                        openWorkoutBox(workout);
                                                    }} >
                                                        <View>
                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',backgroundColor: '#3A3A3A',padding: 5,paddingLeft: 15,elevation: 5,paddingRight: 15,borderRadius: 15,borderWidth: 1.5,borderColor: 'white'}}>
                                                                <View style={styles.workoutTitleContainer}>
                                                                    <Image source={dumbell} style={styles.workoutIcon}/>
                                                                    <Text style={styles.workoutTitle}>{workout.workoutName}</Text>
                                                                </View>
                                                                <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                    {
                                                                        workout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                                                        ?
                                                                        <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                                                        :
                                                                        <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                                                    }       
                                                                </View>
                                                            </View>
                                                        </View>
                                                        
                                                        <View>
                                                            <View style={styles.exerciseList}>
                                                                {
                                                                    workout.allWorkouts.map(exercise => {
                                                                        return(
                                                                            <View style={styles.exerciseName} key={exercise.id}>
                                                                                <Text style={{borderBottomColor: '#fff',borderBottomWidth: 2,fontSize: 17,paddingBottom: 5,color: 'white'}}>{exercise.exerciseName}</Text>
                                                                                <Text style={{fontSize: 17,color: 'white',padding: 5}}> x {exercise.allSets.length}</Text>
                                                                            </View>
                                                                        )
                                                                    })
                                                                }
                                                            </View>

                                                            {/* display likes for my workouts */}
                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',padding: 10}}>
                                                                {
                                                                    workout.likes.length>2
                                                                    ?
                                                                    <View>
                                                                        <Pressable onPress={()=>{
                                                                            showLikes(workout.likes);
                                                                        }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                            {
                                                                                returnProfilePic(workout.likes[0].profileUrl,0)
                                                                            }
                                                                            {
                                                                                returnProfilePic(workout.likes[1].profileUrl,-10)
                                                                            }
                                                                            {
                                                                                returnProfilePic(workout.likes[2].profileUrl,-10)
                                                                            }
                                                                            {
                                                                                workout.likes.some(e => e.uid == `${userID}`)
                                                                                ?
                                                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {workout.likes.length-1} others like this</Text>
                                                                                :
                                                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name.split(" ")[0]} and {workout.likes.length-1} others like this</Text>
                                                                            }
                                                                        </Pressable>
                                                                    </View>
                                                                    :
                                                                    <View>
                                                                    {
                                                                        workout.likes.length>1
                                                                        ?
                                                                        <View>
                                                                            <Pressable onPress={()=>{
                                                                                showLikes(workout.likes);
                                                                            }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                {
                                                                                    returnProfilePic(workout.likes[0].profileUrl,0)
                                                                                }
                                                                                {
                                                                                    returnProfilePic(workout.likes[1].profileUrl,-10)
                                                                                }
                                                                                {
                                                                                    workout.likes.some(e => e.uid == `${userID}`)
                                                                                    ?
                                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {workout.likes.length-1} others like this</Text>
                                                                                    :
                                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name.split(" ")[0]} and {workout.likes.length-1} others like this</Text>
                                                                                } 
                                                                            </Pressable>
                                                                        </View>
                                                                        :
                                                                        <View>
                                                                            {
                                                                                workout.likes.length>0
                                                                                ?
                                                                                <View>
                                                                                    <Pressable onPress={()=>{
                                                                                        showLikes(workout.likes);
                                                                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                        {
                                                                                            returnProfilePic(workout.likes[0].profileUrl,0)
                                                                                        }
                                                                                        {
                                                                                            workout.likes[0].uid==userID
                                                                                            ?
                                                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You like this</Text>
                                                                                            :
                                                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{workout.likes[0].name} likes this</Text>
                                                                                        }                                       
                                                                                    </Pressable>
                                                                                </View>
                                                                                :
                                                                                <View>
                                                                                    <Pressable style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>0 likes</Text>
                                                                                    </Pressable>
                                                                                </View>
                                                                            }
                                                                        </View>
                                                                    }     
                                                                    </View>
                                                                }
                                                                
                                                            </View>

                                                            <View style={styles.interactComponent}>
                                                                <Pressable onPress={()=>{
                                                                    showLikes(workout.likes);
                                                                }}>
                                                                    <Image source={like} style={styles.likeIcon}/>
                                                                </Pressable>
                                                                <Pressable onPress={()=>{
                                                                    openWorkoutBox(workout);
                                                                }}>
                                                                    <Image source={comment} style={styles.commentIcon}/>
                                                                </Pressable>
                                                            </View>
                                                        </View>

                                                    </Pressable>
                                                    
                                                    
                                                    
                                                </View>
                                            </View>
                                        )
                                    })
                                    :
                                    <View  style={styles.emptyWorkoutContainer}>
                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginBottom: 25}}>
                                            <Image source={workoutBlack} style={{height: 30, width: 30}}/>
                                            <Text style={{marginLeft: 10,fontSize: 15,fontWeight: '500',color: '#444444'}}>No Workouts Found</Text>
                                        </View>
                                        {
                                            uid==null
                                            ?
                                            <View style={{display:'flex',alignItems: 'center',justifyContent: 'center'}}> 
                                                <Text style={{color: 'black',fontSize: 14,fontWeight: '500',color: '#4F4F4F',width: '85%',textAlign: 'center'}}>Please start adding workouts to view them here.</Text>
                                            </View>
                                            :
                                            <View style={{display:'flex',alignItems: 'center',justifyContent: 'center',}}> 
                                                <Text style={{color: 'black',fontSize: 14,fontWeight: '500',color: '#4F4F4F',width: '85%',textAlign: 'center'}}>They haven't added any workouts yet.</Text>
                                            </View>
                                        }   
                                    </View>
                                }
                            </View>
                            : 
                            <View>
                                {
                                    !isLoading
                                    ?
                                    <View style={{width: '100%',paddingBottom: 20,}}>
                                        {
                                            followingUserArray.length>0
                                            ?
                                            <View style={{width: '100%'}}>
                                                {
                                                    followingUserArray.map(userProfile => {
                                                        return(
                                                            <View style={{}}  key={userProfile.timeStamp}>
                                                                {/* {
                                                                    // check if date is already present in dateGroup in ddmmyyyy format ->
                                                                    !followingDateGroup.has(`${userProfile.timeStamp.toDate().toISOString().slice(8,10)}${userProfile.timeStamp.toDate().toISOString().slice(5,7)}${userProfile.timeStamp.toDate().toISOString().slice(0,4)}`)
                                                                    ?
                                                                    followingGroupByDate(userProfile)
                                                                    :
                                                                    null
                                                                } */}

                                                                {
                                                                    groupByUser(userProfile,userProfile.uid)
                                                                }
                                                                
                                                                <View style={{marginBottom: 30}} key={userProfile.workout.id}>
                                                                    <ScrollView style={styles.workout}>
                                                                        {/* {
                                                                            // check if date is already present in dateGroup in ddmmyyyy format ->
                                                                            !UserGroup.has(`${userProfile.name}`)
                                                                            ?
                                                                            groupByUser(userProfile,userProfile.uid)
                                                                            :
                                                                            null
                                                                        } */}
                                                                        
                                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                            <ScrollView  onPress={() => {
                                                                                openWorkoutBox(userProfile.workout,userProfile.uid);
                                                                            }}  contentContainerStyle={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',minHeight: 150}}>
                                                                                    <View style={{display: 'flex',overflow: 'scroll',flex: 1,justifyContent: 'center',height: '100%'}} onStartShouldSetResponder={() => true}>
                                                                                        <ScrollView contentContainerStyle={styles.exerciseList} horizontal={true}>
                                                                                            {
                                                                                                userProfile.workout.allWorkouts.map(exercise => {
                                                                                                    return(
                                                                                                        <View key={exercise.id} style={{borderRadius: 15,marginRight: 10,height: '100%'}}>
                                                                                                            <Pressable onPress={() => {
                                                                                                                openWorkoutBox(userProfile.workout,userProfile.uid);
                                                                                                            }} style={styles.exerciseName} key={exercise.id}>
                                                                                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',flexWrap: 'wrap',alignItems: 'center'}}>
                                                                                                                    <View style={{borderBottomWidth: 2,borderBottomColor: '#337CEA'}}>
                                                                                                                        <Text style={{fontSize: 22,color: '#ddd',fontWeight: '600',paddingBottom: 5,fontFamily: 'LeagueSpartan-Medium'}}>{exercise.exerciseName}</Text>
                                                                                                                    </View>
                                                                                                                    {/* <Text style={{display: 'flex',fontSize: 16,color: '#FFF',textAlignVertical: 'center'}}> x {exercise.allSets.length}</Text> */}
                                                                                                                </View>
                                                                                                                <View style={{marginTop: 25,display: 'flex'}}>
                                                                                                                    {
                                                                                                                        exercise.allSets.map(set => {
                                                                                                                            return(
                                                                                                                                <Text key={set.id} style={{fontSize: 18,color: '#AFAFAF',marginBottom: 20,fontFamily: 'LeagueSpartan-Medium'}}>{set.weight} kg x {set.reps}</Text>
                                                                                                                            )
                                                                                                                        })
                                                                                                                    }
                                                                                                                </View>
                                                                                                                
                                                                                                            </Pressable>
                                                                                                        </View>
                                                                                                    )
                                                                                                })
                                                                                            }
                                                                                        </ScrollView>
                                                                                    </View>
                                                                                
                                                                                
                                                                            </ScrollView >
                                                                        </View>
                                                                        
                                                                    </ScrollView>
                                                                    <View style={styles.interactComponent}>
                                                                        {/* display likes */}
                                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                            {
                                                                                userProfile.likes.length>2
                                                                                ?
                                                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                    <View style={{display: 'flex',marginRight: 5}}>
                                                                                        <Pressable onPress={()=>{
                                                                                            showLikes(userProfile.likes);
                                                                                        }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                            
                                                                                                {
                                                                                                    userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                    ?
                                                                                                    <Pressable onPress={()=>{
                                                                                                        unlikeWorkout(userProfile);
                                                                                                    }}>
                                                                                                        <Image source={likeBlue} style={styles.likeIcon}/>
                                                                                                    </Pressable>
                                                                                                    :
                                                                                                    <Pressable onPress={()=>{
                                                                                                        likeWorkout(userProfile);
                                                                                                    }}>
                                                                                                        <Image source={like} style={styles.likeIcon}/>
                                                                                                    </Pressable>
                                                                                                }
                                                                                                {
                                                                                                    returnProfilePic(userProfile.likes[0].profileUrl,0)
                                                                                                }
                                                                                                {
                                                                                                    returnProfilePic(userProfile.likes[1].profileUrl,-10)
                                                                                                }
                                                                                                {
                                                                                                    returnProfilePic(userProfile.likes[2].profileUrl,-10)
                                                                                                }
                                                                                        </Pressable>
                                                                                    </View>
                                                                                
                                                                                    
                                                                                    {/* {
                                                                                        userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                        ?
                                                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {userProfile.likes.length-1} others like this</Text>
                                                                                        :
                                                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name.split(" ")[0]} and {userProfile.likes.length-1} others like this</Text>
                                                                                    } */}
                                                                                    
                                                                                </View>
                                                                                :
                                                                                <View style={{}}>
                                                                                {
                                                                                    userProfile.likes.length>1
                                                                                    ?
                                                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                        <View style={{display: 'flex',marginRight: 5}}>
                                                                                            <Pressable onPress={()=>{
                                                                                                showLikes(userProfile.likes);
                                                                                            }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                                <View style={{display: 'flex',flexDirection: 'row'}}>
                                                                                                    {
                                                                                                        userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                        ?
                                                                                                        <Pressable onPress={()=>{
                                                                                                            unlikeWorkout(userProfile);
                                                                                                        }}>
                                                                                                            <Image source={likeBlue} style={styles.likeIcon}/>
                                                                                                        </Pressable>
                                                                                                        :
                                                                                                        <Pressable onPress={()=>{
                                                                                                            likeWorkout(userProfile);
                                                                                                        }}>
                                                                                                            <Image source={like} style={styles.likeIcon}/>
                                                                                                        </Pressable>
                                                                                                    }
                                                                                                    {
                                                                                                        returnProfilePic(userProfile.likes[0].profileUrl,0)
                                                                                                    }
                                                                                                    {
                                                                                                        returnProfilePic(userProfile.likes[1].profileUrl,-10)
                                                                                                    }
                                                                                                </View>
                                                                                                
                                                                                                {/* {
                                                                                                    userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                    ?
                                                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {userProfile.likes.length-1} others like this</Text>
                                                                                                    :
                                                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name.split(" ")[0]} and {userProfile.likes.length-1} others like this</Text>
                                                                                                }  */}
                                                                                            </Pressable>
                                                                                        </View>
                                                                                    </View>
                                                                                    :
                                                                                    <View style={{}}>
                                                                                        {
                                                                                            userProfile.likes.length>0
                                                                                            ?
                                                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                                <View style={{display: 'flex',marginRight: 5}}>
                                                                                                    <Pressable onPress={()=>{
                                                                                                        showLikes(userProfile.likes);
                                                                                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                                        <View style={{display: 'flex',flexDirection: 'row'}}>
                                                                                                            {
                                                                                                                userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                                ?
                                                                                                                <Pressable onPress={()=>{
                                                                                                                    unlikeWorkout(userProfile);
                                                                                                                }}>
                                                                                                                    <Image source={likeBlue} style={styles.likeIcon}/>
                                                                                                                </Pressable>
                                                                                                                :
                                                                                                                <Pressable onPress={()=>{
                                                                                                                    likeWorkout(userProfile);
                                                                                                                }}>
                                                                                                                    <Image source={like} style={styles.likeIcon}/>
                                                                                                                </Pressable>
                                                                                                            }
                                                                                                            {
                                                                                                                returnProfilePic(userProfile.likes[0].profileUrl,0)
                                                                                                            }
                                                                                                        </View>
                                                                                                        
                                                                                                        {/* {
                                                                                                            userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                            ?
                                                                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {userProfile.likes.length-1} others like this</Text>
                                                                                                            :
                                                                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name.split(" ")[0]} and {userProfile.likes.length-1} others like this</Text>
                                                                                                        }  */}
                                                                                                    </Pressable>
                                                                                                </View>
                                                                                            </View>
                                                                                            :
                                                                                            <View style={{}}>
                                                                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                                    <View style={{display: 'flex',marginRight: 5}}>
                                                                                                        <Pressable onPress={()=>{
                                                                                                            showLikes(userProfile.likes);
                                                                                                        }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                                                                                            <View style={{display: 'flex',flexDirection: 'row'}}>
                                                                                                                {
                                                                                                                    userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                                    ?
                                                                                                                    <Pressable onPress={()=>{
                                                                                                                        unlikeWorkout(userProfile);
                                                                                                                    }}>
                                                                                                                        <Image source={likeBlue} style={styles.likeIcon}/>
                                                                                                                    </Pressable>
                                                                                                                    :
                                                                                                                    <Pressable onPress={()=>{
                                                                                                                        likeWorkout(userProfile);
                                                                                                                    }}>
                                                                                                                        <Image source={like} style={styles.likeIcon}/>
                                                                                                                    </Pressable>
                                                                                                                }
                                                                                                            </View>
                                                                                                            
                                                                                                            {/* {
                                                                                                                userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                                ?
                                                                                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {userProfile.likes.length-1} others like this</Text>
                                                                                                                :
                                                                                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name.split(" ")[0]} and {userProfile.likes.length-1} others like this</Text>
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
                                                                                openWorkoutBox(userProfile.workout,userProfile.uid);
                                                                            }}>
                                                                                <Image source={comment} style={styles.commentIcon}/>
                                                                            </Pressable>
                                                                        </View>
                                                                    </View>
                                                                    
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
                                    :
                                    <View >
                                        <ActivityIndicator size="large" color="#000"/>
                                    </View>
                                }
                            </View>
                            
                        }
                        
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
        marginTop: 15,
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
        color: '#5096FF',
        textAlign: 'center',
        textAlignVertical: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'LeagueSpartan-Medium',
        // borderWidth: 2,
        // borderColor: "#444444",
        // borderRadius: 10,
        fontWeight: '500',
        marginTop: -5
    },
    workoutTime: {
        fontWeight: '500',
        fontSize: 14,
        color: '#DDD',
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
        backgroundColor: '#f5f4f4',
        padding: 10,
        marginTop: 10,
        borderRadius: 10,
    },
    likeIcon: {
        height: 25,
        width: 25,
        marginRight: 5
    },
    commentIcon: {
        height: 24,
        width: 24,
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