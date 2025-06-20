"use client";
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Accordion, AccordionTab } from 'primereact/accordion';
import AssetSelector from '../../components/order/CreateOrderWizard/components/AssetSelector';
import { formatCurrency } from '../../../utils/helper';

export default function TestAssetSelection() {
  const [assetSelectorVisible, setAssetSelectorVisible] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  
  // Mock product data
  const mockProduct = {
    _id: 'prod-123',
    productName: 'Folding Chair',
    sku: 'CHAIR-001',
    rentPrice: 5,
    quantity: 10,
    depot: 'Main Warehouse',
    images: ['/images/product/chair.jpg']
  };
  
  const handleAssetsChange = (assets) => {
    setSelectedAssets(assets);
  };
  
  const handleRemoveAsset = (assetId) => {
    setSelectedAssets(selectedAssets.filter(a => a.assetId !== assetId));
  };
  
  const rentalDuration = 3; // 3 days rental
  const totalPrice = selectedAssets.length * mockProduct.rentPrice * rentalDuration;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Asset Selection Test Page</h1>
        
        {/* Product Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={mockProduct.images[0] || '/images/product/placeholder.webp'} 
                alt={mockProduct.productName}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <h3 className="text-xl font-semibold">{mockProduct.productName}</h3>
                <p className="text-gray-600">SKU: {mockProduct.sku}</p>
                <p className="text-gray-600">Daily Rate: {formatCurrency(mockProduct.rentPrice)}</p>
                <p className="text-gray-600">Total Available: {mockProduct.quantity} units</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                label={selectedAssets.length > 0 ? `${selectedAssets.length} Assets Selected` : 'Select Assets'}
                icon="pi pi-box"
                className={selectedAssets.length > 0 ? 'p-button-success' : ''}
                onClick={() => setAssetSelectorVisible(true)}
                badge={selectedAssets.length > 0 ? selectedAssets.length.toString() : null}
                badgeClassName="p-badge-success"
                size="large"
              />
              {selectedAssets.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Total: {formatCurrency(totalPrice)} for {rentalDuration} days
                </p>
              )}
            </div>
          </div>
        </Card>
        
        {/* Selected Assets Display */}
        {selectedAssets.length > 0 && (
          <Card className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Selected Assets</h4>
            
            <Accordion>
              <AccordionTab
                header={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <i className="pi pi-box text-2xl text-blue-500"></i>
                      <div>
                        <p className="font-medium">{mockProduct.productName}</p>
                        <p className="text-sm text-gray-500">
                          {selectedAssets.length} assets × {formatCurrency(mockProduct.rentPrice)}/day × {rentalDuration} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(totalPrice)}
                      </p>
                    </div>
                  </div>
                }
              >
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Asset Details:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAssets.map(asset => (
                        <Tag
                          key={asset.assetId}
                          value={asset.assetNumber}
                          severity="info"
                          removable
                          onRemove={() => handleRemoveAsset(asset.assetId)}
                          className="p-tag-lg"
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {selectedAssets.map(asset => (
                      <div key={asset.assetId} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{asset.assetNumber}</p>
                            <p className="text-sm text-gray-600">Condition: {asset.condition}</p>
                            <p className="text-sm text-gray-600">Last Maintenance: {
                              new Date(asset.lastMaintenanceDate).toLocaleDateString()
                            }</p>
                            <p className="text-sm text-gray-600">Usage Count: {asset.usageCount}</p>
                          </div>
                          <Tag value={asset.condition} severity={
                            asset.condition === 'excellent' ? 'success' : 
                            asset.condition === 'good' ? 'info' : 'warning'
                          } />
                        </div>
                        {asset.notes && (
                          <p className="text-sm text-gray-500 mt-2">{asset.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      label="Modify Selection"
                      icon="pi pi-pencil"
                      className="p-button-sm p-button-outlined"
                      onClick={() => setAssetSelectorVisible(true)}
                    />
                    <Button
                      label="Clear All"
                      icon="pi pi-trash"
                      className="p-button-sm p-button-danger p-button-outlined"
                      onClick={() => setSelectedAssets([])}
                    />
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </Card>
        )}
        
        {/* Features Demo */}
        <Card>
          <h4 className="text-lg font-semibold mb-4">Asset Selection Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h5 className="font-semibold mb-2">
                <i className="pi pi-check-circle text-blue-500 mr-2"></i>
                Manual Selection
              </h5>
              <p className="text-sm">Select individual assets by clicking checkboxes. Perfect for specific asset requirements.</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h5 className="font-semibold mb-2">
                <i className="pi pi-bolt text-green-500 mr-2"></i>
                Auto-Assignment
              </h5>
              <p className="text-sm">Automatically select assets based on strategies: Oldest First, Newest First, or Least Used.</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <h5 className="font-semibold mb-2">
                <i className="pi pi-shield text-yellow-600 mr-2"></i>
                Availability Checking
              </h5>
              <p className="text-sm">Only shows assets that are available and not assigned to other orders or under maintenance.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h5 className="font-semibold mb-2">
                <i className="pi pi-info-circle text-purple-500 mr-2"></i>
                Asset Information
              </h5>
              <p className="text-sm">View detailed information including condition, maintenance history, and usage count.</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Asset Selector Dialog */}
      <AssetSelector
        product={mockProduct}
        selectedAssets={selectedAssets}
        onAssetsChange={(assets) => {
          handleAssetsChange(assets);
          setAssetSelectorVisible(false);
        }}
        visible={assetSelectorVisible}
        onHide={() => setAssetSelectorVisible(false)}
        rentalDuration={rentalDuration}
        startDate={new Date()}
        endDate={new Date(Date.now() + rentalDuration * 24 * 60 * 60 * 1000)}
      />
    </div>
  );
}