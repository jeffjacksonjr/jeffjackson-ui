import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  backendStatus: 'checking', // 'checking', 'connected', 'disconnected'
  lastChecked: null,
};

export const systemStatusSlice = createSlice({
  name: 'systemStatus',
  initialState,
  reducers: {
    setChecking: (state) => {
      state.backendStatus = 'checking';
      state.lastChecked = new Date().toISOString();
    },
    setConnected: (state) => {
      state.backendStatus = 'connected';
      state.lastChecked = new Date().toISOString();
    },
    setDisconnected: (state) => {
      state.backendStatus = 'disconnected';
      state.lastChecked = new Date().toISOString();
    },
  },
});

export const { setChecking, setConnected, setDisconnected } = systemStatusSlice.actions;
export default systemStatusSlice.reducer;