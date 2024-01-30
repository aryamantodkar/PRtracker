import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable,ScrollView,ActivityIndicator } from 'react-native'
import { collection, query, where, getDocs,doc,getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_DB } from '../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';


const backIconBlack = require("../assets/back-arrow-icon.png");

export default function ViewFollowers() {
    const navigation = useNavigation();
    const route = useRoute();

    const { followersTab } = route.params;
    const [tabBool,setTabBool] = useState(followersTab);

  return (
    <View style={styles.home}>
        {
            tabBool
            ?
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
            :
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
        }
        <View></View>
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