import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLayout: null,
  layouts: [],
  draggedWidget: null,
  dropTarget: null,
  isLoading: false,
  error: null,
  hasUnsavedChanges: false
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Layout management
    setLayout: (state, action) => {
      const layouts = action.payload;
      state.layouts = layouts;
      // Set current layout to the default one or the first one
      const defaultLayout = layouts.find(l => l.isDefault) || layouts[0];
      if (defaultLayout) {
        state.currentLayout = defaultLayout;
      }
    },
    
    setCurrentLayout: (state, action) => {
      state.currentLayout = action.payload;
      state.hasUnsavedChanges = false;
    },
    
    updateCurrentLayout: (state, action) => {
      state.currentLayout = {
        ...state.currentLayout,
        ...action.payload
      };
      state.hasUnsavedChanges = true;
    },
    
    // Widget position management
    updateWidgetPosition: (state, action) => {
      const { widgetId, position } = action.payload;
      if (state.currentLayout && state.currentLayout.widgets[widgetId]) {
        state.currentLayout.widgets[widgetId].position = position;
        state.hasUnsavedChanges = true;
      }
    },
    
    // Widget visibility management
    updateWidgetVisibility: (state, action) => {
      const { widgetId } = action.payload;
      if (state.currentLayout && state.currentLayout.widgets[widgetId]) {
        state.currentLayout.widgets[widgetId].visible = 
          !state.currentLayout.widgets[widgetId].visible;
        state.hasUnsavedChanges = true;
      }
    },
    
    // Widget collapsed state management
    updateWidgetCollapsed: (state, action) => {
      const { widgetId } = action.payload;
      if (state.currentLayout && state.currentLayout.widgets[widgetId]) {
        state.currentLayout.widgets[widgetId].collapsed = 
          !state.currentLayout.widgets[widgetId].collapsed;
        state.hasUnsavedChanges = true;
      }
    },
    
    // Batch update widgets
    updateWidgets: (state, action) => {
      if (state.currentLayout) {
        state.currentLayout.widgets = action.payload;
        state.hasUnsavedChanges = true;
      }
    },
    
    // Drag and drop state
    setDraggedWidget: (state, action) => {
      state.draggedWidget = action.payload;
    },
    
    setDropTarget: (state, action) => {
      state.dropTarget = action.payload;
    },
    
    resetDragState: (state) => {
      state.draggedWidget = null;
      state.dropTarget = null;
    },
    
    // Loading and error states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Reset unsaved changes
    resetUnsavedChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
    
    // Clear all state
    clearDashboardState: (state) => {
      return initialState;
    }
  }
});

export const {
  setLayout,
  setCurrentLayout,
  updateCurrentLayout,
  updateWidgetPosition,
  updateWidgetVisibility,
  updateWidgetCollapsed,
  updateWidgets,
  setDraggedWidget,
  setDropTarget,
  resetDragState,
  setLoading,
  setError,
  resetUnsavedChanges,
  clearDashboardState
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectCurrentLayout = (state) => state.dashboard.currentLayout;
export const selectLayouts = (state) => state.dashboard.layouts;
export const selectDraggedWidget = (state) => state.dashboard.draggedWidget;
export const selectDropTarget = (state) => state.dashboard.dropTarget;
export const selectIsLoading = (state) => state.dashboard.isLoading;
export const selectError = (state) => state.dashboard.error;
export const selectHasUnsavedChanges = (state) => state.dashboard.hasUnsavedChanges;

// Widget selectors
export const selectWidget = (widgetId) => (state) => {
  if (state.dashboard.currentLayout && state.dashboard.currentLayout.widgets) {
    return state.dashboard.currentLayout.widgets[widgetId];
  }
  return null;
};

export const selectVisibleWidgets = (state) => {
  if (state.dashboard.currentLayout && state.dashboard.currentLayout.widgets) {
    return Object.entries(state.dashboard.currentLayout.widgets)
      .filter(([_, widget]) => widget.visible)
      .reduce((acc, [id, widget]) => ({ ...acc, [id]: widget }), {});
  }
  return {};
};