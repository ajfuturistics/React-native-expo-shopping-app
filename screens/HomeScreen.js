import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
} from "firebase/firestore/lite";
import { db } from "../firebase";
import { addUser } from "../redux/User/UserSlice";
import {
  TextInput,
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  IconButton,
} from "react-native-paper";
import Loader from "../Components/Loader/Loader";
import { getCategories, getTwoProduct } from "../redux/Products/productsSlice";
import Toast from "react-native-toast-message";

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(false);
  const dispatch = useDispatch();
  const { authId, user } = useSelector((state) => state.user);
  const { twoProds, categories } = useSelector((state) => state.products);
  console.log("Home", authId);

  const handleSearch = () => {
    if (search.trim() === "") {
      return Toast.show({
        type: "error",
        text1: "Enter product name to search",
      });
    }
    console.log("yey");
  };

  const fetchUser = async () => {
    if (authId) {
      try {
        setLoading(true);
        console.log("getting user...");
        const newDocRef = doc(db, "users", authId);
        const newDocSnap = await getDoc(newDocRef);
        console.log("Document written: ", newDocSnap.data());
        dispatch(addUser(newDocSnap.data()));
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        Toast.show({
          type: "error",
          text1: error.message,
        });
      }
    }
  };

  const getTwoProducts = async () => {
    try {
      setLoading(true);
      console.log("getting two products...");
      const docsRef = collection(db, "products");
      const q = query(docsRef, limit(2));
      const querySnapshot = await getDocs(q);
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        tempArr.push(doc.data());
      });
      dispatch(getTwoProduct(tempArr));
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

  const calculateDiscount = (price, discount) => {
    const discountAmount = (discount * price) / 100;

    const finalPrice = Math.round(price - discountAmount).toFixed(2);
    return finalPrice;
  };

  const getAllCategories = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "categories"));
      const tempArr = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.id);
        tempArr.push(doc.data());
      });

      // console.log("tempArr: ", tempArr);
      dispatch(getCategories(tempArr));
      console.log("categories", categories);
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

  const addToSaved = async (item) => {
    console.log("added to saved");
    console.log(user);

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
    fetchUser();
    getTwoProducts();
    getAllCategories();
  }, [authId]);

  return (
    <View>
      <TextInput
        style={styles.spacing}
        placeholder="Search products"
        mode="outlined"
        value={search}
        onChangeText={(text) => setSearch(text)}
        onSubmitEditing={handleSearch}
        left={<TextInput.Icon icon="magnify" />}
      />
      {loading ? (
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
      ) : (
        <ScrollView style={{ marginBottom: 70 }}>
          <Text style={styles.title}>Featured Products</Text>
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
            {twoProds &&
              twoProds?.map((prod) => (
                <Card
                  key={prod?.id}
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
                      user?.savedItems?.some(
                        (element) => element.id === prod.id
                      )
                        ? "cards-heart"
                        : "cards-heart-outline"
                    }
                    iconColor={
                      user?.savedItems?.some(
                        (element) => element.id === prod.id
                      )
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
          <Text style={styles.title}>Categories</Text>
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
            {categories &&
              categories?.map((cat) => (
                <Card
                  key={cat.id}
                  style={{ margin: 10, width: 140 }}
                  elevation={2}
                  onPress={() =>
                    navigation.push("ProductByCat", {
                      category: cat.category,
                      title: "Products",
                    })
                  }
                >
                  <Card.Cover
                    style={{
                      width: 140,
                      height: 160,
                      alignSelf: "center",
                    }}
                    source={{ uri: cat.imgUrl }}
                  />
                  <Card.Title titleVariant="titleMedium" title={cat.category} />
                </Card>
              ))}
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
};

export default HomeScreen;

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
