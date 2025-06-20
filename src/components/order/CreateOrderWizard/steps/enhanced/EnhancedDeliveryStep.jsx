"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWizard } from '../../context/WizardContext';
import { motion } from 'framer-motion';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { TabView, TabPanel } from 'primereact/tabview';
import { Fieldset } from 'primereact/fieldset';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import { Chip } from 'primereact/chip';
import { Badge } from 'primereact/badge';
import { ListBox } from 'primereact/listbox';
import { MultiSelect } from 'primereact/multiselect';
import { FileUpload } from 'primereact/fileupload';
import { OverlayPanel } from 'primereact/overlaypanel';
import axios from 'axios';
import { BaseURL } from '../../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

// Loading skeleton for routes
const RouteLoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton height="1.5rem" width="60%" className="mb-2" />
            <Skeleton height="1rem" width="40%" />
          </div>
          <Skeleton height="2.5rem" width="5rem" />
        </div>
      </Card>
    ))}
  </div>
);

export default function EnhancedDeliveryStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Address states
  const [useCustomerAddress, setUseCustomerAddress] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [validatingAddress, setValidatingAddress] = useState(false);
  
  // Route states
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(formData.assignedRoute || null);
  
  // Document states
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState(formData.selectedDocuments || []);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  
  // Delivery instructions
  const [deliveryInstructions, setDeliveryInstructions] = useState(formData.deliveryInstructions || '');
  const [accessInstructions, setAccessInstructions] = useState(formData.accessInstructions || '');
  const [contactPerson, setContactPerson] = useState(formData.deliveryContactPerson || '');
  const [contactPhone, setContactPhone] = useState(formData.deliveryContactPhone || '');
  
  // Refs
  const documentPreviewPanel = useRef(null);
  
  // Auto-fill with customer address on mount
  useEffect(() => {
    if (formData.customerDetails && useCustomerAddress) {
      const customer = formData.customerDetails;
      updateFormData({
        deliveryAddress1: customer.address1 || '',
        deliveryAddress2: customer.address2 || '',
        deliveryCity: customer.city || '',
        deliveryCountry: customer.country || 'United Kingdom',
        deliveryPostcode: customer.postcode || '',
        deliveryContactPerson: customer.contactName || customer.name || '',
        deliveryContactPhone: customer.phoneNumber || ''
      });
      setContactPerson(customer.contactName || customer.name || '');
      setContactPhone(customer.phoneNumber || '');
    }
  }, []);
  
  // Fetch available routes when address changes
  useEffect(() => {
    if (formData.deliveryPostcode && formData.deliveryDate) {
      fetchAvailableRoutes();
    }
  }, [formData.deliveryPostcode, formData.deliveryDate]);
  
  // Fetch optional documents
  useEffect(() => {
    fetchOptionalDocuments();
  }, []);
  
  const fetchOptionalDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await axios.get(
        `${BaseURL}/vendor/custom-docs`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success && response.data.data.documents) {
        const docs = response.data.data.documents.map(doc => ({
          id: doc._id,
          name: doc.docName,
          type: doc.docType,
          description: doc.description,
          url: doc.fileUrl,
          tags: doc.tags,
          icon: getDocumentIcon(doc.docType)
        }));
        setAvailableDocuments(docs);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  const getDocumentIcon = (type) => {
    const icons = {
      policy: 'pi-shield',
      agreement: 'pi-file-edit',
      certificate: 'pi-verified',
      manual: 'pi-book',
      other: 'pi-file'
    };
    return icons[type] || 'pi-file';
  };
  
  const geocodeAddress = async () => {
    try {
      setGeocoding(true);
      const fullAddress = `${formData.deliveryAddress1}, ${formData.deliveryCity}, ${formData.deliveryPostcode}, ${formData.deliveryCountry}`;
      
      const response = await axios.post(
        `${BaseURL}/geocoding/geocode`,
        { address: fullAddress },
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.coordinates) {
        updateFormData({
          deliveryCoordinates: response.data.coordinates,
          locationVerified: true
        });
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      updateFormData({
        deliveryCoordinates: null,
        locationVerified: false
      });
    } finally {
      setGeocoding(false);
    }
  };
  
  const fetchAvailableRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const response = await axios.get(
        `${BaseURL}/routes/available`,
        {
          params: {
            date: formData.deliveryDate,
            postcode: formData.deliveryPostcode,
            vendorId: user._id
          },
          headers: { authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data?.data) {
        setAvailableRoutes(response.data.data);
        // Auto-select if only one route
        if (response.data.data.length === 1) {
          selectRoute(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      setAvailableRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };
  
  const selectRoute = (route) => {
    setSelectedRoute(route);
    updateFormData({
      assignedRoute: route._id,
      routeDetails: route,
      depot: route.depot?._id
    });
  };
  
  const handleAddressChange = (field, value) => {
    updateFormData({ [field]: value });
    setUseCustomerAddress(false);
  };
  
  const validateAddress = async () => {
    setValidatingAddress(true);
    try {
      // Validate and geocode address
      await geocodeAddress();
      
      // Check if address is serviceable
      if (formData.deliveryCoordinates) {
        // Additional validation logic here
      }
    } catch (error) {
      console.error('Address validation failed:', error);
    } finally {
      setValidatingAddress(false);
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (!formData.deliveryAddress1) {
      newErrors.address1 = 'Delivery address is required';
    }
    
    if (!formData.deliveryCity) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.deliveryPostcode) {
      newErrors.postcode = 'Postcode is required';
    }
    
    if (!formData.assignedRoute) {
      newErrors.route = 'Please select a delivery route';
    }
    
    if (!contactPerson) {
      newErrors.contactPerson = 'Delivery contact person is required';
    }
    
    if (!contactPhone) {
      newErrors.contactPhone = 'Delivery contact phone is required';
    }
    
    setErrors(newErrors);
    setValidation(3, newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    // Save all delivery details
    updateFormData({
      deliveryInstructions,
      accessInstructions,
      deliveryContactPerson: contactPerson,
      deliveryContactPhone: contactPhone,
      selectedDocuments
    });
    
    if (validateStep()) {
      completeStep(3);
    }
  };
  
  // Address form component
  const addressForm = () => (
    <div className="space-y-4">
      {/* Use Customer Address Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          inputId="use-customer-address"
          checked={useCustomerAddress}
          onChange={(e) => {
            setUseCustomerAddress(e.checked);
            if (e.checked && formData.customerDetails) {
              const customer = formData.customerDetails;
              updateFormData({
                deliveryAddress1: customer.address1 || '',
                deliveryAddress2: customer.address2 || '',
                deliveryCity: customer.city || '',
                deliveryCountry: customer.country || 'United Kingdom',
                deliveryPostcode: customer.postcode || ''
              });
            }
          }}
        />
        <label htmlFor="use-customer-address" className="cursor-pointer">
          Use customer's billing address for delivery
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-field md:col-span-2">
          <label htmlFor="address1">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <InputText
            id="address1"
            value={formData.deliveryAddress1 || ''}
            onChange={(e) => handleAddressChange('deliveryAddress1', e.target.value)}
            placeholder="Street address"
            className={`w-full ${errors.address1 ? 'p-invalid' : ''}`}
          />
          {errors.address1 && <small className="p-error">{errors.address1}</small>}
        </div>
        
        <div className="form-field md:col-span-2">
          <label htmlFor="address2">Address Line 2</label>
          <InputText
            id="address2"
            value={formData.deliveryAddress2 || ''}
            onChange={(e) => handleAddressChange('deliveryAddress2', e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
            className="w-full"
          />
        </div>
        
        <div className="form-field">
          <label htmlFor="city">
            City <span className="text-red-500">*</span>
          </label>
          <InputText
            id="city"
            value={formData.deliveryCity || ''}
            onChange={(e) => handleAddressChange('deliveryCity', e.target.value)}
            placeholder="City"
            className={`w-full ${errors.city ? 'p-invalid' : ''}`}
          />
          {errors.city && <small className="p-error">{errors.city}</small>}
        </div>
        
        <div className="form-field">
          <label htmlFor="postcode">
            Postcode <span className="text-red-500">*</span>
          </label>
          <InputText
            id="postcode"
            value={formData.deliveryPostcode || ''}
            onChange={(e) => handleAddressChange('deliveryPostcode', e.target.value)}
            placeholder="Postcode"
            className={`w-full ${errors.postcode ? 'p-invalid' : ''}`}
          />
          {errors.postcode && <small className="p-error">{errors.postcode}</small>}
        </div>
      </div>
      
      {/* Address Validation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {formData.locationVerified && (
            <Tag value="Address Verified" severity="success" icon="pi pi-check-circle" />
          )}
          {geocoding && (
            <Tag value="Validating..." severity="info" icon="pi pi-spin pi-spinner" />
          )}
        </div>
        <Button
          label="Validate Address"
          icon="pi pi-map-marker"
          className="p-button-sm"
          onClick={validateAddress}
          loading={validatingAddress}
        />
      </div>
    </div>
  );
  
  // Route selection component
  const routeSelection = () => (
    <div className="space-y-4">
      {errors.route && (
        <Message severity="error" text={errors.route} />
      )}
      
      {loadingRoutes ? (
        <RouteLoadingSkeleton />
      ) : availableRoutes.length > 0 ? (
        <div className="space-y-3">
          {availableRoutes.map((route) => (
            <Card
              key={route._id}
              className={`cursor-pointer transition-all ${
                selectedRoute?._id === route._id 
                  ? 'border-2 border-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => selectRoute(route)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <i className="pi pi-truck text-2xl text-primary"></i>
                    <div>
                      <h5 className="font-semibold m-0">{route.name}</h5>
                      <p className="text-sm text-gray-600 m-0">
                        {route.depot?.name} • {route.driver?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Chip 
                      label={`${route.currentLoad || 0}/${route.capacity} orders`} 
                      icon="pi pi-box"
                      className="text-sm"
                    />
                    <Chip 
                      label={`${route.estimatedDuration || 'N/A'} hrs`} 
                      icon="pi pi-clock"
                      className="text-sm"
                    />
                    {route.isOptimized && (
                      <Tag value="Optimized" severity="success" />
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((route.currentLoad / route.capacity) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Capacity</div>
                </div>
              </div>
              
              {selectedRoute?._id === route._id && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <i className="pi pi-check-circle"></i>
                    <span>Selected for delivery</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Message 
          severity="warn" 
          text="No routes available for the selected date and location. Please contact support." 
        />
      )}
    </div>
  );
  
  // Delivery instructions component
  const deliveryInstructionsForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-field">
          <label htmlFor="contact-person">
            Contact Person <span className="text-red-500">*</span>
          </label>
          <InputText
            id="contact-person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Name of person receiving delivery"
            className={`w-full ${errors.contactPerson ? 'p-invalid' : ''}`}
          />
          {errors.contactPerson && <small className="p-error">{errors.contactPerson}</small>}
        </div>
        
        <div className="form-field">
          <label htmlFor="contact-phone">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <InputText
            id="contact-phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Phone number"
            className={`w-full ${errors.contactPhone ? 'p-invalid' : ''}`}
          />
          {errors.contactPhone && <small className="p-error">{errors.contactPhone}</small>}
        </div>
      </div>
      
      <div className="form-field">
        <label htmlFor="delivery-instructions">
          Delivery Instructions
          <Tag value="Optional" className="ml-2" />
        </label>
        <InputTextarea
          id="delivery-instructions"
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          rows={3}
          placeholder="Special delivery instructions, preferred time window, etc."
          className="w-full"
          autoResize
        />
      </div>
      
      <div className="form-field">
        <label htmlFor="access-instructions">
          Access Instructions
          <Tag value="Optional" className="ml-2" />
        </label>
        <InputTextarea
          id="access-instructions"
          value={accessInstructions}
          onChange={(e) => setAccessInstructions(e.target.value)}
          rows={3}
          placeholder="Gate codes, parking instructions, building access, etc."
          className="w-full"
          autoResize
        />
      </div>
    </div>
  );
  
  // Document selection component
  const documentSelection = () => (
    <div className="space-y-4">
      <Message 
        severity="info" 
        text="Select any additional documents to include with this order" 
      />
      
      {loadingDocuments ? (
        <div className="flex justify-center p-4">
          <i className="pi pi-spin pi-spinner text-4xl"></i>
        </div>
      ) : availableDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableDocuments.map((doc) => (
            <Card
              key={doc.id}
              className={`cursor-pointer transition-all ${
                selectedDocuments.includes(doc.id) 
                  ? 'border-2 border-primary' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                if (selectedDocuments.includes(doc.id)) {
                  setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                } else {
                  setSelectedDocuments([...selectedDocuments, doc.id]);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  selectedDocuments.includes(doc.id) 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100'
                }`}>
                  <i className={`pi ${doc.icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h6 className="font-semibold m-0">{doc.name}</h6>
                  <p className="text-sm text-gray-600 m-0 mt-1">{doc.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Tag value={doc.type} severity="info" className="text-xs" />
                    <Button
                      icon="pi pi-eye"
                      className="p-button-text p-button-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocumentPreview(doc);
                        documentPreviewPanel.current.toggle(e);
                      }}
                      tooltip="Preview"
                    />
                  </div>
                </div>
                {selectedDocuments.includes(doc.id) && (
                  <i className="pi pi-check-circle text-primary text-xl"></i>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Message 
          severity="info" 
          text="No optional documents available" 
        />
      )}
      
      {selectedDocuments.length > 0 && (
        <div className="mt-4">
          <Tag 
            value={`${selectedDocuments.length} document${selectedDocuments.length > 1 ? 's' : ''} selected`} 
            severity="success" 
            icon="pi pi-check"
          />
        </div>
      )}
    </div>
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <i className="pi pi-truck text-primary"></i>
          Delivery Details
        </h2>
        <p className="text-gray-600">Configure delivery address, route, and special instructions</p>
      </div>
      
      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        {/* Delivery Address Tab */}
        <TabPanel header="Delivery Address" leftIcon="pi pi-map-marker">
          <Panel>
            {addressForm()}
          </Panel>
        </TabPanel>
        
        {/* Route Selection Tab */}
        <TabPanel 
          header="Route Selection" 
          leftIcon="pi pi-route"
          rightIcon={selectedRoute && <i className="pi pi-check-circle text-success"></i>}
        >
          <Panel>
            {routeSelection()}
          </Panel>
        </TabPanel>
        
        {/* Instructions Tab */}
        <TabPanel header="Instructions & Contact" leftIcon="pi pi-info-circle">
          <Panel>
            {deliveryInstructionsForm()}
          </Panel>
        </TabPanel>
        
        {/* Documents Tab */}
        <TabPanel 
          header="Optional Documents" 
          leftIcon="pi pi-file"
          rightIcon={selectedDocuments.length > 0 && 
            <Badge value={selectedDocuments.length} severity="info" />
          }
        >
          <Panel>
            {documentSelection()}
          </Panel>
        </TabPanel>
      </TabView>
      
      {/* Document Preview Overlay */}
      <OverlayPanel ref={documentPreviewPanel} style={{ width: '400px' }}>
        {documentPreview && (
          <div className="p-3">
            <h5 className="font-semibold mb-3">{documentPreview.name}</h5>
            <p className="text-sm text-gray-600 mb-3">{documentPreview.description}</p>
            <div className="flex gap-2">
              <Button
                label="View Full Document"
                icon="pi pi-external-link"
                className="p-button-sm"
                onClick={() => window.open(documentPreview.url, '_blank')}
              />
              <Button
                label="Close"
                className="p-button-sm p-button-text"
                onClick={() => documentPreviewPanel.current.hide()}
              />
            </div>
          </div>
        )}
      </OverlayPanel>
      
      {/* Map Dialog */}
      <Dialog
        header="Delivery Location"
        visible={showMap}
        onHide={() => setShowMap(false)}
        style={{ width: '70vw' }}
        breakpoints={{ '960px': '90vw' }}
      >
        <div style={{ height: '500px' }}>
          {/* Map component would go here */}
          <Message severity="info" text="Map view coming soon" />
        </div>
      </Dialog>
    </motion.div>
  );
}