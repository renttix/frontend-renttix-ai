"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatDate, calculateDaysBetween } from '../../../../../utils/helper';
import InlineMaintenanceConfig from '../components/InlineMaintenanceConfig';

export default function ProductSelectionStep() {
  const { state, updateFormData, setValidation } = useWizard();
  const { formData } = state;
  const { token } = useSelector((state) => state?.authReducer);
  
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(formData.products || []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [maintenanceConfigs, setMaintenanceConfigs] = useState({});
  const [maintenanceErrors, setMaintenanceErrors] = useState({});
  
  // Calculate rental duration for pricing
  const rentalDuration = formData.chargingStartDate && formData.expectedReturnDate && formData.useExpectedReturnDate
    ? calculateDaysBetween(new Date(formData.chargingStartDate), new Date(formData.expectedReturnDate))
    : 1;
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const vendorId = formData.vendorId || 'demo-vendor-456';
        
        const response = await axios.post(
          `${BaseURL}/product/product-lists?search=${searchQuery}&page=1&limit=100`,
          { vendorId },
          {
            headers: {
              authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data) {
          setProducts(response.data.data || []);
          
          // Extract unique categories
          const uniqueCategories = [...new Set((response.data.data || [])
            .map(p => p.category?.name)
            .filter(Boolean)
          )].map(name => ({ label: name, value: name }));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Set some demo products for demonstration
        setProducts([
          {
            _id: 'demo-1',
            name: 'Folding Chair',
            sku: 'FC-001',
            price: 5,
            quantity: 100,
            category: { name: 'Furniture' },
            images: ['/images/product/placeholder.webp']
          },
          {
            _id: 'demo-2',
            name: 'Round Table',
            sku: 'RT-001',
            price: 15,
            quantity: 50,
            category: { name: 'Furniture' },
            images: ['/images/product/placeholder.webp']
          },
          {
            _id: 'demo-3',
            name: 'PA System',
            sku: 'PA-001',
            price: 75,
            quantity: 10,
            category: { name: 'Audio' },
            images: ['/images/product/placeholder.webp']
          },
          {
            _id: 'demo-4',
            name: 'LED Uplighter',
            sku: 'LED-001',
            price: 25,
            quantity: 30,
            category: { name: 'Lighting' },
            images: ['/images/product/placeholder.webp']
          }
        ]);
        setCategories([
          { label: 'Furniture', value: 'Furniture' },
          { label: 'Audio', value: 'Audio' },
          { label: 'Lighting', value: 'Lighting' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [token, formData.vendorId, searchQuery]);
  
  // Handle maintenance config change
  const handleMaintenanceConfigChange = (productId, config) => {
    setMaintenanceConfigs(prev => ({
      ...prev,
      [productId]: config
    }));
    
    // Update the product with maintenance config
    const updated = selectedProducts.map(p =>
      p.productId === productId
        ? { ...p, maintenanceConfig: config }
        : p
    );
    setSelectedProducts(updated);
    updateFormData({ products: updated });
  };
  
  // Validate selection and maintenance configs
  useEffect(() => {
    const newErrors = {};
    const newMaintenanceErrors = {};
    
    if (!selectedProducts || selectedProducts.length === 0) {
      newErrors.products = 'Please select at least one product';
    }
    
    const hasInvalidQuantity = selectedProducts.some(p => !p.quantity || p.quantity <= 0);
    if (hasInvalidQuantity) {
      newErrors.quantity = 'All selected products must have a valid quantity';
    }
    
    // Validate maintenance configs
    selectedProducts.forEach(product => {
      const config = maintenanceConfigs[product.productId];
      if (config?.requiresMaintenance) {
        if (!config.firstMaintenanceDate) {
          newMaintenanceErrors[`${product.productId}_firstMaintenanceDate`] = 'First maintenance date is required';
        }
        if (!config.repeatEveryXDays) {
          newMaintenanceErrors[`${product.productId}_repeatEveryXDays`] = 'Repeat interval is required';
        }
      }
    });
    
    setErrors(newErrors);
    setMaintenanceErrors(newMaintenanceErrors);
    setValidation(3, { ...newErrors, ...newMaintenanceErrors });
  }, [selectedProducts, maintenanceConfigs, setValidation]);
  
  // Handle product selection
  const handleProductToggle = (product) => {
    const existing = selectedProducts.find(p => p.productId === product._id);
    
    if (existing) {
      // Remove product
      const updated = selectedProducts.filter(p => p.productId !== product._id);
      setSelectedProducts(updated);
      updateFormData({ products: updated });
    } else {
      // Add product with default quantity
      const newProduct = {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        dailyRate: product.price || 0,
        quantity: 1,
        available: product.quantity || 0,
        category: product.category?.name || '',
        image: product.images?.[0] || null,
        maintenanceConfig: product.maintenanceConfig || {}
      };
      const updated = [...selectedProducts, newProduct];
      setSelectedProducts(updated);
      
      // Initialize maintenance config if product requires maintenance
      if (product.maintenanceConfig?.requiresMaintenance) {
        setMaintenanceConfigs(prev => ({
          ...prev,
          [product._id]: product.maintenanceConfig
        }));
      }
      
      updateFormData({ products: updated });
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    const updated = selectedProducts.map(p => 
      p.productId === productId 
        ? { ...p, quantity: Math.max(1, Math.min(quantity, p.available)) }
        : p
    );
    setSelectedProducts(updated);
    updateFormData({ products: updated });
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.quantity * product.dailyRate * rentalDuration);
    }, 0);
  };
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Ensure product has required properties
    if (!product) return false;
    
    const matchesSearch = !searchQuery ||
      (product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter ||
      product.category?.name === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Column templates
  const imageBodyTemplate = (rowData) => {
    return (
      <img 
        src={rowData.images?.[0] || '/images/product/placeholder.webp'} 
        alt={rowData.name}
        className="w-12 h-12 object-cover rounded"
      />
    );
  };
  
  const nameBodyTemplate = (rowData) => {
    return (
      <div>
        <p className="font-medium">{rowData.name}</p>
        <p className="text-sm text-gray-500">{rowData.sku}</p>
      </div>
    );
  };
  
  const categoryBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.category?.name || 'Uncategorized'} severity="info" />
    );
  };
  
  const priceBodyTemplate = (rowData) => {
    return (
      <span className="font-medium">
        £{(rowData.price || 0).toFixed(2)}/day
      </span>
    );
  };
  
  const availabilityBodyTemplate = (rowData) => {
    const available = rowData.quantity || 0;
    const severity = available > 10 ? 'success' : available > 0 ? 'warning' : 'danger';
    
    return (
      <Tag value={`${available} available`} severity={severity} />
    );
  };
  
  const selectionBodyTemplate = (rowData) => {
    const isSelected = selectedProducts.some(p => p.productId === rowData._id);
    const selectedProduct = selectedProducts.find(p => p.productId === rowData._id);
    const maintenanceConfig = maintenanceConfigs[rowData._id] || {};
    
    return (
      <div className="flex flex-column gap-2">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onChange={() => handleProductToggle(rowData)}
            disabled={!rowData.quantity || rowData.quantity === 0}
          />
          {isSelected && (
            <InputNumber
              value={selectedProduct.quantity}
              onValueChange={(e) => handleQuantityChange(rowData._id, e.value)}
              min={1}
              max={rowData.quantity}
              showButtons
              buttonLayout="horizontal"
              size="small"
              className="w-32"
            />
          )}
        </div>
        {isSelected && rowData.maintenanceEligible && (
          <InlineMaintenanceConfig
            product={rowData}
            enabled={maintenanceConfig.requiresMaintenance || false}
            onToggle={(checked) => {
              const config = checked ? { requiresMaintenance: true } : { requiresMaintenance: false };
              handleMaintenanceConfigChange(rowData._id, config);
            }}
            config={maintenanceConfig}
            onChange={(config) => handleMaintenanceConfigChange(rowData._id, config)}
            deliveryDate={formData.deliveryDate || formData.chargingStartDate}
          />
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ProgressSpinner />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Products</h2>
        <p className="text-gray-600">Choose the products to rent and specify quantities.</p>
      </div>
      
      {/* Rental Period Info */}
      {formData.chargingStartDate && (
        <Message 
          severity="info" 
          text={`Rental period: ${formatDate(formData.chargingStartDate)} - ${
            formData.useExpectedReturnDate && formData.expectedReturnDate 
              ? formatDate(formData.expectedReturnDate) 
              : 'Open-ended'
          } (${rentalDuration} day${rentalDuration !== 1 ? 's' : ''})`}
        />
      )}
      
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full"
            />
          </span>
        </div>
        <Dropdown
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.value)}
          options={categories}
          placeholder="All Categories"
          showClear
          className="w-64"
        />
      </div>
      
      {/* Products Table */}
      <Card>
        <DataTable
          value={filteredProducts || []}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="No products found"
          className="p-datatable-sm"
        >
          <Column body={imageBodyTemplate} header="Image" style={{ width: '80px' }} />
          <Column body={nameBodyTemplate} header="Product" sortable />
          <Column body={categoryBodyTemplate} header="Category" sortable />
          <Column body={priceBodyTemplate} header="Daily Rate" sortable />
          <Column body={availabilityBodyTemplate} header="Availability" sortable />
          <Column body={selectionBodyTemplate} header="Select & Configure" style={{ width: '350px' }} />
        </DataTable>
      </Card>
      
      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card title="Selected Products">
          <div className="space-y-3">
            {selectedProducts.map((product) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.quantity} × £{product.dailyRate.toFixed(2)}/day × {rentalDuration} days
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    £{(product.quantity * product.dailyRate * rentalDuration).toFixed(2)}
                  </p>
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger p-button-sm"
                    onClick={() => handleProductToggle({ _id: product.productId })}
                  />
                </div>
              </div>
            ))}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  £{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Validation Errors */}
      {errors.products && (
        <Message severity="error" text={errors.products} />
      )}
    </motion.div>
  );
}