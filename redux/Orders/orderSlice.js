import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    loading: false,
    orders: null,
    order: null,
  },
  reducers: {
    loadStart(state) {
      state.loading = true;
    },
    loadFinish(state) {
      state.loading = false;
    },
    getOrders(state, action) {
      state.loading = false;
      state.orders = action.payload;
    },
    getOrder(state, action) {
      state.loading = false;
      state.order = action.payload;
    },
  },
});

export const { loadStart, loadFinish, getOrders, getOrder } =
  orderSlice.actions;
export default orderSlice.reducer;
