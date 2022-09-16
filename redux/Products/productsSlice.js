import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
  name: "products",
  initialState: {
    loading: false,
    products: null,
    product: null,
    twoProds: null,
    categories: null,
  },
  reducers: {
    loadingStart(state) {
      state.loading = true;
    },
    loadingFinish(state) {
      state.loading = false;
    },
    getProducts(state, action) {
      state.loading = false;
      state.products = action.payload;
    },
    getProduct(state, action) {
      state.loading = false;
      state.product = action.payload;
    },
    getTwoProduct(state, action) {
      state.loading = false;
      state.twoProds = action.payload;
    },
    getCategories(state, action) {
      state.loading = false;
      state.categories = action.payload;
    },
  },
});

export const {
  loadingStart,
  loadingFinish,
  getProducts,
  getProduct,
  getTwoProduct,
  getCategories,
} = productsSlice.actions;
export default productsSlice.reducer;
