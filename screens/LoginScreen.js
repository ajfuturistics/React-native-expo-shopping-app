import { KeyboardAvoidingView, StyleSheet, View, Image } from "react-native";
import { TextInput, Text, Button, HelperText } from "react-native-paper";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/User/UserSlice";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore/lite";
import Toast from "react-native-toast-message";
import validator from "validator";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const dispatch = useDispatch();

  const handleLogin = async () => {
    console.log("Login Pressed");
    if (email === "" || password === "") {
      return Toast.show({
        type: "error",
        text1: "Email and Password is required",
      });
    }

    setLoading(true);
    try {
      const user = await signInWithEmailAndPassword(auth, email, password).then(
        (userCredential) => userCredential.user
      );

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      // console.log(docSnap);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        dispatch(login({ user: docSnap.data(), authId: user.uid }));
        // alert("Logged in successfully!");
        Toast.show({
          type: "success",
          text1: "Logged in successfully!",
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        alert("Email not registered");
        Toast.show({
          type: "error",
          text1: "Email not registered",
        });
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      // alert(error.message);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };
  const handleSignup = () => {
    console.log("Signup Pressed");
    navigation.push("Signup");
  };

  const hasErrors = () => {
    if (email === "") {
      return false;
    }

    return !validator.isEmail(email);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/login.png")}
          style={{ width: 120, height: 120 }}
        ></Image>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.inputs}
        />
        {hasErrors() && (
          <HelperText type="error" visible={hasErrors()}>
            Email address is invalid!
          </HelperText>
        )}
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPass}
          style={styles.inputs}
          right={
            <TextInput.Icon
              onPress={() => setShowPass(!showPass)}
              icon={showPass ? "eye-off" : "eye"}
            />
          }
        />
        <Button
          loading={loading}
          disabled={loading}
          style={styles.btnStyle}
          mode="contained"
          onPress={handleLogin}
        >
          {loading ? "Loading..." : "Login"}
        </Button>
        <Text
          style={{
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Don't have account?
        </Text>
        <Button mode="text" onPress={handleSignup}>
          Click here to signup
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ede9fe",
  },
  inputContainer: {
    padding: 20,
  },
  inputs: {
    margin: 5,
  },
  btnStyle: {
    marginVertical: 20,
  },
});
