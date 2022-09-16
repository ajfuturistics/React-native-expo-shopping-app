import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Header from "../../Components/Header/Header";
import Icon from "react-native-vector-icons/AntDesign";
import DashboardScreen from "../../screens/Admin/DashboardScreen";
import Products from "../../screens/Admin/Product/Products";
import Categories from "../../screens/Admin/Product/Categories";
import Orders from "../../screens/Admin/Order/Orders";

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
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
      {/* <Tab.Screen
        name="AdminHome"
        component={DashboardScreen}
        options={{
          title: "Admin Dashboard",
          tabBarLabel: "Admin",
          headerStyle: {
            backgroundColor: "#ede9fe",
          },

          tabBarIcon: ({ color }) => (
            <Icon name="isv" color={color} size={24} />
          ),
          header: ({ navigation }) => (
            <Header title="Admin Dashboard" navigation={navigation} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="AdminProd"
        component={Products}
        options={{
          title: "Manage Products",
          tabBarLabel: "Products",
          headerStyle: {
            backgroundColor: "#ede9fe",
          },

          tabBarIcon: ({ color }) => (
            <Icon name="appstore-o" color={color} size={24} />
          ),
          header: ({ navigation }) => (
            <Header title="Manage Products" navigation={navigation} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminCat"
        component={Categories}
        options={{
          title: "Manage Category",
          tabBarLabel: "Category",
          headerStyle: {
            backgroundColor: "#ede9fe",
          },

          tabBarIcon: ({ color }) => (
            <Icon name="profile" color={color} size={24} />
          ),
          header: ({ navigation }) => (
            <Header title="Manage Category" navigation={navigation} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminOrder"
        component={Orders}
        options={{
          title: "Manage Orders",
          tabBarLabel: "Orders",
          headerStyle: {
            backgroundColor: "#ede9fe",
          },

          tabBarIcon: ({ color }) => (
            <Icon name="database" color={color} size={24} />
          ),
          header: ({ navigation }) => (
            <Header title="Manage Orders" navigation={navigation} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
