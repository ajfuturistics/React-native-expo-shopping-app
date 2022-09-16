import {
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { TextInput, Button, HelperText } from "react-native-paper";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { db } from "../../firebase";
import { addUser } from "../../redux/User/UserSlice";
import validator from "validator";

const UpdateProfileScreen = ({ navigation }) => {
  const { user, authId } = useSelector((state) => state.user);

  const [updating, setUpdating] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();

  const hasErrors = () => {
    if (phone === "") {
      return false;
    }

    return !validator.isMobilePhone(phone);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);

      console.log({
        username,
        phone,
      });

      const docRef = doc(db, "users", user.userId);
      await setDoc(docRef, { name: username, phone: phone }, { merge: true });

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));

      setUpdating(false);

      Toast.show({
        type: "success",
        text1: "Profile updated sucessfully",
      });
      navigation.goBack();
    } catch (error) {
      setUpdating(false);
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user?.name || "");
      setPhone(user?.phone || "");
    }
  }, []);

  return (
    <ScrollView>
      <KeyboardAvoidingView>
        <Text style={styles.heading}>Update Profile</Text>

        <TextInput
          label="Name"
          style={styles.inputs}
          mode="outlined"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          label="phone"
          style={styles.inputs}
          mode="outlined"
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
        {hasErrors() && (
          <HelperText type="error" visible={hasErrors()}>
            Phone number is invalid!
          </HelperText>
        )}

        <Button
          loading={updating}
          disabled={updating}
          mode="contained"
          style={styles.btnMargin}
          onPress={updateProfile}
        >
          {updating ? "Loading..." : "Update Profile"}
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default UpdateProfileScreen;

const styles = StyleSheet.create({
  heading: {
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "600",
  },
  inputs: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  btnMargin: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
