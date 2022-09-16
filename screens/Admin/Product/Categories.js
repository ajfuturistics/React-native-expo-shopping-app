import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import {
  TextInput,
  Button,
  DataTable,
  IconButton,
  MD3Colors,
} from "react-native-paper";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import Toast from "react-native-toast-message";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore/lite";
import { db, storage } from "../../../firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import {
  getCategories,
  loadingFinish,
  loadingStart,
} from "../../../redux/Products/productsSlice";
import Loader from "../../../Components/Loader/Loader";

const numberOfItemsPerPageList = [5, 6, 7, 8, 9];
const Categories = () => {
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const { categories, loading: load } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [numberOfItemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const from = page * numberOfItemsPerPage;
  const to = Math.min((page + 1) * numberOfItemsPerPage, categories?.length);

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

  const deleteCategory = async (id) => {
    console.log("category", id);
    try {
      // deleting image from firebase storage
      const imageRef = ref(storage, `categories/${id}.jpg`);
      await deleteObject(imageRef);
      // deleting doc from firestore
      await deleteDoc(doc(db, "categories", id));

      await getAllCategories();

      Toast.show({
        type: "success",
        text1: "Category deleted successfully",
      });
    } catch (error) {
      setDeleting(false);
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  useEffect(() => {
    setPage(0);
    getAllCategories();
  }, [numberOfItemsPerPage]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const submitData = async () => {
    if (category === "") {
      return Toast.show({
        type: "error",
        text1: "Enter category name",
      });
    }
    if (!image) {
      return Toast.show({
        type: "error",
        text1: "select category image",
      });
    }

    setLoading(true);

    const data = {
      category: category,
    };
    console.log(data);

    try {
      const docRef = await addDoc(collection(db, "categories"), data);
      const categoryRef = doc(db, "categories", docRef.id);

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

      const storageRef = ref(storage, `categories/${docRef.id}.jpg`);

      var metadata = {
        contentType: "image/jpeg",
      };

      await uploadBytes(storageRef, blob, metadata).then((snapshot) => {
        console.log("Uploaded a blob or file!");
      });

      const imgUrl = await getDownloadURL(storageRef).then((url) => url);

      await setDoc(
        categoryRef,
        { id: docRef.id, imgUrl: imgUrl },
        { merge: true }
      );
      setLoading(false);
      setImage(null);
      setCategory("");
      Toast.show({
        type: "success",
        text1: "Category added successfully!",
      });
      await getAllCategories();
    } catch (error) {
      console.log(error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  };

  const tableRow = (item) => (
    <DataTable.Row key={item.id}>
      <DataTable.Cell style={{ flex: 3 }}>{item.category}</DataTable.Cell>
      <DataTable.Cell>
        <IconButton
          icon="delete"
          iconColor={MD3Colors.error50}
          size={20}
          onPress={() => deleteCategory(item.id)}
        />
      </DataTable.Cell>
    </DataTable.Row>
  );

  if (load) {
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
        <Text style={styles.heading}>Add Category</Text>

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
          label="Category"
          style={styles.inputs}
          mode="outlined"
          value={category}
          onChangeText={(text) => setCategory(text)}
        />
        <Button
          loading={loading}
          disabled={loading}
          mode="contained"
          style={styles.btnMargin}
          onPress={submitData}
        >
          {loading ? "Loading..." : "Add New Category"}
        </Button>

        {categories && categories?.length > 0 ? (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 3 }}>Category</DataTable.Title>
              <DataTable.Title>Action</DataTable.Title>
            </DataTable.Header>

            {categories
              ?.slice(
                page * numberOfItemsPerPage,
                page * numberOfItemsPerPage + numberOfItemsPerPage
              )
              .map((row) => tableRow(row))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(
                categories.length / numberOfItemsPerPage
              )}
              onPageChange={(page) => setPage(page)}
              label={`${from + 1}-${to} of ${categories.length}`}
              showFastPaginationControls
              numberOfItemsPerPageList={numberOfItemsPerPageList}
              numberOfItemsPerPage={numberOfItemsPerPage}
              onItemsPerPageChange={onItemsPerPageChange}
              selectPageDropdownLabel={"Rows per page"}
            />
          </DataTable>
        ) : (
          <Text style={styles.heading}>No categories found</Text>
        )}
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default Categories;

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
