import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import planReducer from './planSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['currentPlan', 'plans'],
};

const persistedReducer = persistReducer(persistConfig, planReducer);

export const store = configureStore({
  reducer: {
    plan: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;