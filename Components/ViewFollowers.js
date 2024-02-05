import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const pfp = require("../assets/pfp.jpg");
const backIconBlack = require("../assets/back-arrow-icon.png");

export default function ViewFollowers() {
    const [followingArray,setFollowingArray] = useState([]);
    const [followersArray,setFollowersArray] = useState([]);
    const [isLoading,setIsLoading] = useState(true);

    const navigation = useNavigation();
    const route = useRoute();

    const { followersTab } = route.params;
    const [tabBool,setTabBool] = useState(followersTab);

    const auth = getAuth();
    const user = auth.currentUser;
   
    

  return (
    <View style={styles.home}>
        {
            tabBool
            ?
            <View style={{display: 'flex',flexDirection: 'column'}}>
                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 10,marginTop: 10,alignItems: 'center'}}>
                    <Pressable onPress={()=>{
                        navigation.goBack();
                    }} style={{position: 'absolute',left: 0}}>
                        <Image source={backIconBlack} style={{height: 35,width: 35}}/>
                    </Pressable>
                    <Pressable style={{borderBottomWidth: 2,borderBottomColor: 'black',paddingBottom: 10,marginLeft: 10}}>
                        <Text style={{color: '#000',fontSize: 18,fontWeight: '600'}}>Followers</Text>
                    </Pressable>
                    <Pressable onPress={()=>{
                        setTabBool(false);
                    }} style={{borderBottomWidth: 2,borderBottomColor: '#DDD',paddingBottom: 10}}>
                        <Text style={{color: '#000',fontSize: 18}}>Following</Text>
                    </Pressable>
                </View>
                {
                    !isLoading
                    ?
                    <View>
                        {
                            followersArray.length>0
                            ?
                            <View style={{display: 'flex',flexDirection: 'column',width: '100%',height: '100%',marginTop: 20}}>
                                {
                                    followersArray.map(user => {
                                        return(
                                            <Pressable onPress={()=>{
                                                navigation.navigate('IndividualUser',{
                                                    uid: user.uid,
                                                    name: user.name,
                                                })
                                            }} key={user.uid} style={{width: '100%',height: 80,display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',paddingLeft: 20,backgroundColor: '#f5f4f4',borderColor: '#DDD',borderWidth: 1,borderRadius: 10,marginTop: 10,marginBottom: 10}}>
                                                <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,borderColor: '#DDD',borderWidth: 2}}/>
                                                <View style={{marginLeft: 20,display: 'flex',flexDirection: 'column'}}>
                                                    <Text style={{color: '#007FF4',fontSize: 16,marginBottom: 5,fontWeight: '500'}}>{user.name}</Text>
                                                    <Text style={{color: '#000',fontSize: 12.5,marginBottom: 5,fontWeight: '400'}}>Pune, Maharashtra</Text>

                                                </View>
                                            </Pressable>
                                        )
                                    })
                                }
                            </View>
                            :
                            <View style={{backgroundColor: '#f5f4f4',height: 60,marginTop: 50,width: '60%',display: 'flex',justifyContent: 'center',alignItems: 'center',borderWidth: 1,borderColor: '#DDD',borderRadius: 10,marginLeft: 'auto',marginRight: 'auto'}}>
                                <Text style={{color: 'black'}}>No Users Found</Text>
                            </View>
                        }
                    </View>
                    :
                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '80%'}}>
                        <ActivityIndicator size="large" color="#000"/>
                    </View>
                }
            </View>
            :
            <View style={{display: 'flex',flexDirection: 'column'}}>
                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-around',marginBottom: 10,marginTop: 10,alignItems: 'center'}}>
                    <Pressable onPress={()=>{
                        navigation.goBack();
                    }} style={{position: 'absolute',left: 0}}>
                        <Image source={backIconBlack} style={{height: 35,width: 35}}/>
                    </Pressable>
                    <Pressable onPress={()=>{
                        setTabBool(true);
                    }} style={{borderBottomWidth: 2,borderBottomColor: '#DDD',paddingBottom: 10,marginLeft: 10}}>
                        <Text style={{color: '#000',fontSize: 18}}>Followers</Text>
                    </Pressable>
                    <Pressable style={{borderBottomWidth: 2,borderBottomColor: 'black',paddingBottom: 10}}>
                        <Text style={{color: '#000',fontSize: 18,fontWeight: '600'}}>Following</Text>
                    </Pressable>
                </View>
                {
                    !isLoading
                    ?
                    <View>
                        {
                            followingArray.length>0
                            ?
                            <View style={{display: 'flex',flexDirection: 'column',width: '100%',height: '100%',marginTop: 20}}>
                                {
                                    followingArray.map(user => {
                                        return(
                                            <Pressable onPress={()=>{
                                                navigation.navigate('IndividualUser',{
                                                    uid: user.uid,
                                                    name: user.name,
                                                })
                                            }} key={user.uid} style={{width: '100%',height: 80,display: 'flex',flexDirection: 'row',justifyContent: 'flex-start',alignItems: 'center',paddingLeft: 20,backgroundColor: '#f5f4f4',borderColor: '#DDD',borderWidth: 1,borderRadius: 10,marginTop: 10,marginBottom: 10}}>
                                                <Image source={pfp} style={{height: 50,width: 50,borderRadius: 50,borderColor: '#DDD',borderWidth: 2}}/>
                                                <View style={{marginLeft: 20,display: 'flex',flexDirection: 'column'}}>
                                                    <Text style={{color: '#007FF4',fontSize: 16,marginBottom: 5,fontWeight: '500'}}>{user.name}</Text>
                                                    <Text style={{color: '#000',fontSize: 12.5,marginBottom: 5,fontWeight: '400'}}>Pune, Maharashtra</Text>

                                                </View>
                                            </Pressable>
                                        )
                                    })
                                }
                            </View>
                            :
                            <View style={{backgroundColor: '#f5f4f4',height: 60,marginTop: 50,width: '60%',display: 'flex',justifyContent: 'center',alignItems: 'center',borderWidth: 1,borderColor: '#DDD',borderRadius: 10,marginLeft: 'auto',marginRight: 'auto'}}>
                                <Text style={{color: 'black'}}>No Users Found</Text>
                            </View>
                        }
                    </View>
                    :
                    <View style={{display: 'flex',justifyContent: 'center',alignItems: 'center',height: '80%'}}>
                        <ActivityIndicator size="large" color="#000"/>
                    </View>
                }
            </View>
        }
    </View>
  )
}

const styles = StyleSheet.create({
    home: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: 15,
        backgroundColor: '#fff',
        paddingTop: 50,
        position: 'relative'
    }
})