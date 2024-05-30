import React, { useEffect, useState,useRef,useMemo,memo,useCallback } from 'react'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withRepeat,
  } from 'react-native-reanimated';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeart } from '@fortawesome/free-regular-svg-icons'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView, TextInput,ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs,doc,deleteDoc,updateDoc,getDoc,serverTimestamp,Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useRoute } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useFonts } from 'expo-font';


const IndividualWorkout = ({ID,showWorkoutBox,showNavbar,uid,hideUserNavbar,followingUserArray,setFollowingUserArray,allUsers}) => {
    const [editWorkout,setEditWorkout] = useState(false);
    const [clickedWorkout,setClickedWorkout] = useState({});
    const [originalClickedWorkout,setOriginalClickedWorkout] = useState({});
    const [editedWorkoutName,setEditedWorkoutName] = useState("");
    const [isLoading,setIsLoading] = useState(true);
    const [docID,setDocID] = useState("");
    const [readOnly,setReadOnly] = useState(false);
    const [showLikesBool,setShowLikesBool] = useState(false);
    const [likedUsers,setLikesUsers] = useState([]);
    const [commentInput,setCommentInput] = useState("");
    const [dropdownArray,setDropdownArray] = useState([]);
    const [editedDropdownArray,setEditedDropdownArray] = useState([]);
    const [userName,setUserName] = useState("");
    const [userPfp,setUserPfp] = useState("");
    const [displayLikes,setDisplayLikes] = useState([]);
    const [longPress,setLongPress] = useState(null);

    const months = new Map;
    const dateSuffix = new Map;

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

    const scrollViewRef = useRef();

    const navigation = useNavigation();
    const auth = getAuth();
    var userID = auth.currentUser.uid;
    const route = useRoute();

    const [fontsLoaded, fontError] = useFonts({
        'JosefinSans': require('../assets/fonts/JosefinSans-Regular.ttf'),
        'JosefinSans-Bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
        'SignikaNegative': require('../assets/fonts/SignikaNegative-Medium.ttf'),
        'LeagueSpartan': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
        'LeagueSpartan-Medium': require('../assets/fonts/LeagueSpartan-Medium.ttf'),
        'Inter': require('../assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
        'Futura-Condensed': require('../assets/fonts/Futura Condensed Extra Bold.otf'),
    });


    const deleteWorkout = async () => {
        const q = query(collection(FIREBASE_DB, `${userID}`));

        let docID = "";
        let tempArray = [...followingUserArray];

        const querySnapshot = getDocs(q)
        .then(async (snap) => {
            snap.forEach((doc) => {
                if(doc.data().id==clickedWorkout.id){
                    docID = doc.id;
                }
            }); 

            await deleteDoc(doc(FIREBASE_DB, `${userID}`, `${docID}`));
            tempArray = tempArray.filter((obj) => obj.workout.id != clickedWorkout.id)
            setFollowingUserArray(tempArray); 
        })
    }

    const autoScroll = () => {
        scrollViewRef.current.scrollToEnd({animated: true});
    }

    const getUserNameAndPfp = async () => {
        const nameRef = doc(FIREBASE_DB, "Users", `${userID}`);
        const nameSnap = await getDoc(nameRef);

        let name = "";
        let profileUrl = "";

        if (nameSnap.exists()) {
            setUserName(nameSnap.data().name);
            setUserPfp(nameSnap.data().profileUrl)
        }
    }

    const getDisplayLikedUsers = (clickedWorkout) => {
        let workoutLikesLength = clickedWorkout.likes.length;
        let userPfp1 = workoutLikesLength>0 && allUsers.length>0 ? allUsers.find(user => user.uid==clickedWorkout.likes[0].uid) : "";
        let userPfp2 = workoutLikesLength>1 && allUsers.length>0 ? allUsers.find(user => user.uid==clickedWorkout.likes[1].uid) : "";
        let userPfp3 = workoutLikesLength>2 && allUsers.length>0 ? allUsers.find(user => user.uid==clickedWorkout.likes[2].uid) : "";

        if(userPfp1==undefined) userPfp1 = "";
        if(userPfp2==undefined) userPfp2 = "";
        if(userPfp3==undefined) userPfp3 = "";

        setDisplayLikes([userPfp1,userPfp2,userPfp3])
    }
    
    useEffect(()=>{
        if(uid!=null){
            userID = uid;
            
            if(userID!=auth.currentUser.uid){
                setReadOnly(true);
            }
        }

        getUserNameAndPfp();   

        const q = query(collection(FIREBASE_DB, `${userID}`));

        const querySnapshot = getDocs(q)
        .then(snap => {
            snap.forEach((doc) => {
                if(doc.data().id==ID){
                    setClickedWorkout(doc.data());
                    getDisplayLikedUsers(doc.data());
                    setEditedWorkoutName(doc.data().workoutName);
                    setOriginalClickedWorkout(doc.data());
                    setDocID(doc.id);
                }
            });
        })
    },[])
    
    const getOriginalWorkout = () => {
        const q = query(collection(FIREBASE_DB, `${userID}`));

        const querySnapshot = getDocs(q)
        .then(snap => {
            snap.forEach((doc) => {
                if(doc.data().id==ID){
                    setEditedWorkoutName(doc.data().workoutName);
                    setOriginalClickedWorkout(doc.data());
                }
            });
        })
    }

    const likeWorkout = async (userProfile) => {
        let docID = "";
        let likeArray = [];

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${uid}`));
        querySnapshot.forEach((doc) => {
            if(userProfile.id==doc.data().id){
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
            profileUrl: profileUrl
        });
        
        const likeRef = doc(FIREBASE_DB, `${uid}`, `${docID}`);

        await updateDoc(likeRef, {
            likes: likeArray
        });

        setClickedWorkout({
            ...clickedWorkout,
            likes: likeArray
        })
    }

    const unlikeWorkout = async (userProfile) => {
        let docID = "";
        let likeArray = [];

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${uid}`));
        querySnapshot.forEach((doc) => {
            if(userProfile.id==doc.data().id){
                docID = doc.id;
                likeArray = doc.data().likes;
            }
        });

        let newLikeArray = likeArray.filter((like) => {
            return like.uid != userID;
        });
        
        const likeRef = doc(FIREBASE_DB, `${uid}`, `${docID}`);

        await updateDoc(likeRef, {
            likes: newLikeArray
        });
        

        setClickedWorkout({
            ...clickedWorkout,
            likes: newLikeArray
        })
    }

    const addComments = async (userProfile) => {
        let randomID = uuidv4();
        let docID = "";
        let commentArray = [];

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${uid}`));
        querySnapshot.forEach((doc) => {
            if(clickedWorkout.id==doc.data().id){
                docID = doc.id;
                commentArray = doc.data().comments;
            }
        });

        const nameRef = doc(FIREBASE_DB, "Users", `${userID}`);
        const nameSnap = await getDoc(nameRef);
        
        let name = "";

        if(nameSnap.exists()){
            name = nameSnap.data().name;
        }

        const timestamp = Date.now();
        const date = new Date(timestamp);

        commentArray.push({
            uid: userID,
            comment: commentInput,
            name: name,
            id: randomID,
            timeStamp: date,
            likes: [],
        });
        
        const commentRef = doc(FIREBASE_DB, `${uid}`, `${docID}`);

        await updateDoc(commentRef, {
            comments: commentArray
        });

        setClickedWorkout({
            ...clickedWorkout,
            comments: commentArray
        })

        setCommentInput("");
        setIsLoading(false);
    }

    const showLikes = async (likes) => {
        setShowLikesBool(true);
        setLikesUsers(likes);
    }

    const deleteComment = async (userProfile,userComment) => {
        let docID = "";
        let commentArray = [];

        if(uid==null){
            uid = userID;
        }

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${uid}`));
        querySnapshot.forEach((doc) => {
            if(clickedWorkout.id==doc.data().id){
                docID = doc.id;
                commentArray = doc.data().comments;
            }
        });

        let newCommentArray = commentArray.filter((comment) => {
            return comment.id != userComment.id;
        });

        const commentRef = doc(FIREBASE_DB, `${uid}`, `${docID}`);

        await updateDoc(commentRef, {
            comments: newCommentArray
        });
        

        setClickedWorkout({
            ...clickedWorkout,
            comments: newCommentArray
        })
        setIsLoading(false);
    }

    const likeComment = async (userProfile) => {
        let docID = "";
        var commentArray = [];

        if(uid==null){
            uid = userID;
        }

        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${uid}`));
        querySnapshot.forEach((doc) => {
            if(clickedWorkout.id==doc.data().id){
                docID = doc.id;
                commentArray = doc.data().comments; 
            }
        });

        const nameRef = doc(FIREBASE_DB, "Users", `${userID}`);
        const nameSnap = await getDoc(nameRef);
        
        let name = "";

        if(nameSnap.exists()){
            name = nameSnap.data().name;
        }

        var newCommentArray = commentArray.map((comment) => {
            if(userProfile.id==comment.id){
                return {
                    ...comment,
                    likes: [...comment.likes,{
                        uid: userID,
                        name: name
                    }]
                }
            }
            else{
                return comment;
            }
        })
        
        const likeRef = doc(FIREBASE_DB, `${uid}`, `${docID}`);

        await updateDoc(likeRef, {
            comments: newCommentArray
        });

        setClickedWorkout({
            ...clickedWorkout,
            comments: newCommentArray
        })
    }

    const unlikeComment = async (userProfile) => {
        let docID = "";
        var commentArray = [];

        if(uid==null){
            uid = userID;
        }
 
        const querySnapshot = await getDocs(collection(FIREBASE_DB, `${uid}`));
        querySnapshot.forEach((doc) => {
            if(clickedWorkout.id==doc.data().id){
                docID = doc.id;
                commentArray = doc.data().comments; 
            }
        });

        const nameRef = doc(FIREBASE_DB, "Users", `${userID}`);
        const nameSnap = await getDoc(nameRef);
        
        let name = "";

        if(nameSnap.exists()){
            name = nameSnap.data().name;
        }

        var newCommentArray = commentArray.map((comment) => {
            if(userProfile.id==comment.id){
                return {
                    ...comment,
                    likes: comment.likes.filter(com => com.uid != userID)
                }
            }
            else{
                return comment;
            }
        })
        
        const likeRef = doc(FIREBASE_DB, `${uid}`, `${docID}`);

        await updateDoc(likeRef, {
            comments: newCommentArray
        });

        setClickedWorkout({
            ...clickedWorkout,
            comments: newCommentArray
        })
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
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 500);
    
        return () => clearTimeout(timeout);
    }, [showWorkoutBox]);

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
                <ScrollView style={{flexGrow: 1,height: '100%',width: '100%'}}>
                    <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-between',width: '100%',alignItems: 'center',marginBottom: 20}}>
                        <Pressable onPress={() => {
                            showWorkoutBox(false);
                            if(hideUserNavbar!=null){
                                hideUserNavbar(false);
                            }
                            if(route.name!='IndividualUser'){
                                if(showNavbar!=null){
                                    showNavbar(true);
                                }
                            }
                        }} style={{display: 'flex',alignItems: 'center',flexDirection: 'row'}}>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={22} style={{color: '#1e1e1e',marginRight: 10}}/>
                        </Pressable>
                        <Text style={{textAlign: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan-Medium',fontSize: 25,color: '#1e1e1e'}}>Workout</Text>
                        <Pressable onPress={()=>{
                            navigation.navigate('Home');
                            showWorkoutBox(false);
                            if(hideUserNavbar!=null){
                                hideUserNavbar(false);
                            }
                            if(route.name!='IndividualUser'){
                                if(showNavbar!=null){
                                    showNavbar(true);
                                }
                            }
                        }} style={{display: 'flex',alignItems: 'center',flexDirection: 'row',}}>
                            <FontAwesomeIcon icon="fa-solid fa-house" size={22} style={{marginRight: 10,color: '#1e1e1e',}}/>
                        </Pressable>
                    </View>
                    {
                        editWorkout
                        ?
                        <ScrollView ref={scrollViewRef} style={[styles.individualWorkout,{backgroundColor: '#fff',paddingBottom: 30,borderWidth: 2,borderColor: '#f1f1f1',marginTop: 15}]}>
                            <View style={styles.individualWorkoutHeader}>
                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                    <TextInput value={editedWorkoutName} placeholder={editedWorkoutName} onChangeText={async(text) => {
                                        setEditedWorkoutName(text);
    
                                        setClickedWorkout({
                                            ...clickedWorkout,
                                            workoutName: text
                                        })
                                    }} style={{display: 'flex',borderRadius: 5,color: '#949494',fontSize: 28,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan-Bold',paddingTop: 5,paddingBottom: 5,borderWidth: 2,borderColor: '#f5f4f4',paddingLeft: 10,paddingRight: 10}}/>
                                </View>
                                <View style={{display: 'flex',flexDirection: 'row'}}>
                                    <Pressable onPress={async ()=>{
                                        setEditWorkout(false);
                                        setEditedWorkoutName(originalClickedWorkout.workoutName);
                                        getOriginalWorkout();
    
                                        setClickedWorkout(originalClickedWorkout);
                                    }}>
                                        <FontAwesomeIcon icon="fa-solid fa-xmark" size={25} style={{color: '#343434'}}/>
                                    </Pressable>
                                    <Pressable onPress={async ()=>{
                                        setEditWorkout(false);
                                        setEditedWorkoutName(clickedWorkout.workoutName);
    
                                        const nameRef = doc(FIREBASE_DB, `${userID}`, `${docID}`);
                                        await updateDoc(nameRef, clickedWorkout);
                                    }}>
                                        <FontAwesomeIcon icon="fa-solid fa-check" size={22} style={{color: '#343434',marginLeft: 10}}/>
                                    </Pressable>
                                </View>
                            </View>
                            <View style={styles.individualWorkoutExercises}>
                                <Pressable onPress={()=>{
                                    const replaceArray = clickedWorkout.allWorkouts;
                                    const newArray = [
                                        ...replaceArray,
                                        {
                                            exerciseName: 'New Exercise',
                                            allSets: [
                                                {
                                                    id: '1',
                                                    weight: '0',
                                                    reps: '0'
                                                }
                                            ],
                                            id: clickedWorkout.allWorkouts.length
                                        }
                                    ];
    
                                    setClickedWorkout({
                                        ...clickedWorkout,
                                        allWorkouts: newArray
                                    })
                                    setEditedDropdownArray([...editedDropdownArray,clickedWorkout.allWorkouts.length])
                                    autoScroll();
    
                                }} style={{width: '100%',backgroundColor: '#343434',display: 'flex',borderRadius: 5,justifyContent: 'space-between',alignItems: 'center',padding: 10,flexDirection: 'row',marginBottom: 20}}>
                                    <Text style={{color: '#fff',fontSize: 18,fontFamily: 'LeagueSpartan-Medium'}}>New Exercise</Text>
                                    <FontAwesomeIcon icon="fa-solid fa-plus" size={20} style={{color: '#fff'}}/>
                                </Pressable>
                                {
                                    clickedWorkout.allWorkouts!=undefined
                                    ?
                                    clickedWorkout.allWorkouts.map(exercises => {
                                        if(exercises!=undefined){
                                            return(
                                                <View style={{marginBottom: 20,marginTop: 20}} key={exercises.id}>
                                                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between'}}>
                                                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                                            {
                                                                editedDropdownArray.includes(exercises.id)
                                                                ?
                                                                <Pressable onPress={()=>{
                                                                    setEditedDropdownArray(editedDropdownArray.filter(arr => arr != exercises.id))
                                                                }}>
                                                                    <FontAwesomeIcon icon="fa-solid fa-angle-up" size={20} style={{color: '#343434',marginRight: 10}}/>
                                                                </Pressable>
                                                                :
                                                                <Pressable onPress={()=>{
                                                                    setEditedDropdownArray([...editedDropdownArray,exercises.id])
                                                                }}>
                                                                    <FontAwesomeIcon icon="fa-solid fa-angle-down" size={20} style={{color: '#343434',marginRight: 5}} />
                                                                </Pressable>
                                                            }
                                                            <TextInput value={exercises.exerciseName} onChangeText={async (text) => {
                                                                const replaceArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
                    
                                                                const newArray = [
                                                                    ...replaceArray,
                                                                    {
                                                                        exerciseName: text,
                                                                        allSets: exercises.allSets,
                                                                        id: exercises.id
                                                                    }
                                                                ];
    
                                                                newArray.sort((a,b)=> a.id-b.id);
    
                                                                setClickedWorkout({
                                                                    ...clickedWorkout,
                                                                    allWorkouts: newArray
                                                                })
                    
                                                                
                                                            }} style={{color: '#949494',fontSize: 20,fontFamily: 'LeagueSpartan-Medium',display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',borderColor: '#f5f4f4',borderWidth: 2,padding: 10,maxWidth: '150',borderRadius: 5,paddingTop: 5,paddingBottom: 5}}/>
                                                        </View>
                                                        <View style={{display: 'flex',justifyContent: 'center',flexDirection: 'row'}}>
                                                            <Pressable onPress={()=>{
                                                                const replaceArray = exercises.allSets;
                                                                const newArray = [
                                                                    ...replaceArray,
                                                                    {
                                                                        id: replaceArray.length + 1,
                                                                        weight: '0',
                                                                        reps: '0'
                                                                    }
                                                                ]
    
                                                                const newWorkout = {
                                                                    ...exercises,
                                                                    allSets: newArray
                                                                }
    
                                                                const tempArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
    
                                                                tempArray.push(newWorkout);
    
                                                                tempArray.sort((a,b)=> a.id-b.id);
    
                                                                setClickedWorkout({
                                                                    ...clickedWorkout,
                                                                    allWorkouts: tempArray
                                                                });
    
                                                                setEditedDropdownArray([...editedDropdownArray,exercises.id])
                                                                }} style={{backgroundColor: '#343434',padding: 10,borderRadius: 50,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',paddingLeft: 10,paddingRight: 10,marginLeft: 10}}>
                                                                <FontAwesomeIcon icon="fa-solid fa-plus" size={20} style={{color: '#fff'}}/>
                                                            </Pressable>
                                                            <Pressable onPress={()=>{
                                                                const replaceArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
    
                                                                let id = 0;
    
                                                                replaceArray.map(newSet => {
                                                                    if(newSet.id != id){
                                                                        newSet.id = id 
                                                                    }
                                                                    id++;
                                                                })
    
                                                                replaceArray.sort((a,b)=>a.id-b.id);
    
                                                                setClickedWorkout({
                                                                    ...clickedWorkout,
                                                                    allWorkouts: replaceArray
                                                                });
    
                                                            }} style={{backgroundColor: '#343434',padding: 10,borderRadius: 50,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',paddingLeft: 10,paddingRight: 10,marginLeft: 10}}>
                                                                <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#fff'}}/>
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                    {
                                                        editedDropdownArray.includes(exercises.id)
                                                        ?   
                                                        <View style={{marginBottom: 20,marginTop: 20}}>
                                                            {
                                                                exercises.allSets.map(sets => {
                                                                    return(
                                                                        <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-around',marginTop: 10,marginBottom: 10}} key={sets.id}>
                                                                            <View style={{maxWidth: 70,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>
                                                                                <Text style={{color: '#343434',fontSize: 19,display: 'flex',alignItems: 'center',textAlign: 'center',fontFamily: 'LeagueSpartan-Medium',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                                            </View>
                                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                                                <View style={{padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 5,maxWidth: 70,minWidth: 30,borderWidth: 2,borderColor: '#f5f4f4'}}>
                                                                                    <TextInput value={sets.weight} onChangeText={(text)=>{
                                                                                        const replaceArray = exercises.allSets.filter(arr => arr.id != sets.id);
    
                                                                                        const newArray = [
                                                                                            ...replaceArray,
                                                                                            {
                                                                                                ...sets,
                                                                                                weight: text
                                                                                            }
                                                                                        ]
    
                                                                                        newArray.sort((a,b)=> a.id-b.id);
    
                                                                                        const newWorkout = {
                                                                                            ...exercises,
                                                                                            allSets: newArray
                                                                                        }
    
                                                                                        const tempArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
    
                                                                                        tempArray.push(newWorkout);
    
                                                                                        tempArray.sort((a,b)=> a.id-b.id);
    
                                                                                        setClickedWorkout({
                                                                                            ...clickedWorkout,
                                                                                            allWorkouts: tempArray
                                                                                        });
    
                                                                                    }} style={{color: '#949494',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}/>
                                                                                </View>
                                                                                <Text style={{color: '#343434',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',marginLeft: 7.5,fontFamily: 'LeagueSpartan-Medium'}}>kg</Text>
                                                                            </View>
                                                                            <View style={{padding: 5,paddingLeft: 5,paddingRight: 5}}>
                                                                                <Text style={{color: '#343434',fontSize: 19,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',fontFamily: 'LeagueSpartan-Medium'}}>x</Text>
                                                                            </View>
                                                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                                                <View style={{borderWidth: 2,borderColor: '#f5f4f4',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 5,maxWidth: 50,minWidth: 30}}>
                                                                                    <TextInput value={sets.reps} onChangeText={(text)=>{
                                                                                        const replaceArray = exercises.allSets.filter(arr => arr.id != sets.id);
    
                                                                                        const newArray = [
                                                                                            ...replaceArray,
                                                                                            {
                                                                                                ...sets,
                                                                                                reps: text
                                                                                            }
                                                                                        ]
    
                                                                                        newArray.sort((a,b)=> a.id-b.id);
    
                                                                                        const newWorkout = {
                                                                                            ...exercises,
                                                                                            allSets: newArray
                                                                                        }
    
                                                                                        const tempArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
    
                                                                                        tempArray.push(newWorkout);
    
                                                                                        tempArray.sort((a,b)=> a.id-b.id);
    
                                                                                        setClickedWorkout({
                                                                                            ...clickedWorkout,
                                                                                            allWorkouts: tempArray
                                                                                        });
                                                                                    }} style={{color: '#949494',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',verticalAlign:'middle',textAlignVertical: 'center'}}/>
                                                                                </View>
                                                                                
                                                                                {/* <Text style={{color: '#000',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',marginLeft: 5}}>reps</Text> */}
                                                                            </View>
                                                                            <Pressable onPress={()=>{
                                                                                const newSets = exercises.allSets.filter(arr => arr.id != sets.id);
    
                                                                                let id = 1;
    
                                                                                newSets.map(newSet => {
                                                                                    if(newSet.id != id){
                                                                                        newSet.id = id 
                                                                                    }
                                                                                    id++;
                                                                                })
    
                                                                                newSets.sort((a,b)=>a.id-b.id);
    
                                                                                const newWorkout = {
                                                                                    ...exercises,
                                                                                    allSets: newSets
                                                                                }
    
                                                                                const tempArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
    
                                                                                tempArray.push(newWorkout);
    
                                                                                tempArray.sort((a,b)=> a.id-b.id);
    
                                                                                setClickedWorkout({
                                                                                    ...clickedWorkout,
                                                                                    allWorkouts: tempArray
                                                                                });
    
                                                                            }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                                <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#343434'}}/>
                                                                            </Pressable>
                                                                        </View>
                                                                    )
                                                                })
                                                            }
                                                        </View>
                                                        :
                                                        null
                                                    }
                                                    
                                                    {/* <Pressable onPress={()=>{
                                                        const replaceArray = exercises.allSets;
                                                        const newArray = [
                                                            ...replaceArray,
                                                            {
                                                                id: replaceArray.length + 1,
                                                                weight: '0',
                                                                reps: '0'
                                                            }
                                                        ]
    
                                                        const newWorkout = {
                                                            ...exercises,
                                                            allSets: newArray
                                                        }
    
                                                        const tempArray = clickedWorkout.allWorkouts.filter(arr => arr.id!=exercises.id);
    
                                                        tempArray.push(newWorkout);
    
                                                        tempArray.sort((a,b)=> a.id-b.id);
    
                                                        setClickedWorkout({
                                                            ...clickedWorkout,
                                                            allWorkouts: tempArray
                                                        });
    
    
                                                        }} style={styles.addSetContainer}>
                                                            <Text style={{color: 'white',fontWeight: 500}}>Add Set</Text>
                                                    </Pressable> */}
                                                    
                                                </View>
                                            )
                                        }
                                    }) 
                                    :
                                    null
                                }
                            </View>
                        </ScrollView>
                        :
                        <ScrollView style={{marginBottom: 0,paddingBottom: 20,width: '100%',marginTop: 15}}>
                            {
                                !showLikesBool
                                ?
                                <ScrollView style={{marginBottom: 0,paddingBottom: 0}}>
                                    <ScrollView contentContainerStyle={styles.individualWorkout} style={{width: '100%'}}>
                                        <View style={styles.individualWorkoutHeader}>
                                            <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                                                <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
                                                    <Pressable onPress={()=>{
                                                        navigation.navigate('IndividualUser',{
                                                            uid: uid,
                                                            name: userName,
                                                            profileUrl: userPfp
                                                        })
                                                    }} style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                        {
                                                            userPfp==""
                                                            ?
                                                            <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd',borderColor: '#ddd',borderWidth: 2}}>
                                                            <FontAwesomeIcon icon="fa-solid fa-user" size={30} style={{color: '#fff'}}/>
                                                            </View>
                                                            :
                                                            <Image src={userPfp} style={{height: 50,width: 50,borderRadius: 50,borderWidth: 2,borderColor: '#ddd',}}/>
                                                        }
                                                        <View style={{marginLeft: 10,display: 'flex',flexDirection: 'column'}}>
                                                            <Text style={{color: '#1e1e1e',fontFamily:'LeagueSpartan-Medium',fontSize: 19}}>{userName}</Text>
                                                            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                                            {
                                                                clickedWorkout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                                                ?
                                                                <Text style={styles.workoutTime}>{clickedWorkout.timeStamp.toDate().toISOString().slice(8,10)}{dateSuffix.has(`${clickedWorkout.timeStamp.toDate().toISOString().slice(8,10)}`) ? dateSuffix.get(`${clickedWorkout.timeStamp.toDate().toISOString().slice(8,10)}`) : 'th'} {months.get(`${clickedWorkout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {clickedWorkout.timeStamp.toDate().toISOString().slice(0,4)} at {clickedWorkout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                                                :
                                                                <Text style={styles.workoutTime}>{clickedWorkout.timeStamp.toDate().toISOString().slice(8,10)}{dateSuffix.has(`${clickedWorkout.timeStamp.toDate().toISOString().slice(8,10)}`) ? dateSuffix.get(`${clickedWorkout.timeStamp.toDate().toISOString().slice(8,10)}`) : 'th'} {months.get(`${clickedWorkout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {clickedWorkout.timeStamp.toDate().toISOString().slice(0,4)} at {clickedWorkout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                                            }       
                                                            </View>
                                                        </View>
                                                    </Pressable>
                                                    
                                                </View> 
                                            </View>
                                            
                                            {
                                                !readOnly
                                                ?
                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                    <Pressable onPress={()=>{
                                                        setEditWorkout(true);
                                                    }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                        <FontAwesomeIcon icon="fa-solid fa-pen" size={18} style={{color: '#343434',marginRight: 15}}/>
                                                    </Pressable>
                                                    <Pressable onPress={()=>{
                                                        deleteWorkout();
                                                        if(showNavbar!=null){
                                                            showNavbar(true);
                                                        }
                                                        showWorkoutBox(false);
                                                        if(hideUserNavbar!=null){
                                                            hideUserNavbar(false);
                                                        }
                                                    }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                        <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#343434',marginRight: 5}}/>
                                                    </Pressable>
                                                </View>
                                                :
                                                null
                                            }
                                        </View>
                                        <View style={styles.individualWorkoutExercises}>
                                        <View style={{display: 'flex',flexDirection: 'column'}}>
                                            <Text style={{display: 'flex',color: '#343434',fontSize: 25,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',fontFamily: 'LeagueSpartan-Bold',paddingLeft: 15,marginTop: 10}}>{clickedWorkout.workoutName}</Text>
                                            {
                                                clickedWorkout.allWorkouts.map(exercises => {
                                                    return(
                                                        <View style={{marginTop: 10,marginBottom: 0,padding: 15,paddingBottom: 0}} key={exercises.id}>
                                                            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                                                {
                                                                    dropdownArray.includes(exercises.id)
                                                                    ?
                                                                    <Pressable onPress={()=>{
                                                                        setDropdownArray(dropdownArray.filter(arr => arr != exercises.id))
                                                                    }}>
                                                                        {/* <Image source={upArrow} style={{display: 'flex',height: 30,width: 30,alignItems: 'center',justifyContent: 'center',marginRight: 5}}></Image> */}
                                                                        <FontAwesomeIcon icon="fa-solid fa-angle-up" size={20} style={{color: '#1e1e1e',marginRight: 10}}/>
                                                                    </Pressable>
                                                                    :
                                                                    <Pressable onPress={()=>{
                                                                        setDropdownArray([...dropdownArray,exercises.id])
                                                                    }}>
                                                                        {/* <Image source={downArrow} style={{display: 'flex',height: 30,width: 30,alignItems: 'center',justifyContent: 'center',marginRight: 5}}></Image> */}
                                                                        <FontAwesomeIcon icon="fa-solid fa-angle-down" size={20} style={{color: '#1e1e1e',marginRight: 10}} />
                                                                    </Pressable>
                                                                }
                                                                <View style={{borderBottomColor: '#f5f4f4',borderBottomWidth: 2,paddingBottom: 5}}>
                                                                    <Text style={{color: '#343434',fontSize: 20,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',fontFamily: 'LeagueSpartan-Medium'}}>{exercises.exerciseName}</Text>
                                                                </View>
                                                            </View>
                                                            {
                                                                dropdownArray.includes(exercises.id)
                                                                ?
                                                                <View style={{marginBottom: 10,marginTop: 20}}>
                                                                    {
                                                                        exercises.allSets.map(sets => {
                                                                            return(
                                                                                <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-around',marginTop: 10,marginBottom: 10}} key={sets.id}>
                                                                                    <View style={{backgroundColor: '#f5f4f4',padding: 10,borderRadius: 5,width: 70,display: 'flex',justifyContent: 'center'}}>
                                                                                        <Text style={{color: '#747474',fontSize: 17,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                                                    </View>
                                                                                    <View style={{backgroundColor: '#f5f4f4',padding: 10,width: 90,display: 'flex',justifyContent: 'center'}}>
                                                                                        <Text style={{color: '#747474',fontSize: 17,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center'}}>{sets.weight} kg</Text>
                                                                                    </View>
                                                                                    <View style={{padding: 5,display: 'flex',justifyContent: 'center'}}>
                                                                                        <Text style={{color: '#747474',fontSize: 17,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center',fontFamily: 'LeagueSpartan'}}>x</Text>
                                                                                    </View>
                                                                                    <View style={{backgroundColor: '#f5f4f4',padding: 10,width: 60,display: 'flex',justifyContent: 'center'}}>
                                                                                        <Text style={{color: '#747474',fontSize: 17,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center',verticalAlign:'middle',textAlignVertical: 'center'}}>{sets.reps}</Text>
                                                                                    </View>
                                                                                </View>
                                                                            )
                                                                        })
                                                                    }
                                                                </View>
                                                                :
                                                                null
                                                            }
                                                        </View>
                                                    )
                                                })
                                            }
                                            <View style={styles.interactComponent}>
                                                {
                                                    clickedWorkout.likes.some(e => e.uid == `${userID}`)
                                                    ?
                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                        <Pressable onPress={()=>{
                                                            unlikeWorkout(clickedWorkout)
                                                        }}>
                                                            <FontAwesomeIcon icon="fa-solid fa-heart" size={22} style={{color: 'red'}}/>
                                                        </Pressable>
                                                        <Pressable onPress={()=>{
                                                            showLikes(clickedWorkout.likes)
                                                        }} style={{marginLeft: 10}}>
                                                            <Text style={{color: '#343434',fontSize: 21,fontFamily: 'LeagueSpartan-Medium',textAlign: 'center',textAlignVertical: 'center'}}>{clickedWorkout.likes.length}</Text>
                                                        </Pressable>
                                                    </View>
                                                    
                                                    :
                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                        <Pressable onPress={()=>{
                                                            likeWorkout(clickedWorkout)
                                                        }}>
                                                            <FontAwesomeIcon icon={faHeart} size={22} style={{color: '#fff'}}/>
                                                        </Pressable>
                                                        <Pressable onPress={()=>{
                                                            showLikes(clickedWorkout.likes)
                                                        }} style={{marginLeft: 10}}>
                                                            <Text style={{color: '#343434',fontSize: 21,fontFamily: 'LeagueSpartan-Medium',textAlign: 'center',textAlignVertical: 'center'}}>{clickedWorkout.likes.length}</Text>
                                                        </Pressable>
                                                    </View>
                                                    
                                                }
                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent:'center',alignItems: 'center'}}>
                                                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                        <FontAwesomeIcon icon="fa-regular fa-comment" size={20} style={{color: '#A19EA3'}}/>
                                                    </View>
                                                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                        <Text style={{color: '#343434',fontSize: 21,fontFamily: 'LeagueSpartan-Medium',textAlign: 'center',textAlignVertical: 'center',marginLeft: 10}}>{clickedWorkout.comments.length}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        </View>     
                                    </ScrollView>
                                    <ScrollView  style={{backgroundColor: '#fff',borderColor: '#F1F1F1',borderWidth: 2,marginTop: 30,position: 'relative'}}>
                                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'flex-start',marginBottom: 10,padding: 20,paddingBottom: 0}}>
                                            <View style={{marginRight: 10,justifyContent: 'center',alignItems: 'center'}}>
                                                <FontAwesomeIcon icon="fa-regular fa-comment" size={20} style={{color: '#343434'}}/>
                                            </View>
                                            <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                <Text style={{fontSize: 21,color: '#343434',textAlignVertical: 'center',textAlign: 'center',fontFamily: 'LeagueSpartan-Medium'}}>Comments</Text>
                                            </View>
                                        </View>
                                        
                                        {
                                            clickedWorkout.comments.map(comment => {
                                                let time = new Date(comment.timeStamp * 1000).toTimeString().slice(0,5);
                                                if(comment.timeStamp.seconds==undefined && comment.timeStamp.nanoseconds==undefined){
                                                    time = new Date(comment.timeStamp).toTimeString().slice(0,5);
                                                }
    
                                                let userComment = allUsers.length>0 ? allUsers.find(user => user.uid==comment.uid) : ""
                                                if(userComment=="" || userComment==undefined) userComment = "";
    
                                                if(longPress==comment.id){
                                                    return(
                                                        <View key={comment.id} style={{display: 'flex',flexDirection: 'row',width: '100%',alignItems: 'center',position: 'relative',marginTop: 10,marginBottom: 10,backgroundColor: '#F82323',paddingLeft: 20,paddingRight: 20,paddingTop: 10,paddingBottom: 10}}>
                                                            <View style={{display: 'flex',flexDirection: 'row',width: '100%',position: 'relative'}}>
                                                                <View style={{display: 'flex',justifyContent: 'flex-start',alignItems: 'center',marginRight: 5,marginTop: 5}}>
                                                                    {
                                                                        userComment.profileUrl=="" || userComment.profileUrl==undefined
                                                                        ?
                                                                        <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                                            <FontAwesomeIcon icon="fa-solid fa-user" size={20} style={{color: '#fff'}}/>
                                                                        </View>
                                                                        :
                                                                        <Image src={userComment.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#ddd',}}/>
                                                                    }
                                                                </View>
                                                                <View style={{marginBottom: 5,display: 'flex',justifyContent: 'center',marginLeft: 5}}>
                                                                    <View>
                                                                        <Text style={{textAlignVertical: 'center',fontSize: 16,color: '#f5f4f4',fontFamily: 'LeagueSpartan-SemiBold'}}>{comment.name}</Text>
                                                                    </View>
                                                                    <View style={{minWidth: '80%',maxWidth: '80%'}}>
                                                                        <Text style={{textAlignVertical: 'center',fontSize: 16,color: '#f5f4f4',fontFamily: 'LeagueSpartan'}}>{comment.comment}</Text>
                                                                    </View>
                                                                </View>
                                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'absolute',right: -5,top: 0,bottom: 0}}>
                                                                    <Pressable onPress={()=>{
                                                                        deleteComment(clickedWorkout,comment)
                                                                    }} style={{marginRight:10}}>
                                                                        <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#fff'}}/>
                                                                    </Pressable>
                                                                    <Pressable onPress={()=>{
                                                                        setLongPress(null);
                                                                    }} style={{marginRight:10}}>
                                                                        <FontAwesomeIcon icon="fa-solid fa-xmark" size={18} style={{color: '#fff'}}/>
                                                                    </Pressable>
                                                                </View>
                                                            </View>
                                                            {/* <View style={{position: 'absolute',top: 0,right: 10}}>
                                                                {
                                                                    time.slice(0,2)<12
                                                                    ?
                                                                    <Text style={{color: '#1e1e1e',fontSize: 14,fontFamily: 'LeagueSpartan'}}>{time} AM</Text>
                                                                    :
                                                                    <Text style={{color: '#1e1e1e',fontSize: 14,fontFamily: 'LeagueSpartan'}}> {time} PM</Text>
                                                                }     
                                                            </View> */}
                                                            
                                                        </View>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <Pressable onLongPress={()=>{
                                                            if(comment.uid==userID || userID==uid){
                                                                setLongPress(comment.id)
                                                            }
                                                        }} delayLongPress={500} key={comment.id} style={{display: 'flex',flexDirection: 'row',width: '100%',alignItems: 'center',position: 'relative',marginTop: 10,marginBottom: 10,paddingLeft: 20,paddingRight: 20}}>
                                                            <View style={{display: 'flex',flexDirection: 'row',width: '100%',position: 'relative'}}>
                                                                <View style={{display: 'flex',justifyContent: 'flex-start',alignItems: 'center',marginRight: 5,marginTop: 5}}>
                                                                    {
                                                                        userComment.profileUrl=="" || userComment.profileUrl==undefined
                                                                        ?
                                                                        <View style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                                            <FontAwesomeIcon icon="fa-solid fa-user" size={20} style={{color: '#fff'}}/>
                                                                        </View>
                                                                        :
                                                                        <Image src={userComment.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#ddd',}}/>
                                                                    }
                                                                </View>
                                                                <View style={{marginBottom: 5,display: 'flex',justifyContent: 'center',marginLeft: 5}}>
                                                                    <View>
                                                                        <Text style={{textAlignVertical: 'center',fontSize: 16,color: '#343434',fontFamily: 'LeagueSpartan-SemiBold'}}>{comment.name}</Text>
                                                                    </View>
                                                                    <View style={{minWidth: '80%',maxWidth: '80%'}}>
                                                                        <Text style={{textAlignVertical: 'center',fontSize: 16,color: '#343434',fontFamily: 'LeagueSpartan'}}>{comment.comment}</Text>
                                                                    </View>
                                                                </View>
                                                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'absolute',right: 0,top: 0,bottom: 0}}>
                                                                    {
                                                                        comment.likes.some(e => e.uid == `${userID}`)
                                                                        ?
                                                                        <Pressable onPress={()=>{
                                                                            unlikeComment(comment)
                                                                        }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>
                                                                            <FontAwesomeIcon icon="fa-solid fa-heart" size={16} style={{color: 'red'}}/>
                                                                        </Pressable>
                                                                        :
                                                                        <Pressable onPress={()=>{
                                                                            likeComment(comment)
                                                                        }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>
                                                                            <FontAwesomeIcon icon={faHeart} size={15} style={{color: '#343434'}}/>
                                                                        </Pressable>
                                                                    }
                                                                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginLeft: 5}}>
                                                                        <Text style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center',color: '#343434',fontFamily: 'LeagueSpartan-Medium'}}>{comment.likes.length}</Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* <View style={{position: 'absolute',top: 0,right: 10}}>
                                                                {
                                                                    time.slice(0,2)<12
                                                                    ?
                                                                    <Text style={{color: '#1e1e1e',fontSize: 14,fontFamily: 'LeagueSpartan'}}>{time} AM</Text>
                                                                    :
                                                                    <Text style={{color: '#1e1e1e',fontSize: 14,fontFamily: 'LeagueSpartan'}}> {time} PM</Text>
                                                                }     
                                                            </View> */}
                                                        </Pressable>
                                                    )
                                                }
                                            })
                                        }
                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: 10,width:'100%',padding: 20,paddingTop: 0}}>
                                            <TextInput value={commentInput} onChangeText={(text)=>{
                                                setCommentInput(text);
                                            }} placeholder='Add a comment' placeholderTextColor='#949494' style={{width: '85%',fontFamily: 'LeagueSpartan',minHeight:30,fontSize: 16,color: '#1e1e1e',backgroundColor: '#f5f4f4',padding: 10,paddingLeft: 15,paddingTop: 5,paddingBottom: 5}}/>
                                            {
                                                commentInput
                                                ?
                                                <Pressable style={{justifyContent: 'center',alignItems: 'center',backgroundColor: '#1e1e1e',padding: 7.5,borderRadius: 50}} onPress={()=>{
                                                    addComments(clickedWorkout)
                                                }}>
                                                    <FontAwesomeIcon icon="fa-solid fa-arrow-up" size={22} style={{color: '#fff'}}/>
                                                </Pressable>
                                                :
                                                <Pressable style={{justifyContent: 'center',alignItems: 'center',backgroundColor: '#f5f4f4',padding: 7.5,borderRadius: 50}} onPress={()=>{
                                                    addComments(clickedWorkout)
                                                }}>
                                                    <FontAwesomeIcon icon="fa-solid fa-arrow-up" size={22} style={{color: '#949494'}}/>
                                                </Pressable>
                                            }
                                        </View>
                                    </ScrollView>
                                </ScrollView>
                                :
                                <ScrollView  contentContainerStyle={{width: '100%',display: 'flex',minHeight: 500,borderRadius: 10,padding: 0}}>
                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginBottom: 20}}>
                                        <View style={{position: 'absolute',left: 0}}>
                                            <Pressable onPress={()=>{
                                                setShowLikesBool(false);
                                            }} >
                                                <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{color: '#343434',marginRight: 10}}/>
                                            </Pressable>
                                        </View>
                                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',flexDirection: 'row'}}>
                                            <Text style={{display: 'flex',textAlign: 'center',fontSize: 22,fontWeight: '500',borderBottomColor: '#949494',borderBottomWidth: 2,color: '#343434',fontFamily:'LeagueSpartan-Medium'}}>Likes</Text>
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
                                                    <View  style={{display: 'flex',flexDirection: 'row',alignItems: 'center',padding: 10,backgroundColor: '#fff',margin: 7.5,borderRadius: 5,paddingLeft: 15,paddingRight: 15,alignItems: 'center',justifyContent: 'space-between',borderWidth: 1,borderColor:'#f1f1f1'}}>
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
                                                                    {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                                                    <FontAwesomeIcon icon="fa-solid fa-user" size={20} style={{color: '#fff'}}/>
                                                                    </View>
                                                                    :
                                                                    <Image src={userPfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#DDD'}}/>
                                                                }
                                                            </View>
                                                            <Text style={{textAlign: 'center',marginLeft: 15,fontSize: 18,color: '#343434',fontWeight: '500',fontFamily:'LeagueSpartan-Medium'}}>{user.name}</Text>
                                                        </Pressable>
                                                        <View style={{marginRight: 10}}>
                                                            <View>
                                                                <FontAwesomeIcon icon="fa-solid fa-heart" size={20} style={{color: 'red'}}/>
                                                            </View>
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
                        </ScrollView>
                    }
                </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    individualWorkout: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#F1F1F1',
        display: 'flex',
        width: '100%',
        overflow: 'scroll',
        padding: 15,
        // marginBottom: 40
    },
    individualWorkoutHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingLeft: 5,
        paddingRight: 5
    },
    individualWorkoutExercises: {
        marginTop: 20,
        paddingTop: 10,
        paddingLeft: 5,
        paddingRight: 5
        // marginBottom: 40
    },
    addSetContainer: {
        backgroundColor: '#000',
        padding: 5,
        borderRadius: 50,
        display: 'flex',
        flexDirection: 'row',
        width: 80,
        justifyContent: 'center',
        marginBottom: 20,
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    likeIcon: {
        height: 24,
        width: 24,
    },
    commentIcon: {
        height: 24,
        width: 24,
    },
    interactComponent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 10,
        marginTop: 20
    },
    workoutTime: {
        fontSize: 13,
        color: '#949494',
        fontFamily: 'LeagueSpartan'
    },
    box: {
        height: 40,
        width: 15,
        backgroundColor: '#F7F6F6'
    }
})

export default memo(IndividualWorkout)