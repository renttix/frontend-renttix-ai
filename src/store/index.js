import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authSlice from "./authSlice";
import headerTitleSlice from "./headerTitleSlice";
import modalReducer from "./modalSlice";
import locationReducer from './locationSlice';
import deleteModalSlice from "./deleteModalSlice";
import columnVisibilityReducer from "./columnVisibilitySlice"; // Import column visibility reducer
import dirtyReducer from './dirtySlice';
import uiReducer from "./uiSlice";
import productFiltersReducer from "./productFiltersSlice";
import dashboardReducer from "./dashboardSlice";
import calendarReducer from "./slices/calendarSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authReducer", "columnVisibility", "location", "ui", "dashboard"], // Persist UI state to maintain sidebar preference
};

const rootReducer = combineReducers({
  authReducer: authSlice,
  headerTitle: headerTitleSlice,
  modal: modalReducer,
  location: locationReducer,
  delete: deleteModalSlice,
  columnVisibility: columnVisibilityReducer, // Persisted table columns
  dirty: dirtyReducer,
  ui: uiReducer,
  productFilters: productFiltersReducer,
  dashboard: dashboardReducer,
  calendar: calendarReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store); // Ensure persistor is exported
