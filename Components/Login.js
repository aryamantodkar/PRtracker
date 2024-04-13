import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { StyleSheet, Text, View, TextInput,KeyboardAvoidingView,Pressable,SafeAreaView, Platform,Image,ScrollView } from 'react-native';
import {useState} from 'react'
import { FIREBASE_AUTH, provider } from '../FirebaseConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';
import { getAuth } from "firebase/auth";

export default function Login({navigation}) {  

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);

  const auth = FIREBASE_AUTH;

  const goToRegister = () => {
    navigation.navigate('Register');
  }

  const handleLogin = async () => {
    setLoading(true);
    try{
      const response = await signInWithEmailAndPassword(auth,email,password);
      console.log(response);
    }
    catch(err){
      console.log("handleLogin",err);
      alert('Login failed');
    }
    finally{
      setLoading(false);
    }
  }


  return (
    <ScrollView style={{height: '100%',backgroundColor: '#fff',display: 'flex'}} keyboardShouldPersistTaps='handled' contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.login}>
          <View style={styles.logincontent}>
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>Welcome Back.</Text>
              <Text style={styles.subHeading}>Hope you're killing your workout :)</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputHeading}>Email</Text>
                <View>
                  <TextInput style={styles.input} value={email} onChangeText={text => {
                    setError('')
                    setEmail(text);
                  }} placeholder='Enter Email ID' />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputHeading}>Password</Text>
                <View style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginTop: 10,position: 'relative'}}>
                  {
                    showPassword
                    ?
                    <TextInput style={styles.input} value={password} onChangeText={text => {
                      setError('')
                      setPassword(text);
                    }} placeholder='Enter Password'/>
                    :
                    <TextInput secureTextEntry={true} password={true} style={styles.input} value={password} onChangeText={text => {
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
                      // <Image source={hideEyeIcon} style={{height: 25,width: 25,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                      <FontAwesomeIcon icon="fa-regular fa-eye-slash" size={20} style={{marginRight: 5}}/>
                    }
                  </Pressable>
                </View>
              </View>
              {error ? <Text>{error}</Text> : null}
              <View style={[styles.btnContainer, styles.inputContainer]}>
                <Pressable style={styles.btn} onPress={handleLogin}>
                  <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10}}>Sign In</Text>
                </Pressable>
              </View>
              <Pressable style={styles.registerContainer} onPress={goToRegister}>
                <Text >New User?</Text>
              </Pressable>
            </View>
          </View>
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
    width: '85%'
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 40,
  },
  heading: {
    fontFamily: 'JosefinSans',
    fontSize: 30,
    paddingBottom: 10,
  },
  subHeading: {
    fontFamily: 'JosefinSans',
    fontSize: 18,
    paddingBottom: 10,
    color: '#696969'
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#A4A4A4',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 'auto',
    
    padding: 10,
    borderRadius: 10,
    fontFamily: 'JosefinSans',
    color: '#A4A4A4',
    paddingTop: 12.5,
    paddingBottom: 12.5
  },
  inputHeading:{
    fontFamily: 'JosefinSans',
    fontSize: 20,
    paddingBottom: 10,
  },
  form: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: 20,
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontFamily: 'JosefinSans',
    alignItems: 'center',
    boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
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
    marginTop: 20
  }
});
