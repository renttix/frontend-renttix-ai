import React, { useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { motion } from "framer-motion";
import { 
  FiSettings, FiBox, FiPackage, FiRefreshCw,
  FiInfo, FiPlus, FiTrash2, FiCopy
} from "react-icons/fi";

export default function SpecificationsStep({ formData, updateFormData, errors }) {
  const [customSpecs, setCustomSpecs] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const lengthUnits = [
    { name: "Centimetre", value: "cm" },
    { name: "Feet", value: "ft" },
    { name: "Inch", value: "in" },
    { name: "Metre", value: "m" },
    { name: "Millimetre", value: "mm" },
    { name: "Yard", value: "yd" }
  ];
  
  const weightUnits = [
    { name: "Kilogrammes", value: "kg" },
    { name: "Pounds", value: "lb" },
    { name: "Ounces", value: "oz" },
    { name: "Tonnes", value: "t" }
  ];
  
  const generateBatchAssets = () => {
    const quantity = formData.quantity || 1;
    const baseAsset = formData.uniqueAssetNo || generateRandomAssetNo();
    const prefix = baseAsset.split('-')[0];
    
    // Generate sequential asset numbers
    const assets = [];
    for (let i = 0; i < quantity; i++) {
      assets.push(`${prefix}-${Date.now()}-${1000 + i}`);
    }
    
    return assets;
  };
  
  const generateRandomAssetNo = () => {
    const prefix = formData.status === "Rental" ? "RNT" : "SLE";
    return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  };
  
  const addCustomSpec = () => {
    setCustomSpecs([...customSpecs, { name: "", value: "", unit: "" }]);
  };
  
  const updateCustomSpec = (index, field, value) => {
    const newSpecs = [...customSpecs];
    newSpecs[index][field] = value;
    setCustomSpecs(newSpecs);
  };
  
  const removeCustomSpec = (index) => {
    setCustomSpecs(customSpecs.filter((_, i) => i !== index));
  };
  
  const presetTemplates = {
    electronics: {
      weight: 2.5,
      weightUnit: "kg",
      customSpecs: [
        { name: "Power", value: "1000", unit: "W" },
        { name: "Voltage", value: "220-240", unit: "V" },
        { name: "Warranty", value: "12", unit: "months" }
      ]
    },
    furniture: {
      lengthUnit: "cm",
      length: 180,
      width: 90,
      height: 75,
      weight: 25,
      weightUnit: "kg",
      customSpecs: [
        { name: "Material", value: "Solid Wood", unit: "" },
        { name: "Max Load", value: "150", unit: "kg" }
      ]
    },
    vehicle: {
      customSpecs: [
        { name: "Engine", value: "2.0L", unit: "" },
        { name: "Fuel Type", value: "Petrol", unit: "" },
        { name: "Seats", value: "5", unit: "" },
        { name: "Mileage", value: "45000", unit: "km" }
      ]
    }
  };
  
  const applyPreset = (preset) => {
    const template = presetTemplates[preset];
    updateFormData({
      ...formData,
      ...template,
      lengthUnit: template.lengthUnit || formData.lengthUnit,
      weightUnit: template.weightUnit || formData.weightUnit
    });
    if (template.customSpecs) {
      setCustomSpecs(template.customSpecs);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiSettings className="mr-3 text-blue-600" />
          Product Specifications
        </h2>
        <p className="mt-2 text-gray-600">
          Define quantity, dimensions, and technical specifications
        </p>
      </div>
      
      {/* Quick Templates */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-50 border border-purple-200 rounded-lg p-4"
      >
        <p className="text-sm font-medium text-purple-900 mb-3">
          Quick Templates for Common Products:
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            label="Electronics"
            icon="pi pi-bolt"
            className="p-button-sm p-button-outlined"
            onClick={() => applyPreset('electronics')}
          />
          <Button
            label="Furniture"
            icon="pi pi-home"
            className="p-button-sm p-button-outlined"
            onClick={() => applyPreset('furniture')}
          />
          <Button
            label="Vehicle"
            icon="pi pi-car"
            className="p-button-sm p-button-outlined"
            onClick={() => applyPreset('vehicle')}
          />
        </div>
      </motion.div>
      
      {/* Quantity and Asset Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiPackage className="mr-2 text-blue-600" />
          Inventory Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <InputNumber
                value={formData.quantity}
                onValueChange={(e) => updateFormData({ quantity: e.value })}
                min={1}
                max={9999}
                showButtons
                buttonLayout="horizontal"
                className={`flex-1 ${errors.quantity ? 'p-invalid' : ''}`}
              />
              <div className="text-sm text-gray-500">
                units
              </div>
            </div>
            {errors.quantity && (
              <small className="text-red-500 text-xs mt-1">{errors.quantity}</small>
            )}
            
            {/* Visual Quantity Indicator */}
            <div className="mt-3">
              <Slider
                value={formData.quantity}
                onChange={(e) => updateFormData({ quantity: e.value })}
                min={1}
                max={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>50</span>
                <span>100+</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Asset Number
            </label>
            <div className="flex items-center space-x-2">
              <InputText
                value={formData.uniqueAssetNo}
                onChange={(e) => updateFormData({ uniqueAssetNo: e.target.value })}
                placeholder="Auto-generated"
                className="flex-1"
              />
              <Button
                icon={<FiRefreshCw className="w-4 h-4" />}
                onClick={() => updateFormData({ uniqueAssetNo: generateRandomAssetNo() })}
                className="p-button-outlined"
                tooltip="Generate new"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
            
            {formData.quantity > 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-blue-50 rounded-lg"
              >
                <p className="text-xs text-blue-900 mb-2">
                  <FiInfo className="inline mr-1" />
                  {formData.quantity} sequential asset numbers will be generated
                </p>
                <Button
                  label="Preview Asset Numbers"
                  icon={<FiCopy className="mr-2 w-4 h-4" />}
                  className="p-button-text p-button-sm"
                  onClick={() => {
                    const assets = generateBatchAssets();
                    console.log('Generated assets:', assets);
                  }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Physical Dimensions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FiBox className="mr-2 text-blue-600" />
          Physical Dimensions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Length Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length Unit
            </label>
            <Dropdown
              value={formData.lengthUnit}
              onChange={(e) => updateFormData({ lengthUnit: e.value })}
              options={lengthUnits}
              optionLabel="name"
              optionValue="value"
              className="w-full"
            />
          </div>
          
          {/* Weight Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight Unit
            </label>
            <Dropdown
              value={formData.weightUnit}
              onChange={(e) => updateFormData({ weightUnit: e.value })}
              options={weightUnits}
              optionLabel="name"
              optionValue="value"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight
            </label>
            <div className="p-inputgroup">
              <InputNumber
                value={formData.weight}
                onValueChange={(e) => updateFormData({ weight: e.value })}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                placeholder="0"
              />
              <span className="p-inputgroup-addon bg-gray-100 text-xs">
                {formData.weightUnit}
              </span>
            </div>
          </div>
          
          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length
            </label>
            <div className="p-inputgroup">
              <InputNumber
                value={formData.length}
                onValueChange={(e) => updateFormData({ length: e.value })}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                placeholder="0"
              />
              <span className="p-inputgroup-addon bg-gray-100 text-xs">
                {formData.lengthUnit}
              </span>
            </div>
          </div>
          
          {/* Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width
            </label>
            <div className="p-inputgroup">
              <InputNumber
                value={formData.width}
                onValueChange={(e) => updateFormData({ width: e.value })}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                placeholder="0"
              />
              <span className="p-inputgroup-addon bg-gray-100 text-xs">
                {formData.lengthUnit}
              </span>
            </div>
          </div>
          
          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <div className="p-inputgroup">
              <InputNumber
                value={formData.height}
                onValueChange={(e) => updateFormData({ height: e.value })}
                mode="decimal"
                minFractionDigits={0}
                maxFractionDigits={2}
                placeholder="0"
              />
              <span className="p-inputgroup-addon bg-gray-100 text-xs">
                {formData.lengthUnit}
              </span>
            </div>
          </div>
        </div>
        
        {/* Volume Calculator */}
        {formData.length && formData.width && formData.height && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <p className="text-sm text-gray-700">
              <span className="font-medium">Calculated Volume:</span>{' '}
              {(formData.length * formData.width * formData.height).toFixed(2)} {formData.lengthUnit}³
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Custom Specifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Custom Specifications
          </h3>
          <Button
            label="Add Specification"
            icon={<FiPlus className="mr-2 w-4 h-4" />}
            className="p-button-sm p-button-outlined"
            onClick={addCustomSpec}
          />
        </div>
        
        {customSpecs.length > 0 ? (
          <div className="space-y-3">
            {customSpecs.map((spec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <InputText
                  value={spec.name}
                  onChange={(e) => updateCustomSpec(index, 'name', e.target.value)}
                  placeholder="Spec name"
                  className="flex-1"
                />
                <InputText
                  value={spec.value}
                  onChange={(e) => updateCustomSpec(index, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <InputText
                  value={spec.unit}
                  onChange={(e) => updateCustomSpec(index, 'unit', e.target.value)}
                  placeholder="Unit (optional)"
                  className="w-32"
                />
                <Button
                  icon={<FiTrash2 className="w-4 h-4" />}
                  className="p-button-danger p-button-text p-button-sm"
                  onClick={() => removeCustomSpec(index)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">No custom specifications added</p>
            <p className="text-sm text-gray-400">
              Add technical specs, features, or requirements specific to your product
            </p>
          </div>
        )}
      </div>
    </div>
  );
}