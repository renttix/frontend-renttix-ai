import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLayout,
  updateWidgetPosition,
  updateWidgetVisibility,
  updateWidgetCollapsed,
  setDraggedWidget,
  setDropTarget,
  resetDragState,
  setLoading,
  setError,
  resetUnsavedChanges,
  setCurrentLayout
} from '../store/dashboardSlice';
import {
  fetchDashboardLayouts,
  saveDashboardLayout as saveDashboardLayoutAPI,
  deleteDashboardLayout as deleteDashboardLayoutAPI,
  setDefaultLayout as setDefaultLayoutAPI
} from '../services/dashboardService';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const dispatch = useDispatch();
  const {
    currentLayout,
    layouts,
    draggedWidget,
    dropTarget,
    isLoading,
    error,
    hasUnsavedChanges
  } = useSelector(state => state.dashboard);
  
  const [isDragging, setIsDragging] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Load user's dashboard layouts on mount
  useEffect(() => {
    loadLayouts();
  }, []);

  // Load all dashboard layouts
  const loadLayouts = useCallback(async () => {
    try {
      console.log('[Dashboard Context] Loading layouts...');
      const response = await fetchDashboardLayouts();
      console.log('[Dashboard Context] Layouts response:', response);
      if (response.data) {
        // Transform backend format to frontend format
        const transformedLayouts = response.data.map(layout => ({
          ...layout,
          widgets: layout.widgets.reduce((acc, widget) => {
            acc[widget.widgetId] = {
              id: widget.widgetId,
              type: widget.type,
              title: widget.settings?.title || widget.type,
              icon: getWidgetIcon(widget.type),
              category: getWidgetCategory(widget.type),
              position: {
                col: widget.position.x,
                row: widget.position.y,
                width: widget.position.w
              },
              visible: widget.isVisible,
              collapsed: false,
              settings: widget.settings,
              minWidth: 3,
              maxWidth: 12,
              resizable: true
            };
            return acc;
          }, {})
        }));
        dispatch(setLayout(transformedLayouts));
      }
    } catch (error) {
      console.error('Error loading dashboard layouts:', error);
    }
  }, [dispatch]);

  // Helper function to get widget icon based on type
  const getWidgetIcon = (type) => {
    const iconMap = {
      // New widget types
      'calendar': 'calendar',
      'last-orders': 'shopping-cart',
      'recent-transactions': 'wallet',
      'todays-deliveries': 'truck',
      'assets-maintenance': 'wrench',
      'overdue-rentals': 'exclamation-triangle',
      'fleet-utilization': 'percentage',
      
      // Legacy widget types for backward compatibility
      'revenue-overview': 'chart-line',
      'active-orders': 'shopping-cart',
      'asset-utilization': 'percentage',
      'upcoming-deliveries': 'truck',
      'maintenance-alerts': 'wrench',
      'customer-activity': 'users',
      'inventory-status': 'box',
      'recent-payments': 'dollar'
    };
    return iconMap[type] || 'chart-bar';
  };

  // Helper function to get widget category
  const getWidgetCategory = (type) => {
    const categoryMap = {
      // New widget types
      'calendar': 'operations',
      'last-orders': 'operations',
      'recent-transactions': 'financial',
      'todays-deliveries': 'operations',
      'assets-maintenance': 'operations',
      'overdue-rentals': 'operations',
      'fleet-utilization': 'analytics',
      
      // Legacy widget types for backward compatibility
      'revenue-overview': 'financial',
      'active-orders': 'operations',
      'asset-utilization': 'analytics',
      'upcoming-deliveries': 'operations',
      'maintenance-alerts': 'operations',
      'customer-activity': 'analytics',
      'inventory-status': 'overview',
      'recent-payments': 'financial'
    };
    return categoryMap[type] || 'overview';
  };

  // Save current layout
  const saveLayout = useCallback(async (layoutData) => {
    try {
      // Transform frontend format back to backend format
      const transformedLayout = {
        name: layoutData.name,
        isDefault: layoutData.isDefault || false,
        widgets: Object.values(layoutData.widgets).map(widget => ({
          widgetId: widget.id,
          type: widget.type,
          position: {
            x: widget.position.col,
            y: widget.position.row,
            w: widget.position.width,
            h: 4 // Default height
          },
          settings: widget.settings || {
            title: widget.title
          },
          isVisible: widget.visible
        }))
      };

      const response = await saveDashboardLayoutAPI(transformedLayout);
      if (response.data) {
        await loadLayouts(); // Reload layouts after save
        return response.data;
      }
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      throw error;
    }
  }, [loadLayouts]);

  // Delete a layout
  const deleteLayout = useCallback(async (layoutId) => {
    try {
      await deleteDashboardLayoutAPI(layoutId);
      await loadLayouts(); // Reload layouts after delete
    } catch (error) {
      console.error('Error deleting dashboard layout:', error);
      throw error;
    }
  }, [loadLayouts]);

  // Set a layout as default
  const setAsDefaultLayout = useCallback(async (layoutId) => {
    try {
      await setDefaultLayoutAPI(layoutId);
      await loadLayouts(); // Reload layouts to update default status
    } catch (error) {
      console.error('Error setting default layout:', error);
      throw error;
    }
  }, [loadLayouts]);

  // Update widget position
  const moveWidget = useCallback((widgetId, newPosition) => {
    dispatch(updateWidgetPosition({ widgetId, position: newPosition }));
  }, [dispatch]);

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback((widgetId) => {
    dispatch(updateWidgetVisibility({ widgetId }));
  }, [dispatch]);

  // Toggle widget collapsed state
  const toggleWidgetCollapsed = useCallback((widgetId) => {
    dispatch(updateWidgetCollapsed({ widgetId }));
  }, [dispatch]);

  // Drag and drop handlers
  const startDrag = useCallback((widgetId, event) => {
    setIsDragging(true);
    dispatch(setDraggedWidget(widgetId));
    
    // Store the offset of where the user clicked on the widget
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('widgetId', widgetId);
    event.dataTransfer.setData('offsetX', offsetX);
    event.dataTransfer.setData('offsetY', offsetY);
  }, [dispatch]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    dispatch(resetDragState());
  }, [dispatch]);

  const handleDrop = useCallback((event, targetPosition) => {
    event.preventDefault();
    const widgetId = event.dataTransfer.getData('widgetId');
    
    if (widgetId && targetPosition) {
      moveWidget(widgetId, targetPosition);
    }
    
    endDrag();
  }, [moveWidget, endDrag]);

  const handleDragOver = useCallback((event, position) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    dispatch(setDropTarget(position));
  }, [dispatch]);

  const handleDragLeave = useCallback(() => {
    dispatch(setDropTarget(null));
  }, [dispatch]);

  // Calculate if a position is occupied
  const isPositionOccupied = useCallback((position, excludeWidgetId = null) => {
    if (!currentLayout || !currentLayout.widgets) return false;
    
    return Object.entries(currentLayout.widgets).some(([widgetId, widget]) => {
      if (widgetId === excludeWidgetId || !widget.visible) return false;
      
      const widgetEndCol = widget.position.col + widget.position.width;
      const positionEndCol = position.col + position.width;
      
      // Check for overlap
      const horizontalOverlap = 
        (widget.position.col < positionEndCol) && 
        (widgetEndCol > position.col);
      
      const verticalOverlap = 
        (widget.position.row === position.row);
      
      return horizontalOverlap && verticalOverlap;
    });
  }, [currentLayout]);

  // Find next available position
  const findNextAvailablePosition = useCallback((width = 4) => {
    if (!currentLayout) return { row: 0, col: 0, width };
    
    let row = 0;
    let found = false;
    let position = { row: 0, col: 0, width };
    
    while (!found) {
      for (let col = 0; col <= 12 - width; col++) {
        const testPosition = { row, col, width };
        if (!isPositionOccupied(testPosition)) {
          position = testPosition;
          found = true;
          break;
        }
      }
      if (!found) row++;
    }
    
    return position;
  }, [currentLayout, isPositionOccupied]);

  const value = {
    // State
    currentLayout,
    layouts,
    draggedWidget,
    dropTarget,
    isDragging,
    editMode,
    isLoading,
    error,
    hasUnsavedChanges,
    
    // Actions
    loadLayouts,
    saveLayout,
    deleteLayout,
    setAsDefaultLayout,
    moveWidget,
    toggleWidgetVisibility,
    toggleWidgetCollapsed,
    setEditMode,
    resetUnsavedChanges: () => dispatch(resetUnsavedChanges()),
    
    // Drag and drop
    startDrag,
    endDrag,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    
    // Utilities
    isPositionOccupied,
    findNextAvailablePosition
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};