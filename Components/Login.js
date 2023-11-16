import React, { useContext } from 'react';
import { StyleSheet, Text, View, TextInput,KeyboardAvoidingView,Pressable,SafeAreaView, Platform } from 'react-native';
import {useState} from 'react'
import { FIREBASE_AUTH, provider } from '../FirebaseConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function Login({navigation}) {  
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const goToRegister = () => {
    navigation.navigate('Register');
  }

  const handleLogin = async () => {
    setLoading(true);
    try{
      const resposne = await signInWithEmailAndPassword(auth,email,password);
      console.log(resposne);
    }
    catch(err){
      console.log("handleLogin",err);
      alert('Login failed');
    }
    finally{
      setLoading(false);
    }
  }

  const googleSignIn = () => {
    const googleAuth = getAuth();

    signInWithPopup(googleAuth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.log("google error",error);
      });
  }

  return (
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
                }} multiline placeholder='Enter Email ID' />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputHeading}>Password</Text>
              <View>
                <TextInput style={styles.input} value={password} onChangeText={text => {
                  setError('')
                  setPassword(text);
                }} multiline placeholder='Enter Password' secureTextEntry/>
              </View>
            </View>
            {error ? <Text>{error}</Text> : null}
            <View style={[styles.btnContainer, styles.inputContainer]}>
              <Pressable style={styles.btn} onPress={handleLogin}>
                <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10}}>Sign In</Text>
              </Pressable>
            </View>
            {/* <View style={[styles.btnContainer, styles.inputContainer]}>
              <Pressable style={styles.btn} onPress={googleSignIn}>
                <Text style={{color: 'white', fontSize: 18,paddingLeft: 10,paddingRight: 10}}>Sign in with Google</Text>
              </Pressable>
            </View> */}
            <Pressable style={styles.registerContainer} onPress={goToRegister}>
              <Text >New User?</Text>
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
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    paddingTop: 10,
    fontFamily: 'JosefinSans',
    color: '#A4A4A4',
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
