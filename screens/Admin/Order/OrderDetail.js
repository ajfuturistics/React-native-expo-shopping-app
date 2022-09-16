import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { Button, Card, Divider } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import Loader from "../../../Components/Loader/Loader";
import {
  getOrder,
  getOrders,
  loadFinish,
  loadStart,
} from "../../../redux/Orders/orderSlice";
import { db } from "../../../firebase";

const OrderDetail = ({ navigation }) => {
  const { orderId } = useRoute().params;
  const [newStatus, setNewStatus] = useState("");
  const [showDropDown, setShowDropDown] = useState(false);

  const { order, loading } = useSelector((state) => state.order);

  const dispatch = useDispatch();

  const getOrderById = async (id) => {
    if (id) {
      try {
        dispatch(loadStart());
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        // console.log(docSnap);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());

          dispatch(getOrder(docSnap.data()));

          dispatch(loadFinish());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          dispatch(loadFinish());
        }
      } catch (error) {
        console.log(error);
        dispatch(loadFinish());
        Toast.show({
          type: "error",
          text1: error.message,
        });
      }
    }
  };

  const updateOrder = async (id) => {
    if (newStatus === "") {
      return Toast.show({
        type: "error",
        text1: "Select status to update",
      });
    }
    if (id) {
      try {
        dispatch(loadStart());
        const docRef = doc(db, "orders", id);
        // deleting doc from firestore
        await setDoc(
          docRef,
          {
            status: newStatus,
          },
          { merge: true }
        );
        if (newStatus === "Dispatched") {
          const prodRef = doc(db, "products", order?.productId);
          const docSnap = await getDoc(prodRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            // updating product doc from firestore
            await setDoc(
              prodRef,
              {
                stock: docSnap.data().stock - order.quantity,
              },
              { merge: true }
            );
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }

        const querySnapshot = await getDocs(collection(db, "orders"));
        const tempArr = [];
        querySnapshot.forEach((doc) => {
          console.log(doc.id);
          tempArr.push(doc.data());
        });

        console.log("tempArr: ", tempArr);
        dispatch(getOrders(tempArr));

        getOrderById(orderId);
        dispatch(loadFinish());

        Toast.show({
          type: "success",
          text1: "Order updated successfully",
        });
      } catch (error) {
        console.log(error);
        dispatch(loadFinish());
        Toast.show({
          type: "error",
          text1: error.message,
        });
      }
    }
  };
  const declineOrder = async (id) => {
    if (id) {
      try {
        dispatch(loadStart());
        const docRef = doc(db, "orders", id);
        // deleting doc from firestore
        await setDoc(
          docRef,
          {
            status: "Declined",
          },
          { merge: true }
        );

        const querySnapshot = await getDocs(collection(db, "orders"));
        const tempArr = [];
        querySnapshot.forEach((doc) => {
          console.log(doc.id);
          tempArr.push(doc.data());
        });

        console.log("tempArr: ", tempArr);
        dispatch(getOrders(tempArr));

        getOrderById(orderId);
        dispatch(loadFinish());

        Toast.show({
          type: "success",
          text1: "Order declined successfully",
        });
      } catch (error) {
        console.log(error);
        dispatch(loadFinish());
        Toast.show({
          type: "error",
          text1: error.message,
        });
      }
    }
  };
  const deleteOrder = async (id) => {
    if (id) {
      try {
        dispatch(loadStart());
        const docRef = doc(db, "orders", id);
        // deleting doc from firestore
        await deleteDoc(docRef);

        const querySnapshot = await getDocs(collection(db, "orders"));
        const tempArr = [];
        querySnapshot.forEach((doc) => {
          console.log(doc.id);
          tempArr.push(doc.data());
        });

        console.log("tempArr: ", tempArr);
        dispatch(getOrders(tempArr));
        dispatch(loadFinish());

        Toast.show({
          type: "success",
          text1: "Order deleted successfully",
        });

        navigation.goBack();
      } catch (error) {
        console.log(error);
        dispatch(loadFinish());
        Toast.show({
          type: "error",
          text1: error.message,
        });
      }
    }
  };

  const getStatusOptions = (orderData) => {
    if (orderData.status === "Pending") {
      return [{ label: "Confirmed", value: "Confirmed" }];
    } else if (orderData.status === "Confirmed") {
      return [{ label: "Dispatched", value: "Dispatched" }];
    } else if (orderData.status === "Dispatched") {
      return [{ label: "Delivered", value: "Delivered" }];
    } else {
      [{ label: "Select Option", value: "" }];
    }
  };

  useEffect(() => {
    getOrderById(orderId);
  }, [orderId]);

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
      {order ? (
        <ScrollView>
          <Card>
            <Card.Cover source={{ uri: order.imgUrl }} />
            <Card.Content>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 16,
                  marginVertical: 10,
                }}
              >
                Order ID: {order.orderId}
              </Text>
            </Card.Content>
            <Divider bold={true} style={{ marginVertical: 5 }} />
            <Card.Content>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 16,
                  marginVertical: 4,
                }}
              >
                {order.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "400",
                }}
              >
                Order Date: {order.orderDate}
              </Text>
            </Card.Content>
          </Card>
          <Divider bold={true} style={{ marginVertical: 5 }} />
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
                    ₹{order.price}
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
                    ₹{order.shippingCost}
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
                    ₹{order.price + order.shippingCost}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Divider bold={true} style={{ marginVertical: 5 }} />
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
                  <Text style={{ color: "#8f8f8f" }}>Status: </Text>
                  <Text style={{ alignSelf: "flex-start" }}>
                    {order.status}
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
                  <Text style={{ color: "#8f8f8f" }}>Quantity: </Text>
                  <Text style={{ alignSelf: "flex-start" }}>
                    {order.quantity}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Divider bold={true} style={{ marginVertical: 5 }} />
          <Card>
            <Card.Content>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 16,
                  marginVertical: 9,
                }}
              >
                Billing Details:
              </Text>
              <Text>{order?.billingDetails?.name}</Text>
              <Text>
                {order?.billingDetails?.home}, {order?.billingDetails?.city},{" "}
                {order?.billingDetails?.state}, {order?.billingDetails?.pincode}
              </Text>
            </Card.Content>
          </Card>
          <Divider bold={true} style={{ marginVertical: 5 }} />
          {order.status !== "Delivered" && (
            <View style={styles.inputs}>
              <DropDown
                label={"Update Status"}
                mode={"outlined"}
                visible={showDropDown}
                showDropDown={() => setShowDropDown(true)}
                onDismiss={() => setShowDropDown(false)}
                value={newStatus}
                setValue={setNewStatus}
                list={getStatusOptions(order)}
              />
            </View>
          )}
          <View
            style={{
              backgroundColor: "#fff",
              borderTopWidth: 2,
              borderColor: "#f6f6f6",
              paddingVertical: 5,
              flexDirection: "row",
              justifyContent: "space-around",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Button
              mode="contained-tonal"
              style={{ borderRadius: 3, fontSize: 15, margin: 10 }}
              onPress={() => updateOrder(order.orderId)}
            >
              Update Order
            </Button>
            {order.status === "Pending" && (
              <Button
                mode="contained-tonal"
                style={{ borderRadius: 3, fontSize: 15, margin: 10 }}
                onPress={() => declineOrder(order.orderId)}
              >
                Decline Order
              </Button>
            )}
            <Button
              mode="contained-tonal"
              style={{ borderRadius: 3, fontSize: 15, margin: 10 }}
              onPress={() => deleteOrder(order.orderId)}
            >
              Delete Order
            </Button>
          </View>
        </ScrollView>
      ) : (
        <View
          style={{
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <Card>
            <Card.Content>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 16,
                  marginVertical: 9,
                  textAlign: "center",
                }}
              >
                Something went wrong
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};

export default OrderDetail;

const styles = StyleSheet.create({
  inputs: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
});
