import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator } from 'react-native'
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import IndividualWorkout from './IndividualWorkout';

const dumbell = require("../assets/dumbell.png");
const like = require("../assets/like-icon.png");
const comment = require("../assets/comment-icon.png");
const workoutBlack = require("../assets/workout-icon-black.png");



const Workout = ({showNavbar,searchParams}) => {
    const [workoutsArray,setWorkoutsArray] = useState([]);
    const [showWorkoutBox,setShowWorkoutBox] = useState(false);
    const [clickedWorkoutID,setClickedWorkoutID] = useState();
    const [isLoading,setIsLoading] = useState(false);
    const [myWorkoutsBool,setMyWorkoutsBool] = useState(true);
    const [originalWorkoutArray,setOriginalWorkoutArray] = useState([]);

    const months = new Map;
    const dateSuffix = new Map;
    const dateGroup = new Map;

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
    const userID = auth.currentUser.uid;

    useEffect(() => {
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
    }, [showWorkoutBox]);

    const openWorkoutBox = (workout) => {
        setShowWorkoutBox(true);
        setClickedWorkoutID(workout.id);
        showNavbar(false);
    }

    const groupByDate = (workout) => {
        dateGroup.set(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`,'1')
        return(
            <View style={{marginTop: 20,borderBottomColor: '#EBEAEA',borderBottomWidth: 2,paddingBottom: 5,alignSelf: 'flex-start'}}>
                <Text style={{fontSize: 20,color: '#404040',fontWeight: '500'}}>{workout.timeStamp.toDate().toISOString().slice(8,10)} 
                    {/* last digit(1,2,3,...9) ? st/nd/rd : th */}
                    {dateSuffix.has(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) ? dateSuffix.get(`${workout.timeStamp.toDate().toISOString().slice(9,10)}`) : 'th'} {months.get(`${workout.timeStamp.toDate().toISOString().slice(5,7)}`)}, {workout.timeStamp.toDate().toISOString().slice(0,4)}
                </Text>
            </View>
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

  return (
      <ScrollView contentContainerStyle={workoutsArray!=undefined && workoutsArray.length>0 ? styles.workoutContainer : styles.emptyWorkoutBox}  showsVerticalScrollIndicator={false}>
        {
            !showWorkoutBox
            ?
            <View style={workoutsArray!=undefined && workoutsArray.length>0 ? styles.workoutList : styles.emptyWorkoutList}>
                {
                    myWorkoutsBool
                    ?
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 10,marginTop: 10}}>
                        <Pressable onPress={()=>{
                            setMyWorkoutsBool(false);
                        }} style={{backgroundColor: '#f5f4f4',borderWidth: 1,borderColor: '#DDD',borderRadius: 10,padding: 5,paddingLeft: 20,paddingRight: 20}}>
                            <Text style={{color: '#404040',fontSize: 18,fontWeight: 400}}>Following</Text>
                        </Pressable>
                        <Pressable onPress={()=>{
                            setMyWorkoutsBool(true);
                        }} style={{backgroundColor: '#000',borderRadius: 10,padding: 5,paddingLeft: 20,paddingRight: 20}}>
                            <Text style={{color: '#fff',fontSize: 18,fontWeight: 400}}>My Workouts</Text>
                        </Pressable>
                    </View>
                    :
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 10,marginTop: 10}}>
                        <Pressable onPress={()=>{
                            setMyWorkoutsBool(false);
                        }} style={{backgroundColor: '#000',borderRadius: 10,padding: 5,paddingLeft: 20,paddingRight: 20}}>
                            <Text style={{color: '#fff',fontSize: 18,fontWeight: 400}}>Following</Text>
                        </Pressable>
                        <Pressable onPress={()=>{
                            setMyWorkoutsBool(true);
                        }} style={{backgroundColor: '#f5f4f4',borderWidth: 1,borderColor: '#DDD',borderRadius: 10,padding: 5,paddingLeft: 20,paddingRight: 20}}>
                            <Text style={{color: '#404040',fontSize: 18,fontWeight: 400}}>My Workouts</Text>
                        </Pressable>
                    </View>
                }

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
                            <Pressable onPress={() => {
                                openWorkoutBox(workout);
                            }} key={workout.id}>
                                {
                                    // check if date is already present in dateGroup in ddmmyyyy format ->
                                    !dateGroup.has(`${workout.timeStamp.toDate().toISOString().slice(8,10)}${workout.timeStamp.toDate().toISOString().slice(5,7)}${workout.timeStamp.toDate().toISOString().slice(0,4)}`)
                                    ?
                                    groupByDate(workout)
                                    :
                                    null
                                }
                                
                                <View style={styles.workout}>
                                    <View >
                                        <View style={styles.workoutTitleContainer}>
                                            <Image source={dumbell} style={styles.workoutIcon}/>
                                            <Text style={styles.workoutTitle}>{workout.workoutName}</Text>
                                        </View>
                                        <View style={styles.exerciseList}>
                                            {
                                                workout.allWorkouts.map(exercise => {
                                                    return(
                                                        <View style={styles.exerciseName} key={exercise.id}>
                                                            <Text style={{borderBottomColor: '#fff',borderBottomWidth: 2,fontSize: 17,paddingBottom: 5,color: 'white'}}>{exercise.exerciseName}</Text>
                                                            <Text style={{fontSize: 17,color: 'white',padding: 5}}> x 3</Text>
                                                        </View>
                                                    )
                                                })
                                            }
                                        </View>
                                        {
                                            workout.timeStamp.toDate().toTimeString().slice(0,2)<12
                                            ?
                                            <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} AM</Text>
                                            :
                                            <Text style={styles.workoutTime}>{workout.timeStamp.toDate().toTimeString().slice(0,5)} PM</Text>
                                        }
                                        
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
                            </Pressable>
                        )
                    })
                    :
                    <View  style={styles.emptyWorkoutContainer}>
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
            :
            <IndividualWorkout ID={clickedWorkoutID} showWorkoutBox={setShowWorkoutBox} showNavbar={showNavbar}/>
        }
      </ScrollView>
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
        marginTop: 20,
        marginBottom: 50,
    },
    emptyWorkoutBox: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40
    },
    workoutList: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    emptyWorkoutList: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        marginBottom: 35
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
        marginTop: 20,
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
    },
    
})