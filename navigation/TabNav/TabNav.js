import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../screens/HomeScreen";
import ProfileScreen from "../../screens/Profile/ProfileScreen";
import CartScreen from "../../screens/CartScreen";
import SavedScreen from "../../screens/SavedScreen";
import Header from "../../Components/Header/Header";
import Icon from "react-native-vector-icons/AntDesign";

const Tab = createBottomTabNavigator();

const TabNav = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ede9fe",
        },
        tabBarActiveTintColor: "#8b5cf6",
        // tabBarLabelStyle: {
        //   fontWeight: "600",
        // },

        tabBarActiveBackgroundColor: "#f5d0fe",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Shop Zone",
          tabBarLabel: "Home",
          headerStyle: {
            backgroundColor: "#ede9fe",
          },

          tabBarIcon: ({ color }) => (
            <Icon name="home" color={color} size={24} />
          ),
          header: ({ navigation }) => (
            <Header title="Shop Zone" navigation={navigation} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          headerStyle: {
            backgroundColor: "#ede9fe",
          },
          tabBarIcon: ({ color }) => (
            <Icon name="hearto" color={color} size={24} />
          ),
          header: ({ navigation }) => <Header navigation={navigation} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          headerStyle: {
            backgroundColor: "#ede9fe",
          },
          tabBarIcon: ({ color }) => (
            <Icon name="shoppingcart" color={color} size={24} />
          ),
          header: ({ navigation }) => <Header navigation={navigation} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerStyle: {
            backgroundColor: "#ede9fe",
          },
          tabBarIcon: ({ focused, color }) => (
            <Icon name="user" color={color} size={24} />
          ),
          header: ({ navigation }) => <Header navigation={navigation} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNav;
