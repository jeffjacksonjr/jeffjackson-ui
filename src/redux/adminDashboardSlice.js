// src/redux/adminDashboardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedTab: 0
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    setSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    }
  }
});

export const { setSelectedTab } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;