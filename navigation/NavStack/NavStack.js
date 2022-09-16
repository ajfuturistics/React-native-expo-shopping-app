import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import LoginScreen from "../../screens/LoginScreen";
import SignupScreen from "../../screens/SignupScreen";
import { useAuth } from "../../utils/useAuth";
import { useSelector } from "react-redux";
import TabNav from "../TabNav/TabNav";
import AdminTabs from "../TabNav/AdminTabs";
import AddProduct from "../../screens/Admin/Product/AddProduct";
import UpdateDelProd from "../../screens/Admin/Product/UpdateDelProd";
import UpdateProfileScreen from "../../screens/Profile/UpdateProfileScreen";
import MyOrdersScreen from "../../screens/Profile/MyOrdersScreen";
import AddAddressScreen from "../../screens/Profile/AddAddressScreen";
import ProductsByCat from "../../screens/Products/ProductsByCat";
import ProductDetails from "../../screens/Products/ProductDetails";
import CheckoutScreen from "../../screens/Checkout/CheckoutScreen";
import MyOrderDetails from "../../screens/Profile/MyOrderDetails";
import OrderDetail from "../../screens/Admin/Order/OrderDetail";

const Stack = createNativeStackNavigator();

const NavStack = () => {
  const { user } = useAuth();
  console.log("nav stack: ", user?.uid);

  const { isLoggedIn, authId } = useSelector((state) => state.user);

  console.log("authId: ", authId);
  console.log("isLoggedIn: ", isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn && !authId ? (
          <>
            <Stack.Screen
              options={{ headerShown: false }}
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Signup"
              component={SignupScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              options={{ headerShown: false }}
              name="TabNav"
              component={TabNav}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Dashboard"
              component={AdminTabs}
            />
            <Stack.Screen name="AddProduct" component={AddProduct} />
            <Stack.Screen name="UpdateDelProd" component={UpdateDelProd} />
            <Stack.Screen
              name="UpdateProfile"
              options={{ title: "Update Profile" }}
              component={UpdateProfileScreen}
            />
            <Stack.Screen
              name="OrderDetail"
              options={{ title: "Order Detail" }}
              component={OrderDetail}
            />
            <Stack.Screen
              name="MyOrders"
              options={{ title: "My Orders" }}
              component={MyOrdersScreen}
            />
            <Stack.Screen
              name="MyOrdersDetails"
              options={{ title: "Order Details" }}
              component={MyOrderDetails}
            />
            <Stack.Screen
              name="AddAddress"
              options={{ title: "Add Address" }}
              component={AddAddressScreen}
            />
            <Stack.Screen
              name="ProductByCat"
              options={{ title: "Products" }}
              component={ProductsByCat}
            />
            <Stack.Screen
              name="ProductDetails"
              options={{ title: "Product Details" }}
              component={ProductDetails}
            />
            <Stack.Screen
              name="Checkout"
              options={{ title: "Checkout" }}
              component={CheckoutScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default NavStack;
