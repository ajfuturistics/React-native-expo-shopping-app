import { ScrollView, StyleSheet, View } from "react-native";
import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Text,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore/lite";
import { getProducts } from "../../redux/Products/productsSlice";
import Toast from "react-native-toast-message";
import Loader from "../../Components/Loader/Loader";
import { addUser } from "../../redux/User/UserSlice";

const ProductsByCat = ({ navigation }) => {
  const { category } = useRoute().params;
  const [loading, setLoading] = useState(false);

  const { products } = useSelector((state) => state.products);
  const { user, authId } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const getProductsByCategory = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "products"),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        tempArr.push(doc.data());
      });
      dispatch(getProducts(tempArr));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const calculateDiscount = (price, discount) => {
    const discountAmount = (discount * price) / 100;

    const finalPrice = Math.round(price - discountAmount).toFixed(2);
    return finalPrice;
  };

  const addToSaved = async (item) => {
    console.log("added to saved");
    console.log(item);

    try {
      const isItemAlreadySaved = user?.savedItems?.some(
        (element) => element.id === item.id
      );
      const docRef = doc(db, "users", user.userId);

      let message = "Item added to saved";

      if (isItemAlreadySaved) {
        message = "Item removed from saved";
        await setDoc(
          docRef,
          {
            savedItems:
              user?.savedItems?.filter((element) => element.id !== item.id) ||
              [],
          },
          { merge: true }
        );
      } else {
        message = "Item added to saved";
        await setDoc(
          docRef,
          {
            savedItems: [...user?.savedItems, item],
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

  useEffect(() => {
    getProductsByCategory();
  }, [category]);

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
    <ScrollView style={{ marginBottom: 70 }}>
      {products && products?.length === 0 ? (
        <Text
          variant="headlineMedium"
          style={{
            margin: 10,
            textAlign: "center",
          }}
        >
          No products found
        </Text>
      ) : (
        <ScrollView
          style={styles.productCards}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingLeft: 10,
            paddingRight: 10,
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            flex: 1,
            flexBasis: 2,
          }}
        >
          {products &&
            products?.map((prod) => (
              <Card
                key={prod.id}
                style={{ margin: 10, position: "relative", width: 150 }}
                elevation={2}
              >
                <Card.Cover
                  style={{
                    width: 140,
                    height: 100,
                    alignSelf: "center",
                  }}
                  source={{ uri: prod?.imgUrl }}
                />
                {/* <Card.Title
                    style={styles.cardTitle}
                    title={prod.productName}
                  /> */}
                <Card.Content>
                  <Title style={{ fontWeight: "500", fontSize: 15 }}>
                    {prod?.productName}
                  </Title>
                  <Paragraph style={{ fontWeight: "400", fontSize: 13 }}>
                    ₹ {calculateDiscount(prod?.price, prod?.discount)}
                  </Paragraph>
                </Card.Content>

                <IconButton
                  icon={
                    user?.savedItems?.some((element) => element.id === prod.id)
                      ? "cards-heart"
                      : "cards-heart-outline"
                  }
                  iconColor={
                    user?.savedItems?.some((element) => element.id === prod.id)
                      ? "#f472b6"
                      : "#525252"
                  }
                  size={20}
                  onPress={() => addToSaved(prod)}
                  style={{
                    position: "absolute",
                    right: -5,
                    top: -5,
                    borderRadius: 20,
                    backgroundColor: "#ddd6fe",
                    elevation: 20,
                    shadowColor: "#52006A",
                  }}
                />

                <Button
                  mode="contained-tonal"
                  style={{ margin: 9, borderRadius: 3, fontSize: 15 }}
                  onPress={() =>
                    navigation.push("ProductDetails", {
                      prodId: prod.id,
                    })
                  }
                >
                  More Details
                </Button>
              </Card>
            ))}
        </ScrollView>
      )}
    </ScrollView>
  );
};

export default ProductsByCat;

const styles = StyleSheet.create({
  spacing: {
    marginVertical: 10,
    marginHorizontal: 12,
  },
  title: {
    fontWeight: "500",
    fontSize: 20,
    marginVertical: 12,
    marginHorizontal: 14,
  },
  productCards: {
    flexDirection: "row",
    flex: 1,
  },
  cardTitle: {
    marginHorizontal: 2,
    marginVertical: 2,
    fontWeight: "bold",
  },
});
