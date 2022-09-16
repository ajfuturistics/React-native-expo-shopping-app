import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where } from "firebase/firestore/lite";
import { db } from "../../firebase";
import {
  getOrders,
  loadFinish,
  loadStart,
} from "../../redux/Orders/orderSlice";
import { Button } from "react-native-paper";
import Loader from "../../Components/Loader/Loader";

const MyOrdersScreen = ({ navigation }) => {
  const { orders, loading } = useSelector((state) => state.order);
  const { authId } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const getAllUserOrders = async () => {
    try {
      dispatch(loadStart());
      const q = query(collection(db, "orders"), where("userId", "==", authId));
      const querySnapshot = await getDocs(q);
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        tempArr.push(doc.data());
      });
      console.log(tempArr);
      dispatch(getOrders(tempArr));
    } catch (error) {
      console.log(error);
      dispatch(loadFinish());
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    getAllUserOrders();
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
      {orders?.length > 0 ? (
        <ScrollView>
          <ScrollView
            style={{
              marginVertical: 10,
            }}
          >
            {orders?.map((item) => (
              <View
                key={item.orderId}
                style={{
                  flexDirection: "row",
                  backgroundColor: "#fff",
                  margin: 2,
                  padding: 6,
                  height: 160,
                  alignItems: "center",
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
                    style={{
                      paddingRight: 10,
                      paddingLeft: 10,
                      alignSelf: "center",
                    }}
                  >
                    <Image
                      source={{
                        uri: item?.imgUrl,
                      }}
                      style={[
                        styles.centerElement,
                        {
                          height: 120,
                          width: 120,
                          backgroundColor: "#eeeeee",
                          alignSelf: "center",
                        },
                      ]}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      flexGrow: 1,
                      flexShrink: 1,
                      alignSelf: "center",
                      marginVertical: 10,
                    }}
                  >
                    <View>
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 15, marginBottom: 6 }}
                      >
                        {item?.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ fontSize: 15, marginBottom: 6 }}
                      >
                        ₹{item?.price + item?.shippingCost}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={{ color: "#333333", marginBottom: 6 }}
                    >
                      {item?.orderDate}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ color: "#333333", marginBottom: 6 }}
                    >
                      Status: {item?.status}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        mode="contained-tonal"
                        style={{ borderRadius: 3, fontSize: 15 }}
                        onPress={() =>
                          navigation.push("MyOrdersDetails", {
                            orderId: item?.orderId,
                          })
                        }
                      >
                        View Details
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      ) : (
        <Text
          variant="headlineMedium"
          style={{
            margin: 10,
            textAlign: "center",
          }}
        >
          No orders found
        </Text>
      )}
    </View>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  centerElement: { justifyContent: "center", alignItems: "center" },
});
