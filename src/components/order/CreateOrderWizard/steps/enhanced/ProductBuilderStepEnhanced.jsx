"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useEnhancedWizard } from '../../context/EnhancedWizardContext';
import { useAssetAvailability } from '../../hooks/useAssetAvailability';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BaseURL } from '../../../../../../utils/baseUrl';
import ConflictAlert from '../../components/ConflictAlert';
import BulkAssetAssigner from '../../components/BulkAssetAssigner';
import AssetConditionIndicator from '../../components/AssetConditionIndicator';
import ProductAttachmentViewer from '../../components/ProductAttachmentViewer';

const ProductBuilderStepEnhanced = () => {
  const { 
    state, 
    updateFormData,
    checkAssetAvailability,
    addBulkAssignment,
    setMaintenanceRule
  } = useEnhancedWizard();
  const { formData, assetAvailabilityLoading } = state;
  const { user, token } = useSelector((state) => state?.authReducer);
  
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(formData.products || []);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [selectedProductForBulk, setSelectedProductForBulk] = useState(null);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [selectedProductAttachments, setSelectedProductAttachments] = useState(null);
  const [expandedRows, setExpandedRows] = useState(null);

  // Use asset availability hook
  const {
    loading: availabilityLoading,
    conflicts,
    availableAssets,
    checkBulkAvailability,
    getAvailableAssetsForProduct,
    getConflictsForProduct,
    hasConflicts,
  } = useAssetAvailability();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Check availability when products or dates change
  useEffect(() => {
    if (selectedProducts.length > 0 && formData.deliveryDate && formData.expectedReturnDate) {
      checkBulkAvailability(
        selectedProducts,
        formData.deliveryDate,
        formData.expectedReturnDate
      );
    }
  }, [selectedProducts, formData.deliveryDate, formData.expectedReturnDate]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(
        `${BaseURL}/product?vendorId=${user?._id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p._id === product._id);
    
    if (existingProduct) {
      // Update quantity
      const updatedProducts = selectedProducts.map(p =>
        p._id === product._id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
      setSelectedProducts(updatedProducts);
      updateFormData({ products: updatedProducts });
    } else {
      // Add new product
      const newProduct = {
        ...product,
        quantity: 1,
        assignedAssets: [],
        maintenanceConfig: null,
      };
      const updatedProducts = [...selectedProducts, newProduct];
      setSelectedProducts(updatedProducts);
      updateFormData({ products: updatedProducts });
    }
    
    setShowProductDialog(false);
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    
    const updatedProducts = selectedProducts.map(p =>
      p._id === productId
        ? { ...p, quantity }
        : p
    );
    setSelectedProducts(updatedProducts);
    updateFormData({ products: updatedProducts });
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(p => p._id !== productId);
    setSelectedProducts(updatedProducts);
    updateFormData({ products: updatedProducts });
  };

  const handleBulkAssign = (productId) => {
    setSelectedProductForBulk(productId);
    setShowBulkAssignDialog(true);
  };

  const handleBulkAssignmentComplete = (productId, assets) => {
    addBulkAssignment(productId, assets);
    setShowBulkAssignDialog(false);
  };

  const handleViewAttachments = (product) => {
    setSelectedProductAttachments(product);
    setShowAttachmentDialog(true);
  };

  // Column templates
  const productNameTemplate = (rowData) => {
    const conflicts = getConflictsForProduct(rowData._id);
    const hasMaintenanceRules = rowData.maintenanceRules?.length > 0;
    
    return (
      <div className="flex align-items-center gap-2">
        <span className="font-semibold">{rowData.name}</span>
        {conflicts.length > 0 && (
          <Tag severity="danger" value={`${conflicts.length} conflicts`} />
        )}
        {hasMaintenanceRules && (
          <i 
            className="pi pi-wrench text-orange-500" 
            data-pr-tooltip="Has maintenance rules"
          />
        )}
        <Tooltip target=".pi-wrench" />
      </div>
    );
  };

  const quantityTemplate = (rowData) => {
    return (
      <InputNumber
        value={rowData.quantity}
        onValueChange={(e) => handleQuantityChange(rowData._id, e.value)}
        min={1}
        showButtons
        buttonLayout="horizontal"
        decrementButtonClassName="p-button-secondary"
        incrementButtonClassName="p-button-secondary"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        style={{ width: '120px' }}
      />
    );
  };

  const availabilityTemplate = (rowData) => {
    const availableCount = getAvailableAssetsForProduct(rowData._id).length;
    const conflicts = getConflictsForProduct(rowData._id);
    
    if (availabilityLoading || assetAvailabilityLoading) {
      return <ProgressSpinner style={{ width: '20px', height: '20px' }} />;
    }
    
    if (conflicts.length > 0) {
      return (
        <Tag 
          severity="danger" 
          value={`${availableCount}/${rowData.quantity} available`}
        />
      );
    }
    
    if (availableCount >= rowData.quantity) {
      return (
        <Tag 
          severity="success" 
          value="Available"
        />
      );
    }
    
    return (
      <Tag 
        severity="warning" 
        value={`${availableCount}/${rowData.quantity} available`}
      />
    );
  };

  const priceTemplate = (rowData) => {
    const total = rowData.price * rowData.quantity;
    return (
      <div className="text-right">
        <div className="font-semibold">£{total.toFixed(2)}</div>
        <div className="text-sm text-500">£{rowData.price}/unit</div>
      </div>
    );
  };

  const actionsTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-box"
          className="p-button-text p-button-sm"
          onClick={() => handleBulkAssign(rowData._id)}
          tooltip="Bulk assign assets"
          disabled={getAvailableAssetsForProduct(rowData._id).length === 0}
        />
        {rowData.attachments?.length > 0 && (
          <Button
            icon="pi pi-paperclip"
            className="p-button-text p-button-sm"
            onClick={() => handleViewAttachments(rowData)}
            tooltip="View attachments"
            badge={rowData.attachments.length}
          />
        )}
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-danger p-button-sm"
          onClick={() => handleRemoveProduct(rowData._id)}
          tooltip="Remove product"
        />
      </div>
    );
  };

  // Row expansion template for asset details
  const rowExpansionTemplate = (data) => {
    const availableAssets = getAvailableAssetsForProduct(data._id);
    const assignedAssets = formData.bulkAssignments[data._id] || [];
    
    return (
      <div className="p-3">
        <h4 className="mb-3">Asset Details for {data.name}</h4>
        
        {/* Assigned Assets */}
        {assignedAssets.length > 0 && (
          <div className="mb-3">
            <h5 className="mb-2">Assigned Assets ({assignedAssets.length})</h5>
            <div className="grid">
              {assignedAssets.map((asset, index) => (
                <div key={asset._id} className="col-12 md:col-6 lg:col-4">
                  <div className="surface-100 border-round p-2">
                    <div className="flex align-items-center justify-content-between">
                      <span className="font-semibold">{asset.assetNumber}</span>
                      <AssetConditionIndicator condition={asset.condition} />
                    </div>
                    {asset.lastServiceDate && (
                      <small className="text-500">
                        Last serviced: {new Date(asset.lastServiceDate).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Assets */}
        {availableAssets.length > 0 && assignedAssets.length < data.quantity && (
          <div>
            <h5 className="mb-2">
              Available Assets ({availableAssets.length - assignedAssets.length})
            </h5>
            <Button
              label="Assign Assets"
              icon="pi pi-plus"
              className="p-button-sm"
              onClick={() => handleBulkAssign(data._id)}
            />
          </div>
        )}
        
        {/* Maintenance Configuration */}
        {data.maintenanceRules?.length > 0 && (
          <div className="mt-3">
            <h5 className="mb-2">Maintenance Rules</h5>
            <div className="surface-100 border-round p-2">
              {data.maintenanceRules.map((rule, index) => (
                <div key={index} className="mb-1">
                  <i className="pi pi-check-circle text-green-500 mr-2"></i>
                  {rule.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, product) => 
      sum + (product.price * product.quantity), 0
    );
    const tax = subtotal * 0.2; // 20% VAT
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const totals = calculateTotals();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid">
        {/* Conflict Alerts */}
        {hasConflicts() && (
          <div className="col-12">
            <ConflictAlert conflicts={conflicts} />
          </div>
        )}

        {/* Products Table */}
        <div className="col-12">
          <Card>
            <div className="flex justify-content-between align-items-center mb-3">
              <h3 className="text-xl font-semibold m-0">Selected Products</h3>
              <Button
                label="Add Product"
                icon="pi pi-plus"
                onClick={() => setShowProductDialog(true)}
              />
            </div>

            {selectedProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="pi pi-inbox text-4xl text-300 mb-3"></i>
                <p className="text-500">No products selected yet</p>
                <Button
                  label="Browse Products"
                  className="mt-2"
                  onClick={() => setShowProductDialog(true)}
                />
              </div>
            ) : (
              <>
                <DataTable
                  value={selectedProducts}
                  expandedRows={expandedRows}
                  onRowToggle={(e) => setExpandedRows(e.data)}
                  rowExpansionTemplate={rowExpansionTemplate}
                  dataKey="_id"
                  className="mb-3"
                >
                  <Column expander style={{ width: '3em' }} />
                  <Column 
                    field="name" 
                    header="Product" 
                    body={productNameTemplate}
                  />
                  <Column 
                    field="quantity" 
                    header="Quantity" 
                    body={quantityTemplate}
                    style={{ width: '150px' }}
                  />
                  <Column 
                    header="Availability" 
                    body={availabilityTemplate}
                    style={{ width: '150px' }}
                  />
                  <Column 
                    field="price" 
                    header="Price" 
                    body={priceTemplate}
                    style={{ width: '150px' }}
                  />
                  <Column 
                    header="Actions" 
                    body={actionsTemplate}
                    style={{ width: '150px' }}
                  />
                </DataTable>

                {/* Totals */}
                <div className="surface-100 border-round p-3">
                  <div className="grid">
                    <div className="col-12 md:col-6 md:col-offset-6">
                      <div className="flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span className="font-semibold">£{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-content-between mb-2">
                        <span>VAT (20%):</span>
                        <span className="font-semibold">£{totals.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-content-between pt-2 border-top-1 surface-border">
                        <span className="text-xl">Total:</span>
                        <span className="text-xl font-bold">£{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Product Selection Dialog */}
      <Dialog
        header="Select Product"
        visible={showProductDialog}
        style={{ width: '50vw' }}
        onHide={() => setShowProductDialog(false)}
      >
        {loadingProducts ? (
          <div className="text-center py-5">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={products}
            paginator
            rows={10}
            filterDisplay="row"
            globalFilterFields={['name', 'sku', 'category']}
          >
            <Column field="name" header="Name" filter />
            <Column field="sku" header="SKU" filter />
            <Column field="category" header="Category" filter />
            <Column 
              field="price" 
              header="Price" 
              body={(rowData) => `£${rowData.price}`}
            />
            <Column
              body={(rowData) => (
                <Button
                  label="Add"
                  icon="pi pi-plus"
                  className="p-button-sm"
                  onClick={() => handleAddProduct(rowData)}
                />
              )}
              style={{ width: '100px' }}
            />
          </DataTable>
        )}
      </Dialog>

      {/* Bulk Asset Assignment Dialog */}
      {showBulkAssignDialog && selectedProductForBulk && (
        <BulkAssetAssigner
          visible={showBulkAssignDialog}
          onHide={() => setShowBulkAssignDialog(false)}
          productId={selectedProductForBulk}
          availableAssets={getAvailableAssetsForProduct(selectedProductForBulk)}
          requiredQuantity={selectedProducts.find(p => p._id === selectedProductForBulk)?.quantity || 0}
          onAssign={handleBulkAssignmentComplete}
        />
      )}

      {/* Product Attachments Dialog */}
      {showAttachmentDialog && selectedProductAttachments && (
        <ProductAttachmentViewer
          visible={showAttachmentDialog}
          onHide={() => setShowAttachmentDialog(false)}
          product={selectedProductAttachments}
        />
      )}
    </motion.div>
  );
};

export default React.memo(ProductBuilderStepEnhanced);