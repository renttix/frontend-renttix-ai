import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

const AssetSelector = ({ 
  product, 
  selectedAssets = [], 
  onAssetsChange, 
  visible, 
  onHide,
  rentalDuration = 1,
  startDate,
  endDate 
}) => {
  const { token } = useSelector((state) => state?.authReducer);
  const [loading, setLoading] = useState(true);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState(new Set(selectedAssets.map(a => a.assetId)));
  const [selectionMode, setSelectionMode] = useState('manual'); // 'manual' or 'auto'
  const [autoAssignQuantity, setAutoAssignQuantity] = useState(selectedAssets.length || 1);
  const [autoAssignStrategy, setAutoAssignStrategy] = useState('oldest'); // 'oldest', 'newest', 'least-used'
  const [error, setError] = useState(null);

  const autoAssignStrategies = [
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Least Used', value: 'least-used' }
  ];

  useEffect(() => {
    if (visible && product) {
          setSelectionMode('manual'); // reset mode
      fetchAvailableAssets();
    }
  }, [visible, product, startDate, endDate]);

  const fetchAvailableAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product details with asset information
      const response = await axios.get(
        `${BaseURL}/product/assets/${product._id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          params: {
            startDate,
            endDate
          }
        }
      );

      if (response.data?.assets) {
        // Filter only available assets
        const available = response.data.assets.filter(asset => 
          asset.status === 'available' && 
          !asset.isUnderMaintenance &&
          !asset.hasConflictingBooking
        );
       // Build a set of selected asset IDs to compare
const previouslySelectedIds = new Set(selectedAssets.map(a => a.assetId));

// Mark previously selected assets as 'rented'
const hydratedAssets = available.map(asset => ({
  ...asset,
  status: previouslySelectedIds.has(asset.assetId) ? 'rented' : 'available'
}));

setAvailableAssets(hydratedAssets);
setSelectedAssetIds(previouslySelectedIds);

      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setError('Failed to load available assets. Please try again.');
      // Mock data for development
      const mockAssets = Array.from({ length: product.quantity || 5 }, (_, i) => ({
        assetId: `${product._id}-asset-${i + 1}`,
        assetNumber: `AST-${product.sku}-${String(i + 1).padStart(3, '0')}`,
        status: i < 3 ? 'available' : (i === 3 ? 'rented' : 'maintenance'),
        lastMaintenanceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        usageCount: Math.floor(Math.random() * 50),
        condition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
        location: product.depot || 'Main Warehouse',
        notes: i === 0 ? 'Recently serviced' : null
      })).filter(a => a.status === 'available');
      
      setAvailableAssets(mockAssets);
    } finally {
      setLoading(false);
    }
  };

const handleManualSelection = (assetId) => {
  const newSelection = new Set(selectedAssetIds);

  const updatedAssets = availableAssets.map(asset => {
    if (asset.assetId === assetId) {
      const isSelected = newSelection.has(assetId);
      if (isSelected) {
        newSelection.delete(assetId);
        return { ...asset, status: 'available',isAvailable:true, }; // Unselect -> make available
      } else {
        newSelection.add(assetId);
        return { ...asset, status: 'rented',isAvailable:false }; // Select -> make rented
      }
    }
    return asset;
  });

  setSelectedAssetIds(newSelection);
  setAvailableAssets(updatedAssets);
};


const handleAutoAssign = () => {
  let sortedAssets = [...availableAssets];

  switch (autoAssignStrategy) {
    case 'oldest':
      sortedAssets.sort((a, b) => new Date(a.lastMaintenanceDate) - new Date(b.lastMaintenanceDate));
      break;
    case 'newest':
      sortedAssets.sort((a, b) => new Date(b.lastMaintenanceDate) - new Date(a.lastMaintenanceDate));
      break;
    case 'least-used':
      sortedAssets.sort((a, b) => a.usageCount - b.usageCount);
      break;
  }

  const autoSelected = sortedAssets.slice(0, Math.min(autoAssignQuantity, sortedAssets.length));
  const selectedIds = new Set(autoSelected.map(a => a.assetId));

  const updatedAssets = availableAssets.map(asset => ({
    ...asset,
    status: selectedIds.has(asset.assetId) ? 'rented' : 'available',
  }));

  setSelectedAssetIds(selectedIds);
  setAvailableAssets(updatedAssets);
};


const handleConfirm = () => {
  const selectedAssetObjects = availableAssets
    .filter(asset => selectedAssetIds.has(asset.assetId))
    .map(asset => ({
      ...asset,
      productId: product._id 
    }));

  onAssetsChange(selectedAssetObjects);
  onHide();
};


  const statusBodyTemplate = (asset) => {
    const severity = asset.status === 'available' ? 'success' : 
                    asset.status === 'rented' ? 'danger' : 'warning';
    return <Tag value={asset.status} severity={severity} />;
  };

  const conditionBodyTemplate = (asset) => {
    const severity = asset.condition === 'excellent' ? 'success' : 
                    asset.condition === 'good' ? 'info' : 'warning';
    return <Tag value={asset.condition} severity={severity} />;
  };

  const maintenanceBodyTemplate = (asset) => {
    const daysSinceLastMaintenance = Math.floor(
      (new Date() - new Date(asset.lastMaintenanceDate)) / (1000 * 60 * 60 * 24)
    );
    return (
      <div className="text-sm">
        <div>{daysSinceLastMaintenance} days ago</div>
        {asset.notes && <div className="text-gray-500">{asset.notes}</div>}
      </div>
    );
  };

  const selectionBodyTemplate = (asset) => {
    if (selectionMode === 'manual') {
      return (
        <Checkbox
          checked={selectedAssetIds.has(asset.assetId)}
          onChange={() => handleManualSelection(asset.assetId)}
        />
      );
    }
    return null;
  };

  const header = (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <RadioButton
            inputId="manual"
            value="manual"
            checked={selectionMode === 'manual'}
            onChange={(e) => setSelectionMode(e.value)}
          />
          <label htmlFor="manual">Manual Selection</label>
        </div>
        <div className="flex items-center gap-2">
          <RadioButton
            inputId="auto"
            value="auto"
            checked={selectionMode === 'auto'}
            onChange={(e) => setSelectionMode(e.value)}
          />
          <label htmlFor="auto">Auto-Assign</label>
        </div>
      </div>
      
      {selectionMode === 'auto' && (
        <div className="flex items-center gap-2">
          <label>Quantity:</label>
          <InputNumber
            value={autoAssignQuantity}
            onValueChange={(e) => setAutoAssignQuantity(e.value)}
            min={1}
            max={availableAssets.length}
            showButtons
            className="w-32"
          />
          <Dropdown
            value={autoAssignStrategy}
            options={autoAssignStrategies}
            onChange={(e) => setAutoAssignStrategy(e.value)}
            className="w-48"
          />
          <Button
            label="Apply"
            icon="pi pi-check"
            onClick={handleAutoAssign}
            className="p-button-sm"
          />
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-600">
        {selectedAssetIds.size} of {availableAssets.length} assets selected
      </div>
      <div className="flex gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={onHide}
          className="p-button-text"
        />
        <Button
          label="Confirm Selection"
          icon="pi pi-check"
          onClick={handleConfirm}
          disabled={selectedAssetIds.size === 0}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={`Select Assets for ${product?.productName || 'Product'}`}
      style={{ width: '80vw' }}
      maximizable
      modal
      footer={footer}
    >
      {error && (
        <Message severity="error" text={error} className="mb-4" />
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={availableAssets}
          header={header}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          className="p-datatable-sm"
          emptyMessage="No available assets found"
          selectionMode={selectionMode === 'manual' ? null : 'multiple'}
          selection={selectionMode === 'auto' ? 
            availableAssets.filter(a => selectedAssetIds.has(a.assetId)) : null
          }
          onSelectionChange={(e) => {
            if (selectionMode === 'auto') {
              setSelectedAssetIds(new Set(e.value.map(a => a.assetId)));
            }
          }}
        >
          {selectionMode === 'manual' && (
            <Column body={selectionBodyTemplate} style={{ width: '50px' }} />
          )}
          <Column field="assetNumber" header="Asset Number" sortable />
          <Column body={statusBodyTemplate} header="Status" />
          <Column body={conditionBodyTemplate} header="Condition" />
          <Column field="location" header="Location" />
          <Column body={maintenanceBodyTemplate} header="Last Maintenance" sortable />
          <Column field="usageCount" header="Usage Count" sortable />
        </DataTable>
      )}
    </Dialog>
  );
};

export default AssetSelector;