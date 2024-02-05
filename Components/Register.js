import React, { useContext } from 'react';
import { StyleSheet, Text, View, TextInput,KeyboardAvoidingView,Pressable,SafeAreaView, Platform } from 'react-native';
import {useState} from 'react'
import { FIREBASE_AUTH, FIREBASE_DB } from '../FirebaseConfig';
import { createUserWithEmailAndPassword,updateProfile } from 'firebase/auth';
import { doc, setDoc,collection, addDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

export default function Register({navigation}) { 
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

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
          comments: []
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.login}>
        <View style={styles.logincontent}>
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Welcome to the Club.</Text>
            <Text style={styles.subHeading}>It's time to hit PR's</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputHeading}>Name</Text>
              <View>
                <TextInput style={styles.input} value={name} onChangeText={text => {
                  setError('')
                  setName(text);
                }} multiline placeholder='Enter your Name' />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputHeading}>Email</Text>
              <View>
                <TextInput style={styles.input} value={email} onChangeText={text => {
                  setError('');
                  setEmail(text);
                }} multiline placeholder='Enter Email ID' />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputHeading}>Password</Text>
              <View>
                <TextInput style={styles.input} value={password} onChangeText={text => {
                  setError('');
                  setPassword(text);
                }} multiline placeholder='Enter Password' secureTextEntry/>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputHeading}>Confirm Password</Text>
              <View>
                <TextInput style={styles.input} value={confirmPassword} onChangeText={text => {
                  setError('');
                  setConfirmPassword(text);
                }} multiline placeholder='Re-Enter Password' secureTextEntry/>
              </View>
            </View>
            {error ? <Text>{error}</Text> : null}
            <View style={[styles.btnContainer, styles.inputContainer]}>
              <Pressable style={styles.btn} onPress={handleSignup}>
                <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10}}>Sign Up</Text>
              </Pressable>
            </View>
            <Pressable style={styles.registerContainer} onPress={goToRegister}>
              <Text>Already have an Account?</Text>
            </Pressable>
          </View>
        </View>
    </KeyboardAvoidingView>
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
    marginBottom: 20,
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
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    fontFamily: 'JosefinSans',
    color: '#A4A4A4',
    paddingTop: 10,
  },
  inputHeading:{
    fontFamily: 'JosefinSans',
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
