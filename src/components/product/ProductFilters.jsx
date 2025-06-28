import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Slider } from 'primereact/slider';
import { Checkbox } from 'primereact/checkbox';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import axios from 'axios';
import {
  setPriceRange,
  setStockStatus,
  setCategories,
  setDepot,
  clearAllFilters,
  closeFilterPanel,
  selectProductFilters,
  selectIsFilterPanelOpen,
  selectActiveFiltersCount
} from '@/store/productFiltersSlice';
import useDebounce from '@/hooks/useDebounce';

const ProductFilters = ({ onFiltersChange }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectProductFilters);
  const isOpen = useSelector(selectIsFilterPanelOpen);
  const activeFiltersCount = useSelector(selectActiveFiltersCount);
  
  const { token, user } = useSelector((state) => state?.authReducer);
  const vendorId = ["Admin"].includes(user?.role) ? user?._id : user?.vendor;
  
  // Local state for immediate UI updates
  const [localPriceRange, setLocalPriceRange] = useState([filters.priceRange.min || 0, filters.priceRange.max || 1000]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableDepots, setAvailableDepots] = useState([]);
  const [priceStats, setPriceStats] = useState({ min: 0, max: 1000 });
  
  // Debounce price range changes
  const debouncedPriceRange = useDebounce(localPriceRange, 500);
  
  // Stock status options
  const stockStatusOptions = [
    { label: 'In Stock', value: 'INSTOCK' },
    { label: 'Low Stock', value: 'LOWSTOCK' },
    { label: 'Out of Stock', value: 'OUTOFSTOCK' }
  ];
  
  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);
  
  // Update Redux when debounced price changes
  useEffect(() => {
    // Only update if the debounced values are different from current filter values
    const newMin = debouncedPriceRange[0] === priceStats.min ? null : debouncedPriceRange[0];
    const newMax = debouncedPriceRange[1] === priceStats.max ? null : debouncedPriceRange[1];
    
    if (newMin !== filters.priceRange.min || newMax !== filters.priceRange.max) {
      dispatch(setPriceRange({
        min: newMin,
        max: newMax
      }));
    }
  }, [debouncedPriceRange, dispatch, priceStats.min, priceStats.max]); // Remove filters.priceRange from dependencies
  
  // Sync local price range with Redux state only when filters are cleared or set from URL
  useEffect(() => {
    // Only update local state if it's significantly different (not from user input)
    const filterMin = filters.priceRange.min || priceStats.min;
    const filterMax = filters.priceRange.max || priceStats.max;
    
    // Check if this is a reset or external update (not from slider/input)
    if (Math.abs(localPriceRange[0] - filterMin) > 1 || Math.abs(localPriceRange[1] - filterMax) > 1) {
      setLocalPriceRange([filterMin, filterMax]);
    }
  }, [filters.priceRange.min, filters.priceRange.max, priceStats.min, priceStats.max]); // More specific dependencies
  
  const fetchFilterOptions = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/category`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      setAvailableCategories(
        categoriesResponse.data.map(cat => ({
          label: cat.name,
          value: cat._id
        }))
      );
      
      // Fetch depots
      const depotsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/depots/list`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      setAvailableDepots(
        depotsResponse.data.map(depot => ({
          label: depot.name,
          value: depot._id
        }))
      );
      
      // Fetch price range stats - with error handling for missing endpoint
      try {
        const statsResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/product/price-stats`,
          { vendorId },
          {
            headers: { authorization: `Bearer ${token}` }
          }
        );
        if (statsResponse.data) {
          setPriceStats({
            min: statsResponse.data.min || 0,
            max: statsResponse.data.max || 1000
          });
          setLocalPriceRange([
            filters.priceRange.min || statsResponse.data.min || 0,
            filters.priceRange.max || statsResponse.data.max || 1000
          ]);
        }
      } catch (priceError) {
        // Handle missing price stats endpoint gracefully
        console.warn('Price stats endpoint not available, using defaults:', priceError.message);
        const defaultMin = 0;
        const defaultMax = 1000;
        setPriceStats({ min: defaultMin, max: defaultMax });
        setLocalPriceRange([
          filters.priceRange.min || defaultMin,
          filters.priceRange.max || defaultMax
        ]);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };
  
  const handleStockStatusChange = (value, checked) => {
    const newStatus = checked
      ? [...filters.stockStatus, value]
      : filters.stockStatus.filter(status => status !== value);
    dispatch(setStockStatus(newStatus));
  };
  
  const handleClearAll = () => {
    dispatch(clearAllFilters());
    setLocalPriceRange([priceStats.min, priceStats.max]);
  };
  
  const handleClose = () => {
    dispatch(closeFilterPanel());
  };
  
  // Notify parent component of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);
  
  const dialogHeader = (
    <div className="flex align-items-center justify-content-between">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-filter text-2xl text-primary"></i>
        <span className="text-2xl font-bold">Filters</span>
      </div>
      {activeFiltersCount > 0 && (
        <Badge
          value={activeFiltersCount}
          severity="info"
          className="filter-badge"
        />
      )}
    </div>
  );
  
  const dialogFooter = (
    <div className="flex gap-3 justify-content-end">
      <Button
        label="Clear All"
        icon="pi pi-times"
        className="p-button-text p-button-secondary filter-clear-btn"
        onClick={handleClearAll}
        disabled={activeFiltersCount === 0}
      />
      <Button
        label="Apply Filters"
        icon="pi pi-check"
        className="filter-apply-btn"
        onClick={handleClose}
      />
    </div>
  );
  
  return (
    <Dialog
      visible={isOpen}
      onHide={handleClose}
      header={dialogHeader}
      footer={dialogFooter}
      className="product-filters-dialog"
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      breakpoints={{ '960px': '90vw', '640px': '100vw' }}
      style={{ width: '450px' }}
    >
      <div className="filter-content">
        {/* Price Range Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <i className="pi pi-dollar mr-2"></i>
            <h4>Price Range</h4>
          </div>
          <div className="filter-section-content">
            <div className="price-inputs">
              <div className="price-input-group">
                <label htmlFor="min-price">Min Price</label>
                <InputNumber
                  id="min-price"
                  value={localPriceRange[0]}
                  onValueChange={(e) => setLocalPriceRange([e.value || 0, localPriceRange[1]])}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  min={priceStats.min}
                  max={localPriceRange[1]}
                  className="w-full modern-input"
                />
              </div>
              <div className="price-separator">
                <span>—</span>
              </div>
              <div className="price-input-group">
                <label htmlFor="max-price">Max Price</label>
                <InputNumber
                  id="max-price"
                  value={localPriceRange[1]}
                  onValueChange={(e) => setLocalPriceRange([localPriceRange[0], e.value || priceStats.max])}
                  mode="currency"
                  currency="USD"
                  locale="en-US"
                  min={localPriceRange[0]}
                  max={priceStats.max}
                  className="w-full modern-input"
                />
              </div>
            </div>
            <div className="slider-container">
              <Slider
                value={localPriceRange}
                onChange={(e) => setLocalPriceRange(e.value)}
                range
                min={priceStats.min}
                max={priceStats.max}
                className="modern-slider"
              />
              <div className="slider-labels">
                <span>${priceStats.min.toLocaleString()}</span>
                <span>${priceStats.max.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stock Status Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <i className="pi pi-box mr-2"></i>
            <h4>Stock Status</h4>
          </div>
          <div className="filter-section-content">
            <div className="stock-status-options">
              {stockStatusOptions.map((option) => (
                <div key={option.value} className="modern-checkbox-group">
                  <Checkbox
                    inputId={option.value}
                    value={option.value}
                    onChange={(e) => handleStockStatusChange(option.value, e.checked)}
                    checked={filters.stockStatus.includes(option.value)}
                    className="modern-checkbox"
                  />
                  <label htmlFor={option.value} className="modern-checkbox-label">
                    <span className={`status-indicator ${option.value.toLowerCase()}`}></span>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <i className="pi pi-tags mr-2"></i>
            <h4>Categories</h4>
          </div>
          <div className="filter-section-content">
            <MultiSelect
              value={filters.categories}
              onChange={(e) => dispatch(setCategories(e.value))}
              options={availableCategories}
              placeholder="Select Categories"
              className="w-full modern-multiselect"
              display="chip"
              filter
              showClear
              panelClassName="modern-multiselect-panel"
            />
          </div>
        </div>
        
        {/* Depot Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <i className="pi pi-building mr-2"></i>
            <h4>Depot Location</h4>
          </div>
          <div className="filter-section-content">
            <Dropdown
              value={filters.depot}
              onChange={(e) => dispatch(setDepot(e.value))}
              options={availableDepots}
              placeholder="Select Depot"
              className="w-full modern-dropdown"
              filter
              showClear
              panelClassName="modern-dropdown-panel"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductFilters;