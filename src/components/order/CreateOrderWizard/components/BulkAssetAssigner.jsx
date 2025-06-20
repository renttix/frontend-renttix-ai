import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import PropTypes from 'prop-types';
import AssetConditionIndicator from './AssetConditionIndicator';

const BulkAssetAssigner = ({ 
  visible, 
  onHide, 
  productId, 
  availableAssets, 
  requiredQuantity, 
  onAssign 
}) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState(availableAssets);
  const [globalFilter, setGlobalFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState(null);
  const [sortField, setSortField] = useState('assetNumber');
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    setFilteredAssets(availableAssets);
    setSelectedAssets([]);
  }, [availableAssets]);

  const handleSelectAll = (checked) => {
    if (checked) {
      // Select up to required quantity
      const assetsToSelect = filteredAssets.slice(0, requiredQuantity);
      setSelectedAssets(assetsToSelect);
    } else {
      setSelectedAssets([]);
    }
  };

  const handleAssetToggle = (asset) => {
    const isSelected = selectedAssets.some(a => a._id === asset._id);
    
    if (isSelected) {
      setSelectedAssets(selectedAssets.filter(a => a._id !== asset._id));
    } else {
      if (selectedAssets.length < requiredQuantity) {
        setSelectedAssets([...selectedAssets, asset]);
      }
    }
  };

  const handleAutoSelect = () => {
    // Auto-select best available assets based on condition
    const sortedAssets = [...availableAssets].sort((a, b) => {
      const conditionOrder = { 'excellent': 0, 'good': 1, 'fair': 2, 'poor': 3 };
      return (conditionOrder[a.condition] || 4) - (conditionOrder[b.condition] || 4);
    });
    
    const assetsToSelect = sortedAssets.slice(0, requiredQuantity);
    setSelectedAssets(assetsToSelect);
  };

  const handleAssign = () => {
    if (selectedAssets.length > 0) {
      onAssign(productId, selectedAssets);
    }
  };

  const applyFilters = () => {
    let filtered = [...availableAssets];
    
    // Apply global filter
    if (globalFilter) {
      filtered = filtered.filter(asset => 
        asset.assetNumber.toLowerCase().includes(globalFilter.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        asset.location?.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    
    // Apply condition filter
    if (conditionFilter) {
      filtered = filtered.filter(asset => asset.condition === conditionFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'lastServiceDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      if (aValue < bValue) return -1 * sortOrder;
      if (aValue > bValue) return 1 * sortOrder;
      return 0;
    });
    
    setFilteredAssets(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [globalFilter, conditionFilter, sortField, sortOrder]);

  // Column templates
  const selectionTemplate = (rowData) => {
    const isSelected = selectedAssets.some(a => a._id === rowData._id);
    const isDisabled = !isSelected && selectedAssets.length >= requiredQuantity;
    
    return (
      <Checkbox
        checked={isSelected}
        onChange={() => handleAssetToggle(rowData)}
        disabled={isDisabled}
      />
    );
  };

  const assetNumberTemplate = (rowData) => {
    return (
      <div>
        <div className="font-semibold">{rowData.assetNumber}</div>
        {rowData.serialNumber && (
          <div className="text-sm text-500">SN: {rowData.serialNumber}</div>
        )}
      </div>
    );
  };

  const conditionTemplate = (rowData) => {
    return <AssetConditionIndicator condition={rowData.condition} showLabel />;
  };

  const lastServiceTemplate = (rowData) => {
    if (!rowData.lastServiceDate) {
      return <span className="text-500">Never</span>;
    }
    
    const date = new Date(rowData.lastServiceDate);
    const daysSince = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    
    return (
      <div>
        <div>{date.toLocaleDateString()}</div>
        <div className="text-sm text-500">{daysSince} days ago</div>
      </div>
    );
  };

  const locationTemplate = (rowData) => {
    return rowData.location || <span className="text-500">Not specified</span>;
  };

  const header = (
    <div className="flex flex-column gap-3">
      <div className="flex justify-content-between align-items-center">
        <div className="flex align-items-center gap-2">
          <Checkbox
            checked={selectedAssets.length === Math.min(filteredAssets.length, requiredQuantity)}
            onChange={(e) => handleSelectAll(e.checked)}
          />
          <span>
            {selectedAssets.length} of {requiredQuantity} selected
          </span>
        </div>
        <Button
          label="Auto-select Best"
          icon="pi pi-bolt"
          className="p-button-outlined p-button-sm"
          onClick={handleAutoSelect}
        />
      </div>
      
      <div className="flex gap-2">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search assets..."
            className="w-full"
          />
        </span>
        <Dropdown
          value={conditionFilter}
          options={[
            { label: 'All Conditions', value: null },
            { label: 'Excellent', value: 'excellent' },
            { label: 'Good', value: 'good' },
            { label: 'Fair', value: 'fair' },
            { label: 'Poor', value: 'poor' }
          ]}
          onChange={(e) => setConditionFilter(e.value)}
          placeholder="Filter by condition"
          className="w-12rem"
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex justify-content-between align-items-center">
      <div>
        {selectedAssets.length < requiredQuantity && (
          <Message
            severity="warn"
            text={`Please select ${requiredQuantity - selectedAssets.length} more asset${requiredQuantity - selectedAssets.length > 1 ? 's' : ''}`}
            className="m-0"
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label={`Assign ${selectedAssets.length} Asset${selectedAssets.length !== 1 ? 's' : ''}`}
          icon="pi pi-check"
          onClick={handleAssign}
          disabled={selectedAssets.length === 0}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header="Bulk Asset Assignment"
      visible={visible}
      style={{ width: '70vw' }}
      onHide={onHide}
      footer={footer}
      maximizable
    >
      <div className="mb-3">
        <Message
          severity="info"
          text={`Select ${requiredQuantity} asset${requiredQuantity > 1 ? 's' : ''} to assign to this product. Assets are sorted by condition for optimal selection.`}
        />
      </div>

      <DataTable
        value={filteredAssets}
        header={header}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={(e) => {
          setSortField(e.sortField);
          setSortOrder(e.sortOrder);
        }}
        className="p-datatable-sm"
        emptyMessage="No assets available"
      >
        <Column
          body={selectionTemplate}
          style={{ width: '3rem' }}
        />
        <Column
          field="assetNumber"
          header="Asset Number"
          body={assetNumberTemplate}
          sortable
        />
        <Column
          field="condition"
          header="Condition"
          body={conditionTemplate}
          sortable
        />
        <Column
          field="lastServiceDate"
          header="Last Service"
          body={lastServiceTemplate}
          sortable
        />
        <Column
          field="location"
          header="Location"
          body={locationTemplate}
          sortable
        />
      </DataTable>

      {availableAssets.length === 0 && (
        <div className="text-center py-5">
          <i className="pi pi-inbox text-4xl text-300 mb-3"></i>
          <p className="text-500">No assets available for this product</p>
        </div>
      )}
    </Dialog>
  );
};

BulkAssetAssigner.propTypes = {
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  productId: PropTypes.string.isRequired,
  availableAssets: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    assetNumber: PropTypes.string.isRequired,
    serialNumber: PropTypes.string,
    condition: PropTypes.string,
    lastServiceDate: PropTypes.string,
    location: PropTypes.string
  })).isRequired,
  requiredQuantity: PropTypes.number.isRequired,
  onAssign: PropTypes.func.isRequired
};

export default React.memo(BulkAssetAssigner);