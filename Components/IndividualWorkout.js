import React, { useEffect, useState,useRef } from 'react'
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


const IndividualWorkout = ({ID,showWorkoutBox,showNavbar,uid,hideUserNavbar,followingUserArray,setFollowingUserArray}) => {
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
                    setEditedWorkoutName(doc.data().workoutName);
                    setOriginalClickedWorkout(doc.data());
                    setIsLoading(false);
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

    const userDetailsHeader = () => {
        return(
            <View style={{width: '100%',marginBottom: 15,display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',padding: 15,backgroundColor: '#f5f4f4'}}>
                {
                    userPfp==""
                    ?
                    <Pressable onPress={()=>{

                    }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                      {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                      <FontAwesomeIcon icon="fa-solid fa-user" size={35} style={{color: '#fff'}}/>
                    </Pressable>
                    :
                    <Image src={userPfp} style={{height: 45,width: 45,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7',}}/>
                }
                <View style={{marginLeft: 15}}>
                    <Text style={{color: '#1e1e1e',fontFamily:'LeagueSpartan',fontSize: 18}}>{userName}</Text>
                </View>
            </View>
        )
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
                editWorkout
                ?
                <ScrollView ref={scrollViewRef} style={[styles.individualWorkout,{backgroundColor: '#1e1e1e',paddingBottom: 50}]}>
                    <View style={styles.individualWorkoutHeader}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                            <TextInput value={editedWorkoutName} placeholder={editedWorkoutName} onChangeText={async(text) => {
                                setEditedWorkoutName(text);

                                setClickedWorkout({
                                    ...clickedWorkout,
                                    workoutName: text
                                })
                            }} style={{display: 'flex',color: '#f5f4f4',padding: 10,borderWidth: 2,borderColor: '#ddd',borderRadius: 5,fontSize: 22.5,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',marginLeft: 5,fontFamily: 'LeagueSpartan',paddingTop: 5,paddingBottom: 5}}/>
                        </View>
                        <View style={{display: 'flex',flexDirection: 'row'}}>
                            <Pressable onPress={async ()=>{
                                setEditWorkout(false);
                                setEditedWorkoutName(originalClickedWorkout.workoutName);
                                getOriginalWorkout();

                                setClickedWorkout(originalClickedWorkout);
                            }}>
                                {/* <Image source={crossIcon} style={{height: 18,width: 18,marginRight: 10}}/> */}
                                <FontAwesomeIcon icon="fa-solid fa-xmark" size={25} style={{color: '#fff'}}/>
                            </Pressable>
                            <Pressable onPress={async ()=>{
                                setEditWorkout(false);
                                setEditedWorkoutName(clickedWorkout.workoutName);

                                const nameRef = doc(FIREBASE_DB, `${userID}`, `${docID}`);
                                await updateDoc(nameRef, clickedWorkout);
                            }}>
                                {/* <Image source={tickIcon} style={{height: 20,width: 20,marginRight: 10,marginLeft: 10}}></Image> */}
                                <FontAwesomeIcon icon="fa-solid fa-check" size={22} style={{color: '#fff',marginLeft: 10,marginRight: 10}}/>
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

                        }} style={{backgroundColor: '#3e3e3e',width: '100%',display: 'flex',justifyContent: 'space-between',alignItems: 'center',marginLeft: 'auto',marginRight: 'auto',padding: 10,paddingLeft: 15,paddingRight: 15,borderRadius: 5,flexDirection: 'row',marginBottom: 20}}>
                            <Text style={{color: '#fff',fontSize: 18,fontFamily: 'LeagueSpartan'}}>Add Exercise</Text>
                            {/* <Image source={plusIconWhite} style={{height: 15,width: 15}}/> */}
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
                                                    {/* <Text style={{color: '#fff',fontSize: 17.5,marginRight: 7.5,backgroundColor: '#000',borderRadius: 50,padding:5,paddingLeft: 12,paddingRight: 12,display: 'flex',alignItems: 'center',textAlign: 'center',fontWeight: '600'}}>{exercises.id+1}</Text> */}
                                                    {
                                                        editedDropdownArray.includes(exercises.id)
                                                        ?
                                                        <Pressable onPress={()=>{
                                                            setEditedDropdownArray(editedDropdownArray.filter(arr => arr != exercises.id))
                                                        }}>
                                                            {/* <Image source={upArrow} style={{display: 'flex',height: 30,width: 30,alignItems: 'center',justifyContent: 'center',marginRight: 5}}></Image> */}
                                                            <FontAwesomeIcon icon="fa-solid fa-angle-up" size={20} style={{color: '#fff',marginRight: 10}}/>
                                                        </Pressable>
                                                        :
                                                        <Pressable onPress={()=>{
                                                            setEditedDropdownArray([...editedDropdownArray,exercises.id])
                                                        }}>
                                                            {/* <Image source={downArrow} style={{display: 'flex',height: 30,width: 30,alignItems: 'center',justifyContent: 'center',marginRight: 5}}></Image> */}
                                                            <FontAwesomeIcon icon="fa-solid fa-angle-down" size={20} style={{color: '#fff',marginRight: 5}} />
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
            
                                                        
                                                    }} style={{color: '#fff',fontSize: 20,fontFamily: 'LeagueSpartan',display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',borderColor: '#ddd',borderWidth: 2,padding: 10,maxWidth: '150',borderRadius: 5,paddingTop: 5,paddingBottom: 5}}/>
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
                                                        }} style={{backgroundColor: '#3e3e3e',padding: 10,borderRadius: 50,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',paddingLeft: 10,paddingRight: 10,marginLeft: 10}}>
                                                        
                                                        {/* <Image source={plusIconWhite} style={{height: 15,width: 15}}/> */}
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

                                                    }} style={{backgroundColor: '#3e3e3e',padding: 10,borderRadius: 50,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',paddingLeft: 10,paddingRight: 10,marginLeft: 10}}>
                                                        {/* <Image source={deleteIcon} style={{height: 15,width: 15}}/> */}
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
                                                                        <Text style={{color: '#fff',fontSize: 19,display: 'flex',alignItems: 'center',textAlign: 'center',fontFamily: 'LeagueSpartan',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                                    </View>
                                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                                        <View style={{padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 5,maxWidth: 70,minWidth: 30,borderWidth: 2,borderColor: '#ddd'}}>
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

                                                                            }} style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}/>
                                                                        </View>
                                                                        <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',marginLeft: 7.5}}>kg</Text>
                                                                    </View>
                                                                    <View style={{padding: 5,paddingLeft: 5,paddingRight: 5}}>
                                                                        <Text style={{color: '#fff',fontSize: 19,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',fontFamily: 'LeagueSpartan'}}>x</Text>
                                                                    </View>
                                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                                        <View style={{borderWidth: 2,borderColor: '#ddd',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 5,maxWidth: 50,minWidth: 30}}>
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
                                                                            }} style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',verticalAlign:'middle',textAlignVertical: 'center'}}/>
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
                                                                        {/* <Image source={deleteIcon} style={{height: 21,width: 21}}/> */}
                                                                        <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#fff'}}/>
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
                <ScrollView style={{marginBottom: 0,paddingBottom: 0,width: '100%',marginTop: 15}}>
                    {
                        !showLikesBool
                        ?
                        <ScrollView style={{marginBottom: 0,paddingBottom: 0}}>
                            <ScrollView contentContainerStyle={styles.individualWorkout} style={{width: '100%'}}>
                                <View style={styles.individualWorkoutHeader}>
                                    <View style={{display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center'}}>
                                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'center',marginTop: 10}}>
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
                                            }}>
                                                {/* <Image source={backIconWhite} style={{display: 'flex',height: 35,width: 35,alignItems: 'center',justifyContent: 'center'}}></Image> */}
                                                <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{color: '#fff',marginRight: 10}}/>
                                            </Pressable>
                                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                {
                                                    userPfp==""
                                                    ?
                                                    <Pressable onPress={()=>{

                                                    }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                      {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                                      <FontAwesomeIcon icon="fa-solid fa-user" size={35} style={{color: '#fff'}}/>
                                                    </Pressable>
                                                    :
                                                    <Image src={userPfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 1.5,borderColor: '#f6f6f7',}}/>
                                                }
                                                <View style={{marginLeft: 10}}>
                                                    <Text style={{color: '#fff',fontFamily:'LeagueSpartan',fontSize: 19}}>{userName}</Text>
                                                </View>
                                            </View>
                                            
                                        </View> 
                                    </View>
                                    
                                    {
                                        !readOnly
                                        ?
                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                            <Pressable onPress={()=>{
                                                setEditWorkout(true);
                                            }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                {/* <Image source={editIcon} style={{height: 20,width: 20,marginRight: 20}}/> */}
                                                <FontAwesomeIcon icon="fa-solid fa-pen" size={20} style={{color: '#fff',marginRight: 20}}/>
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
                                                {/* <Image source={deleteIcon} style={{height: 20,width: 20,marginRight: 10}}/> */}
                                                <FontAwesomeIcon icon="fa-solid fa-trash" size={20} style={{color: '#fff',marginRight: 10}}/>
                                            </Pressable>
                                        </View>
                                        :
                                        null
                                    }
                                </View>
                                <View style={styles.individualWorkoutExercises}>
                                <View style={{display: 'flex',flexDirection: 'column'}}>
                                    <View style={{position: 'absolute',top: -20,right: 10}}>
                                        {
                                            clickedWorkout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                            ?
                                            <Text style={{color: '#EEEEEE',fontSize: 15,fontWeight: '500',fontFamily: 'LeagueSpartan'}}>{clickedWorkout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                            :
                                            <Text style={{color: '#EEEEEE',fontSize: 15,fontWeight: '500',fontFamily: 'LeagueSpartan'}}>{clickedWorkout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                        }       
                                    </View>

                                    <Text style={{display: 'flex',color: '#fff',fontSize: 25,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',fontFamily: 'Futura-Condensed',paddingLeft: 15,marginTop: 10}}>{clickedWorkout.workoutName}</Text>
                                    {
                                        clickedWorkout.allWorkouts.map(exercises => {
                                            return(
                                                <View style={{marginTop: 10,marginBottom: 10,padding: 15}} key={exercises.id}>
                                                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                                        {
                                                            dropdownArray.includes(exercises.id)
                                                            ?
                                                            <Pressable onPress={()=>{
                                                                setDropdownArray(dropdownArray.filter(arr => arr != exercises.id))
                                                            }}>
                                                                {/* <Image source={upArrow} style={{display: 'flex',height: 30,width: 30,alignItems: 'center',justifyContent: 'center',marginRight: 5}}></Image> */}
                                                                <FontAwesomeIcon icon="fa-solid fa-angle-up" size={20} style={{color: '#fff',marginRight: 10}}/>
                                                            </Pressable>
                                                            :
                                                            <Pressable onPress={()=>{
                                                                setDropdownArray([...dropdownArray,exercises.id])
                                                            }}>
                                                                {/* <Image source={downArrow} style={{display: 'flex',height: 30,width: 30,alignItems: 'center',justifyContent: 'center',marginRight: 5}}></Image> */}
                                                                <FontAwesomeIcon icon="fa-solid fa-angle-down" size={20} style={{color: '#fff',marginRight: 10}} />
                                                            </Pressable>
                                                        }
                                                        <View style={{borderBottomColor: '#2B8CFF',borderBottomWidth: 2,paddingBottom: 5}}>
                                                            <Text style={{color: '#fff',fontSize: 22,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',fontFamily: 'LeagueSpartan',}}>{exercises.exerciseName}</Text>
                                                        </View>
                                                    </View>
                                                    {
                                                        dropdownArray.includes(exercises.id)
                                                        ?
                                                        <View style={{marginBottom: 20,marginTop: 20}}>
                                                            {
                                                                exercises.allSets.map(sets => {
                                                                    return(
                                                                        <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-around',marginTop: 10,marginBottom: 10}} key={sets.id}>
                                                                            <View style={{backgroundColor: '#404040',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 5,width: 70,display: 'flex',justifyContent: 'center'}}>
                                                                                <Text style={{color: '#fff',fontSize: 19,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                                            </View>
                                                                            <View style={{paddingLeft: 10,paddingRight: 10,width: 90,display: 'flex',justifyContent: 'center'}}>
                                                                                <Text style={{color: '#fff',fontSize: 19,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center'}}>{sets.weight} kg</Text>
                                                                            </View>
                                                                            <View style={{padding: 5,paddingLeft: 10,paddingRight: 10,display: 'flex',justifyContent: 'center'}}>
                                                                                <Text style={{color: '#fff',fontSize: 19,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center',fontFamily: 'LeagueSpartan'}}>x</Text>
                                                                            </View>
                                                                            <View style={{paddingLeft: 10,paddingRight: 10,width: 60,display: 'flex',justifyContent: 'center'}}>
                                                                                <Text style={{color: '#fff',fontSize: 19,display: 'flex',alignItems: 'center',fontFamily: 'LeagueSpartan',textAlign: 'center',justifyContent: 'center',verticalAlign:'middle',textAlignVertical: 'center'}}>{sets.reps}</Text>
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
                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',padding: 10,marginTop: 15}}>
                                        {
                                            clickedWorkout.likes.length>2
                                            ?
                                            <View>
                                                <Pressable onPress={()=>{
                                                    showLikes(clickedWorkout.likes);
                                                }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                    <Image src={clickedWorkout.likes[0].profileUrl} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white'}}/>
                                                    <Image src={clickedWorkout.likes[1].profileUrl} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: -10}}/>
                                                    <Image src={clickedWorkout.likes[2].profileUrl} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: -10}}/>
                                                    {
                                                        clickedWorkout.likes.some(e => e.uid == `${userID}`)
                                                        ?
                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {clickedWorkout.likes.length-1} others like this</Text>
                                                        :
                                                        <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{clickedWorkout.likes[0].name.split(" ")[0]} and {clickedWorkout.likes.length-1} others like this</Text>
                                                    }
                                                </Pressable>
                                            </View>
                                            :
                                            <View>
                                            {
                                                clickedWorkout.likes.length>1
                                                ?
                                                <View>
                                                    <Pressable onPress={()=>{
                                                        showLikes(clickedWorkout.likes);
                                                    }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                        <Image src={clickedWorkout.likes[0].profileUrl} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white'}}/>
                                                        <Image src={clickedWorkout.likes[1].profileUrl} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: -10}}/>
                                                        {
                                                            clickedWorkout.likes.some(e => e.uid == `${userID}`)
                                                            ?
                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You and {clickedWorkout.likes.length-1} others like this</Text>
                                                            :
                                                            <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{clickedWorkout.likes[0].name.split(" ")[0]} and {clickedWorkout.likes.length-1} others like this</Text>
                                                        } 
                                                    </Pressable>
                                                </View>
                                                :
                                                <View>
                                                    {
                                                        clickedWorkout.likes.length>0
                                                        ?
                                                        <View>
                                                            <Pressable onPress={()=>{
                                                                showLikes(clickedWorkout.likes);
                                                            }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                                <Image src={clickedWorkout.likes[0].profileUrl} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white'}}/>
                                                                {
                                                                    clickedWorkout.likes[0].uid==userID
                                                                    ?
                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>You like this</Text>
                                                                    :
                                                                    <Text style={{color: 'white',fontSize: 15,marginLeft: 5}}>{clickedWorkout.likes[0].name} likes this</Text>
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
                                        {
                                            clickedWorkout.likes.some(e => e.uid == `${userID}`)
                                            ?
                                            <Pressable onPress={()=>{
                                                unlikeWorkout(clickedWorkout)
                                            }}>
                                                {/* <Image source={likeBlue} style={styles.likeIcon}/> */}
                                                <FontAwesomeIcon icon="fa-solid fa-heart" size={22} style={{color: 'red'}}/>
                                            </Pressable>
                                            :
                                            <Pressable onPress={()=>{
                                                likeWorkout(clickedWorkout)
                                            }}>
                                                {/* <Image source={like} style={styles.likeIcon}/> */}
                                                <FontAwesomeIcon icon={faHeart} size={22} style={{color: '#fff'}}/>
                                            </Pressable>
                                        }
                                        <Pressable>
                                            {/* <Image source={comment} style={styles.commentIcon}/> */}
                                            <FontAwesomeIcon icon="fa-regular fa-comment" size={20} style={{color: '#fff'}}/>
                                        </Pressable>
                                    </View>
                                </View>
                                </View>     
                            </ScrollView>
                            <ScrollView  style={{backgroundColor: '#1e1e1e',borderColor: '#DDD',borderWidth: 1,marginTop: 30,borderRadius: 15,padding: 20,position: 'relative'}}>
                                <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'flex-start',marginBottom: 10}}>
                                    <View style={{marginRight: 10,justifyContent: 'center',alignItems: 'center'}}>
                                        {/* <Image source={comment} style={styles.commentIcon}/> */}
                                        <FontAwesomeIcon icon="fa-regular fa-comment" size={20} style={{color: '#fff'}}/>
                                    </View>
                                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                        <Text style={{fontSize: 18,color: '#fff',textAlignVertical: 'center',textAlign: 'center',fontWeight: '500',fontFamily: 'LeagueSpartan'}}>{clickedWorkout.comments.length} Comments</Text>
                                    </View>
                                </View>
                                
                                {
                                    clickedWorkout.comments.map(comment => {
                                        let time = new Date(comment.timeStamp * 1000).toTimeString().slice(0,5);

                                        if(comment.timeStamp.seconds==undefined && comment.timeStamp.nanoseconds==undefined){
                                            time = new Date(comment.timeStamp).toTimeString().slice(0,5);
                                        }

                                        return(
                                            <View key={comment.id} style={{display: 'flex',flexDirection: 'row',width: '100%',alignItems: 'center',position: 'relative',backgroundColor: '#363636',borderWidth: 1,borderColor: '#404040',padding: 10,borderRadius: 10,marginTop: 10,marginBottom: 10}}>
                                                <View style={{display: 'flex',flexDirection: 'column',width: '100%'}}>
                                                    <View style={{display: 'flex',flexDirection: 'row'}}>
                                                        <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginRight: 5}}>
                                                            {
                                                                comment.profileUrl=="" || comment.profileUrl==undefined
                                                                ?
                                                                <Pressable onPress={()=>{

                                                                }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                                  {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                                                  <FontAwesomeIcon icon="fa-solid fa-user" size={20} style={{color: '#fff'}}/>
                                                                </Pressable>
                                                                :
                                                                <Image src={comment.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#ddd',}}/>
                                                            }
                                                        </View>
                                                        <View style={{marginBottom: 5,display: 'flex',justifyContent: 'center',marginLeft: 5}}>
                                                            <Text style={{textAlignVertical: 'center',fontSize: 21,fontWeight: '500',color: '#fff',fontFamily: 'LeagueSpartan'}}>{comment.name}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{display: 'flex',flexDirection: 'column',marginLeft: 10,width: '100%',marginBottom:0}}>
                                                        
                                                        <View style={{width: '65%',marginTop: 15}}>
                                                            <Text style={{textAlignVertical: 'center',fontSize: 16,color: '#ddd',fontWeight: '400',fontFamily: 'LeagueSpartan'}}>{comment.comment}</Text>
                                                        </View>
                                                        <View style={{display: 'flex',flexDirection: 'row',alignItems:'center',marginTop: 15}}>
                                                            {
                                                                comment.likes.some(e => e.uid == `${userID}`)
                                                                ?
                                                                <Pressable onPress={()=>{
                                                                    unlikeComment(comment)
                                                                }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>
                                                                    {/* <Image source={likeBlue} style={{height: 14,width: 14}}/> */}
                                                                    <FontAwesomeIcon icon="fa-solid fa-heart" size={15} style={{color: 'red'}}/>
                                                                </Pressable>
                                                                :
                                                                <Pressable onPress={()=>{
                                                                    likeComment(comment)
                                                                }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>
                                                                    {/* <Image source={likeBlack} style={{height: 14,width: 14}}/> */}
                                                                    <FontAwesomeIcon icon={faHeart} size={15} style={{color: '#fff'}}/>
                                                                </Pressable>
                                                            }
                                                            <Pressable style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginLeft: 5}}>
                                                                <Text style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center',color: '#fff'}}>{comment.likes.length}</Text>
                                                            </Pressable>
                                                            <Text style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center',marginLeft: 10,fontSize: 14,color:'#fff',fontWeight: '600',fontFamily: 'LeagueSpartan'}}>Reply</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{position: 'absolute',bottom: 5,right: 10}}>
                                                    {
                                                        time.slice(0,2)<12
                                                        ?
                                                        <Text style={{color: '#fff',fontSize: 14,fontWeight: '500',fontFamily: 'LeagueSpartan'}}>{time} AM</Text>
                                                        :
                                                        <Text style={{color: '#fff',fontSize: 14,fontWeight: '500',fontFamily: 'LeagueSpartan'}}> {time} PM</Text>
                                                    }     
                                                </View>
                                                {
                                                    comment.uid==userID
                                                    ?
                                                    <Pressable onPress={()=>{
                                                        deleteComment(clickedWorkout,comment)
                                                    }} style={{position: 'absolute',top: 20,right: 10}}>
                                                        {/* <Image source={deleteIcon} style={{height: 20,width: 20}}/> */}
                                                        <FontAwesomeIcon icon="fa-solid fa-trash" size={18} style={{color: '#fff'}}/>
                                                    </Pressable>
                                                    :
                                                    null
                                                }
                                            </View>
                                        )
                                    })
                                }
                                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: 10,width:'100%'}}>
                                    <TextInput value={commentInput} onChangeText={(text)=>{
                                        setCommentInput(text);
                                    }} placeholder='Add a comment' placeholderTextColor='#fff' style={{width: '85%',fontFamily: 'LeagueSpartan',minHeight:30,fontSize: 17,color: '#fff',backgroundColor: '#363636',padding: 10,paddingLeft: 15,borderRadius: 15,paddingTop: 5,paddingBottom: 5}}/>
                                    <Pressable style={{justifyContent: 'center',alignItems: 'center',backgroundColor: '#3e3e3e',padding: 7.5,borderRadius: 50}} onPress={()=>{
                                        addComments(clickedWorkout)
                                    }}>
                                        {/* <Image source={addComment} style={{height: 30,width:31}}/> */}
                                        <FontAwesomeIcon icon="fa-solid fa-arrow-up" size={25} style={{color: '#fff'}}/>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </ScrollView>
                        :
                        <ScrollView  contentContainerStyle={{width: '100%',backgroundColor: '#1e1e1e',display: 'flex',marginTop: 40,marginBottom: 50,minHeight: 500,borderRadius: 10,padding: 20}}>
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative',marginBottom: 20}}>
                                <View style={{position: 'absolute',left: 0}}>
                                    <Pressable onPress={()=>{
                                        setShowLikesBool(false);
                                    }} >
                                        {/* <Image source={backIconWhite} style={{height: 30,width: 30,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/> */}
                                        <FontAwesomeIcon icon="fa-solid fa-arrow-left" size={25} style={{color: '#fff',marginRight: 10}}/>
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
                                                            <Pressable onPress={()=>{

                                                            }} style={{padding: 10,borderRadius: 50,backgroundColor: '#ddd'}}>
                                                              {/* <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,}}/> */}
                                                              <FontAwesomeIcon icon="fa-solid fa-user" size={35} style={{color: '#fff'}}/>
                                                            </Pressable>
                                                            :
                                                            <Image src={user.profileUrl} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#DDD'}}/>
                                                        }
                                                    </Pressable>
                                                    <Text style={{textAlign: 'center',marginLeft: 10,fontSize: 17,color: '#fff',fontWeight: '500',fontFamily:'LeagueSpartan'}}>{user.name}</Text>
                                                </View>
                                                <View style={{marginRight: 10}}>
                                                    <Pressable>
                                                        {/* <Image source={likeBlue} style={{height: 20,width: 20}}/> */}
                                                        <FontAwesomeIcon icon="fa-solid fa-heart" size={20} style={{color: 'red'}}/>
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
                </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    individualWorkout: {
        backgroundColor: '#202020',
        borderRadius: 15,
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
        marginTop: 10
    },
    individualWorkoutExercises: {
        marginTop: 20,
        paddingTop: 10,
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
        backgroundColor: '#202020',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 10,
        
    },
    workoutTime: {
        fontWeight: '600',
        color: 'white',
    },
    box: {
        height: 40,
        width: 15,
        backgroundColor: '#F7F6F6'
    }
})

export default IndividualWorkout