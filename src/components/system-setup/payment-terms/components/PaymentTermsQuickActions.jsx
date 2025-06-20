import React from "react";
import { motion } from "framer-motion";
import { 
  Trash2, 
  Download, 
  Edit3, 
  X,
  FileDown,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const PaymentTermsQuickActions = ({
  selectedCount,
  onDelete,
  onExport,
  onBulkEdit,
  onClearSelection
}) => {
  const exportOptions = [
    { label: "Export as CSV", value: "csv", icon: <FileSpreadsheet size={16} /> },
    { label: "Export as JSON", value: "json", icon: <FileDown size={16} /> },
    { label: "Export as PDF", value: "pdf", icon: <FileDown size={16} /> }
  ];

  const handleExport = (format) => {
    onExport(format);
  };

  return (
    <motion.div 
      className="elite-quick-actions"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="elite-quick-actions-content">
        <div className="elite-quick-actions-left">
          <span className="elite-selected-count">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <Button
            label="Clear"
            icon={<X size={16} />}
            className="elite-clear-btn"
            onClick={onClearSelection}
            text
          />
        </div>
        
        <div className="elite-quick-actions-right">
          <Button
            label="Bulk Edit"
            icon={<Edit3 size={16} />}
            className="elite-bulk-edit-btn"
            onClick={onBulkEdit}
          />
          
          <Dropdown
            options={exportOptions}
            onChange={(e) => handleExport(e.value)}
            placeholder="Export"
            className="elite-export-dropdown"
            optionLabel="label"
            itemTemplate={(option) => (
              <div className="elite-export-option">
                {option.icon}
                <span>{option.label}</span>
              </div>
            )}
          />
          
          <Button
            label="Delete"
            icon={<Trash2 size={16} />}
            className="elite-delete-btn"
            onClick={onDelete}
            severity="danger"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentTermsQuickActions;