import { StyleSheet, Text, View,ScrollView, TextInput, Pressable,Image } from 'react-native'
import React, { useState,useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios';
const plusWhite = require("../assets/plus-icon-white.png");
const deleteIcon = require("../assets/delete-icon.png");


const NewWorkout = ({navigation}) => {
    const [workoutName,setWorkoutName] = useState("");
    const [exerciseName,setExerciseName] = useState("");
    const [allSets,setAllSets] = useState([]);
    const [totalSets,setTotalSets] = useState(0);

    const [weight,setWeight] = useState("");
    const [reps,setReps] = useState("");
    const[addSet,setAddSet] = useState(false);
    const[delSet,setDelSet] = useState(false);
    const [deleteID,setDeleteID] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("user has stopped typing", exerciseName);
        }, 500)

        return () => clearTimeout(timer)
    }, [exerciseName])

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

    const addSets = () => {
        setTotalSets(totalSets+1);
        setAddSet(true);
    }

    const deleteSet = (id) => {
        setTotalSets(totalSets-1);
        setDelSet(true);
        setDeleteID(id);
    }
    return (
        <SafeAreaView style={styles.home}>
        <ScrollView contentContainerStyle ={[styles.home,{padding: 30}]} showsVerticalScrollIndicator>
            <Text style={styles.headingTitle}>New Workout</Text>
            <View style={styles.workoutCard}>
                <TextInput style={styles.inputBox} placeholder='Enter Workout Name' value={workoutName} onChangeText={text =>{
                    setWorkoutName(text)
                }}/>
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
                            <View style={styles.plusIconContainer}>
                                <Pressable onPress={()=>{
                                    deleteSet(set.id)
                                }}>
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
                        <TextInput style={{textAlign: 'center'}} placeholder='0 kg' value={weight} onChangeText={text => {
                            setWeight(text)
                        }}></TextInput>
                    </View>
                    <View style={[styles.setInput,{minWidth: 60}]}>
                        <TextInput style={{textAlign: 'center'}} placeholder='0 Reps' value={reps} onChangeText={text => {
                            setReps(text)
                        }}></TextInput>
                    </View>
                    <View style={styles.plusIconContainer}>
                        <Pressable onPress={addSets}>
                            <Image source={plusWhite} style={styles.plusIcon}/>
                        </Pressable>
                    </View>
                </View>
                {/* <View style={styles.setBox}>
                    <Pressable onPress={addSets}>
                        <Text style={{color: '#fff', fontWeight: '600', fontSize: 15}}>Add Set</Text>
                    </Pressable>
                </View> */}
            </View>
        </ScrollView>
        </SafeAreaView>
    )
}

export default NewWorkout

const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: '#fff'
    },
    workoutCard: {
        display: 'flex',
        alignItems: 'center',
    },
    headingTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
        marginBottom: 20,
        backgroundColor: 'black',
        alignSelf: "flex-start",
        padding: 5,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 10,
    },
    inputBox: {
        width: '85%',
        marginTop: 30,
        height: 40,
        borderRadius: 8.5,

        padding: 10,
        paddingLeft: 10,
        fontSize: 20,
        color: 'black',
        borderWidth: 2,
        borderColor: 'black',
        textAlignVertical: 'center',
        fontSize: 17,
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
        color: 'black'
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
        // backgroundColor: 'black',
        height: 17,
        width: 17,
        
    }
})