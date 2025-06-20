import { createSlice } from "@reduxjs/toolkit";

// Try to get initial state from localStorage if available
const getInitialSidebarState = () => {
  if (typeof window !== 'undefined') {
    try {
      const persistedState = localStorage.getItem('persist:root');
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        if (parsed.ui) {
          const uiState = JSON.parse(parsed.ui);
          return uiState.sidebarOpen ?? true;
        }
      }
    } catch (error) {
      console.error('Error reading persisted UI state:', error);
    }
  }
  return true; // Default to showing sidebar
};

const initialState = {
  sidebarOpen: getInitialSidebarState(),  // Initialize from persisted state or default to true
  sidebarCollapsed: false,  // for desktop mini-mode (default to expanded)
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleCollapsed,
  setSidebarCollapsed,
} = uiSlice.actions;

export default uiSlice.reducer;
