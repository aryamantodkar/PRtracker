import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator, ViewBase } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import IndividualWorkout from './IndividualWorkout';
import { getStorage, ref,uploadBytes,getDownloadURL } from "firebase/storage";

const dumbell = require("../assets/dumbell.png");
const like = require("../assets/like-icon-outline.png");
const likeBlack = require("../assets/like-icon-outline-black.png");
const likeBlue = require("../assets/like-icon-blue.png");
const comment = require("../assets/comment-icon.png");
const workoutBlack = require("../assets/workout-icon-black.png");
const sadSmiley = require("../assets/sad-smiley-icon.jpg");
const pfp = require("../assets/pfp.jpg");
const crossIcon = require("../assets/cross-icon-black.png");
const backIconBlack = require("../assets/back-arrow-icon.png");


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
    const [likedUsers,setLikesUsers] = useState([]);
    const [goToCommentBox,setGoToCommentBox] = useState(false);

    const storage = getStorage();

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
            <View style={{marginTop: 15,borderColor: '#EFEFEF',borderWidth: 2,padding: 10,alignSelf: 'flex-start',borderRadius: 10,backgroundColor: '#f5f4f4'}}>
                <Text style={{fontSize: 17,color: '#404040',fontWeight: '500'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
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
            <View style={{marginTop: 15,marginBottom: 10,borderColor: '#EFEFEF',borderWidth: 2,padding: 10,alignSelf: 'flex-start',borderRadius: 10,backgroundColor: '#f5f4f4'}}>
                <Text style={{fontSize: 17,color: '#404040',fontWeight: '500'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
                    {/* last digit(1,2,3,...9) ? st/nd/rd : th */}
                    {dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)}
                </Text>
            </View>
        )
    }

    const groupByUser = (workout,profileUid) => {
        UserGroup.set(`${workout.name}`,'1')
        return(
            <Pressable onPress={()=>{
                navigation.navigate('IndividualUser',{
                    uid: profileUid,
                    name: workout.name,
                })
            }} style={{marginTop: 15,display: 'flex',flexDirection: 'row',alignItems: 'center',padding: 10,borderRadius: 10,backgroundColor: '#018FF5',borderWidth: 1,borderColor: '#DDD'}}>
                {
                    workout.profileUrl=="" || workout.profileUrl==undefined
                    ?
                    <Image source={pfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: 'white'}}/>
                    :
                    <Image src={workout.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: 'white'}}/>
                }
                <Text style={{color: 'white',fontSize: 16,marginLeft: 10,fontWeight: '500',borderBottomColor: 'white',borderBottomWidth: 2,paddingBottom: 5}}>{workout.name}</Text>
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

        if(nameSnap.exists()){
            name = nameSnap.data().name;
        }

        likeArray.push({
            uid: userID,
            name: name
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
            return <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: margin}}/>
        }
        else{
            return <Image src={url} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: margin}}/>
        }
    }

    const showLikes = async (likes) => {
        setShowLikesBool(true);
        setLikesUsers(likes);
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
    <View style={{display: 'flex',justifyContent: 'center',marginTop: 'auto',marginBottom: 'auto',marginTop: 0}}>
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
                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 20,alignItems: 'center',marginLeft: 'auto',marginRight: 'auto'}}>
                                        <Pressable onPress={()=>{
                                            setMyWorkoutsBool(false);
                                        }} style={{borderBottomWidth: 2,borderBottomColor: '#DDD',paddingBottom: 10,marginLeft: 25,marginRight: 25}}>
                                            <Text style={{color: '#000',fontSize: 18}}>Following</Text>
                                        </Pressable>
                                        <Pressable onPress={()=>{
                                            setMyWorkoutsBool(true);
                                        }} style={{borderBottomWidth: 2,borderBottomColor: 'black',paddingBottom: 10,marginLeft: 25,marginRight: 25}}>
                                            <Text style={{color: '#000',fontSize: 18,fontWeight: '600'}}>My Workouts</Text>
                                        </Pressable>
                                    </View>
                                    :
                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 20,alignItems: 'center',marginLeft: 'auto',marginRight: 'auto'}}>
                                        <View>
                                            <Pressable onPress={()=>{
                                                setMyWorkoutsBool(false);
                                            }} style={{borderBottomWidth: 2,borderBottomColor: 'black',paddingBottom: 10,marginLeft: 25,marginRight: 25}}>
                                                <Text style={{color: '#000',fontSize: 18,fontWeight: '600'}}>Following</Text>
                                            </Pressable>
                                        </View>
                                        <View>
                                            <Pressable onPress={()=>{
                                                setMyWorkoutsBool(true);
                                            }} style={{borderBottomWidth: 2,borderBottomColor: '#DDD',paddingBottom: 10,marginLeft: 25,marginRight: 25}}>
                                                <Text style={{color: '#000',fontSize: 18}}>My Workouts</Text>
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
                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',padding: 10}}>
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
                                                                        showLikes({
                                                                            likes: workout.likes,
                                                                            profileUrl: workout.profileUrl
                                                                        });
                                                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                        {
                                                                            returnProfilePic(workout.profileUrl,0)
                                                                        }
                                                                        {
                                                                            returnProfilePic(workout.profileUrl,-10)
                                                                        }
                                                                        {
                                                                            returnProfilePic(workout.profileUrl,-10)
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
                                                                                returnProfilePic(workout.profileUrl,0)
                                                                            }
                                                                            {
                                                                                returnProfilePic(workout.profileUrl,-10)
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
                                                                                        returnProfilePic(workout.profileUrl,0)
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

                                                    </Pressable>
                                                    
                                                    
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
                                            </View>
                                        )
                                    })
                                    :
                                    <View  style={styles.emptyWorkoutContainer}>
                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginBottom: 25}}>
                                            <Image source={workoutBlack} style={{height: 30, width: 30}}/>
                                            <Text style={{color: 'black',marginLeft: 10,fontSize: 17.5,fontWeight: '600',color: '#000'}}>No Workouts Found</Text>
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
                                                            <View  key={userProfile.timeStamp}>
                                                                {
                                                                    // check if date is already present in dateGroup in ddmmyyyy format ->
                                                                    !followingDateGroup.has(`${userProfile.timeStamp.toDate().toISOString().slice(8,10)}${userProfile.timeStamp.toDate().toISOString().slice(5,7)}${userProfile.timeStamp.toDate().toISOString().slice(0,4)}`)
                                                                    ?
                                                                    followingGroupByDate(userProfile)
                                                                    :
                                                                    null
                                                                }
                                                                {
                                                                    // check if date is already present in dateGroup in ddmmyyyy format ->
                                                                    !UserGroup.has(`${userProfile.name}`)
                                                                    ?
                                                                    groupByUser(userProfile,userProfile.uid)
                                                                    :
                                                                    null
                                                                }
                                                                <View key={userProfile.workout.id}>
                                                                    <View style={styles.workout}>
                                                                        <Pressable onPress={() => {
                                                                            openWorkoutBox(userProfile.workout,userProfile.uid);
                                                                        }} >
                                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',padding: 10}}>
                                                                                <View style={styles.workoutTitleContainer}>
                                                                                    <Image source={dumbell} style={styles.workoutIcon}/>
                                                                                    <Text style={styles.workoutTitle}>{userProfile.workout.workoutName}</Text>
                                                                                </View>
                                                                                <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                                    {
                                                                                        userProfile.timeStamp.toDate().toTimeString().slice(0,2)<12
                                                                                        ?
                                                                                        <Text style={styles.workoutTime}>{userProfile.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                                                                        :
                                                                                        <Text style={styles.workoutTime}>{userProfile.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                                                                    }       
                                                                                </View>
                                                                            </View>
                                                                            <View style={styles.exerciseList}>
                                                                                {
                                                                                    userProfile.workout.allWorkouts.map(exercise => {
                                                                                        return(
                                                                                            <View style={styles.exerciseName} key={exercise.id}>
                                                                                                <Text style={{borderBottomColor: '#fff',borderBottomWidth: 2,fontSize: 17,paddingBottom: 5,color: 'white'}}>{exercise.exerciseName}</Text>
                                                                                                <Text style={{fontSize: 17,color: 'white',padding: 5}}> x {exercise.allSets.length}</Text>
                                                                                            </View>
                                                                                        )
                                                                                    })
                                                                                }
                                                                            </View>

                                                                            {/* display likes */}
                                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',padding: 10}}>
                                                                                {
                                                                                    userProfile.likes.length>2
                                                                                    ?
                                                                                    <View>
                                                                                        <Pressable onPress={()=>{
                                                                                            showLikes(userProfile.likes);
                                                                                        }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                            {
                                                                                                returnProfilePic(userProfile.profileUrl,0)
                                                                                            }
                                                                                            {
                                                                                                returnProfilePic(userProfile.profileUrl,-10)
                                                                                            }
                                                                                            {
                                                                                                returnProfilePic(userProfile.profileUrl,-10)
                                                                                            }
                                                                                            {
                                                                                                userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                ?
                                                                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {userProfile.likes.length-1} others like this</Text>
                                                                                                :
                                                                                                <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name.split(" ")[0]} and {userProfile.likes.length-1} others like this</Text>
                                                                                            }
                                                                                        </Pressable>
                                                                                    </View>
                                                                                    :
                                                                                    <View>
                                                                                    {
                                                                                        userProfile.likes.length>1
                                                                                        ?
                                                                                        <View>
                                                                                            <Pressable onPress={()=>{
                                                                                                showLikes(userProfile.likes);
                                                                                            }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                                {
                                                                                                    returnProfilePic(userProfile.profileUrl,0)
                                                                                                }
                                                                                                {
                                                                                                    returnProfilePic(userProfile.profileUrl,-10)
                                                                                                }
                                                                                                {
                                                                                                    userProfile.likes.some(e => e.uid == `${userID}`)
                                                                                                    ?
                                                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {userProfile.likes.length-1} others like this</Text>
                                                                                                    :
                                                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name.split(" ")[0]} and {userProfile.likes.length-1} others like this</Text>
                                                                                                } 
                                                                                            </Pressable>
                                                                                        </View>
                                                                                        :
                                                                                        <View>
                                                                                            {
                                                                                                userProfile.likes.length>0
                                                                                                ?
                                                                                                <View>
                                                                                                    <Pressable onPress={()=>{
                                                                                                        showLikes(userProfile.likes);
                                                                                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                                                        {
                                                                                                            returnProfilePic(userProfile.profileUrl,0)
                                                                                                        }
                                                                                                        {
                                                                                                            userProfile.likes[0].uid==userID
                                                                                                            ?
                                                                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You like this</Text>
                                                                                                            :
                                                                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{userProfile.likes[0].name} likes this</Text>
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
                                                                            
                                                                        </Pressable>
                                                                        <View style={styles.interactComponent}>
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
            <ScrollView contentContainerStyle={{borderWidth:1,borderColor: '#DDD',backgroundColor: '#f5f4f4',width: '100%',display: 'flex',marginTop: 40,marginBottom: 50,minHeight: 500,borderRadius: 10,padding: 20}}>
                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginBottom: 20}}>
                    <View style={{position: 'absolute',left: 0}}>
                        <Pressable onPress={()=>{
                            setShowLikesBool(false);
                        }} >
                            <Image source={backIconBlack} style={{height: 30,width: 30,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                        </Pressable>
                    </View>
                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                        <Text style={{display: 'flex',textAlign: 'center',fontSize: 20,fontWeight: '500',borderBottomColor: 'black',borderBottomWidth: 2}}>Likes</Text>
                    </View>
                </View>
                {
                    likedUsers.length>0
                    ?
                    likedUsers.map(user => {
                        
                        return(
                            <View key={user.uid} style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',width: '100%',marginTop: 10,marginBottom: 10,backgroundColor: '#000',padding: 10,paddingLeft: 15,paddingRight: 15,borderRadius: 10}}>
                                <View style={{display:'flex',flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                                    <Pressable onPress={() => {
                                        navigation.navigate('UserPage')
                                    }}>
                                        <Image source={pfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: 'white'}}/>
                                    </Pressable>
                                    <Text style={{textAlign: 'center',marginLeft: 10,fontSize: 15,color: 'white',fontWeight: '500',borderBottomColor: 'white',borderBottomWidth: 2,paddingBottom: 5}}>{user.name}</Text>
                                </View>
                                <View style={{marginRight: 10}}>
                                    <Pressable>
                                        <Image source={likeBlue} style={{height: 20,width: 20}}/>
                                    </Pressable>
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
        flexDirection: 'column',
        // justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: '#000',
        padding: 10
    },
    workoutTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',

        fontWeight: '600',
        paddingBottom: 0
        // borderBottomWidth:2,
        // borderBottomColor: "white"
    },
    workoutTitle: {
        fontSize: 17.5,
        color: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 5,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },
    workoutTime: {
        fontWeight: '500',
        color: 'white',
        alignItems: 'center',
        textAlign: 'center'
    },
    exerciseList:{
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        
    },
    exerciseName:{
        paddingTop: 5,
        paddingBottom: 5,
        display: 'flex',
        flexDirection: 'row',
        
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center'
    },
    exerciseReps: {
        // borderColor: '#f5f4f4'
    },
    workoutIcon: {
        height: 30,
        width: 30,
        marginRight: 10,
    },
    interactComponent: {
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 10,

    },
    likeIcon: {
        height: 24,
        width: 24,
    },
    commentIcon: {
        height: 24,
        width: 24,
    },
    emptyWorkoutContainer: {
        borderWidth: 2,
        borderColor: '#DDD',
        display: 'flex',
        width: '100%',
        backgroundColor: '#f5f4f4',
        borderRadius: 15,
        marginTop: 125,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 20,
        justifyContent: 'center',
    },
    
})