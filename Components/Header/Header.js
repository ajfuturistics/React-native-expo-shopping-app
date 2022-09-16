import { StyleSheet, View } from "react-native";
import { Appbar } from "react-native-paper";
import React from "react";
import { Menu, Divider } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Toast from "react-native-toast-message";

const Header = ({ navigation, title }) => {
  const [visible, setVisible] = React.useState(false);

  const { user } = useSelector((state) => state.user);

  const route = useRoute();

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const logoutUser = () => {
    console.log("Logout");
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        // alert("Logged out sucessfully");
        Toast.show({
          type: "success",
          text1: "Logged out sucessfully",
        });
      })
      .catch((error) => {
        // An error happened.
        // alert(error.message);
        Toast.show({
          type: "error",
          text1: error.message,
        });
      });
    closeMenu();
  };

  const goToDashboard = () => {
    navigation.push("Dashboard");
    closeMenu();
  };

  return (
    <Appbar.Header style={styles.appbarStyle}>
      <Appbar.Content
        style={{
          fontWeight: "600",
          alignItems: "center",
        }}
        title={title || route.name}
      />

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon="dots-vertical" onPress={openMenu} />}
      >
        {user && user?.isAdmin === true && route.name !== "Dashboard" && (
          <Menu.Item
            leadingIcon="view-dashboard"
            onPress={goToDashboard}
            title="Dashboard"
          />
        )}

        <Menu.Item leadingIcon="logout" onPress={logoutUser} title="Logout" />
      </Menu>
    </Appbar.Header>
  );
};

export default Header;

const styles = StyleSheet.create({});
