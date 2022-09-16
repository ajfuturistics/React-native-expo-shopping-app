import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { DataTable, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "../../../firebase";
import Loader from "../../../Components/Loader/Loader";
import {
  getOrders,
  loadFinish,
  loadStart,
} from "../../../redux/Orders/orderSlice";

const numberOfItemsPerPageList = [5, 6, 7, 8, 9];

const Orders = ({ navigation }) => {
  const { orders, loading } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const from = page * numberOfItemsPerPage;
  const to = Math.min((page + 1) * numberOfItemsPerPage, orders?.length);

  const getAllOrders = async () => {
    try {
      dispatch(loadStart());
      const querySnapshot = await getDocs(collection(db, "orders"));
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        tempArr.push(doc.data());
      });

      console.log("tempArr: ", tempArr);
      dispatch(getOrders(tempArr));
      dispatch(loadFinish());
    } catch (error) {
      console.log(error);
      dispatch(loadFinish());
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const tableRow = (item) => (
    <DataTable.Row
      key={item.orderId}
      onPress={() =>
        navigation.push("OrderDetail", {
          orderId: item.orderId,
        })
      }
    >
      <DataTable.Cell>{item.name}</DataTable.Cell>
      <DataTable.Cell>{item.status}</DataTable.Cell>
      <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
      <DataTable.Cell numeric>{item.price + item.shippingCost}</DataTable.Cell>
    </DataTable.Row>
  );

  useEffect(() => {
    setPage(0);
    getAllOrders();
  }, [numberOfItemsPerPage]);

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
    <ScrollView>
      <Text style={styles.heading}>All Orders</Text>
      {orders && orders?.length > 0 ? (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title numeric>Quantity</DataTable.Title>
            <DataTable.Title numeric>Price</DataTable.Title>
          </DataTable.Header>

          {orders
            ?.slice(
              page * numberOfItemsPerPage,
              page * numberOfItemsPerPage + numberOfItemsPerPage
            )
            .map((row) => tableRow(row))}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(orders.length / numberOfItemsPerPage)}
            onPageChange={(page) => setPage(page)}
            label={`${from + 1}-${to} of ${orders.length}`}
            showFastPaginationControls
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={numberOfItemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            selectPageDropdownLabel={"Rows per page"}
          />
        </DataTable>
      ) : (
        <Text style={styles.heading}>No orders found</Text>
      )}
    </ScrollView>
  );
};

export default Orders;

const styles = StyleSheet.create({
  heading: {
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "600",
  },
  btnMargin: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});
