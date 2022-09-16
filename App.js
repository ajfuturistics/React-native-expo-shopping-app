// import { StatusBar } from "expo-status-bar";
import { Provider as ReduxProvider } from "react-redux";
import { Provider as PaperProvider } from "react-native-paper";

import { store } from "./redux/store";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native";

import NavStack from "./navigation/NavStack/NavStack";
import Loader from "./Components/Loader/Loader";
import Toast from "react-native-toast-message";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 4000);

    // return clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <View style={styles.splash}>
        <Loader />
      </View>
    );
  }
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavStack />

        {/* for toast  */}
        <Toast position="bottom" />
      </PaperProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
});
