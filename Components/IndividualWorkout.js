import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView, TextInput,ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs,doc,deleteDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';


const backIconWhite = require("../assets/back-arrow-icon-white.png");
const backIconBlack = require("../assets/back-arrow-icon.png");
const editIcon = require("../assets/edit-icon.png");
const deleteIcon = require("../assets/delete-icon.png");
const crossIconBlack = require("../assets/cross-icon-black.png");
const plusIconWhite = require("../assets/plus-icon-white.png");
const tickIconBlack = require("../assets/tick-icon-black.png");

const IndividualWorkout = ({ID,showWorkoutBox,showNavbar}) => {
    const [editWorkout,setEditWorkout] = useState(false);
    const [clickedWorkout,setClickedWorkout] = useState({});
    const [originalClickedWorkout,setOriginalClickedWorkout] = useState({});
    const [editedWorkoutName,setEditedWorkoutName] = useState("");
    const [isLoading,setIsLoading] = useState(true);
    const [docID,setDocID] = useState("");


    const navigation = useNavigation();
    const auth = getAuth();
    const userID = auth.currentUser.uid;
    
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
            showNavbar(true);
        })
    }

    useEffect(()=>{
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

    // const getWorkout = () => {
    //     const q = query(collection(FIREBASE_DB, `${userID}`));

    //     const querySnapshot = getDocs(q)
    //     .then(snap => {
    //         snap.forEach((doc) => {
    //             if(doc.data().id==ID){
    //                 setClickedWorkout(doc.data());
    //                 setEditedWorkoutName(doc.data().workoutName);
    //             }
    //         });
    //     })
    // }

  return (
        editWorkout
        ?
        <ScrollView style={[styles.individualWorkout,{backgroundColor: '#fff',borderColor: '#f5f4f4',borderWidth: 3}]}>
            <View style={styles.individualWorkoutHeader}>
                <View style={{display: 'flex',flexDirection: 'row'}}>
                    {/* <Pressable onPress={() => {
                        showWorkoutBox(false);
                        setEditWorkout(false);
                        showNavbar(true);
                    }} style={{display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                        <Image source={backIconBlack} style={{display: 'flex',height: 35,width: 35,alignItems: 'center',justifyContent: 'center'}}></Image>
                    </Pressable> */}
                    <TextInput value={editedWorkoutName} placeholder={editedWorkoutName} onChangeText={async(text) => {
                        setEditedWorkoutName(text);
                        const nameRef = doc(FIREBASE_DB, `${userID}`, `${docID}`);
                        await updateDoc(nameRef, {
                            workoutName: text
                        });
                    }} style={{display: 'flex',color: '#000',fontSize: 22.5,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',borderBottomColor: '#000',borderBottomWidth: 2,paddingBottom: 5,marginLeft: 5,}}/>
                </View>
                <View style={{display: 'flex',flexDirection: 'row'}}>
                    <Pressable onPress={async ()=>{
                        setEditWorkout(false);
                        setEditedWorkoutName(originalClickedWorkout.workoutName);
                        setClickedWorkout(originalClickedWorkout);

                        const nameRef = doc(FIREBASE_DB, `${userID}`, `${docID}`);
                        await updateDoc(nameRef, originalClickedWorkout);

                    }}>
                        <Image source={crossIconBlack} style={{height: 20,width: 20,marginRight: 10}}/>
                    </Pressable>
                    <Pressable onPress={async ()=>{
                        setEditWorkout(false);
                        setEditedWorkoutName(clickedWorkout.workoutName);

                        const nameRef = doc(FIREBASE_DB, `${userID}`, `${docID}`);
                        await updateDoc(nameRef, clickedWorkout);
                    }}>
                        <Image source={tickIconBlack} style={{height: 20,width: 20,marginRight: 10,marginLeft: 10}}></Image>
                    </Pressable>
                </View>
            </View>
            <View style={styles.individualWorkoutExercises}>
                {
                    clickedWorkout.allWorkouts!=undefined
                    ?
                    clickedWorkout.allWorkouts.map(exercises => {
                        if(exercises!=undefined){
                            return(
                                <View key={exercises.id}>
                                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between'}}>
                                        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                            <Text style={{color: '#fff',fontSize: 15,marginRight: 7.5,backgroundColor: '#000',borderRadius: 50,padding: 5,paddingLeft: 10,paddingRight: 10,display: 'flex',alignItems: 'center',textAlign: 'center',fontWeight: '600'}}>{exercises.id+1}</Text>
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
    
                                                
                                            }} style={{color: '#000',fontSize: 20,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',borderBottomColor: '#000',borderBottomWidth: 2,paddingBottom: 5}}/>
                                        </View>
                                        <View style={{backgroundColor: '#000',padding: 5,borderRadius: 50}}>
                                            <Image source={plusIconWhite} style={{height: 15,width: 15}}/>
                                        </View>
                                    </View>
                                    <View style={{marginBottom: 20,marginTop: 20}}>
                                        {
                                            exercises.allSets.map(sets => {
                                                return(
                                                    <View style={{display: 'flex',flexDirection: 'row', justifyContent: 'space-around',marginTop: 10,marginBottom: 10}} key={sets.id}>
                                                        <View style={{backgroundColor: '#000',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 70}}>
                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>Set {sets.id}</Text>
                                                        </View>
                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                            <View style={{borderBottomWidth: 2,borderBottomColor: '#000',padding: 5,paddingLeft: 10,paddingRight: 10,width: 50}}>
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
                                                            <Text style={{color: '#000',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center',marginLeft: 5}}>kg</Text>
                                                        </View>
                                                        <View style={{padding: 5,paddingLeft: 5,paddingRight: 5}}>
                                                            <Text style={{color: '#000',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>x</Text>
                                                        </View>
                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                            <View style={{borderBottomWidth: 2,borderBottomColor: '#000',padding: 5,paddingLeft: 10,paddingRight: 10,width: 50}}>
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
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            )
                        }
                    }) 
                    :
                    <View>{
                            console.log("YOPOOOOOO",clickedWorkout)
                        }</View> 
                }
            </View>
        </ScrollView>
        :
        <ScrollView style={styles.individualWorkout}>
            <View style={styles.individualWorkoutHeader}>
                <View style={{display: 'flex',flexDirection: 'row'}}>
                    <Pressable onPress={() => {
                        showWorkoutBox(false);
                        showNavbar(true);
                    }}>
                        <Image source={backIconWhite} style={{display: 'flex',height: 35,width: 35,alignItems: 'center',justifyContent: 'center'}}></Image>
                    </Pressable>
                    <Text style={{display: 'flex',color: '#fff',fontSize: 22.5,alignItems: 'center',justifyContent: 'center',textAlignVertical: 'center',borderBottomColor: 'white',borderBottomWidth: 2,paddingBottom: 5}}>{clickedWorkout.workoutName}</Text>
                </View>
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
                                                    <View style={{borderWidth: 2,borderColor: '#fff',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 80}}>
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
        height: '100%',
        overflow: 'scroll',
        padding: 15,
        
    },
    individualWorkoutHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    individualWorkoutExercises: {
        padding: 10,
        marginTop: 15
    }
})

export default IndividualWorkout