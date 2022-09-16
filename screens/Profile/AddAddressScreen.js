import {
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { TextInput, Button } from "react-native-paper";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { db } from "../../firebase";
import { addUser } from "../../redux/User/UserSlice";

const AddAddressScreen = ({ navigation }) => {
  const { user, authId } = useSelector((state) => state.user);

  const [updating, setUpdating] = useState(false);
  const [address, setAddress] = useState({
    home: "",
    city: "",
    state: "",
    pincode: "",
  });

  const dispatch = useDispatch();

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);

      console.log(address);

      const docRef = doc(db, "users", user.userId);
      await setDoc(
        docRef,
        { addresses: [...user.addresses, address] },
        { merge: true }
      );

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));

      setUpdating(false);

      Toast.show({
        type: "success",
        text1: "Address added sucessfully",
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

  return (
    <ScrollView>
      <KeyboardAvoidingView>
        <Text style={styles.heading}>Update Profile</Text>

        <TextInput
          label="Home"
          style={styles.inputs}
          mode="outlined"
          value={address.home}
          onChangeText={(text) =>
            setAddress((prev) => ({ ...prev, home: text }))
          }
        />
        <TextInput
          label="city"
          style={styles.inputs}
          mode="outlined"
          value={address.city}
          onChangeText={(text) =>
            setAddress((prev) => ({ ...prev, city: text }))
          }
        />
        <TextInput
          label="state"
          style={styles.inputs}
          mode="outlined"
          value={address.state}
          onChangeText={(text) =>
            setAddress((prev) => ({ ...prev, state: text }))
          }
        />
        <TextInput
          label="pincode"
          style={styles.inputs}
          mode="outlined"
          value={address.pincode}
          onChangeText={(text) =>
            setAddress((prev) => ({ ...prev, pincode: text }))
          }
        />

        <Button
          loading={updating}
          disabled={updating}
          mode="contained"
          style={styles.btnMargin}
          onPress={addAddress}
        >
          {updating ? "Loading..." : "Add Address"}
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default AddAddressScreen;

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
