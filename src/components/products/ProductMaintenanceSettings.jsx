import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { BaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { Wrench, Settings } from 'lucide-react';
import './ProductMaintenanceSettings.css';

const ProductMaintenanceSettings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [taskTypes, setTaskTypes] = useState([]);
  const toast = React.useRef(null);
  
  const { token } = useSelector((state) => state?.authReducer);

  const [maintenanceConfig, setMaintenanceConfig] = useState({
    maintenanceEligible: false,
    defaultTaskTypes: [],
    defaultFrequency: 'weekly',
    defaultPriority: 'medium'
  });

  useEffect(() => {
    fetchProducts();
    fetchTaskTypes();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BaseURL}/product/product-lists?page=1&limit=100`,
        {},
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch products'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskTypes = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/task-types`,
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setTaskTypes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching task types:', error);
    }
  };

  const handleMaintenanceToggle = async (product, value) => {
    try {
      const response = await axios.put(
        `${BaseURL}/product/update-product/${product._id}`,
        {
          maintenanceEligible: value
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: `Maintenance ${value ? 'enabled' : 'disabled'} for ${product.productName}`
        });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update product'
      });
    }
  };

  const openConfigDialog = (product) => {
    setSelectedProduct(product);
    setMaintenanceConfig({
      maintenanceEligible: product.maintenanceEligible || false,
      defaultTaskTypes: product.defaultMaintenanceConfig?.serviceDetails?.taskTypes || [],
      defaultFrequency: product.defaultMaintenanceConfig?.schedule?.frequency?.type || 'weekly',
      defaultPriority: product.defaultMaintenanceConfig?.serviceDetails?.defaultPriority || 'medium'
    });
    setShowConfigDialog(true);
  };

  const saveMaintenanceConfig = async () => {
    try {
      const response = await axios.put(
        `${BaseURL}/product/update-product/${selectedProduct._id}`,
        {
          maintenanceEligible: maintenanceConfig.maintenanceEligible,
          defaultMaintenanceConfig: {
            enabled: maintenanceConfig.maintenanceEligible,
            schedule: {
              frequency: {
                type: maintenanceConfig.defaultFrequency
              }
            },
            serviceDetails: {
              taskTypes: maintenanceConfig.defaultTaskTypes,
              defaultTaskType: maintenanceConfig.defaultTaskTypes[0],
              defaultPriority: maintenanceConfig.defaultPriority
            }
          }
        },
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Maintenance configuration saved'
        });
        setShowConfigDialog(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save configuration'
      });
    }
  };

  const maintenanceBodyTemplate = (rowData) => {
    return (
      <InputSwitch
        checked={rowData.maintenanceEligible || false}
        onChange={(e) => handleMaintenanceToggle(rowData, e.value)}
      />
    );
  };

  const configBodyTemplate = (rowData) => {
    return (
      <Button
        icon="pi pi-cog"
        className="p-button-text p-button-sm"
        onClick={() => openConfigDialog(rowData)}
        disabled={!rowData.maintenanceEligible}
        tooltip="Configure maintenance defaults"
      />
    );
  };

  const statusBodyTemplate = (rowData) => {
    if (!rowData.maintenanceEligible) {
      return <Tag value="Not Eligible" severity="secondary" />;
    }
    
    const hasConfig = rowData.defaultMaintenanceConfig?.serviceDetails?.taskTypes?.length > 0;
    return (
      <Tag 
        value={hasConfig ? "Configured" : "Needs Configuration"} 
        severity={hasConfig ? "success" : "warning"} 
      />
    );
  };

  const frequencyOptions = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-weekly', value: 'biweekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  const priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' }
  ];

  return (
    <div className="product-maintenance-settings">
      <Toast ref={toast} />
      
      <Card title="Product Maintenance Settings">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={24} />
            <h3 className="text-xl font-semibold">Maintenance Eligibility</h3>
          </div>
          <p className="text-gray-600">
            Configure which products are eligible for maintenance services and set default configurations.
          </p>
        </div>

        <DataTable
          value={products || []}
          loading={loading}
          paginator
          rows={10}
          className="p-datatable-sm"
          emptyMessage="No products found"
        >
          <Column field="productName" header="Product Name" sortable />
          <Column field="category.name" header="Category" sortable />
          <Column 
            header="Maintenance Eligible" 
            body={maintenanceBodyTemplate}
            style={{ width: '150px' }}
          />
          <Column 
            header="Status" 
            body={statusBodyTemplate}
            style={{ width: '150px' }}
          />
          <Column 
            header="Configure" 
            body={configBodyTemplate}
            style={{ width: '100px' }}
          />
        </DataTable>
      </Card>

      <Dialog
        visible={showConfigDialog}
        onHide={() => setShowConfigDialog(false)}
        header={`Maintenance Configuration - ${selectedProduct?.productName}`}
        style={{ width: '500px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setShowConfigDialog(false)}
              className="p-button-text"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              onClick={saveMaintenanceConfig}
            />
          </div>
        }
      >
        <div className="maintenance-config-form">
          <div className="field mb-4">
            <label className="flex items-center gap-2">
              <InputSwitch
                checked={maintenanceConfig.maintenanceEligible}
                onChange={(e) => setMaintenanceConfig({
                  ...maintenanceConfig,
                  maintenanceEligible: e.value
                })}
              />
              <span>Enable maintenance for this product</span>
            </label>
          </div>

          {maintenanceConfig.maintenanceEligible && (
            <>
              <div className="field mb-4">
                <label className="block mb-2">Available Task Types</label>
                <MultiSelect
                  value={maintenanceConfig.defaultTaskTypes}
                  options={taskTypes.map(t => ({ label: t.name, value: t.name }))}
                  onChange={(e) => setMaintenanceConfig({
                    ...maintenanceConfig,
                    defaultTaskTypes: e.value
                  })}
                  placeholder="Select task types"
                  className="w-full"
                  display="chip"
                />
              </div>

              <div className="field mb-4">
                <label className="block mb-2">Default Frequency</label>
                <Dropdown
                  value={maintenanceConfig.defaultFrequency}
                  options={frequencyOptions}
                  onChange={(e) => setMaintenanceConfig({
                    ...maintenanceConfig,
                    defaultFrequency: e.value
                  })}
                  placeholder="Select frequency"
                  className="w-full"
                />
              </div>

              <div className="field">
                <label className="block mb-2">Default Priority</label>
                <Dropdown
                  value={maintenanceConfig.defaultPriority}
                  options={priorityOptions}
                  onChange={(e) => setMaintenanceConfig({
                    ...maintenanceConfig,
                    defaultPriority: e.value
                  })}
                  placeholder="Select priority"
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ProductMaintenanceSettings;