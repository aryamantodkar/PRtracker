import React, { useEffect, useState,useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView, TextInput,ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs,doc,deleteDoc,updateDoc,getDoc,serverTimestamp,Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useRoute } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';


const backIconWhite = require("../assets/back-arrow-icon-white.png");
const backIconBlack = require("../assets/back-arrow-icon.png");
const editIcon = require("../assets/edit-icon.png");
const deleteIcon = require("../assets/delete-icon.png");
const crossIconBlack = require("../assets/cross-icon-black.png");
const plusIconWhite = require("../assets/plus-icon-white.png");
const tickIconBlack = require("../assets/tick-icon-black.png");
const deleteIconBlack = require("../assets/delete-icon-black.png");
const pfp = require("../assets/pfp.jpg");
const like = require("../assets/like-icon-outline.png");
const likeBlack = require("../assets/like-icon-outline-black.png");
const likeBlue = require("../assets/like-icon-blue.png");
const comment = require("../assets/comment-icon.png");
const commentBlack = require("../assets/comment-icon-black.png");
const addComment = require("../assets/add-comment.png");


const IndividualWorkout = ({ID,showWorkoutBox,showNavbar,uid}) => {
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

    const scrollViewRef = useRef();

    const navigation = useNavigation();
    const auth = getAuth();
    var userID = auth.currentUser.uid;
    const route = useRoute();

    const deleteWorkout = async () => {
        const q = query(collection(FIREBASE_DB, `${userID}`));

        let docID = "";

        const querySnapshot = getDocs(q)
        .then(async (snap) => {
            snap.forEach((doc) => {
                if(doc.data().id==clickedWorkout.id){
                    docID = doc.id;
                }
            }); 

            await deleteDoc(doc(FIREBASE_DB, `${userID}`, `${docID}`));
            showWorkoutBox(false);
            if(uid==null){
                showNavbar(true);
            }
        })
    }

    const autoScroll = () => {
        scrollViewRef.current.scrollToEnd({animated: true});
    }


    useEffect(()=>{
        if(uid!=null){
            userID = uid;
            setReadOnly(true);
        }
        
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

        if(nameSnap.exists()){
            name = nameSnap.data().name;
        }

        likeArray.push({
            uid: userID,
            name: name
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
        setIsLoading(true);

        let randomID = uuidv4();
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
            likes: []
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
        setIsLoading(true);

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

  return (
        editWorkout
        ?
        <ScrollView ref={scrollViewRef} style={[styles.individualWorkout,{backgroundColor: '#fff',borderColor: '#f5f4f4',borderWidth: 3}]}>
            <View style={styles.individualWorkoutHeader}>
                <View style={{display: 'flex',flexDirection: 'row'}}>
                    <TextInput value={editedWorkoutName} placeholder={editedWorkoutName} onChangeText={async(text) => {
                        setEditedWorkoutName(text);
                    }} style={{display: 'flex',color: '#000',fontSize: 22.5,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',borderBottomColor: '#000',borderBottomWidth: 2,paddingBottom: 5,marginLeft: 5,}}/>
                </View>
                <View style={{display: 'flex',flexDirection: 'row'}}>
                    <Pressable onPress={async ()=>{
                        setEditWorkout(false);
                        setEditedWorkoutName(originalClickedWorkout.workoutName);
                        getOriginalWorkout();

                        setClickedWorkout(originalClickedWorkout);
                    }}>
                        <Image source={crossIconBlack} style={{height: 20,width: 20,marginRight: 10}}/>
                    </Pressable>
                    <Pressable onPress={async ()=>{
                        setEditWorkout(false);
                        setEditedWorkoutName(clickedWorkout.workoutName);

                        const nameRef = doc(FIREBASE_DB, `${userID}`, `${docID}`);
                        await updateDoc(nameRef, clickedWorkout);
                    }}>
                        <Image source={tickIconBlack} style={{height: 22.5,width: 22.5,marginRight: 10,marginLeft: 10}}></Image>
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

                    autoScroll();

                }} style={{backgroundColor: 'black',width: '100%',display: 'flex',justifyContent: 'space-between',alignItems: 'center',marginLeft: 'auto',marginRight: 'auto',padding: 7.5,borderRadius: 10,flexDirection: 'row',marginBottom: 20,paddingLeft: 10,paddingRight: 10}}>
                    <Text style={{color: '#fff',fontSize: 17,fontWeight: 500}}>Add Exercise</Text>
                    <Image source={plusIconWhite} style={{height: 17.5,width: 17.5}}/>
                </Pressable>
                {
                    clickedWorkout.allWorkouts!=undefined
                    ?
                    clickedWorkout.allWorkouts.map(exercises => {
                        if(exercises!=undefined){
                            return(
                                <View key={exercises.id}>
                                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between'}}>
                                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                            <Text style={{color: '#fff',fontSize: 17.5,marginRight: 7.5,backgroundColor: '#000',borderRadius: 50,padding:5,paddingLeft: 12,paddingRight: 12,display: 'flex',alignItems: 'center',textAlign: 'center',fontWeight: '600'}}>{exercises.id+1}</Text>
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
    
                                                
                                            }} style={{color: '#000',fontSize: 20,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',borderBottomColor: '#000',borderBottomWidth: 2,paddingBottom: 5,maxWidth: 150}}/>
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


                                                }} style={{backgroundColor: '#000',padding: 10,borderRadius: 50,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',paddingLeft: 10,paddingRight: 10,marginLeft: 10}}>
                                                
                                                <Image source={plusIconWhite} style={{height: 15,width: 15}}/>
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

                                                console.log("rep array",replaceArray);

                                                setClickedWorkout({
                                                    ...clickedWorkout,
                                                    allWorkouts: replaceArray
                                                });

                                            }} style={{backgroundColor: '#000',padding: 10,borderRadius: 50,display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',paddingLeft: 10,paddingRight: 10,marginLeft: 10}}>
                                                <Image source={deleteIcon} style={{height: 15,width: 15}}/>
                                            </Pressable>
                                        </View>
                                    </View>
                                    <View style={{marginBottom: 20,marginTop: 20}}>
                                        {
                                            exercises.allSets.map(sets => {
                                                return(
                                                    <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-around',marginTop: 10,marginBottom: 10}} key={sets.id}>
                                                        <View style={{backgroundColor: '#000',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 70,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>
                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                        </View>
                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                            <View style={{borderWidth: 2,borderColor: '#DDD',borderRadius: 10,padding: 5,width: 70}}>
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

                                                                }} style={{color: '#000',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}/>
                                                            </View>
                                                            <Text style={{color: 'grey',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',marginLeft: 7.5}}>kg</Text>
                                                        </View>
                                                        <View style={{padding: 5,paddingLeft: 5,paddingRight: 5}}>
                                                            <Text style={{color: '#000',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>x</Text>
                                                        </View>
                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                            <View style={{borderWidth: 2,borderColor: '#DDD',borderRadius: 10,padding: 5,paddingLeft: 10,paddingRight: 10,width: 50}}>
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
                                                                }} style={{color: '#000',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',verticalAlign:'middle',textAlignVertical: 'center'}}/>
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
                                                            <Image source={deleteIconBlack} style={{height: 21,width: 21}}/>
                                                        </Pressable>
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
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
                                    {
                                        exercises.id+1 < clickedWorkout.allWorkouts.length
                                        ?
                                        <View style={{borderWidth: 1,borderColor: '#DDD',marginBottom: 20}}></View>
                                        :
                                        null
                                    }
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
        <ScrollView style={{marginBottom: 0,paddingBottom: 0}}>
            {
                !showLikesBool
                ?
                <ScrollView style={{marginBottom: 0,paddingBottom: 0}}>
                    <ScrollView contentContainerStyle={styles.individualWorkout} style={{width: '100%'}}>
                        <View style={styles.individualWorkoutHeader}>
                            <View style={{display: 'flex',flexDirection: 'column'}}>
                                <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}}>
                                    <Pressable onPress={() => {
                                        showWorkoutBox(false);
                
                                        if(route.name!='IndividualUser'){
                                            showNavbar(true);
                                        }
                                    }}>
                                        <Image source={backIconWhite} style={{display: 'flex',height: 35,width: 35,alignItems: 'center',justifyContent: 'center'}}></Image>
                                    </Pressable>
                                    <Text style={{display: 'flex',color: '#fff',fontSize: 22,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',borderBottomColor: 'white',borderBottomWidth: 2,paddingBottom: 5}}>{clickedWorkout.workoutName}</Text>
                                </View>
                                
                            </View>
                            
                            {
                                !readOnly
                                ?
                                <View style={{display: 'flex',flexDirection: 'row'}}>
                                    <Pressable onPress={()=>{
                                        setEditWorkout(true);
                                    }}>
                                        <Image source={editIcon} style={{height: 20,width: 20,marginRight: 10}}/>
                                    </Pressable>
                                    <Pressable onPress={()=>{
                                        deleteWorkout();
                                    }}>
                                        <Image source={deleteIcon} style={{height: 20,width: 20,marginRight: 10}}/>
                                    </Pressable>
                                </View>
                                :
                                null
                            }
                        </View>
                        <View style={styles.individualWorkoutExercises}>
                            {
                                !isLoading
                                ?
                                <View style={{display: 'flex',flexDirection: 'column'}}>
                                    <View style={{position: 'absolute',top: -20,right: 10}}>
                                        {
                                            clickedWorkout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                            ?
                                            <Text style={{color: '#EEEEEE',fontSize: 14,fontWeight: '500'}}>{clickedWorkout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                            :
                                            <Text style={{color: '#EEEEEE',fontSize: 14,fontWeight: '500'}}>{clickedWorkout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                        }       
                                    </View>
                                    {
                                        clickedWorkout.allWorkouts.map(exercises => {
                                            return(
                                                <View key={exercises.id}>
                                                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                                        <Text style={{color: '#fff',fontSize: 15,marginRight: 15,borderColor: '#fff',borderWidth: 2,borderRadius: 50,padding: 5,paddingLeft: 10,paddingRight: 10,display: 'flex',alignItems: 'center',textAlign: 'center',fontWeight: '600'}}>{exercises.id+1}</Text>
                                                        <Text style={{color: '#fff',fontSize: 20,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',borderBottomColor: 'white',borderBottomWidth: 2,paddingBottom: 5}}>{exercises.exerciseName}</Text>
                                                    </View>
                                                    <View style={{marginBottom: 20,marginTop: 20}}>
                                                        {
                                                            exercises.allSets.map(sets => {
                                                                return(
                                                                    <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-around',marginTop: 10,marginBottom: 10}} key={sets.id}>
                                                                        <View style={{borderWidth: 2,borderColor: '#fff',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 70}}>
                                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                                        </View>
                                                                        <View style={{borderWidth: 2,borderColor: '#fff',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 90}}>
                                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>{sets.weight} kg</Text>
                                                                        </View>
                                                                        <View style={{padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10}}>
                                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>x</Text>
                                                                        </View>
                                                                        <View style={{borderWidth: 2,borderColor: '#fff',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 60}}>
                                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',verticalAlign:'middle',textAlignVertical: 'center'}}>{sets.reps}</Text>
                                                                        </View>
                                                                    </View>
                                                                )
                                                            })
                                                        }
                                                    </View>
                                                </View>
                                            )
                                        })
                                    }
                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',width: '100%',padding: 10}}>
                                        {
                                            clickedWorkout.likes.length>2
                                            ?
                                            <View>
                                                <Pressable onPress={()=>{
                                                    showLikes(clickedWorkout.likes);
                                                }} style={{width:'100%',position: 'relative',display: 'flex',flexDirection: 'row'}}>
                                                    <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white'}}/>
                                                    <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: -10}}/>
                                                    <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: -10}}/>
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
                                                        <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white'}}/>
                                                        <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white',marginLeft: -10}}/>
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
                                                                <Image source={pfp} style={{height: 25,width: 25,borderRadius: 50,borderWidth: 1.5,borderColor: 'white'}}/>
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
                                                <Image source={likeBlue} style={styles.likeIcon}/>
                                            </Pressable>
                                            :
                                            <Pressable onPress={()=>{
                                                likeWorkout(clickedWorkout)
                                            }}>
                                                <Image source={like} style={styles.likeIcon}/>
                                            </Pressable>
                                        }
                                        <Pressable>
                                            <Image source={comment} style={styles.commentIcon}/>
                                        </Pressable>
                                    </View>
                                </View>
                                :
                                <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '80%'}}>
                                    <ActivityIndicator size="large" color="#fff"/>
                                </View>
                            }
                        </View>
                        
                    </ScrollView>
                    {
                        isLoading
                        ?
                        <View style={{width: '100%',height: '100%'}}>
                            <ActivityIndicator size="large" color="#000"/>
                        </View>
                        :
                        <ScrollView  style={{backgroundColor: '#f5f4f4',borderColor: '#DDD',borderWidth: 1,marginTop: 30,borderRadius: 15,padding: 20,position: 'relative'}}>
                            <View style={{display: 'flex',flexDirection: 'row',alignItems: 'flex-start',justifyContent: 'flex-start',marginBottom: 10}}>
                                <Pressable style={{marginRight: 10,justifyContent: 'center',alignItems: 'center'}}>
                                    <Image source={commentBlack} style={styles.commentIcon}/>
                                </Pressable>
                                <Text style={{fontSize: 17,color: 'black',textAlignVertical: 'center',textAlign: 'center',fontWeight: '500'}}>{clickedWorkout.comments.length} Comments</Text>
                            </View>
                            
                            {
                                clickedWorkout.comments.map(comment => {
                                    let time = new Date(comment.timeStamp * 1000).toTimeString().slice(0,5);

                                    if(comment.timeStamp.seconds==undefined && comment.timeStamp.nanoseconds==undefined){
                                        time = new Date(comment.timeStamp).toTimeString().slice(0,5);
                                    }

                                    return(
                                        <View key={comment.id} style={{display: 'flex',flexDirection: 'row',width: '100%',alignItems: 'center',position: 'relative',backgroundColor: '#fff',borderWidth: 1.5,borderColor: '#DDD',padding: 10,borderRadius: 10,marginTop: 10,marginBottom: 10}}>
                                            <View style={{display: 'flex',flexDirection: 'row'}}>
                                                <View style={{display: 'flex'}}>
                                                    <Image source={pfp} style={{height: 40,width: 40,borderRadius: 50,borderWidth: 2,borderColor: '#ddd',}}/>
                                                </View>
                                                <View style={{display: 'flex',flexDirection: 'column',marginLeft: 10,width: '100%',marginBottom:0}}>
                                                    <View style={{marginBottom: 5,display: 'flex',justifyContent: 'center'}}>
                                                        <Text style={{textAlignVertical: 'center',fontSize: 16,fontWeight: '500',color: '#018FF5'}}>{comment.name}</Text>
                                                    </View>
                                                    <View style={{width: '65%'}}>
                                                        <Text style={{textAlignVertical: 'center',fontSize: 14,color: '#000',fontWeight: '400'}}>{comment.comment}</Text>
                                                    </View>
                                                    <View style={{display: 'flex',flexDirection: 'row',alignItems:'center',marginTop: 15}}>
                                                        {
                                                            comment.likes.some(e => e.uid == `${userID}`)
                                                            ?
                                                            <Pressable onPress={()=>{
                                                                unlikeComment(comment)
                                                            }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>
                                                                <Image source={likeBlue} style={{height: 14,width: 14}}/>
                                                            </Pressable>
                                                            :
                                                            <Pressable onPress={()=>{
                                                                likeComment(comment)
                                                            }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>
                                                                <Image source={likeBlack} style={{height: 14,width: 14}}/>
                                                            </Pressable>
                                                        }
                                                        <Pressable style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginLeft: 5}}>
                                                            <Text style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center'}}>{comment.likes.length}</Text>
                                                        </Pressable>
                                                        <Text style={{display: 'flex',justifyContent: 'center',alignItems: 'center',textAlign: 'center',marginLeft: 10,fontSize: 12,color:'#8A8A8A',fontWeight: '600'}}>Reply</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{position: 'absolute',bottom: 5,right: 10}}>
                                                {
                                                    time.slice(0,2)<12
                                                    ?
                                                    <Text style={{color: '#000',fontSize: 12,fontWeight: '500'}}>{time} AM</Text>
                                                    :
                                                    <Text style={{color: '#000',fontSize: 12,fontWeight: '500'}}> {time} PM</Text>
                                                }     
                                            </View>
                                            {
                                                comment.uid==userID
                                                ?
                                                <Pressable onPress={()=>{
                                                    deleteComment(clickedWorkout,comment)
                                                }} style={{position: 'absolute',top: 10,right: 10}}>
                                                    <Image source={deleteIconBlack} style={{height: 20,width: 20}}/>
                                                </Pressable>
                                                :
                                                null
                                            }
                                        </View>
                                    )
                                })
                            }
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',marginTop: 10}}>
                                <TextInput value={commentInput} onChangeText={(text)=>{
                                    setCommentInput(text);
                                }} placeholder='Add a comment' style={{maxWidth: 250,width: '100%',minHeight:30,backgroundColor: 'white',padding: 10,borderRadius: 15,paddingTop: 5,paddingBottom: 5}}/>
                                <Pressable style={{marginRight: 10,justifyContent: 'center',alignItems: 'center',marginLeft: 10}} onPress={()=>{
                                    addComments(clickedWorkout)
                                }}>
                                    <Image source={addComment} style={styles.commentIcon}/>
                                </Pressable>
                            </View>
                        </ScrollView>
                        }
                </ScrollView>
                :
                <ScrollView  contentContainerStyle={{borderWidth:1,borderColor: '#DDD',backgroundColor:'#f5f4f4',width: '100%',display: 'flex',marginTop: 40,marginBottom: 50,minHeight: 500,borderRadius: 10,padding: 20}}>
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
        </ScrollView>
  )
}

const styles = StyleSheet.create({
    individualWorkout: {
        backgroundColor: 'black',
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
        justifyContent: 'space-between'
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
        backgroundColor: '#000',
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
})

export default IndividualWorkout