import React, { useEffect, useState,useRef } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView, TextInput,ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs,doc,deleteDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useRoute } from '@react-navigation/native';


const backIconWhite = require("../assets/back-arrow-icon-white.png");
const backIconBlack = require("../assets/back-arrow-icon.png");
const editIcon = require("../assets/edit-icon.png");
const deleteIcon = require("../assets/delete-icon.png");
const crossIconBlack = require("../assets/cross-icon-black.png");
const plusIconWhite = require("../assets/plus-icon-white.png");
const tickIconBlack = require("../assets/tick-icon-black.png");
const deleteIconBlack = require("../assets/delete-icon-black.png");

const IndividualWorkout = ({ID,showWorkoutBox,showNavbar,uid}) => {
    const [editWorkout,setEditWorkout] = useState(false);
    const [clickedWorkout,setClickedWorkout] = useState({});
    const [originalClickedWorkout,setOriginalClickedWorkout] = useState({});
    const [editedWorkoutName,setEditedWorkoutName] = useState("");
    const [isLoading,setIsLoading] = useState(true);
    const [docID,setDocID] = useState("");
    const [readOnly,setReadOnly] = useState(false);

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

    const autoScroll = () => {
        scrollViewRef.current.scrollToEnd({animated: true});
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
        <ScrollView contentContainerStyle={styles.individualWorkout} style={{width: '100%'}}>
            <View style={styles.individualWorkoutHeader}>
                <View style={{display: 'flex',flexDirection: 'row'}}>
                    <Pressable onPress={() => {
                        showWorkoutBox(false);
                        if(route.name!='IndividualUser'){
                            showNavbar(true);
                        }
                    }}>
                        <Image source={backIconWhite} style={{display: 'flex',height: 35,width: 35,alignItems: 'center',justifyContent: 'center'}}></Image>
                    </Pressable>
                    <Text style={{display: 'flex',color: '#fff',fontSize: 22.5,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',borderBottomColor: 'white',borderBottomWidth: 2,paddingBottom: 5}}>{clickedWorkout.workoutName}</Text>
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
                    :
                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '80%'}}>
                        <ActivityIndicator size="large" color="#fff"/>
                    </View>
                }
            </View>
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
        marginTop: 15,
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
    }
})

export default IndividualWorkout