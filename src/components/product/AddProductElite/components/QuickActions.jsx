import React from "react";
import { Button } from "primereact/button";
import { FiSave, FiEye, FiEyeOff, FiUpload, FiCopy } from "react-icons/fi";
import { Tooltip } from "primereact/tooltip";

export default function QuickActions({ onSaveDraft, onTogglePreview, showPreview }) {
  return (
    <div className="flex items-center space-x-2">
      <Tooltip target=".save-draft" content="Save as draft" position="bottom" />
      <Button
        icon={<FiSave className="w-4 h-4" />}
        onClick={onSaveDraft}
        className="save-draft p-button-text p-button-sm hover:bg-gray-100"
      />
      
      <Tooltip target=".toggle-preview" content={showPreview ? "Hide preview" : "Show preview"} position="bottom" />
      <Button
        icon={showPreview ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        onClick={onTogglePreview}
        className="toggle-preview p-button-text p-button-sm hover:bg-gray-100"
      />
      
      <Tooltip target=".import-csv" content="Import from CSV" position="bottom" />
      <Button
        icon={<FiUpload className="w-4 h-4" />}
        className="import-csv p-button-text p-button-sm hover:bg-gray-100"
      />
      
      <Tooltip target=".duplicate" content="Duplicate existing product" position="bottom" />
      <Button
        icon={<FiCopy className="w-4 h-4" />}
        className="duplicate p-button-text p-button-sm hover:bg-gray-100"
      />
    </div>
  );
}