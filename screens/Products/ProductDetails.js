import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import {
  getProduct,
  loadingFinish,
  loadingStart,
} from "../../redux/Products/productsSlice";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { db } from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Loader from "../../Components/Loader/Loader";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { addUser } from "../../redux/User/UserSlice";

const ProductDetails = ({ navigation }) => {
  const { prodId } = useRoute().params;
  const { product, loading } = useSelector((state) => state.products);
  const { user, authId } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const getProductById = async (id) => {
    if (id) {
      try {
        dispatch(loadingStart());
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        // console.log(docSnap);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());

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

  const calculateDiscount = (price, discount) => {
    const discountAmount = (discount * price) / 100;

    const finalPrice = Math.round(price - discountAmount).toFixed(2);
    return finalPrice;
  };

  const addToCart = async (item) => {
    console.log("added to cart");
    console.log(item);

    try {
      if (item.stock === 0) {
        return Toast.show({
          type: "error",
          text1: "Currently out of stock",
        });
      }
      const cartItem = {
        ...item,
        quantity: 1,
      };
      delete cartItem.stock;
      const isItemAlreadyAdded = user?.cartItems?.some(
        (element) => element.id === item.id
      );
      const docRef = doc(db, "users", user.userId);

      let message = "Item added to cart";

      if (isItemAlreadyAdded) {
        message = "Item removed from cart";
        await setDoc(
          docRef,
          {
            cartItems:
              user?.cartItems?.filter(
                (element) => element.id !== cartItem.id
              ) || [],
          },
          { merge: true }
        );
      } else {
        message = "Item added to cart";
        await setDoc(
          docRef,
          {
            cartItems: [...user?.cartItems, cartItem],
          },
          { merge: true }
        );
      }

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));

      Toast.show({
        type: "success",
        text1: message,
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };
  const buyNow = async (item) => {
    console.log("added to cart");
    console.log(item);

    try {
      const cartItem = {
        ...item,
        quantity: 1,
      };
      delete cartItem.stock;

      const isItemAlreadyAdded = user?.cartItems?.some(
        (element) => element.id === item.id
      );
      const docRef = doc(db, "users", user.userId);

      let message = "Item added to cart";

      if (isItemAlreadyAdded) {
        message = "Item already added to cart";
      } else {
        message = "Item added to cart";
        await setDoc(
          docRef,
          {
            cartItems: [...user?.cartItems, cartItem],
          },
          { merge: true }
        );
      }

      const newDocRef = doc(db, "users", authId);
      const newDocSnap = await getDoc(newDocRef);
      console.log("Document updated: ", newDocSnap.data());
      dispatch(addUser(newDocSnap.data()));

      Toast.show({
        type: "success",
        text1: message,
      });
      navigation.navigate("Cart");
    } catch (error) {
      console.log(error);
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
    <View>
      {product ? (
        <Card>
          <Card.Cover source={{ uri: product?.imgUrl }} />
          <Card.Content>
            <Title>{product?.productName}</Title>
          </Card.Content>
          {product?.discount > 0 ? (
            <View style={styles.rowContainer}>
              <View style={styles.row}>
                <Text variant="displaySmall" style={styles.oldPrice}>
                  ₹{product?.price}
                </Text>
                <Text variant="displaySmall" style={styles.newPrice}>
                  ₹{calculateDiscount(product?.price, product?.discount)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text variant="displaySmall" style={styles.labelcolor}>
                  {product?.discount}% Off
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.rowContainer}>
              <View style={styles.row}>
                <Text variant="displaySmall" style={styles.newPrice}>
                  ₹{product?.price}
                </Text>
              </View>
            </View>
          )}

          <View
            style={[styles.rowContainer, { justifyContent: "space-around" }]}
          >
            <Button
              mode="contained-tonal"
              style={{ margin: 5, borderRadius: 3, fontSize: 15, width: "45%" }}
              onPress={() => buyNow(product)}
            >
              Buy
            </Button>
            <Button
              mode="contained-tonal"
              style={{ margin: 5, borderRadius: 3, fontSize: 15, width: "45%" }}
              onPress={() => addToCart(product)}
            >
              {user?.cartItems?.some((element) => element.id === product.id)
                ? "Remove"
                : "Add to Cart"}
            </Button>
          </View>

          <Card.Content>
            <Paragraph variant="titleSmall">
              Stock: {product?.stock === 0 ? "Out of stock" : product?.stock}
            </Paragraph>
            <Paragraph variant="titleSmall">{product?.description}</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <Text
          variant="headlineMedium"
          style={{
            margin: 10,
            textAlign: "center",
          }}
        >
          Failed to load product
        </Text>
      )}
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 15,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  oldPrice: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    fontSize: 16,
  },
  newPrice: {
    marginHorizontal: 10,
    fontSize: 20,
    fontWeight: "500",
  },
  labelcolor: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "pink",
    fontWeight: "500",
  },
});
