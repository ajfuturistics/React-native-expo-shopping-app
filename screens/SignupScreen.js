import { KeyboardAvoidingView, StyleSheet, View, Image } from "react-native";
import { TextInput, Text, Button, HelperText } from "react-native-paper";
import React, { useState } from "react";

import { login } from "../redux/User/UserSlice";
import { useDispatch } from "react-redux";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import Toast from "react-native-toast-message";
import validator from "validator";

// {
//   userId: user.uid,
//   name: "",
//   phone: "",
//   email: user.email,
//   cartItems: [],
//   savedItems: [],
//   addresses: [],
//   orders: [],
// }

const SignupScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const dispatch = useDispatch();

  const hasErrors = () => {
    if (email === "") {
      return false;
    }

    return !validator.isEmail(email);
  };

  const handleLogin = () => {
    console.log("Login Pressed");
    navigation.push("Login");
  };
  const handleSignup = async () => {
    if (userName === "" || email === "" || password === "") {
      // alert("Enter details to signup!");
      return Toast.show({
        type: "error",
        text1: "Enter details to signup!",
      });
    }
    console.log("Signup Pressed");
    setLoading(true);
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ).then((userCredential) => userCredential.user);

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      // console.log(docSnap);

      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        Toast.show({
          type: "error",
          text1: "Something went wrong!",
        });
      }
      await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        name: userName,
        phone: "",
        email: user.email,
        cartItems: [],
        savedItems: [],
        addresses: [],
        orders: [],
      });

      const newDocRef = doc(db, "users", user.uid);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document written: ", newDocSnap.data());
      dispatch(login({ user: newDocSnap.data(), authId: user.uid }));
      // alert("Registed sucessfully!");
      Toast.show({
        type: "success",
        text1: "Registed sucessfully!",
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      alert(error.message);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
    // setLoading(true);
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
          source={require("../assets/signup.png")}
          style={{ width: 120, height: 120 }}
        ></Image>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          label="Name"
          value={userName}
          onChangeText={(text) => setUserName(text)}
          style={styles.inputs}
        />
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
          onPress={handleSignup}
        >
          {loading ? "Loading..." : "Signup"}
        </Button>
        <Text
          style={{
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Already Registered?
        </Text>
        <Button mode="text" onPress={handleLogin}>
          Click here to login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

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
