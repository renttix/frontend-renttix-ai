import React from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Panel } from 'primereact/panel';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';

export default function MaintenanceConfigPanel({ product, config, onChange, errors }) {
  const frequencyOptions = [
    { label: '1 time per week', value: 1 },
    { label: '2 times per week', value: 2 },
    { label: '3 times per week', value: 3 },
    { label: '4 times per week', value: 4 },
    { label: '5 times per week', value: 5 },
    { label: '6 times per week', value: 6 },
    { label: 'Daily', value: 7 }
  ];
  
  const serviceTypeOptions = [
    { label: 'Inspection', value: 'inspection' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Repair', value: 'repair' },
    { label: 'Replacement', value: 'replacement' },
    { label: 'Other', value: 'other' }
  ];
  
  const headerTemplate = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-wrench text-primary"></i>
      <span>Maintenance Configuration - {product.name}</span>
    </div>
  );
  
  return (
    <Panel 
      header={headerTemplate}
      toggleable
      collapsed={!config.requiresMaintenance}
      className="mt-3"
    >
      <div className="grid">
        <div className="col-12">
          <div className="field-checkbox">
            <Checkbox
              inputId={`maintenance-${product._id}`}
              checked={config.requiresMaintenance || false}
              onChange={(e) => onChange({ ...config, requiresMaintenance: e.checked })}
            />
            <label htmlFor={`maintenance-${product._id}`} className="ml-2">
              This product requires maintenance
            </label>
          </div>
        </div>
        
        {config.requiresMaintenance && (
          <>
            {errors && errors[product._id] && (
              <div className="col-12">
                <Message severity="error" text={errors[product._id]} />
              </div>
            )}
            
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor={`firstMaintenanceDate-${product._id}`}>
                  First Maintenance Date <span className="text-red-500">*</span>
                </label>
                <Calendar
                  id={`firstMaintenanceDate-${product._id}`}
                  value={config.firstMaintenanceDate ? new Date(config.firstMaintenanceDate) : null}
                  onChange={(e) => onChange({ ...config, firstMaintenanceDate: e.value })}
                  dateFormat="dd/mm/yy"
                  minDate={new Date()}
                  showIcon
                  placeholder="Select date"
                  className={errors && errors[`${product._id}_firstMaintenanceDate`] ? 'p-invalid' : ''}
                />
                {errors && errors[`${product._id}_firstMaintenanceDate`] && (
                  <small className="p-error">{errors[`${product._id}_firstMaintenanceDate`]}</small>
                )}
              </div>
            </div>
            
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor={`repeatEvery-${product._id}`}>
                  Repeat Every (Days) <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id={`repeatEvery-${product._id}`}
                  value={config.repeatEveryXDays}
                  onValueChange={(e) => onChange({ ...config, repeatEveryXDays: e.value })}
                  min={1}
                  max={365}
                  placeholder="Enter days"
                  className={errors && errors[`${product._id}_repeatEveryXDays`] ? 'p-invalid' : ''}
                />
                {errors && errors[`${product._id}_repeatEveryXDays`] && (
                  <small className="p-error">{errors[`${product._id}_repeatEveryXDays`]}</small>
                )}
              </div>
            </div>
            
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor={`frequency-${product._id}`}>Frequency per Week</label>
                <Dropdown
                  id={`frequency-${product._id}`}
                  value={config.frequencyPer7Days || 1}
                  options={frequencyOptions}
                  onChange={(e) => onChange({ ...config, frequencyPer7Days: e.value })}
                  placeholder="Select frequency"
                />
              </div>
            </div>
            
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor={`serviceType-${product._id}`}>Service Type</label>
                <Dropdown
                  id={`serviceType-${product._id}`}
                  value={config.serviceType || 'inspection'}
                  options={serviceTypeOptions}
                  onChange={(e) => onChange({ ...config, serviceType: e.value })}
                  placeholder="Select service type"
                />
              </div>
            </div>
            
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor={`duration-${product._id}`}>Estimated Duration (minutes)</label>
                <InputNumber
                  id={`duration-${product._id}`}
                  value={config.estimatedServiceDuration || 30}
                  onValueChange={(e) => onChange({ ...config, estimatedServiceDuration: e.value })}
                  min={15}
                  max={480}
                  step={15}
                />
              </div>
            </div>
            
            <div className="col-12 md:col-6">
              <div className="field-checkbox mt-4">
                <Checkbox
                  inputId={`continues-${product._id}`}
                  checked={config.continuesUntilTermination !== false}
                  onChange={(e) => onChange({ ...config, continuesUntilTermination: e.checked })}
                />
                <label htmlFor={`continues-${product._id}`} className="ml-2">
                  Continue until termination
                </label>
              </div>
            </div>
            
            <div className="col-12">
              <div className="field-checkbox">
                <Checkbox
                  inputId={`oneoff-${product._id}`}
                  checked={config.oneOffServiceRequired || false}
                  onChange={(e) => onChange({ ...config, oneOffServiceRequired: e.checked })}
                />
                <label htmlFor={`oneoff-${product._id}`} className="ml-2">
                  One-off service required
                </label>
              </div>
            </div>
            
            <div className="col-12">
              <div className="field">
                <label htmlFor={`instructions-${product._id}`}>Special Instructions</label>
                <InputTextarea
                  id={`instructions-${product._id}`}
                  value={config.specialInstructions || ''}
                  onChange={(e) => onChange({ ...config, specialInstructions: e.target.value })}
                  rows={3}
                  placeholder="Enter any special maintenance instructions..."
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Maintenance Schedule Preview */}
            {config.firstMaintenanceDate && config.repeatEveryXDays && (
              <div className="col-12">
                <div className="surface-100 border-round p-3">
                  <h5 className="mt-0 mb-2">
                    <i className="pi pi-calendar mr-2"></i>
                    Maintenance Schedule Preview
                  </h5>
                  <div className="text-sm">
                    <p className="mb-1">
                      <strong>First Service:</strong> {new Date(config.firstMaintenanceDate).toLocaleDateString()}
                    </p>
                    <p className="mb-1">
                      <strong>Frequency:</strong> Every {config.repeatEveryXDays} days
                      {config.frequencyPer7Days > 1 && ` (${config.frequencyPer7Days} times per week)`}
                    </p>
                    <p className="mb-1">
                      <strong>Service Type:</strong> {serviceTypeOptions.find(o => o.value === (config.serviceType || 'inspection'))?.label}
                    </p>
                    <p className="mb-0">
                      <strong>Duration:</strong> {config.estimatedServiceDuration || 30} minutes per service
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}