import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Loader from "../../Components/Loader/Loader";
import {
  getOrder,
  getOrders,
  loadFinish,
  loadStart,
} from "../../redux/Orders/orderSlice";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { Button, Card, Divider } from "react-native-paper";
import { db } from "../../firebase";

const MyOrderDetails = ({ navigation }) => {
  const { orderId } = useRoute().params;

  const { order, loading } = useSelector((state) => state.order);
  const { authId } = useSelector((state) => state.user);

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

  const cancelOrder = async (id) => {
    if (id) {
      try {
        dispatch(loadStart());
        const docRef = doc(db, "orders", id);
        // deleting doc from firestore
        await deleteDoc(docRef);

        const q = query(
          collection(db, "orders"),
          where("userId", "==", authId)
        );
        const querySnapshot = await getDocs(q);
        const tempArr = [];
        querySnapshot.forEach((doc) => {
          tempArr.push(doc.data());
        });
        console.log(tempArr);
        dispatch(getOrders(tempArr));

        Toast.show({
          type: "success",
          text1: "Order cancelled successfully",
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
                Billing Address:
              </Text>
              <Text>
                {order?.billingDetails?.home}, {order?.billingDetails?.city},{" "}
                {order?.billingDetails?.state}, {order?.billingDetails?.pincode}
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
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            {order.status === "Pending" && (
              <Button
                mode="contained-tonal"
                style={{ borderRadius: 3, fontSize: 15 }}
                onPress={() => cancelOrder(order.orderId)}
              >
                Cancel Order
              </Button>
            )}
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

export default MyOrderDetails;

const styles = StyleSheet.create({});
