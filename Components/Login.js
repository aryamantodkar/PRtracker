import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { FIREBASE_AUTH, provider } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const auth = FIREBASE_AUTH;

  const goToRegister = () => {
    navigation.navigate("Register");
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (err) {
      console.log("handleLogin", err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    sendPasswordResetEmail(getAuth(), recoveryEmail)
      .then(() => {
        alert(
          "Please check the verification email sent on your email address."
        );
        setRecoveryEmail("");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        alert("Could not send verification email.");
      });
  };

  if (forgotPassword) {
    return (
      <ScrollView
        style={{ height: "100%", backgroundColor: "#fff", display: "flex" }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.login, {}]}
        >
          <View
            style={{
              height: 400,
              width: "100%",
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <View
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <Text style={{ fontFamily: "LeagueSpartan", fontSize: 30, color: '#343434' }}>
                Forgot Password?
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                width: "100%",
              }}
            >
              <Text style={{ fontFamily: "LeagueSpartan", fontSize: 20, color: '#949494' }}>
                Please enter a valid email address.
              </Text>
              <View style={{ width: "100%", marginTop: 25 }}>
                <TextInput
                  value={recoveryEmail}
                  onChangeText={(text) => {
                    setRecoveryEmail(text);
                  }}
                  placeholder="Enter email address"
                  placeholderTextColor='#777777'
                  style={{
                    width: "100%",
                    padding: 15,
                    paddingTop: 10,
                    paddingBottom: 10,
                    fontFamily: "LeagueSpartan",
                    fontSize: 17,
                    color: '#343434',
                    borderWidth: 2,
                    borderColor: '#f1f1f1',
                    borderRadius: 5
                  }}
                />
              </View>
            </View>
            <View
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {recoveryEmail == "" ? (
                <Pressable
                  style={[styles.btn, {backgroundColor: '#f5f4f4', }]}
                >
                  <Text
                    style={{
                      color: "#949494",
                      fontSize: 18,
                      paddingLeft: 10,
                      paddingRight: 10,
                      fontFamily: "LeagueSpartan",
                    }}
                  >
                    Reset
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    resetPassword();
                  }}
                  style={styles.btn}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      paddingLeft: 10,
                      paddingRight: 10,
                      fontFamily: "LeagueSpartan",
                    }}
                  >
                    Reset
                  </Text>
                </Pressable>
              )}
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => {
                  setForgotPassword(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "LeagueSpartan",
                    fontSize: 18,
                    color: "#747474",
                  }}
                >
                  Already a user?
                </Text>
                <Text
                  style={{
                    fontFamily: "LeagueSpartan",
                    fontSize: 18,
                    marginLeft: 10,
                    color: "#343434",
                  }}
                >
                  Login
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  goToRegister();
                  setForgotPassword(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "LeagueSpartan",
                    fontSize: 18,
                    color: "#747474",
                  }}
                >
                  Don't have an account?
                </Text>
                <Text
                  style={{
                    fontFamily: "LeagueSpartan",
                    fontSize: 18,
                    marginLeft: 10,
                    color: "#343434",
                  }}
                >
                  Register
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  } else {
    return (
      <ScrollView
        style={{ height: "100%", backgroundColor: "#fff", display: "flex" }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1,display: 'flex', justifyContent: 'center',alignItems: 'center' }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.login}
        >
          <ScrollView
            style={{ height: "100%", width: "100%", display: "flex" }}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.logincontent}>
              <View style={styles.headingContainer}>
                <Text style={styles.heading}>Welcome Back.</Text>
                <Text style={styles.subHeading}>
                  Hope you have a good workout today :)
                </Text>
              </View>
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeading}>Email</Text>
                  <View>
                    <TextInput
                      style={styles.input}
                      value={email}
                      placeholderTextColor="#949494"
                      onChangeText={(text) => {
                        setError("");
                        setEmail(text);
                      }}
                      placeholder="Enter Email ID"
                    />
                  </View>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputHeading}>Password</Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {showPassword ? (
                      <TextInput
                        style={styles.input}
                        value={password}
                        placeholderTextColor="#949494"
                        onChangeText={(text) => {
                          setError("");
                          setPassword(text);
                        }}
                        placeholder="Enter Password"
                      />
                    ) : (
                      <TextInput
                        secureTextEntry={true}
                        password={true}
                        style={styles.input}
                        value={password}
                        placeholderTextColor="#949494"
                        onChangeText={(text) => {
                          setError("");
                          setPassword(text);
                        }}
                        placeholder="Enter Password"
                      />
                    )}
                    <Pressable
                      onPress={() => {
                        setShowPassword(!showPassword);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        position: "absolute",
                        margin: "auto",
                        right: 10,
                        top: 0,
                        bottom: 0,
                      }}
                    >
                      {showPassword ? (
                        // <Image source={eyeIcon} style={{height: 22,width: 22,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                        <FontAwesomeIcon
                          icon="fa-regular fa-eye"
                          size={20}
                          style={{ marginRight: 5,color: '#949494' }}
                        />
                      ) : (
                        // <Image source={hideEyeIcon} style={{height: 25,width: 25,display: 'flex',justifyContent: 'center',alignItems: 'center'}}/>
                        <FontAwesomeIcon
                          icon="fa-regular fa-eye-slash"
                          size={20}
                          style={{ marginRight: 5,color: '#949494' }}
                        />
                      )}
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => {
                      setForgotPassword(true);
                    }}
                    style={{ marginTop: 15 }}
                  >
                    <Text
                      style={{
                        fontFamily: "LeagueSpartan",
                        fontSize: 14,
                        color: "#747474",
                      }}
                    >
                      Forgot Password?
                    </Text>
                  </Pressable>
                </View>
                {error ? <Text>{error}</Text> : null}
                <View style={[styles.btnContainer, styles.inputContainer]}>
                  {email != "" && password != "" ? (
                    <Pressable style={styles.btn} onPress={handleLogin}>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          paddingLeft: 10,
                          paddingRight: 10,
                          fontFamily: "LeagueSpartan",
                        }}
                      >
                        Sign In
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={[styles.btn,{backgroundColor: '#f5f4f4'}]}
                    >
                      <Text
                        style={{
                          color: "#949494",
                          fontSize: 18,
                          paddingLeft: 10,
                          paddingRight: 10,
                          fontFamily: "LeagueSpartan",
                        }}
                      >
                        Sign In
                      </Text>
                    </Pressable>
                  )}
                </View>
                <Pressable
                  style={styles.registerContainer}
                  onPress={goToRegister}
                >
                  <Text
                    style={{
                      fontFamily: "LeagueSpartan",
                      fontSize: 17,
                      color: "#949494",
                      alignItems: 'center'
                    }}
                  >
                    New User?
                  </Text>
                  <Text
                    style={{
                      fontFamily: "LeagueSpartan",
                      fontSize: 17,
                      marginLeft: 5,
                      color: "#343434",
                    }}
                  >
                    Register
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  login: {
    display: "flex",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
    height: "100%",
    width: "100%",
    padding: 15,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 0,
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
    display: "flex",
    flexDirection: "column",
    marginBottom: 40,
    marginTop: 30,
  },
  heading: {
    fontFamily: "LeagueSpartan-Medium",
    fontSize: 40,
    paddingBottom: 10,
    color: '#343434'
  },
  subHeading: {
    fontFamily: "LeagueSpartan",
    fontSize: 20,
    paddingBottom: 10,
    color: "#A7A7A7",
  },
  input: {
    width: "100%",
    padding: 15,
    paddingTop: 15,
    paddingBottom: 15,
    fontFamily: "LeagueSpartan",
    fontSize: 16,
    color: '#343434',
    borderWidth: 1,
    borderColor: '#F1F1F1',
    borderRadius: 5
  },
  inputHeading: {
    fontFamily: "LeagueSpartan",
    fontSize: 24,
    paddingBottom: 10,
    color: '#343434'
  },
  form: {
    marginTop: 30,
    display: "flex",
    flexDirection: "column",
  },
  inputContainer: {
    marginBottom: 30,
  },
  btn: {
    backgroundColor: "#343434",
    borderRadius: 30,
    fontSize: 20,
    width: "100%",
    fontFamily: "LeagueSpartan",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  btnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
    marginTop: 20,
  },
  registerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    marginBottom: 20,
  },
});
