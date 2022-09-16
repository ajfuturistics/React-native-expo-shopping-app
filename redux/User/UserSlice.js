import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false,
    user: null,
    authId: null,
  },
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.user = action.payload.user;
      state.authId = action.payload.authId;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.authId = null;
      state.user = null;
    },
    addUser(state, action) {
      state.user = action.payload;
    },
  },
});

export const { login, logout, addUser } = userSlice.actions;
export default userSlice.reducer;
