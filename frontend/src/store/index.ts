import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import planReducer from './planSlice';
import themeReducer from './themeSlice';

const planPersistConfig = {
  key: 'planbuddy-plan-storage',
  storage: AsyncStorage,
  whitelist: ['currentPlan', 'plans'],
  debug: true, // Enable debug logging
};

const themePersistConfig = {
  key: 'planbuddy-theme-storage',
  storage: AsyncStorage,
  whitelist: ['themeMode'],
  debug: true,
};

const persistedPlanReducer = persistReducer(planPersistConfig, planReducer);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

export const store = configureStore({
  reducer: {
    plan: persistedPlanReducer,
    theme: persistedThemeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredPaths: ['result', 'meta.arg', 'meta.baseQueryMeta'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;