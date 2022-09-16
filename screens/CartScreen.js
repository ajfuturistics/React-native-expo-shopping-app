import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Divider } from "react-native-paper";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Components/Loader/Loader";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { db } from "../firebase";
import { addUser } from "../redux/User/UserSlice";

const CartScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { user, authId } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const getUser = async () => {
    try {
      setLoading(true);
      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const calculateDiscount = (price, discount, quantity) => {
    const discountAmount = (discount * price) / 100;

    const finalPrice = Math.round(price - discountAmount).toFixed(2);
    return finalPrice * quantity;
  };

  const getSubTotal = (Items) => {
    let total = 0;
    Items?.forEach((item) => {
      total += calculateDiscount(item.price, item.discount, item.quantity);
    });
    return Math.round(total).toFixed(2);
  };
  const getTotalShipping = (Items) => {
    let total = 0;
    Items?.forEach((item) => {
      total += item.shippingCost;
    });
    return Math.round(total).toFixed(2);
  };
  const getTotalAmount = (Items) => {
    let total = 0;
    const subTotal = getSubTotal(Items);
    const totalShip = getTotalShipping(Items);
    total = Number(subTotal) + Number(totalShip);
    return Math.round(total).toFixed(2);
  };

  const increaseQuantity = async (id) => {
    try {
      const docRef = doc(db, "users", user.userId);

      const tempArr = user?.cartItems?.map((element) => {
        if (element.id === id) {
          if (element.quantity >= 10) {
            Toast.show({
              type: "error",
              text1: "Quantity cannot exceed 10 limit",
            });
            return element;
          }
          return {
            ...element,
            quantity: element.quantity + 1,
          };
        } else {
          return element;
        }
      });

      await setDoc(
        docRef,
        {
          cartItems: tempArr || [],
        },
        { merge: true }
      );

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const decreaseQuantity = async (id) => {
    try {
      const docRef = doc(db, "users", user.userId);

      const tempArr = user?.cartItems?.map((element) => {
        if (element.id === id) {
          if (element.quantity <= 1) {
            Toast.show({
              type: "error",
              text1: "Quantity cannot be less than 1",
            });
            return element;
          }
          return {
            ...element,
            quantity: element.quantity - 1,
          };
        } else {
          return element;
        }
      });

      await setDoc(
        docRef,
        {
          cartItems: tempArr || [],
        },
        { merge: true }
      );

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };
  const removeFromCart = async (id) => {
    try {
      const docRef = doc(db, "users", user.userId);

      const tempArr = user?.cartItems?.filter((element) => element.id !== id);

      await setDoc(
        docRef,
        {
          cartItems: tempArr || [],
        },
        { merge: true }
      );

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <Loader />
      </View>
    );
  }

  return (
    <View>
      {user?.cartItems?.length > 0 ? (
        <ScrollView>
          <ScrollView
            style={{
              marginVertical: 10,
            }}
          >
            {user?.cartItems?.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  backgroundColor: "#fff",
                  marginBottom: 2,
                  height: 120,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    flexGrow: 1,
                    flexShrink: 1,
                    alignSelf: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => console.log("yey")}
                    style={{ paddingRight: 10, paddingLeft: 10 }}
                  >
                    <Image
                      source={{
                        uri: item?.imgUrl,
                      }}
                      style={[
                        styles.centerElement,
                        { height: 70, width: 70, backgroundColor: "#eeeeee" },
                      ]}
                    />
                  </TouchableOpacity>
                  <View
                    style={{ flexGrow: 1, flexShrink: 1, alignSelf: "center" }}
                  >
                    <Text numberOfLines={1} style={{ fontSize: 15 }}>
                      {item?.productName}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{ color: "#333333", marginBottom: 10 }}
                    >
                      ₹
                      {calculateDiscount(
                        item?.price,
                        item?.discount,
                        item?.quantity
                      )}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={{
                          borderColor: "#cccccc",
                          borderWidth: 1,
                        }}
                        onPress={() => decreaseQuantity(item?.id)}
                      >
                        <MaterialIcons
                          name="remove"
                          size={22}
                          color="#cccccc"
                        />
                      </TouchableOpacity>
                      <Text
                        style={{
                          borderTopWidth: 1,
                          borderBottomWidth: 1,
                          borderColor: "#cccccc",
                          paddingHorizontal: 7,
                          paddingTop: 3,
                          color: "#bbbbbb",
                          fontSize: 13,
                        }}
                      >
                        {item?.quantity}
                      </Text>
                      <TouchableOpacity
                        style={{
                          borderColor: "#cccccc",
                          borderWidth: 1,
                        }}
                        onPress={() => increaseQuantity(item?.id)}
                      >
                        <MaterialIcons name="add" size={22} color="#cccccc" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={[styles.centerElement, { width: 60 }]}>
                  <TouchableOpacity
                    style={[styles.centerElement, { width: 32, height: 32 }]}
                    onPress={() => removeFromCart(item?.id)}
                  >
                    <Ionicons name="md-trash" size={25} color="#ee4d2d" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* checkout  */}
          <View
            style={{
              backgroundColor: "#fff",
              borderTopWidth: 2,
              borderColor: "#f6f6f6",
              paddingVertical: 5,
            }}
          >
            <View style={{ flexDirection: "row", margin: 10 }}>
              <View
                style={{
                  flexDirection: "column",
                  flexGrow: 1,
                  flexShrink: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    paddingRight: 20,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#8f8f8f" }}>Subtotal: </Text>
                  <Text style={{ alignSelf: "flex-start" }}>
                    ₹{getSubTotal(user.cartItems)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    paddingRight: 20,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#8f8f8f" }}>Shipping: </Text>
                  <Text style={{ alignSelf: "flex-start" }}>
                    ₹{getTotalShipping(user.cartItems)}
                  </Text>
                </View>
                <Divider bold={true} style={{ marginVertical: 5 }} />
                <View
                  style={{
                    flexDirection: "row",
                    paddingRight: 20,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#8f8f8f" }}>Total: </Text>
                  <Text style={{ alignSelf: "flex-start" }}>
                    ₹{getTotalAmount(user.cartItems)}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexGrow: 1,
                  flexShrink: 1,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.centerElement,
                    {
                      backgroundColor: "#0faf9a",
                      width: 100,
                      height: 40,
                      borderRadius: 5,
                    },
                  ]}
                  onPress={() => navigation.push("Checkout")}
                >
                  <Text style={{ color: "#ffffff" }}>Checkout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <Text
          variant="headlineMedium"
          style={{
            margin: 10,
            textAlign: "center",
          }}
        >
          No items added in cart
        </Text>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  centerElement: { justifyContent: "center", alignItems: "center" },
});
