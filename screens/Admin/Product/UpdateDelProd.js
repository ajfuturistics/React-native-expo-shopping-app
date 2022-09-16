import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { db, storage } from "../../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore/lite";
import { useDispatch, useSelector } from "react-redux";
import {
  getProduct,
  getProducts,
  loadingFinish,
  loadingStart,
} from "../../../redux/Products/productsSlice";
import Toast from "react-native-toast-message";
import Loader from "../../../Components/Loader/Loader";
import { TextInput, Button } from "react-native-paper";
import { deleteObject, ref } from "firebase/storage";
import DropDown from "react-native-paper-dropdown";

const UpdateDelProd = ({ navigation }) => {
  const { prodId } = useRoute().params;
  const { loading, categories } = useSelector((state) => state.products);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [category, setCategory] = useState("");
  const [productData, setProductData] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    discount: "",
    shippingCost: "",
  });
  const dispatch = useDispatch();

  console.log(prodId);

  const getProductById = async (id) => {
    if (id) {
      try {
        dispatch(loadingStart());
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        // console.log(docSnap);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());

          setProductData({
            productName: docSnap.data().productName,
            description: docSnap.data().description,
            price: docSnap.data().price.toString(),
            stock: docSnap.data().stock.toString(),
            discount: docSnap.data().discount.toString(),
            shippingCost: docSnap.data().shippingCost.toString(),
          });
          setCategory(docSnap.data().category);

          dispatch(getProduct(docSnap.data()));
          dispatch(loadingFinish());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
          dispatch(loadingFinish());
        }
      } catch (error) {
        console.log(error);
        dispatch(loadingFinish());
        Toast.show({
          type: "error",
          text1: error.message,
        });
      }
    }
  };

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

  const deleteProduct = async () => {
    console.log(prodId);
    try {
      setDeleting(true);

      // deleting image from firebase storage
      const imageRef = ref(storage, `products/${prodId}.jpg`);
      await deleteObject(imageRef);

      // deleting doc from firestore
      await deleteDoc(doc(db, "products", prodId));

      Toast.show({
        type: "success",
        text1: "Product deleted successfully",
      });
      getAllProducts();

      navigation.goBack();
    } catch (error) {
      setDeleting(false);
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const submitData = async () => {
    const { productName, description, price, stock, discount, shippingCost } =
      productData;

    if (
      productName === "" ||
      description === "" ||
      price === "" ||
      stock === "" ||
      discount === "" ||
      shippingCost === "" ||
      category === ""
    ) {
      return Toast.show({
        type: "error",
        text1: "Enter all details",
      });
    }

    setUpdating(true);

    const data = {
      ...productData,
      price: parseInt(price),
      stock: parseInt(stock),
      discount: parseInt(discount),
      shippingCost: parseInt(shippingCost),
      category: category,
    };
    console.log(data);

    try {
      const productRef = doc(db, "products", prodId);

      await setDoc(productRef, { ...data }, { merge: true });
      setUpdating(false);
      getAllProducts();
      Toast.show({
        type: "success",
        text1: "Product updated successfully!",
      });
    } catch (error) {
      console.log(error);
      setUpdating(false);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    getProductById(prodId);
  }, [prodId]);

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
      <KeyboardAvoidingView>
        <Text style={styles.heading}>Add Product</Text>
        <Button
          mode="contained"
          disabled={deleting}
          loading={deleting}
          style={styles.btnMargin}
          onPress={deleteProduct}
        >
          {deleting ? "Loading..." : "Delete Product"}
        </Button>
        <Text style={styles.heading}>Update Product</Text>

        <TextInput
          label="Product Name"
          style={styles.inputs}
          mode="outlined"
          value={productData.productName}
          onChangeText={(text) =>
            setProductData((prev) => ({ ...prev, productName: text }))
          }
        />
        <TextInput
          label="Product Description"
          style={styles.inputs}
          mode="outlined"
          value={productData.description}
          onChangeText={(text) =>
            setProductData((prev) => ({ ...prev, description: text }))
          }
        />
        <View style={styles.inputs}>
          <DropDown
            label={"Category"}
            mode={"outlined"}
            visible={showDropDown}
            showDropDown={() => setShowDropDown(true)}
            onDismiss={() => setShowDropDown(false)}
            value={category}
            setValue={setCategory}
            list={
              (categories &&
                categories?.map((cat) => ({
                  id: cat.id,
                  label: cat.category,
                  value: cat.category,
                }))) || [{ label: "No Categories Found", value: "" }]
            }
          />
        </View>
        <TextInput
          label="Product Price"
          style={styles.inputs}
          mode="outlined"
          keyboardType="numeric"
          value={productData.price}
          onChangeText={(text) =>
            setProductData((prev) => ({
              ...prev,
              price: text.replace(/[^0-9]/g, ""),
            }))
          }
        />
        <TextInput
          label="Product Stock"
          style={styles.inputs}
          mode="outlined"
          keyboardType="numeric"
          value={productData.stock}
          onChangeText={(text) =>
            setProductData((prev) => ({
              ...prev,
              stock: text.replace(/[^0-9]/g, ""),
            }))
          }
        />
        <TextInput
          label="Product Discount"
          style={styles.inputs}
          mode="outlined"
          keyboardType="numeric"
          value={productData.discount}
          onChangeText={(text) =>
            setProductData((prev) => ({
              ...prev,
              discount: text.replace(/[^0-9]/g, ""),
            }))
          }
        />
        <TextInput
          label="Product Shipping Cost"
          style={styles.inputs}
          mode="outlined"
          keyboardType="numeric"
          value={productData.shippingCost}
          onChangeText={(text) =>
            setProductData((prev) => ({
              ...prev,
              shippingCost: text.replace(/[^0-9]/g, ""),
            }))
          }
        />
        <Button
          loading={updating}
          disabled={updating}
          mode="contained"
          style={styles.btnMargin}
          onPress={submitData}
        >
          {updating ? "Loading..." : "Update Product"}
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default UpdateDelProd;

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
