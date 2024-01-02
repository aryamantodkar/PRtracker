import { StyleSheet, Text, View,ScrollView, TextInput, Pressable,Image,KeyboardAvoidingView,Platform,Keyboard } from 'react-native'
import React, { useState,useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useRef} from 'react';
import { Firestore, Timestamp, doc, serverTimestamp, setDoc,getDoc,collection,getDocs,getFirestore,onSnapshot,addDoc } from "firebase/firestore"; 
import { FIREBASE_APP, FIREBASE_DB, firebaseConfig,  } from '../FirebaseConfig';
import { getAuth } from "firebase/auth";

const plusWhite = require("../assets/plus-icon-white.png");
const deleteIcon = require("../assets/delete-icon.png");
const crossIconWhite = require("../assets/cross-icon-white.png");
const crossIconBlack = require("../assets/cross-icon-black.png");
const tickIcon = require("../assets/tick-icon.png");
const tickIconBlack = require("../assets/tick-icon-black.png");
const editIcon = require("../assets/edit-icon.png");

const NewWorkout = ({navigation}) => {
    const [workoutName,setWorkoutName] = useState("");
    const [exerciseName,setExerciseName] = useState("");

    const [allSets,setAllSets] = useState([]);
    const [totalSets,setTotalSets] = useState(0);

    const [allWorkouts,setAllWorkouts] = useState([]);
    const [totalWorkouts,setTotalWorkouts] = useState(0);
    const [showExerciseContainer,setShowExerciseContainer] = useState(true);

    const [weight,setWeight] = useState("");
    const [reps,setReps] = useState("");

    const[addSet,setAddSet] = useState(false);
    const[delSet,setDelSet] = useState(false);
    const [deleteID,setDeleteID] = useState(0);

    const weightRef = useRef(null);
    const repsRef = useRef(null);

    const [exerciseAdded,setExerciseAdded] = useState(false);

    const [showAddedExercises,setShowAddedExercises] = useState(false);

    const [keyboardStatus, setKeyboardStatus] = useState(false);

    const [workoutsTillNow,setWorkoutsTillNow] = useState(0);

    const [deleteWorkoutID,setDeleteWorkoutID] = useState(0);

    const [editWorkoutID,setEditWorkoutID] = useState(-1);

    const [editWorkoutBool,setEditWorkoutBool] = useState(false);

    const [editedWorkoutName,setEditedWorkoutName] = useState("");

    const [editTickIconBool,setEditTickIconBool] = useState(false);

    //track input
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("user has stopped typing", exerciseName);
        }, 500)

        return () => clearTimeout(timer)
    }, [exerciseName])

    //track sets
    useEffect(() => {
        if(totalSets>0){
            if(addSet){
                setAllSets([...allSets,{
                    weight,
                    reps,
                    id: totalSets,
                }])
                setWeight("");
                setReps("");
                setAddSet(false);
            }
            if(delSet && deleteID!=""){
                let newArr = allSets.filter(s => {
                    return s.id != deleteID;
                });
                newArr.map(s => {
                    if(s.id>deleteID){
                        return s.id -= 1;
                    }
                    else return null;
                })
        
                setAllSets(newArr)
                setDeleteID("");
            }
        }
    }, [totalSets])

    //track workouts and delete workouts

    useEffect(() => {
        if(totalWorkouts>0){
            setShowExerciseContainer(true);
        }

        if(workoutsTillNow>totalWorkouts){
            let arrayAfterDeletion = allWorkouts.map(workout => {
                if(workout.id>deleteWorkoutID){
                    return {
                        ...workout,
                        id: workout.id-1,
                    }
                }
                else{
                    return workout;
                }
            });
            setAllWorkouts(arrayAfterDeletion);
        }
    }, [totalWorkouts])

    // show previously added exercises

    useEffect(()=>{
        if(allWorkouts.length>0){
            setShowAddedExercises(true);
            setShowExerciseContainer(false);
        }
        console.log("all workouts",allWorkouts)

        
    },[allWorkouts])

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardStatus(true);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatus(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const addSets = () => {
        setTotalSets(totalSets+1);
        setAddSet(true);
    }

    const deleteSet = (id) => {
        setTotalSets(totalSets-1);
        setDelSet(true);
        setDeleteID(id);
    }

    const newExercise = () => {
        setExerciseAdded(false);
        setTotalWorkouts(totalWorkouts+1);
        setWorkoutsTillNow(workoutsTillNow+1);
    }

    const addExercise = () => {
        setExerciseAdded(true);
        setShowExerciseContainer(false);
        setAllWorkouts([...allWorkouts,{
            exerciseName,
            allSets,
            id: totalWorkouts,
        }])
        setWeight("");
        setReps("");
        setExerciseName("");
        setAllSets([]);
        setTotalSets(0)
    }

    const deleteExercise = (id) => {
        setAllWorkouts(allWorkouts.filter(workout => workout.id!= id));
        setTotalWorkouts(totalWorkouts-1);
        setDeleteWorkoutID(id);
    }

    const addWorkoutToDB = async () => {
        const auth = getAuth();
        const userID = auth.currentUser.uid;

        const res = await addDoc(collection(FIREBASE_DB, `${userID}`),{
            workoutName,
            allWorkouts,
            timeStamp: serverTimestamp()
        })
    }

    const editWorkout = (workout) => {
        setEditWorkoutID(workout.id);
        setEditWorkoutBool(true);
        setEditedWorkoutName(workout.exerciseName);
    }


    return (  
        <KeyboardAvoidingView style={styles.home} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={-25}>
            <ScrollView style={{flex: 1,height: '100%',width: '100%'}} keyboardShouldPersistTaps="always">
                    <View>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',marginBottom: 20}}>
                            <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                <Text style={styles.headingTitle}>New Workout</Text>
                            </View>
                            
                        </View>
                        <View style={styles.workoutCard}>
                            <TextInput style={styles.inputBox} placeholder='Enter Workout Name' value={workoutName} onChangeText={text =>{
                                setWorkoutName(text)
                            }}/>
                            <View style={styles.addExerciseContainer}>
                                <Text style={styles.addExerciseTitle}>New Exercise</Text>
                                {
                                    exerciseAdded || !showExerciseContainer?
                                    <Pressable onPress={newExercise} style={{padding: 5}}>
                                        <Image source={plusWhite} style={styles.plusIcon}/>
                                    </Pressable>
                                    :
                                    <Pressable onPress={()=>setShowExerciseContainer(!showExerciseContainer)} style={{padding: 5}}>
                                        <Image source={crossIconWhite} style={{height: 15,width: 15}}/>
                                    </Pressable>
                                }
                            </View>
                            
                            {
                                showAddedExercises
                                ?
                                allWorkouts.map(workout => {
                                    if(workout!=undefined){
                                        if((!editWorkoutBool) ||(editWorkoutBool && (editWorkoutID!=workout.id))){
                                            return (
                                                <View style={styles.prevWorkoutContainer} key={workout.id}>
                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'}}>
                                                        <View>
                                                            <Text style={styles.prevWorkoutName}>{workout.exerciseName}</Text>
                                                        </View>
                                                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                            <Pressable onPress={()=>{
                                                                editWorkout(workout)
                                                            }}>
                                                                <Image source={editIcon} style={{height: 20,width: 20,marginRight: 10}}/>
                                                            </Pressable>
                                                            <Pressable onPress={()=>{
                                                                deleteExercise(workout.id)
                                                            }}>
                                                                <Image source={deleteIcon} style={{height: 20,width: 20,marginLeft: 10}}/>
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                    {
                                                        workout.allSets.map(set => {
                                                            return(
                                                                <View style={styles.prevWorkoutSet} key={set.id}>
                                                                    <View style={[styles.setBox,{padding: 10,paddingTop:5,paddingBottom: 5,borderColor: '#fff',borderWidth: 2}]}>
                                                                        <Text style={{color: '#fff',fontSize: 15,fontWeight: '600'}}>Set {set.id}</Text>
                                                                    </View>
                                                                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
                                                                        <View style={{padding: 10,width: 70,display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                            <Text style={{color: '#fff',fontSize: 16,fontWeight: '600',borderBottomWidth: 2,borderBottomColor: 'white',alignSelf: 'center',paddingBottom: 5}}>{set.weight} Kg</Text>
                                                                        </View>
                                                                        <View>
                                                                            <Text style={{fontWeight: '500',fontSize: 20,color: '#fff'}}> x </Text>
                                                                        </View>
                                                                        <View style={{padding: 10,width: 80,display: 'flex',justifyContent: 'center',alignItems: 'center'}}>
                                                                            <Text style={{color: '#fff',fontSize: 15,fontWeight: '600',borderWidth: 2,borderBottomColor: 'white',alignSelf: 'center',paddingBottom: 5}}>{set.reps}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            )
                                                        })
                                                    }
                                                </View>
                                            )
                                        }
                                        else{
                                            return(
                                                    <View style={[styles.exerciseContainer,{borderWidth: 2,borderColor: '#DDD',width: '85%',marginTop: 20,borderRadius: 10,}]} key={workout.id}>
                                                        <TextInput style={[styles.inputBox,{paddingLeft: 0}]} placeholder='Enter Exercise Name' value={editedWorkoutName} onChangeText={text =>{
                                                            setEditedWorkoutName(text)
                                                            setEditTickIconBool(true)
                                                        }}/>
                                                        {
                                                            workout.allSets.map(set =>{
                                                                return (
                                                                    <View style={styles.setContainer} key={set.id}>
                                                                        <View style={[styles.setBox,{padding: 15}]}>
                                                                            <View>
                                                                                <Text style={{color: '#fff', fontWeight: '600', fontSize: 15}}>Set {set.id}</Text>
                                                                            </View>
                                                                        </View>
                                                                        <View style={[styles.setInput,{minWidth: 60}]}>
                                                                            <TextInput ref={weightRef} style={{textAlign: 'center', fontWeight: '500'}} placeholder='0' value={set.weight} onChangeText={text => {
                                                                                setEditTickIconBool(true);
                                                                                setAllWorkouts(allWorkouts.map(w => {
                                                                                    if(w!=undefined){
                                                                                        if(w.id==workout.id){
                                                                                            const replaceArray = w.allSets.filter(arr => arr.id!=set.id);
                                                                                            
                                                                                            const workoutObj = {
                                                                                                exerciseName: editedWorkoutName,
                                                                                                allSets: [
                                                                                                    ...replaceArray,
                                                                                                    {
                                                                                                        weight:text,
                                                                                                        reps: set.reps,
                                                                                                        id: set.id
                                                                                                    }
                                                                                                ],
                                                                                                id: w.id
                                                                                            }

                                                                                            workoutObj.allSets.sort((a,b) => a.id-b.id);

                                                                                            return workoutObj;
                                                                                        }
                                                                                        else{
                                                                                            return w;
                                                                                        }
                                                                                    }
                                                                                }))
                                                                            }}></TextInput>
                                                                            <Pressable onPress={()=>{
                                                                                weightRef.current.focus()
                                                                            }}>
                                                                                <Text style={{color: '#373737',fontWeight: '500'}}>Kg</Text>
                                                                            </Pressable>
                                                                        </View>
                                                                        <View style={[styles.setInput,{minWidth: 60}]}>
                                                                            <TextInput ref={repsRef} style={{textAlign: 'center', fontWeight: '500'}} placeholder='0' value={set.reps} onChangeText={text => {
                                                                                setEditTickIconBool(true);
                                                                                setAllWorkouts(allWorkouts.map(w => {
                                                                                    if(w!=undefined){
                                                                                        if(w.id==workout.id){
                                                                                            const replaceArray = w.allSets.filter(arr => arr.id!=set.id);
                                                                                            
                                                                                            const workoutObj = {
                                                                                                exerciseName: editedWorkoutName,
                                                                                                allSets: [
                                                                                                    ...replaceArray,
                                                                                                    {
                                                                                                        weight:set.weight,
                                                                                                        reps: text,
                                                                                                        id: set.id
                                                                                                    }
                                                                                                ],
                                                                                                id: w.id
                                                                                            }

                                                                                            workoutObj.allSets.sort((a,b) => a.id-b.id);

                                                                                            return workoutObj;
                                                                                        }
                                                                                        else{
                                                                                            return w;
                                                                                        }
                                                                                    }
                                                                                }))
                                                                            }}></TextInput>
                                                                            <Pressable onPress={()=>{
                                                                                repsRef.current.focus()
                                                                            }}>
                                                                                <Text style={{color: '#373737',fontWeight: '500'}}>Reps</Text>
                                                                            </Pressable>
                                                                        </View>
                                                                        <View>
                                                                                <Pressable onPress={()=>{
                                                                                    const newSets = workout.allSets.filter(arr => arr.id != set.id);
                                                                                    
                                                                                    let id = 1;

                                                                                    newSets.map(newSet => {
                                                                                        if(newSet.id != id){
                                                                                            newSet.id = id
                                                                                            id++;
                                                                                        }
                                                                                    })

                                                                                    const editedSetWorkout = {
                                                                                        exerciseName: editedWorkoutName,
                                                                                        allSets: newSets,
                                                                                        id: workout.id
                                                                                    }
    
                                                                                    const tempArray = allWorkouts.filter(arr => arr.id != workout.id);

                                                                                    const arr = [...tempArray,editedSetWorkout];

                                                                                    arr.sort((a,b) => a.id-b.id);
    
                                                                                    setAllWorkouts(arr);
    
                                                                                }} style={styles.plusIconContainer}>
                                                                                    <Image source={deleteIcon} style={[styles.plusIcon,{height:17,width: 17}]}/>
                                                                                </Pressable>
                                                                        </View>
                                                                    </View>
                                                                )})
                                                        }
                                                        <View style={styles.setContainer}>
                                                            <View style={[styles.setBox,{padding: 15}]}>
                                                                <View>
                                                                    <View>
                                                                        <Text style={{color: '#fff', fontWeight: '600', fontSize: 15}}>Set {workout.allSets.length+1}</Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <View style={[styles.setInput,{minWidth: 60}]}>
                                                                <TextInput ref={weightRef} style={{textAlign: 'center', fontWeight: '500'}} placeholder='0' value={weight} onChangeText={text => {
                                                                    setWeight(text)
                                                                }}></TextInput>
                                                                <Pressable onPress={()=>{
                                                                    weightRef.current.focus()
                                                                }}>
                                                                    <Text style={{color: '#373737',fontWeight: '500'}}>Kg</Text>
                                                                </Pressable>
                                                            </View>
                                                            <View style={[styles.setInput,{minWidth: 60}]}>
                                                                <TextInput ref={repsRef} style={{textAlign: 'center', fontWeight: '500'}} placeholder='0' value={reps} onChangeText={text => {
                                                                    setReps(text)
                                                                }}></TextInput>
                                                                <Pressable onPress={()=>{
                                                                    repsRef.current.focus()
                                                                }}>
                                                                    <Text style={{color: '#373737',fontWeight: '500'}}>Reps</Text>
                                                                </Pressable>
                                                            </View>
                                                            <View>
                                                                {
                                                                    weight!="" && reps!=""
                                                                    ?
                                                                    <Pressable onPress={()=>{
                                                                        setAllWorkouts(allWorkouts.map(w => {
                                                                            if(w.id == workout.id){
                                                                                return {
                                                                                    ...w,
                                                                                    allSets: [
                                                                                        ...workout.allSets,
                                                                                        {
                                                                                            weight,
                                                                                            reps,
                                                                                            id: workout.allSets.length+1
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            }
                                                                            else{
                                                                                return w;
                                                                            }
                                                                        }))
                                                                        setWeight(0);
                                                                        setReps(0);
                                                                        setEditTickIconBool(true);

                                                                    }} style={styles.plusIconContainer}>
                                                                        <Image source={plusWhite} style={styles.plusIcon}/>
                                                                    </Pressable>
                                                                    :
                                                                    <Pressable style={[styles.plusIconContainer,{backgroundColor:'#C2C2C2'}]}>
                                                                        <Image source={plusWhite} style={styles.plusIcon}/>
                                                                    </Pressable>
                                                                }
                                                            </View>
                                                        </View>


                                                        <View style={{display:"flex",flexDirection: 'row',marginBottom: 10,justifyContent: 'center',alignItems: 'center'}}>
                                                            <Pressable style={{marginLeft: 10,marginRight:10,padding: 10,borderRadius: 20,backgroundColor: 'black'}} onPress={()=>{
                                                                setEditWorkoutBool(false);
                                                                setEditWorkoutID(-1);
                                                                setEditTickIconBool(false)
                                                            }}>
                                                                <Image style={{height:17.5,width: 17.5}} source={crossIconWhite}/>
                                                            </Pressable>
                                                            <Pressable style={{marginLeft: 10,marginRight:10,padding: 10,borderRadius: 20,backgroundColor: editTickIconBool ? 'black' : '#DDDDDD'}} onPress={()=>{
                                                                const newWorkoutNameObj = {
                                                                    ...workout,
                                                                    exerciseName: editedWorkoutName
                                                                }
    
                                                                const replaceArray = allWorkouts.filter(arr => arr.id!=workout.id);

                                                                const arr = [...replaceArray,newWorkoutNameObj];

                                                                arr.sort((a,b) => a.id-b.id)
    
                                                                setAllWorkouts(arr);

                                                                setEditWorkoutBool(false);
                                                                setEditWorkoutID(-1);
                                                                setEditTickIconBool(false)
                                                            }}>
                                                                <Image style={{height:17.5,width: 17.5}} source={tickIcon}/>
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                            )
                                        }
                                    }
                                    
                                })
                                :
                                null
                            }


                            {
                                showExerciseContainer
                                ?
                                <View style={styles.exerciseContainer}>
                                    <TextInput style={styles.inputBox} placeholder='Enter Exercise Name' value={exerciseName} onChangeText={text =>{
                                        setExerciseName(text)
                                    }}/>
                                    {
                                        totalSets>0 ?
                                        allSets.map(set =>{return (
                                            <View style={styles.setContainer} key={set.id}>
                                                <View style={[styles.setBox,{padding: 15}]}>
                                                    <View>
                                                        <Text style={{color: '#fff', fontWeight: '600', fontSize: 15}}>Set {set.id}</Text>
                                                    </View>
                                                </View>
                                                <View style={{minWidth: 60,borderRadius: 10,backgroundColor: 'black',display: 'flex',justifyContent: 'center'}}>
                                                    <Text style={{textAlign: 'center',color: 'white',fontWeight: '600',textAlignVertical: 'center'}}>{set.weight}</Text>
                                                </View>
                                                <View style={{minWidth: 60,borderRadius: 10,backgroundColor: 'black',display: 'flex',justifyContent: 'center'}}>
                                                    <Text style={{textAlign: 'center',color: 'white',fontWeight: '600',textAlignVertical: 'center'}}>{set.reps}</Text>
                                                </View>
                                                <View>
                                                    <Pressable onPress={()=>{
                                                        deleteSet(set.id)
                                                    }} style={styles.plusIconContainer}>
                                                        <Image source={deleteIcon} style={[styles.plusIcon,{height:17,width: 17}]}/>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        )})
                                        :
                                        null
                                    }
                                    <View style={styles.setContainer}>
                                        <View style={[styles.setBox,{padding: 15}]}>
                                            <View>
                                                <View>
                                                    <Text style={{color: '#fff', fontWeight: '600', fontSize: 15}}>Set {totalSets+1}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.setInput,{minWidth: 60}]}>
                                            <TextInput ref={weightRef} style={{textAlign: 'center', fontWeight: '500'}} placeholder='0' value={weight} onChangeText={text => {
                                                setWeight(text)
                                            }}></TextInput>
                                            <Pressable onPress={()=>{
                                                weightRef.current.focus()
                                            }}>
                                                <Text style={{color: '#373737',fontWeight: '500'}}>Kg</Text>
                                            </Pressable>
                                        </View>
                                        <View style={[styles.setInput,{minWidth: 60}]}>
                                            <TextInput ref={repsRef} style={{textAlign: 'center', fontWeight: '500'}} placeholder='0' value={reps} onChangeText={text => {
                                                setReps(text)
                                            }}></TextInput>
                                            <Pressable onPress={()=>{
                                                repsRef.current.focus()
                                            }}>
                                                <Text style={{color: '#373737',fontWeight: '500'}}>Reps</Text>
                                            </Pressable>
                                        </View>
                                        <View>
                                            {
                                                weight!="" && reps!=""
                                                ?
                                                <Pressable onPress={addSets} style={styles.plusIconContainer}>
                                                    <Image source={plusWhite} style={styles.plusIcon}/>
                                                </Pressable>
                                                :
                                                <Pressable onPress={addSets} style={[styles.plusIconContainer,{backgroundColor:'#C2C2C2'}]}>
                                                    <Image source={plusWhite} style={styles.plusIcon}/>
                                                </Pressable>
                                            }
                                        </View>
                                    </View>
                                    {
                                        allSets.length>0
                                        ?
                                        <Pressable onPress={addExercise} style={styles.addExerciseBtnEnabled}>
                                            <Text style={{fontWeight: '600',color: '#fff'}}>Add</Text>
                                        </Pressable>
                                        :
                                        <Pressable disabled={true} style={styles.addExerciseBtnDisabled}>
                                            <Text style={{fontWeight: '600',color: '#909090'}}>Add</Text>
                                        </Pressable>
                                    }
                                </View>
                                :
                                null
                            }
                        </View>
                        
                    </View>
            </ScrollView>
            {
                !keyboardStatus && !editWorkoutBool
                ?
                <View style={{position: 'absolute', left: 0, right: 0, bottom: 20, justifyContent: 'center', alignItems: 'center',display: 'flex',flexDirection: 'row'}}>
                    <View style={{backgroundColor: '#000',borderRadius: 50,padding: 17.5,marginRight: 10,borderWidth: 3,borderColor: '#fff'}}>
                        <Image source={crossIconWhite} style={{height: 22.5,width: 22.5}}/>
                    </View>
                    {
                        !showExerciseContainer && workoutName!="" && allWorkouts.length>0 ?
                        <Pressable onPress={addWorkoutToDB} style={{backgroundColor: '#000',borderRadius: 50,padding: 17.5,marginLeft: 10,borderWidth: 3,borderColor: '#fff'}}>
                            <Image source={tickIcon} style={{height: 22.5,width: 22.5}}/>
                        </Pressable>
                        :
                        <Pressable style={{backgroundColor: '#DDDDDD',borderRadius: 50,padding: 17.5,marginLeft: 10,borderWidth: 3,borderColor: '#fff'}}>
                            <Image source={tickIcon} style={{height: 22.5,width: 22.5}}/>
                        </Pressable>
                    }
                </View>
                :
                null
            }
        </KeyboardAvoidingView>
    )
}

export default NewWorkout

const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        justifyContent: 'space-around',
        margin: 'auto',
        height: '100%',
        width: '100%',
        padding: 20,
        paddingTop: 70,
        paddingBottom: 0,
    },
    workoutCard: {
        display: 'flex',
        alignItems: 'center',
        paddingBottom: 20,
        marginBottom: 100
    },
    headingTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
        backgroundColor: 'black',
        alignSelf: "flex-start",
        padding: 5,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 10,

        display: 'flex',
        textAlign: 'center',
        textAlignVertical: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputBox: {
        width: '85%',
        marginTop: 20,
        height: 40,

        padding: 10,
        fontSize: 20,
        color: 'black',

        textAlignVertical: 'center',
        fontSize: 17,

        borderBottomColor: '#000',
        borderBottomWidth: 2,
        paddingLeft: 5,
        fontWeight: '500'
    },
    selectBox: {
        marginTop: 20,
        width: '80%'
    },
    setBox: {
        backgroundColor: 'black',
        color: '#fff',
        fontWeight: '500',
        padding: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        fontSize: 15,
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        margin: 'auto'
    },
    setContainer: {
        marginTop: 20,
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    setInput: {
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 5,
        borderRadius: 10,

        borderWidth: 2,
        borderColor: '#C1C1C1',
        color: 'black',
        flexDirection: 'row',
        alignItems: 'center',
    },
    plusIconContainer: {
        backgroundColor: 'black',
        display: 'flex',
        justifyContent:'center',
        // paddingLeft: 10,
        // paddingRight: 10,
        padding: 15,
        borderRadius: 50
    },
    plusIcon: {
        // backgroundColor: 'red',
        height: 17,
        width: 17,
    },
    addExerciseContainer: {
        marginTop: 20,
        backgroundColor: 'black',
        width: '85%',
        padding: 10,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'row',
        textAlign: 'center',
        textAlignVertical:"center",
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15
    },
    addExerciseTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 17,
        textAlign: 'center',
    },
    exerciseContainer: {
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    addExerciseBtnEnabled: {
        backgroundColor: 'black',
        borderRadius: 15,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },
    addExerciseBtnDisabled: {
        backgroundColor: '#DDDDDD',
        borderRadius: 15,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
    },
    prevWorkoutContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: '#000',
        width: '85%',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
    },
    prevWorkoutName: {
        fontWeight: '500',
        fontSize: 18.5,
        borderBottomWidth: 2,
        alignSelf: 'flex-start',
        paddingBottom: 5,
        color: 'white',
        borderBottomColor: 'white'
    },
    prevWorkoutSet: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between'
    },
})