import { StyleSheet, Text, View } from "react-native";
import {
  Button,
  Divider,
  RadioButton,
  Paragraph,
  Dialog,
  Portal,
} from "react-native-paper";
import React, { useState } from "react";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore/lite";
import { db } from "../../firebase";
import { addUser } from "../../redux/User/UserSlice";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";

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

function Totals({ Items, selectedAddr, showDialog }) {
  const { user } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const placeOrder = async () => {
    if (user.addresses.length === 0) {
      return Toast.show({
        type: "error",
        text1: "Add address first to purchase items",
      });
    }

    try {
      setLoading(true);
      user.cartItems.forEach(async (item) => {
        const orderData = {
          name: item.productName,
          imgUrl: item.imgUrl,
          price: calculateDiscount(item.price, item.discount, item.quantity),
          quantity: item.quantity,
          productId: item.id,
          shippingCost: item.shippingCost,
          userId: user.userId,
          billingDetails: { ...user.addresses[selectedAddr], name: user.name },
          orderDate: moment(new Date()).format("MMMM Do YYYY [at] h:mm a"),
          status: "Pending",
        };
        const docRef = await addDoc(collection(db, "orders"), orderData);
        const orderRef = doc(db, "orders", docRef.id);
        await setDoc(orderRef, { orderId: docRef.id }, { merge: true });
      });

      const docRef = doc(db, "users", user.userId);

      await setDoc(
        docRef,
        {
          cartItems: [],
        },
        { merge: true }
      );
      const newDocRef = doc(db, "users", user.userId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));
      showDialog();

      Toast.show({
        type: "success",
        text1: "Order placed successfully",
      });
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

  return (
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
              ₹{getSubTotal(Items)}
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
              ₹{getTotalShipping(Items)}
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
              ₹{getTotalAmount(Items)}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexGrow: 1,
          flexShrink: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          mode="contained-tonal"
          disabled={loading}
          loading={loading}
          style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
          onPress={placeOrder}
        >
          {loading ? "Loading..." : "Place Order"}
        </Button>
      </View>
    </View>
  );
}

const CheckoutScreen = ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);

  const { user } = useSelector((state) => state.user);
  const [selectedAddr, setSelectedAddr] = useState(0);

  return (
    <View>
      {user ? (
        <View>
          <Portal>
            <Dialog visible={visible}>
              <View
                style={{
                  flexDirection: "row",
                  flexGrow: 1,
                  flexShrink: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 10,
                }}
              >
                <MaterialIcons
                  name="check"
                  size={40}
                  color="#22c55e"
                  style={{
                    backgroundColor: "#f0fdf4",
                    padding: 6,
                    borderRadius: 30,
                  }}
                />
              </View>

              <Dialog.Title
                style={{
                  textAlign: "center",
                }}
              >
                Order Placed
              </Dialog.Title>
              <Dialog.Content>
                <Paragraph
                  style={{
                    textAlign: "center",
                  }}
                >
                  Thank you for shopping
                </Paragraph>
              </Dialog.Content>
              <View
                style={{
                  flexDirection: "row",
                  flexGrow: 1,
                  flexShrink: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 10,
                }}
              >
                <Button
                  mode="contained-tonal"
                  style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
                  onPress={() => {
                    navigation.navigate("TabNav", {
                      screen: "Home",
                    });
                    setVisible(false);
                  }}
                >
                  Continue Shopping
                </Button>
              </View>
            </Dialog>
          </Portal>
          <RadioButton.Group
            onValueChange={(newValue) => setSelectedAddr(newValue)}
            value={selectedAddr}
          >
            <Text
              style={{
                fontWeight: "500",
                marginHorizontal: 10,
                marginTop: 10,
              }}
            >
              Select Address
            </Text>
            {user.addresses.map((address, index) => {
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#fff",
                    borderTopWidth: 2,
                    borderColor: "#f6f6f6",
                    paddingVertical: 5,
                    margin: 5,
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 10,
                    elevation: 5,
                  }}
                >
                  <RadioButton value={index} />
                  <Text
                    style={{
                      fontWeight: "500",
                    }}
                  >
                    {address?.home}, {address?.city}, {address?.state},{" "}
                    {address?.pincode}
                  </Text>
                </View>
              );
            })}
          </RadioButton.Group>
          <View
            style={{
              backgroundColor: "#fff",
              borderTopWidth: 2,
              borderColor: "#f6f6f6",
              paddingVertical: 5,
              margin: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                marginHorizontal: 10,
                marginTop: 10,
              }}
            >
              Items
            </Text>
            {user.cartItems.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  paddingRight: 20,
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                  marginVertical: 5,
                }}
              >
                <Text style={{ color: "#8f8f8f" }}>
                  {item.productName} x {item.quantity}{" "}
                </Text>
                <Text style={{ alignSelf: "flex-start" }}>
                  ₹{calculateDiscount(item.price, item.discount, item.quantity)}
                </Text>
              </View>
            ))}
          </View>
          <Totals
            Items={user.cartItems}
            selectedAddr={selectedAddr}
            showDialog={showDialog}
          />
        </View>
      ) : (
        <Text
          variant="headlineMedium"
          style={{
            margin: 10,
            textAlign: "center",
          }}
        >
          Something went wrong
        </Text>
      )}
    </View>
  );
};

export default CheckoutScreen;
