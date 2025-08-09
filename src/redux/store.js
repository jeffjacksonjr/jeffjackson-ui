// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import systemStatusReducer from './systemStatusSlice';
import authReducer from './authSlice';
import adminDashboardReducer from './adminDashboardSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'user', 'expiresAt']
};

const adminDashboardPersistConfig = {
  key: 'adminDashboard',
  storage,
  whitelist: ['selectedTab']
};

const rootReducer = {
  systemStatus: systemStatusReducer,
  auth: persistReducer(authPersistConfig, authReducer),
  adminDashboard: persistReducer(adminDashboardPersistConfig, adminDashboardReducer)
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);