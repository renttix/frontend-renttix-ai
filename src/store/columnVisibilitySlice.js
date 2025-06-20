// store/columnVisibilitySlice.js
import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  tables: {}, // Store visibility settings for multiple tables
};

const columnVisibilitySlice = createSlice({
  name: "columnVisibility",
  initialState,
  reducers: {
    toggleColumnVisibility: (state, action) => {
      const { tableName, column } = action.payload;

      if (!state.tables[tableName]) {
        state.tables[tableName] = {}; // Ensure table entry exists
      }

      // If column visibility is undefined, set it to true before toggling
      if (state.tables[tableName][column] === undefined) {
        state.tables[tableName][column] = true;
      }

      state.tables[tableName][column] = !state.tables[tableName][column]; // Toggle visibility
    },
    setDefaultColumns: (state, action) => {
      const { tableName, columns } = action.payload;
      if (!Array.isArray(columns)) return; // Ensure columns is an array

      if (!state.tables[tableName]) {
        state.tables[tableName] = columns.reduce((acc, col) => {
          acc[col] = true; // Set default visibility to true
          return acc;
        }, {});
      } else {
        // Ensure all default columns exist in the state
        columns.forEach((col) => {
          if (state.tables[tableName][col] === undefined) {
            state.tables[tableName][col] = true;
          }
        });
      }
    },
    resetColumns: (state, action) => {
      const { tableName, columns } = action.payload;
      if (!Array.isArray(columns)) return; // Ensure columns is an array

      state.tables[tableName] = columns.reduce((acc, col) => {
        acc[col] = true;
        return acc;
      }, {});
    },
  },
});

export const { toggleColumnVisibility, setDefaultColumns, resetColumns } = columnVisibilitySlice.actions;

const persistConfig = {
  key: "columnVisibility",
  storage,

};

export default persistReducer(persistConfig, columnVisibilitySlice.reducer);
