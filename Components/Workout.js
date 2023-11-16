import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView } from 'react-native'
import React from 'react'
const dumbell = require("../assets/dumbell.png");
const like = require("../assets/like-icon.png");
const comment = require("../assets/comment-icon.png");


const Workout = () => {
  return (
    <SafeAreaView style={[styles.workoutContainer,{marginTop: 50}]}>
      <ScrollView style={styles.workoutContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.workoutList}>
            <View style={styles.dateContainer}>
                <Text style={styles.date}>Today</Text>
            </View>
            <View style={styles.workout}>
                <View>
                    <View style={styles.workoutTitleContainer}>
                        <Image source={dumbell} style={styles.workoutIcon}/>
                        <Text style={styles.workoutTitle}>Chest & Shoulders</Text>
                    </View>
                    <View style={styles.exerciseList}>
                        <View style={styles.exerciseName}>
                            <Text style={{borderBottomColor: '#C3C3C3',borderBottomWidth: 2,fontSize: 17,paddingBottom: 5}}>Bench Press</Text>
                            <Text style={{fontSize: 17,}}> x 3</Text>
                        </View>
                        <View style={styles.exerciseName}>
                            <Text style={{borderBottomColor: '#C3C3C3',borderBottomWidth: 2,fontSize: 17,paddingBottom: 5}}>Squats</Text>
                            <Text style={{fontSize: 17,}}> x 3</Text>
                        </View>
                        <View style={styles.exerciseName}>
                            <Text style={{borderBottomColor: '#C3C3C3',borderBottomWidth: 2,fontSize: 17,paddingBottom: 5}}>Lunges</Text>
                            <Text style={{fontSize: 17,}}> x 3</Text>
                        </View>
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
    },
    workoutList: {
        display: 'flex',
        flexDirection: 'column',
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
        backgroundColor: '#f5f4f4',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        borderRadius: 15,
        elevation: 10,
    },
    workoutTitleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'center',

        backgroundColor: 'black',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 10,
        fontWeight: '600',
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
        fontWeight: '600'
    },
    exerciseList:{
        padding: 10,
        marginTop: 5,
        marginBottom: 20,
    },
    exerciseName:{
        paddingTop: 5,
        paddingBottom: 5,
        display: 'flex',
        flexDirection: 'row',
        
        alignSelf: 'flex-start',
    },
    exerciseReps: {
        borderColor: '#f5f4f4'
    },
    workoutIcon: {
        height: 30,
        width: 30,
        marginRight: 10,
    },
    interactComponent: {
        backgroundColor: '#808080',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 5
    },
    likeIcon: {
        height: 35,
        width: 35,
    },
    commentIcon: {
        height: 25,
        width: 25,
    },
})