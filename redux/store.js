import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./User/UserSlice";
import productsReducer from "./Products/productsSlice";
import orderReducer from "./Orders/orderSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
    order: orderReducer,
  },
});
