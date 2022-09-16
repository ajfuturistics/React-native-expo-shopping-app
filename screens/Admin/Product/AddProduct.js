import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  View,
} from "react-native";
import React, { useState } from "react";
import { TextInput, Button } from "react-native-paper";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { addDoc, collection, doc, setDoc } from "firebase/firestore/lite";
import { db, storage } from "../../../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import DropDown from "react-native-paper-dropdown";

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productData, setProductData] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    discount: "",
    shippingCost: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false);
  const [category, setCategory] = useState("");

  const { categories } = useSelector((state) => state.products);

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
    if (!image) {
      return Toast.show({
        type: "error",
        text1: "select product image",
      });
    }

    setLoading(true);

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
      const docRef = await addDoc(collection(db, "products"), data);
      const productRef = doc(db, "products", docRef.id);

      // const response = await fetch(image);
      // const blob = response.blob();
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", image, true);
        xhr.send(null);
      });

      const storageRef = ref(storage, `products/${docRef.id}.jpg`);

      var metadata = {
        contentType: "image/jpeg",
      };

      await uploadBytes(storageRef, blob, metadata).then((snapshot) => {
        console.log("Uploaded a blob or file!");
      });

      const imgUrl = await getDownloadURL(storageRef).then((url) => url);

      await setDoc(
        productRef,
        { id: docRef.id, imgUrl: imgUrl },
        { merge: true }
      );
      setLoading(false);
      setProductData({
        productName: "",
        description: "",
        price: "",
        stock: "",
        discount: "",
        shippingCost: "",
      });
      setCategory("");
      setImage(null);
      Toast.show({
        type: "success",
        text1: "Product added successfully!",
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };
  return (
    <ScrollView>
      <KeyboardAvoidingView>
        <Text style={styles.heading}>Add Product</Text>

        <Button onPress={pickImage}>Pick Image</Button>
        {image && (
          <View
            style={{
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: image }}
              style={{ width: 200, height: 200 }}
            />
          </View>
        )}
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
          loading={loading}
          disabled={loading}
          mode="contained"
          style={styles.btnMargin}
          onPress={submitData}
        >
          {loading ? "Loading..." : "Add New Product"}
        </Button>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default AddProduct;

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
