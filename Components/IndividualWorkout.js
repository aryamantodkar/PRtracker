import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs,doc,deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';


const backIconWhite = require("../assets/back-arrow-icon-white.png");
const editIcon = require("../assets/edit-icon.png");
const deleteIcon = require("../assets/delete-icon.png");

const IndividualWorkout = ({clickedWorkout,showWorkoutBox,showNavbar}) => {
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

  return (
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
                        clickedWorkout.allWorkouts.map(exercises => {
                            return(
                                <View key={exercises.id}>
                                    <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
                                        <Text style={{color: '#fff',fontSize: 15,marginRight: 15,borderColor: '#fff',borderWidth: 2,borderRadius: 50,padding: 5,paddingLeft: 10,paddingRight: 10,display: 'flex',alignItems: 'center',textAlign: 'center'}}>{exercises.id+1}</Text>
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
                                                        <View style={{borderWidth: 2,borderColor: '#fff',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 70}}>
                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>{sets.weight} kg</Text>
                                                        </View>
                                                        <View style={{padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10}}>
                                                            <Text style={{color: '#fff',fontSize: 17.5,display: 'flex',alignItems: 'center',textAlign: 'center',justifyContent: 'center'}}>x</Text>
                                                        </View>
                                                        <View style={{borderWidth: 2,borderColor: '#fff',padding: 5,paddingLeft: 10,paddingRight: 10,borderRadius: 10,width: 50}}>
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
        padding: 15,
        marginTop: 15
    }
})

export default IndividualWorkout