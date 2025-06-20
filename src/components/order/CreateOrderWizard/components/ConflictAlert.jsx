import React, { useState } from 'react';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const ConflictAlert = ({ conflicts, onResolve }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [resolving, setResolving] = useState(false);

  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const handleResolve = async (conflict, resolution) => {
    if (!onResolve) return;
    
    setResolving(true);
    try {
      await onResolve(conflict.id, resolution);
    } finally {
      setResolving(false);
    }
  };

  const conflictTypeTemplate = (conflict) => {
    const typeConfig = {
      'overlap': { label: 'Overlap', severity: 'danger', icon: 'pi pi-exclamation-triangle' },
      'maintenance': { label: 'Maintenance', severity: 'warning', icon: 'pi pi-wrench' },
      'reserved': { label: 'Reserved', severity: 'info', icon: 'pi pi-lock' }
    };
    
    const config = typeConfig[conflict.type] || { label: 'Unknown', severity: 'secondary', icon: 'pi pi-question' };
    
    return (
      <Tag
        value={config.label}
        severity={config.severity}
        icon={config.icon}
      />
    );
  };

  const dateRangeTemplate = (conflict) => {
    const startDate = new Date(conflict.conflictStart).toLocaleDateString();
    const endDate = new Date(conflict.conflictEnd).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  const actionsTemplate = (conflict) => {
    return (
      <div className="flex gap-2">
        <Button
          label="View Details"
          icon="pi pi-eye"
          className="p-button-text p-button-sm"
          onClick={() => {
            setSelectedConflict(conflict);
            setShowDetails(true);
          }}
        />
        {conflict.alternativeAssets?.length > 0 && (
          <Button
            label="Use Alternative"
            icon="pi pi-refresh"
            className="p-button-success p-button-sm"
            onClick={() => handleResolve(conflict, 'alternative')}
            loading={resolving}
          />
        )}
      </div>
    );
  };

  const getSeverity = () => {
    const hasOverlaps = conflicts.some(c => c.type === 'overlap');
    return hasOverlaps ? 'error' : 'warn';
  };

  const getMessage = () => {
    const productCount = new Set(conflicts.map(c => c.productId)).size;
    const conflictCount = conflicts.length;
    
    if (productCount === 1) {
      return `${conflictCount} asset conflict${conflictCount > 1 ? 's' : ''} detected`;
    }
    return `${conflictCount} asset conflicts detected across ${productCount} products`;
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Message
            severity={getSeverity()}
            className="w-full mb-3"
            content={
              <div className="flex align-items-center justify-content-between w-full">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-exclamation-triangle text-2xl"></i>
                  <div>
                    <div className="font-semibold">{getMessage()}</div>
                    <div className="text-sm mt-1">
                      Some assets are not available for the selected dates
                    </div>
                  </div>
                </div>
                <Button
                  label="View All Conflicts"
                  icon="pi pi-list"
                  className="p-button-sm"
                  onClick={() => setShowDetails(true)}
                />
              </div>
            }
          />
        </motion.div>
      </AnimatePresence>

      {/* Conflicts Details Dialog */}
      <Dialog
        header="Asset Conflicts"
        visible={showDetails}
        style={{ width: '70vw' }}
        onHide={() => setShowDetails(false)}
        footer={
          <div>
            <Button
              label="Close"
              icon="pi pi-times"
              onClick={() => setShowDetails(false)}
            />
          </div>
        }
      >
        <DataTable
          value={conflicts}
          paginator
          rows={10}
          className="p-datatable-sm"
        >
          <Column field="productName" header="Product" />
          <Column field="assetNumber" header="Asset" />
          <Column header="Type" body={conflictTypeTemplate} />
          <Column header="Conflict Period" body={dateRangeTemplate} />
          <Column field="conflictingOrder" header="Conflicting Order" />
          <Column header="Actions" body={actionsTemplate} />
        </DataTable>

        {selectedConflict && (
          <div className="mt-4 p-3 surface-100 border-round">
            <h4>Conflict Details</h4>
            <div className="grid">
              <div className="col-12 md:col-6">
                <p><strong>Product:</strong> {selectedConflict.productName}</p>
                <p><strong>Asset:</strong> {selectedConflict.assetNumber}</p>
                <p><strong>Current Order:</strong> {selectedConflict.conflictingOrder}</p>
              </div>
              <div className="col-12 md:col-6">
                <p><strong>Conflict Type:</strong> {selectedConflict.type}</p>
                <p><strong>Period:</strong> {dateRangeTemplate(selectedConflict)}</p>
                {selectedConflict.alternativeAssets?.length > 0 && (
                  <p><strong>Alternatives Available:</strong> {selectedConflict.alternativeAssets.length}</p>
                )}
              </div>
            </div>
            
            {selectedConflict.alternativeAssets?.length > 0 && (
              <div className="mt-3">
                <h5>Alternative Assets</h5>
                <div className="grid">
                  {selectedConflict.alternativeAssets.slice(0, 3).map((asset, index) => (
                    <div key={asset._id} className="col-12 md:col-4">
                      <div className="p-2 border-1 surface-border border-round">
                        <div className="font-semibold">{asset.assetNumber}</div>
                        <div className="text-sm text-500">Condition: {asset.condition}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
};

ConflictAlert.propTypes = {
  conflicts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    productId: PropTypes.string,
    productName: PropTypes.string,
    assetId: PropTypes.string,
    assetNumber: PropTypes.string,
    type: PropTypes.oneOf(['overlap', 'maintenance', 'reserved']),
    conflictStart: PropTypes.string,
    conflictEnd: PropTypes.string,
    conflictingOrder: PropTypes.string,
    alternativeAssets: PropTypes.array
  })),
  onResolve: PropTypes.func
};

export default React.memo(ConflictAlert);