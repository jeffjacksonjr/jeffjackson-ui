// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  expiresAt: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.expiresAt = action.payload.expiresAt;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(action.payload, {
        duration: 2000, // 2 seconds
      });
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.expiresAt = null;
      toast.success('Logged out successfully', {
        duration: 2000, // 2 seconds
      });
    },
    checkAuth: (state) => {
      if (state.token && state.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(state.expiresAt);
        
        if (expiresAt > now) {
          state.isAuthenticated = true;
        } else {
          // Token expired
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          state.expiresAt = null;
          toast.error('Session expired. Please login again', {
            duration:  2000, // 2 seconds
          });
        }
      } else {
        state.isAuthenticated = false;
      }
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;