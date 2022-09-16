import { StyleSheet, View } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Text, Button, IconButton, MD3Colors } from "react-native-paper";
import Toast from "react-native-toast-message";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { addUser } from "../../redux/User/UserSlice";

const ProfileScreen = ({ navigation }) => {
  const { user, authId } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const logoutUser = () => {
    console.log("Logout");
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        Toast.show({
          type: "success",
          text1: "Logged out sucessfully",
        });
      })
      .catch((error) => {
        // An error happened.
        Toast.show({
          type: "error",
          text1: error.message,
        });
      });
  };

  const removeAddress = async (itemIndex) => {
    try {
      const newArr = [...user.addresses];

      const docRef = doc(db, "users", user.userId);
      await setDoc(
        docRef,
        {
          addresses: newArr.filter((data, index) => index !== itemIndex) || [],
        },
        { merge: true }
      );

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));

      Toast.show({
        type: "success",
        text1: "Address removed sucessfully",
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  return (
    <View
      style={{
        paddingVertical: 20,
      }}
    >
      <Card
        style={{
          paddingVertical: 20,
        }}
      >
        <View>
          <Text style={styles.spacing} variant="titleLarge">
            Welcome, {user.name}
          </Text>
          <Card.Content>
            <Text style={styles.spacing} variant="titleMedium">
              Email: {user.email}
            </Text>
            <Text style={styles.spacing} variant="titleMedium">
              Phone: {user?.phone === "" ? "not added" : user.phone}
            </Text>
          </Card.Content>

          <Text style={styles.spacing} variant="titleMedium">
            Addresses:{" "}
          </Text>
          {user.addresses.length === 0 ? (
            <Card.Content>
              <Text style={styles.spacing} variant="titleMedium">
                No address added
              </Text>
            </Card.Content>
          ) : (
            user.addresses.map((address, index) => (
              <Card.Content
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                key={index}
              >
                <Text style={styles.spacing} variant="titleMedium">
                  {address?.home}, {address?.city}, {address?.state},{" "}
                  {address?.pincode}
                </Text>
                <IconButton
                  icon="delete"
                  iconColor={MD3Colors.error50}
                  size={20}
                  onPress={() => removeAddress(index)}
                />
              </Card.Content>
            ))
          )}
        </View>

        <View style={styles.btnListContainer}>
          <Button
            mode="contained-tonal"
            style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
            onPress={() => navigation.push("UpdateProfile")}
          >
            Update Profile
          </Button>
          <Button
            mode="contained-tonal"
            style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
            onPress={() => navigation.push("AddAddress")}
          >
            Add Address
          </Button>
          <Button
            mode="contained-tonal"
            style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
            onPress={() => navigation.push("MyOrders")}
          >
            My Orders
          </Button>
          <Button
            mode="contained-tonal"
            style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
            onPress={logoutUser}
          >
            Logout
          </Button>
        </View>
      </Card>

      {/* <Text>{JSON.stringify(user)}</Text> */}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  spacing: {
    marginHorizontal: 14,
    marginVertical: 6,
  },
  btnListContainer: {
    marginHorizontal: 14,
    marginVertical: 15,
  },
});
