import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { DataTable, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "../../../firebase";
import {
  getCategories,
  getProducts,
  loadingFinish,
  loadingStart,
} from "../../../redux/Products/productsSlice";
import Loader from "../../../Components/Loader/Loader";

const numberOfItemsPerPageList = [5, 6, 7, 8, 9];

const Products = ({ navigation }) => {
  const { products, loading } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const from = page * numberOfItemsPerPage;
  const to = Math.min((page + 1) * numberOfItemsPerPage, products?.length);

  const getAllProducts = async () => {
    try {
      dispatch(loadingStart());
      const querySnapshot = await getDocs(collection(db, "products"));
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        tempArr.push(doc.data());
      });

      console.log("tempArr: ", tempArr);
      dispatch(getProducts(tempArr));
      dispatch(loadingFinish());
    } catch (error) {
      console.log(error);
      dispatch(loadingFinish());
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const getAllCategories = async () => {
    try {
      dispatch(loadingStart());
      const querySnapshot = await getDocs(collection(db, "categories"));
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        tempArr.push(doc.data());
      });

      console.log("tempArr: ", tempArr);
      dispatch(getCategories(tempArr));
      dispatch(loadingFinish());
    } catch (error) {
      console.log(error);
      dispatch(loadingFinish());
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    setPage(0);
    getAllProducts();
    getAllCategories();
  }, [numberOfItemsPerPage]);

  const tableRow = (item) => (
    <DataTable.Row
      key={item.id}
      onPress={() =>
        navigation.push("UpdateDelProd", {
          prodId: item.id,
        })
      }
    >
      <DataTable.Cell>{item.productName}</DataTable.Cell>
      <DataTable.Cell numeric>{item.stock}</DataTable.Cell>
      <DataTable.Cell numeric>{item.discount}</DataTable.Cell>
      <DataTable.Cell numeric>{item.price}</DataTable.Cell>
      <DataTable.Cell numeric>{item.shippingCost}</DataTable.Cell>
    </DataTable.Row>
  );

  const goToAddProduct = () => {
    console.log("Pressed");
    navigation.push("AddProduct");
  };

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
      <Text style={styles.heading}>Add Product</Text>
      <Button
        mode="contained"
        style={styles.btnMargin}
        onPress={goToAddProduct}
      >
        Add New Product
      </Button>
      <Text style={styles.heading}>All Products</Text>
      {products && products?.length > 0 ? (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Stock</DataTable.Title>
            <DataTable.Title numeric>Discount</DataTable.Title>
            <DataTable.Title numeric>Price</DataTable.Title>
            <DataTable.Title numeric>Shipping</DataTable.Title>
          </DataTable.Header>

          {products
            ?.slice(
              page * numberOfItemsPerPage,
              page * numberOfItemsPerPage + numberOfItemsPerPage
            )
            .map((row) => tableRow(row))}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(products.length / numberOfItemsPerPage)}
            onPageChange={(page) => setPage(page)}
            label={`${from + 1}-${to} of ${products.length}`}
            showFastPaginationControls
            numberOfItemsPerPageList={numberOfItemsPerPageList}
            numberOfItemsPerPage={numberOfItemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}
            selectPageDropdownLabel={"Rows per page"}
          />
        </DataTable>
      ) : (
        <Text style={styles.heading}>No products found</Text>
      )}
    </ScrollView>
  );
};

export default Products;

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
