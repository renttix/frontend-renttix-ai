import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  priceRange: {
    min: null,
    max: null
  },
  stockStatus: [],
  categories: [],
  depot: null,
  isFilterPanelOpen: false,
  activeFiltersCount: 0
};

const productFiltersSlice = createSlice({
  name: 'productFilters',
  initialState,
  reducers: {
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
      state.activeFiltersCount = calculateActiveFilters(state);
    },
    setStockStatus: (state, action) => {
      state.stockStatus = action.payload;
      state.activeFiltersCount = calculateActiveFilters(state);
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
      state.activeFiltersCount = calculateActiveFilters(state);
    },
    setDepot: (state, action) => {
      state.depot = action.payload;
      state.activeFiltersCount = calculateActiveFilters(state);
    },
    toggleFilterPanel: (state) => {
      state.isFilterPanelOpen = !state.isFilterPanelOpen;
    },
    openFilterPanel: (state) => {
      state.isFilterPanelOpen = true;
    },
    closeFilterPanel: (state) => {
      state.isFilterPanelOpen = false;
    },
    clearAllFilters: (state) => {
      state.priceRange = { min: null, max: null };
      state.stockStatus = [];
      state.categories = [];
      state.depot = null;
      state.activeFiltersCount = 0;
    },
    setFiltersFromURL: (state, action) => {
      const { priceMin, priceMax, stockStatus, categories, depot } = action.payload;
      
      if (priceMin !== undefined || priceMax !== undefined) {
        state.priceRange = {
          min: priceMin ? parseFloat(priceMin) : null,
          max: priceMax ? parseFloat(priceMax) : null
        };
      }
      
      if (stockStatus) {
        state.stockStatus = Array.isArray(stockStatus) ? stockStatus : stockStatus.split(',');
      }
      
      if (categories) {
        state.categories = Array.isArray(categories) ? categories : categories.split(',');
      }
      
      if (depot) {
        state.depot = depot;
      }
      
      state.activeFiltersCount = calculateActiveFilters(state);
    }
  }
});

// Helper function to calculate active filters count
const calculateActiveFilters = (state) => {
  let count = 0;
  
  if (state.priceRange.min !== null || state.priceRange.max !== null) {
    count++;
  }
  
  if (state.stockStatus.length > 0) {
    count++;
  }
  
  if (state.categories.length > 0) {
    count++;
  }
  
  if (state.depot !== null) {
    count++;
  }
  
  return count;
};

// Selectors
export const selectProductFilters = (state) => state.productFilters;
export const selectActiveFiltersCount = (state) => state.productFilters.activeFiltersCount;
export const selectIsFilterPanelOpen = (state) => state.productFilters.isFilterPanelOpen;

// Memoized selector to get filters as query params
export const selectFiltersAsParams = createSelector(
  [selectProductFilters],
  (filters) => {
    const params = {};
    
    if (filters.priceRange.min !== null) {
      params.priceMin = filters.priceRange.min;
    }
    
    if (filters.priceRange.max !== null) {
      params.priceMax = filters.priceRange.max;
    }
    
    if (filters.stockStatus.length > 0) {
      params.stockStatus = filters.stockStatus.join(',');
    }
    
    if (filters.categories.length > 0) {
      params.categories = filters.categories.join(',');
    }
    
    if (filters.depot) {
      params.depot = filters.depot;
    }
    
    return params;
  }
);

export const {
  setPriceRange,
  setStockStatus,
  setCategories,
  setDepot,
  toggleFilterPanel,
  openFilterPanel,
  closeFilterPanel,
  clearAllFilters,
  setFiltersFromURL
} = productFiltersSlice.actions;

export default productFiltersSlice.reducer;