import React, { useContext,useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { StyleSheet, Text, View, TextInput,KeyboardAvoidingView,Pressable,SafeAreaView, Platform,Image, ScrollView } from 'react-native';
import {useState} from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { createUserWithEmailAndPassword,sendEmailVerification,updateProfile } from 'firebase/auth';
import { doc, setDoc,collection, addDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

export default function Register({navigation}) { 
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [showConfirmPassword,setShowConfirmPassword] = useState(false);
  const [validEmail,setValidEmail] = useState(false);

  const auth = FIREBASE_AUTH;
  const userAuth = getAuth();

  const goToRegister = () => {
    navigation.navigate('Login');
  }

  const handleSignup = async () =>{
    setLoading(true);
    try{
      const resposne = await createUserWithEmailAndPassword(auth,email,password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        updateProfile(user,{
          displayName: name,
        });
        
        const docRef = await setDoc(doc(FIREBASE_DB, "Users", `${user.uid}`), {
          name: `${name}`,
          uid: `${user.uid}`,
          followers: [],
          following: [],
          likes: [],
          comments: [],
          profileUrl: "",
        });
      })
      console.log(resposne);
    }
    catch(err){
      console.log("handleSignUp",err);
      alert('Sign Up failed');
    }
    finally{
      setLoading(false);
    }
  }
  return (
    <ScrollView style={{height: '100%',backgroundColor: '#fff',display: 'flex'}} keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1,display: 'flex', justifyContent: 'center',alignItems: 'center' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.login}>
          <ScrollView style={{height: '100%',width: '100%',display: 'flex'}} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center',alignItems: 'center' }}>
            <View style={styles.logincontent} >
                <View style={styles.headingContainer}>
                  <Text style={styles.heading}>Welcome to the Club.</Text>
                  <Text style={styles.subHeading}>It's time to hit PR's</Text>
                </View>
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>Name</Text>
                    <View>
                      <TextInput onFocus={()=>{
                        setValidEmail(false)
                      }} style={styles.input} value={name} onChangeText={text => {
                        setError('')
                        setName(text);
                      }} placeholder='Enter your Name' />
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>Email</Text>
                    <View>
                      <TextInput onFocus={()=>{
                        setValidEmail(true)
                      }} style={styles.input} value={email} onChangeText={text => {
                        setError('');
                        setEmail(text);
                      }} placeholder='Enter Email ID' />
                    </View>
                    {
                      validEmail
                      ?
                      <Text style={[styles.inputHeading,{fontSize: 15,marginTop: 10,color: '#404040'}]}>Please enter valid email, this cannot be changed later.</Text>
                      :
                      null
                    }
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>Password</Text>
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative'}}>
                      {
                        showPassword
                        ?
                        <TextInput onFocus={()=>{
                          setValidEmail(false)
                        }} style={styles.input} value={password} onChangeText={text => {
                          setError('')
                          setPassword(text);
                        }} placeholder='Enter Password'/>
                        :
                        <TextInput onFocus={()=>{
                          setValidEmail(false)
                        }} secureTextEntry={true} password={true} style={styles.input} value={password} onChangeText={text => {
                          setError('')
                          setPassword(text);
                        }} placeholder='Enter Password'/>
                      }
                      <Pressable onPress={()=>{
                        setShowPassword(!showPassword);
                      }} style={{display: 'flex',justifyContent: 'center',position: 'absolute',margin: 'auto',right: 10,top: 0,bottom: 0}}>
                        {
                          showPassword
                          ?
                          // <Image source={eyeIcon} style={{height: 22,width: 22,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                          <FontAwesomeIcon icon="fa-regular fa-eye" size={20} style={{marginRight: 5}}/>
                          :
                          <FontAwesomeIcon icon="fa-regular fa-eye-slash" size={20} style={{marginRight: 5}}/>
                          // <Image source={hideEyeIcon} style={{height: 25,width: 25,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                        }
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputHeading}>Confirm Password</Text>
                    <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',position: 'relative'}}>
                      {
                        showConfirmPassword
                        ?
                        <TextInput onFocus={()=>{
                          setValidEmail(false)
                        }} style={styles.input} value={confirmPassword} onChangeText={text => {
                          setError('')
                          setConfirmPassword(text);
                        }} placeholder='Re-Enter Password'/>
                        :
                        <TextInput onFocus={()=>{
                          setValidEmail(false)
                        }} secureTextEntry={true} password={true} style={styles.input} value={confirmPassword} onChangeText={text => {
                          setError('')
                          setConfirmPassword(text);
                        }} placeholder='Re-Enter Password'/>
                      }
                      <Pressable onPress={()=>{
                        setShowConfirmPassword(!showConfirmPassword);
                      }} style={{display: 'flex',justifyContent: 'center',position: 'absolute',margin: 'auto',right: 10,top: 0,bottom: 0}}>
                        {
                          showConfirmPassword
                          ?
                          // <Image source={eyeIcon} style={{height: 22,width: 22,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                          <FontAwesomeIcon icon="fa-regular fa-eye" size={20} style={{marginRight: 5}}/>
                          :
                          <FontAwesomeIcon icon="fa-regular fa-eye-slash" size={20} style={{marginRight: 5}}/>
                          // <Image source={hideEyeIcon} style={{height: 25,width: 25,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                        }
                      </Pressable>
                    </View>
                  </View>
                  {error ? <Text>{error}</Text> : null}
                  <View style={[styles.btnContainer, styles.inputContainer]}>
                    {
                      name!="" && email!="" && password!="" && confirmPassword!="" && password==confirmPassword
                      ?
                      <Pressable style={styles.btn} onPress={handleSignup}>
                        <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10,fontFamily: 'LeagueSpartan'}}>Sign Up</Text>
                      </Pressable>
                      :
                      <Pressable style={[styles.btn,{backgroundColor: '#ddd'}]}>
                        <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10,fontFamily: 'LeagueSpartan'}}>Sign Up</Text>
                      </Pressable>
                    }
                  </View>
                  <Pressable style={styles.registerContainer} onPress={goToRegister}>
                    <Text style={{ fontFamily: "LeagueSpartan", fontSize: 17, color: '#404040'}}>Already have an Account?</Text>
                    <Text style={{ fontFamily: "LeagueSpartan", fontSize: 17, marginLeft: 5, color: '#2B8CFF' }}>Login</Text>
                  </Pressable>
                </View>
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  login: {
      display: 'flex',
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 'auto',
      height: '100%',
      width: '100%',
      padding: 15
  },
  logincontent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '85%',
    height: '100%',
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
    marginTop: 30
  },
  heading: {
    fontFamily: 'LeagueSpartan',
    fontSize: 35,
    paddingBottom: 10,
  },
  subHeading: {
    fontFamily: 'LeagueSpartan',
    fontSize: 18,
    paddingBottom: 10,
    color: '#696969'
  },
  input: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#f6f6f7",
    padding: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: "LeagueSpartan",
    fontSize: 16,
  },
  inputHeading:{
    fontFamily: 'LeagueSpartan',
    fontSize: 20,
    paddingBottom: 10,
  },
  form: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    marginBottom: 20,
    marginTop: 10
  },
  btn: {
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 30,
    fontSize: 20,
    width: '100%',
    fontFamily: "LeagueSpartan",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  btnContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    marginTop: 50
  },
  registerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    color: '#B3B3B3',
    flexDirection: 'row',
    marginBottom: 20
  }
});
