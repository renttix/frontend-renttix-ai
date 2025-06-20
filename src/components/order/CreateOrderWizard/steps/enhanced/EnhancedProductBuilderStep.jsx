"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWizard } from '../../context/WizardContext';
import { motion } from 'framer-motion';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Sidebar } from 'primereact/sidebar';
import { TreeSelect } from 'primereact/treeselect';
import { MultiSelect } from 'primereact/multiselect';
import { Fieldset } from 'primereact/fieldset';
import axios from 'axios';
import { BaseURL } from '../../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatCurrency, calculateDaysBetween } from '../../../../../../utils/helper';

// Loading skeleton for products
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="p-0">
        <Skeleton height="150px" className="mb-3" />
        <div className="p-3">
          <Skeleton height="1.5rem" className="mb-2" />
          <Skeleton height="1rem" className="mb-2" />
          <Skeleton height="2rem" />
        </div>
      </Card>
    ))}
  </div>
);

export default function EnhancedProductBuilderStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(formData.products || []);
  const [loading, setLoading] = useState(true);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  
  // Asset selection
  const [assetDialogVisible, setAssetDialogVisible] = useState(false);
  const [currentProductForAssets, setCurrentProductForAssets] = useState(null);
  const [productAssets, setProductAssets] = useState({});
  
  // Quick add panel
  const quickAddPanel = useRef(null);
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  
  // Calculate rental duration
  const rentalDuration = formData.chargingStartDate && formData.expectedReturnDate
    ? calculateDaysBetween(new Date(formData.chargingStartDate), new Date(formData.expectedReturnDate))
    : 1;
  
  // Fetch products and bundles
  useEffect(() => {
    fetchProducts();
    fetchBundles();
    fetchCategories();
  }, [user]);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BaseURL}/product?vendorId=${user._id}&limit=1000`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data?.data) {
        setProducts(response.data.data);
        // Update price range based on products
        const prices = response.data.data.map(p => p.price || 0);
        if (prices.length > 0) {
          setPriceRange({
            min: Math.min(...prices),
            max: Math.max(...prices)
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBundles = async () => {
    try {
      setLoadingBundles(true);
      const response = await axios.get(
        `${BaseURL}/bundles?vendorId=${user._id}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data?.data) {
        setBundles(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
    } finally {
      setLoadingBundles(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/categories?vendorId=${user._id}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data?.data) {
        // Transform categories for TreeSelect
        const transformedCategories = response.data.data.map(cat => ({
          key: cat._id,
          label: cat.name,
          data: cat,
          icon: 'pi pi-folder'
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  
  // Filter products based on search and categories
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(product.category?._id);
    
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });
  
  const addProduct = (product, quantity = 1) => {
    const existingIndex = selectedProducts.findIndex(p => p.productId === product._id);
    
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += quantity;
      setSelectedProducts(updated);
    } else {
      // Add new product
      const newProduct = {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        dailyRate: product.price,
        quantity: quantity,
        image: product.image,
        category: product.category?.name,
        requiresAssets: product.trackInventory,
        selectedAssets: []
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }
  };
  
  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    // Remove associated assets
    const newAssets = { ...productAssets };
    delete newAssets[productId];
    setProductAssets(newAssets);
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeProduct(productId);
    } else {
      const updated = selectedProducts.map(p => 
        p.productId === productId ? { ...p, quantity } : p
      );
      setSelectedProducts(updated);
    }
  };
  
  const addBundle = (bundle) => {
    bundle.products.forEach(item => {
      const product = products.find(p => p._id === item.product._id);
      if (product) {
        addProduct(product, item.quantity);
      }
    });
  };
  
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((total, product) => 
      total + (product.quantity * product.dailyRate * rentalDuration), 0
    );
    const tax = subtotal * 0.20; // 20% VAT
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };
  
  const totals = calculateTotals();
  
  // Product card template
  const productCardTemplate = (product) => (
    <Card 
      key={product._id}
      className="product-card hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-40 object-cover rounded-t"
          />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-t">
            <i className="pi pi-image text-4xl text-gray-400"></i>
          </div>
        )}
        {product.featured && (
          <Tag 
            value="Featured" 
            severity="warning" 
            className="absolute top-2 right-2"
          />
        )}
      </div>
      
      <div className="p-4">
        <h5 className="font-semibold mb-2">{product.name}</h5>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-primary">
              £{product.price?.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-1">/day</span>
          </div>
          {product.category && (
            <Tag value={product.category.name} severity="info" />
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            label="Quick Add"
            icon="pi pi-plus"
            className="p-button-sm flex-1"
            onClick={(e) => {
              e.stopPropagation();
              setQuickAddProduct(product);
              quickAddPanel.current.toggle(e);
            }}
          />
          <Button
            icon="pi pi-info-circle"
            className="p-button-sm p-button-outlined"
            onClick={(e) => {
              e.stopPropagation();
              // Show product details
            }}
          />
        </div>
      </div>
    </Card>
  );
  
  // Bundle card template
  const bundleCardTemplate = (bundle) => (
    <Card 
      key={bundle._id}
      className="bundle-card border-2 border-primary hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary text-white rounded-full p-3">
          <i className="pi pi-box text-2xl"></i>
        </div>
        <div className="flex-1">
          <h5 className="font-semibold mb-1">{bundle.name}</h5>
          <p className="text-sm text-gray-600 mb-3">{bundle.description}</p>
          
          <div className="space-y-1 mb-3">
            {bundle.products.slice(0, 3).map((item, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{item.quantity}x</span> {item.product.name}
              </div>
            ))}
            {bundle.products.length > 3 && (
              <span className="text-sm text-gray-500">
                +{bundle.products.length - 3} more items
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">
                £{bundle.price?.toFixed(2)}
              </span>
              {bundle.discountPercentage > 0 && (
                <Badge 
                  value={`${bundle.discountPercentage}% OFF`} 
                  severity="success" 
                  className="ml-2"
                />
              )}
            </div>
            <Button
              label="Add Bundle"
              icon="pi pi-plus"
              className="p-button-sm"
              onClick={() => addBundle(bundle)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
  
  // Selected products table
  const selectedProductsTable = () => (
    <DataTable 
      value={selectedProducts} 
      className="p-datatable-sm"
      emptyMessage="No products selected yet"
    >
      <Column 
        field="name" 
        header="Product"
        body={(rowData) => (
          <div className="flex items-center gap-2">
            {rowData.image && (
              <img 
                src={rowData.image} 
                alt={rowData.name}
                className="w-10 h-10 object-cover rounded"
              />
            )}
            <div>
              <div className="font-medium">{rowData.name}</div>
              <div className="text-sm text-gray-500">{rowData.sku}</div>
            </div>
          </div>
        )}
      />
      <Column 
        field="quantity" 
        header="Quantity"
        style={{ width: '150px' }}
        body={(rowData) => (
          <InputNumber
            value={rowData.quantity}
            onValueChange={(e) => updateQuantity(rowData.productId, e.value)}
            showButtons
            buttonLayout="horizontal"
            min={0}
            className="w-full"
          />
        )}
      />
      <Column 
        field="dailyRate" 
        header="Daily Rate"
        body={(rowData) => `£${rowData.dailyRate.toFixed(2)}`}
        style={{ width: '100px' }}
      />
      <Column 
        header="Subtotal"
        body={(rowData) => (
          <span className="font-semibold">
            £{(rowData.quantity * rowData.dailyRate * rentalDuration).toFixed(2)}
          </span>
        )}
        style={{ width: '120px' }}
      />
      <Column
        header="Actions"
        style={{ width: '100px' }}
        body={(rowData) => (
          <div className="flex gap-2">
            {rowData.requiresAssets && (
              <Button
                icon="pi pi-box"
                className="p-button-sm p-button-text"
                tooltip="Select Assets"
                onClick={() => {
                  setCurrentProductForAssets(rowData);
                  setAssetDialogVisible(true);
                }}
              />
            )}
            <Button
              icon="pi pi-trash"
              className="p-button-sm p-button-text p-button-danger"
              onClick={() => removeProduct(rowData.productId)}
            />
          </div>
        )}
      />
    </DataTable>
  );
  
  // Quick add overlay panel
  const quickAddOverlay = () => (
    <OverlayPanel ref={quickAddPanel} style={{ width: '300px' }}>
      {quickAddProduct && (
        <div className="p-3">
          <h6 className="font-semibold mb-3">{quickAddProduct.name}</h6>
          <div className="form-field">
            <label>Quantity</label>
            <InputNumber
              value={1}
              onValueChange={(e) => {
                addProduct(quickAddProduct, e.value);
                quickAddPanel.current.hide();
              }}
              showButtons
              min={1}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              label="Add"
              icon="pi pi-check"
              className="p-button-sm flex-1"
              onClick={() => {
                addProduct(quickAddProduct, 1);
                quickAddPanel.current.hide();
              }}
            />
            <Button
              label="Cancel"
              className="p-button-sm p-button-text flex-1"
              onClick={() => quickAddPanel.current.hide()}
            />
          </div>
        </div>
      )}
    </OverlayPanel>
  );
  
  // Filters sidebar
  const filtersSidebar = () => (
    <Sidebar 
      visible={showFilters} 
      onHide={() => setShowFilters(false)}
      position="right"
      style={{ width: '350px' }}
      header="Filter Products"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="form-field">
          <label>Search Products</label>
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU..."
              className="w-full"
            />
          </span>
        </div>
        
        {/* Categories */}
        <div className="form-field">
          <label>Categories</label>
          <MultiSelect
            value={selectedCategories}
            options={categories}
            onChange={(e) => setSelectedCategories(e.value)}
            optionLabel="label"
            optionValue="key"
            placeholder="All Categories"
            className="w-full"
            display="chip"
          />
        </div>
        
        {/* Price Range */}
        <div className="form-field">
          <label>Price Range (per day)</label>
          <div className="flex gap-2 items-center">
            <InputNumber
              value={priceRange.min}
              onValueChange={(e) => setPriceRange({ ...priceRange, min: e.value })}
              mode="currency"
              currency="GBP"
              className="flex-1"
              placeholder="Min"
            />
            <span>to</span>
            <InputNumber
              value={priceRange.max}
              onValueChange={(e) => setPriceRange({ ...priceRange, max: e.value })}
              mode="currency"
              currency="GBP"
              className="flex-1"
              placeholder="Max"
            />
          </div>
        </div>
        
        <Divider />
        
        <div className="flex gap-2">
          <Button
            label="Clear Filters"
            icon="pi pi-times"
            className="p-button-outlined flex-1"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategories([]);
              setPriceRange({ min: 0, max: 1000 });
            }}
          />
          <Button
            label="Apply"
            icon="pi pi-check"
            className="flex-1"
            onClick={() => setShowFilters(false)}
          />
        </div>
      </div>
    </Sidebar>
  );
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!selectedProducts || selectedProducts.length === 0) {
      newErrors.products = 'Please select at least one product';
    }
    
    setErrors(newErrors);
    setValidation(2, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  useEffect(() => {
    updateFormData({ 
      products: selectedProducts,
      pricing: totals
    });
  }, [selectedProducts]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <i className="pi pi-box text-primary"></i>
            Product Selection
          </h2>
          <p className="text-gray-600">Choose products and services for this order</p>
        </div>
        <div className="flex items-center gap-2">
          <Tag 
            value={`${selectedProducts.length} items`} 
            severity="info" 
            icon="pi pi-shopping-cart"
          />
          <Tag 
            value={`£${totals.total.toFixed(2)}`} 
            severity="success" 
            icon="pi pi-pound"
          />
        </div>
      </div>
      
      {errors.products && (
        <Message severity="error" text={errors.products} />
      )}
      
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* Products Tab */}
        <TabPanel 
          header="Products" 
          leftIcon="pi pi-box"
          rightIcon={<Badge value={products.length} />}
        >
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-2">
              <span className="p-input-icon-left flex-1">
                <i className="pi pi-search" />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full"
                />
              </span>
              <Button
                label="Filters"
                icon="pi pi-filter"
                onClick={() => setShowFilters(true)}
                badge={selectedCategories.length > 0 ? selectedCategories.length : null}
                badgeClassName="p-badge-danger"
              />
            </div>
            
            {/* Products Grid */}
            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => productCardTemplate(product))}
              </div>
            )}
            
            {filteredProducts.length === 0 && !loading && (
              <Message 
                severity="info" 
                text="No products found matching your criteria" 
              />
            )}
          </div>
        </TabPanel>
        
        {/* Bundles Tab */}
        <TabPanel 
          header="Bundles" 
          leftIcon="pi pi-gift"
          rightIcon={<Badge value={bundles.length} severity="warning" />}
        >
          <div className="space-y-4">
            {loadingBundles ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map(bundle => bundleCardTemplate(bundle))}
              </div>
            )}
            
            {bundles.length === 0 && !loadingBundles && (
              <Message 
                severity="info" 
                text="No bundles available" 
              />
            )}
          </div>
        </TabPanel>
        
        {/* Selected Products Tab */}
        <TabPanel 
          header="Selected Items" 
          leftIcon="pi pi-shopping-cart"
          rightIcon={<Badge value={selectedProducts.length} severity="success" />}
        >
          <div className="space-y-4">
            {selectedProducts.length > 0 ? (
              <>
                {selectedProductsTable()}
                
                <Divider />
                
                {/* Pricing Summary */}
                <div className="flex justify-end">
                  <Card className="w-full md:w-96">
                    <h5 className="font-semibold mb-3">Order Summary</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Rental Duration</span>
                        <span className="font-medium">{rentalDuration} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">£{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (20%)</span>
                        <span className="font-medium">£{totals.tax.toFixed(2)}</span>
                      </div>
                      <Divider />
                      <div className="flex justify-between text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-primary">£{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <Message 
                severity="info" 
                text="No products selected yet. Browse products or bundles to add items to your order." 
              />
            )}
          </div>
        </TabPanel>
      </TabView>
      
      {/* Quick Add Overlay */}
      {quickAddOverlay()}
      
      {/* Filters Sidebar */}
      {filtersSidebar()}
      
      {/* Asset Selection Dialog */}
      <Dialog
        header={`Select Assets for ${currentProductForAssets?.name}`}
        visible={assetDialogVisible}
        onHide={() => setAssetDialogVisible(false)}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
      >
        {/* Asset selection component would go here */}
        <p>Asset selection functionality to be implemented</p>
      </Dialog>
    </motion.div>
  );
}