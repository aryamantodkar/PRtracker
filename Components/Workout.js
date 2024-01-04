import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView } from 'react-native'
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';

const dumbell = require("../assets/dumbell.png");
const like = require("../assets/like-icon.png");
const comment = require("../assets/comment-icon.png");
const workoutBlack = require("../assets/workout-icon-black.png");


const Workout = () => {
    const [workoutsArray,setWorkoutsArray] = useState([]);

    const auth = getAuth();
    const userID = auth.currentUser.uid;

    useEffect(() => {
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
        })
    }, [])


  return (
    <SafeAreaView style={[styles.workoutContainer,{marginTop: 50}]}>
      <ScrollView style={styles.workoutContainer} contentContainerStyle={{display: 'flex',justifyContent: 'center',margin: 'auto'}} showsVerticalScrollIndicator={false}>
        <View style={styles.workoutList}>
            {/* <View style={styles.dateContainer}>
                <Text style={styles.date}>Today</Text>
            </View> */}
            {
                workoutsArray!=undefined && workoutsArray.length>0
                ?
                workoutsArray.map(workout => {
                    return(
                        <View style={styles.workout} key={workout.id}>
                            <View>
                                <View style={styles.workoutTitleContainer}>
                                    <Image source={dumbell} style={styles.workoutIcon}/>
                                    <Text style={styles.workoutTitle}>{workout.workoutName}</Text>
                                </View>
                                <View style={styles.exerciseList}>
                                    {
                                        workout.allWorkouts.map(exercise => {
                                            return(
                                                <View style={styles.exerciseName} key={workout.allWorkouts.id}>
                                                    <Text style={{borderColor: '#fff',borderWidth: 2,fontSize: 17,padding: 5,color: 'white',borderRadius: 10,paddingLeft: 10,paddingRight: 10}}>{exercise.exerciseName}</Text>
                                                    <Text style={{fontSize: 17,color: 'white',padding: 5}}> x 3</Text>
                                                </View>
                                            )
                                        })
                                    }
                                </View>
                                
                                <Text style={styles.workoutTime}>9:05 AM</Text>
                            </View>
                            <View style={styles.interactComponent}>
                                <Pressable>
                                    <Image source={like} style={styles.likeIcon}/>
                                </Pressable>
                                <Pressable>
                                    <Image source={comment} style={styles.commentIcon}/>
                                </Pressable>
                            </View>
                        </View>
                    )
                })
                :
                <View style={styles.emptyWorkoutContainer}>
                    <View style={{display: 'flex',justifyContent: 'center'}}>
                        <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginBottom: 25,marginTop: 20}}>
                            <Image source={workoutBlack} style={{height: 30, width: 30}}/>
                            <Text style={{color: 'black',marginLeft: 10,fontSize: 17.5,fontWeight: '600',color: '#000'}}>No Workouts Found</Text>
                        </View>
                        <View style={{alignItems: 'center',justifyContent: 'center'}}> 
                            <Text style={{color: 'black',marginLeft: 10,fontSize: 14,fontWeight: '500',color: '#4F4F4F',width: '85%'}}>Please start adding workouts to view them here.</Text>
                        </View>
                    </View>
                </View>
            }
            
            
        </View>
      </ScrollView>
        {/* <View style={styles.plusIconContainer}>
            <Image source={plus} style={styles.plusIcon}/>
        </View> */}
    </SafeAreaView>
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
        // backgroundColor: 'green'
    },
    workoutList: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
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
        marginTop: 30,
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: 'black'
    },
    workoutTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'center',

        padding: 10,
        fontWeight: '600',
        borderBottomWidth:2,
        borderBottomColor: "white"
    },
    workoutTitle: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    workoutTime: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        fontWeight: '600',
        color: 'white'
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
        padding: 5,

    },
    likeIcon: {
        height: 35,
        width: 35,
    },
    commentIcon: {
        height: 25,
        width: 25,
    },
    emptyWorkoutContainer: {
        borderWidth: 2,
        borderColor: '#DDD',
        display: 'flex',
        width: '100%',
        backgroundColor: '#f5f4f4',
        height: 150,
        width: 250,
        borderRadius: 15,
        elevation: 10
    }
})