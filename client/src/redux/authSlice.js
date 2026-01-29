import { createSlice } from '@reduxjs/toolkit';

// Helper to safely read user data
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    if (user === null || user === "undefined") return null;
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      // FIX: The backend sends the user data directly, not inside a .user property
      state.user = action.payload; 
      state.token = action.payload.token;
      
      localStorage.setItem('user', JSON.stringify(action.payload));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;