"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { InputSwitch } from "primereact/inputswitch";
import { format } from "date-fns";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CreateRentalModalEnhanced = ({ visible, onHide, prefilledDate, prefilledProduct, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [depots, setDepots] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
  const toast = useRef(null);
  const router = useRouter();
  const { token, user } = useSelector((state) => state?.authReducer);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize form data with all fields
  const [formData, setFormData] = useState({
    // Customer Information
    customerId: null,
    customerPhone: "",
    customerEmail: "",
    customerReference: "",
    siteContact: "",
    salesPerson: "",
    orderedBy: "",
    
    // Delivery Information
    deliveryDate: prefilledDate || new Date(),
    deliveryTime: "morning",
    deliveryPlaceName: "",
    deliveryAddress1: "",
    deliveryAddress2: "",
    deliveryCity: "",
    deliveryCountry: "",
    deliveryPostcode: "",
    depot: null,
    
    // Collection Information
    useExpectedReturnDate: false,
    expectedReturnDate: null,
    collectionTime: "afternoon",
    
    // Billing Information
    billingPlaceName: "",
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingCountry: "",
    billingPostcode: "",
    copyDeliveryToBilling: false,
    
    // Payment Information
    paymentTerm: null,
    invoiceRunCode: null,
    invoiceInBatch: false,
    chargingStartDate: prefilledDate || new Date(),
    
    // Additional Information
    specialInstructions: "",
    sendConfirmation: true,
    addToRoute: true
  });

  const steps = [
    { label: "Customer & Contact" },
    { label: "Select Products" },
    { label: "Delivery & Collection" },
    { label: "Billing & Payment" },
    { label: "Review & Confirm" }
  ];

  const timeOptions = [
    { label: "Morning (8-12)", value: "morning" },
    { label: "Afternoon (12-5)", value: "afternoon" },
    { label: "Evening (5-8)", value: "evening" }
  ];

  // Fetch all required data
  useEffect(() => {
    if (visible && token) {
      fetchCustomers();
      fetchProducts();
      fetchDepots();
      fetchPaymentTerms();
      fetchInvoiceRunCodes();
    }
  }, [visible, token]);

  // Handle prefilled product
  useEffect(() => {
    if (prefilledProduct && products.length > 0) {
      const product = products.find(p => p._id === prefilledProduct.id);
      if (product) {
        setSelectedProducts([{
          id: product._id,
          name: product.productName,
          quantity: 1,
          dailyRate: product.dailyRate || product.price || 50,
          available: product.available || product.quantity || 10
        }]);
      }
    }
  }, [prefilledProduct, products]);

  // Auto-populate charging start date
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      chargingStartDate: prev.deliveryDate
    }));
  }, [formData.deliveryDate]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/order/customer?vendorId=${user?._id}&limit=1000`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load customers",
        life: 3000
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.post(
        `${BaseURL}/product/product-lists`,
        { vendorId: user?._id },
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        const transformedProducts = response.data.data.map(product => ({
          ...product,
          available: product.quantity || 10,
          dailyRate: product.price || product.rentPrice || 50,
          // Ensure _id is consistent
          _id: product._id || product.id
        }));
        setProducts(transformedProducts);
      } else {
        console.error("Failed to fetch products:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load products",
        life: 3000
      });
    }
  };

  const fetchDepots = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/depots?limit=1000`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setDepots(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching depots:", error);
    }
  };

  const fetchPaymentTerms = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/payment-terms`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setPaymentTerms(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching payment terms:", error);
    }
  };

  const fetchInvoiceRunCodes = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/invoice-run-code`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        setInvoiceRunCodes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoice run codes:", error);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customerId,
        customerPhone: customer.telephone || "",
        customerEmail: customer.email || "",
        deliveryAddress1: customer.addressLine1 || "",
        deliveryCity: customer.city || "",
        deliveryCountry: customer.country || "",
        deliveryPostcode: customer.postcode || ""
      });
    }
  };

  const handleCopyDeliveryToBilling = (checked) => {
    setFormData({
      ...formData,
      copyDeliveryToBilling: checked,
      billingPlaceName: checked ? formData.deliveryPlaceName : formData.billingPlaceName,
      billingAddress1: checked ? formData.deliveryAddress1 : formData.billingAddress1,
      billingAddress2: checked ? formData.deliveryAddress2 : formData.billingAddress2,
      billingCity: checked ? formData.deliveryCity : formData.billingCity,
      billingCountry: checked ? formData.deliveryCountry : formData.billingCountry,
      billingPostcode: checked ? formData.deliveryPostcode : formData.billingPostcode
    });
  };

  const handleProductToggle = (product) => {
    const productId = product._id || product.id;
    
    const existing = selectedProducts.find(p => p.id === productId);
    if (existing) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, {
        id: productId,
        name: product.productName,
        quantity: 1,
        dailyRate: product.dailyRate || product.price || product.rentPrice || 50,
        deliveryPrice: 0,
        collectionPrice: 0,
        available: product.available || product.quantity || 10
      }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const handlePriceChange = (productId, field, value) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.id === productId ? { ...p, [field]: value || 0 } : p
    ));
  };

  const calculateTotal = () => {
    if (!formData.deliveryDate || !formData.expectedReturnDate) return 0;
    
    const days = Math.ceil(
      (new Date(formData.expectedReturnDate) - new Date(formData.deliveryDate)) / (1000 * 60 * 60 * 24)
    );
    
    return selectedProducts.reduce((total, product) => {
      return total + (product.quantity * product.dailyRate * Math.max(1, days));
    }, 0);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.customerId) {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: "Please select a customer",
            life: 3000
          });
          return false;
        }
        return true;
      
      case 1:
        if (selectedProducts.length === 0) {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: "Please select at least one product",
            life: 3000
          });
          return false;
        }
        return true;
      
      case 2:
        if (!formData.deliveryAddress1 || !formData.deliveryCity) {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: "Please complete delivery address",
            life: 3000
          });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.paymentTerm) {
          toast.current?.show({
            severity: "warn",
            summary: "Warning",
            detail: "Please select payment terms",
            life: 3000
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const orderPayload = {
        // Customer Information
        customerId: formData.customerId,
        customerReference: formData.customerReference,
        siteContact: formData.siteContact,
        salesPerson: formData.salesPerson,
        orderedBy: formData.orderedBy,
        phoneNumber: formData.customerPhone,
        email: formData.customerEmail,
        
        // Delivery Information
        deliveryDate: formData.deliveryDate.toISOString(),
        deliveryPlaceName: formData.deliveryPlaceName,
        deliveryAddress1: formData.deliveryAddress1,
        deliveryAddress2: formData.deliveryAddress2,
        deliveryCity: formData.deliveryCity,
        deliveryCountry: formData.deliveryCountry,
        deliveryPostcode: formData.deliveryPostcode,
        depot: formData.depot,
        
        // Collection Information
        useExpectedReturnDate: formData.useExpectedReturnDate,
        expectedReturnDate: formData.expectedReturnDate?.toISOString(),
        
        // Billing Information
        billingPlaceName: formData.billingPlaceName,
        address1: formData.billingAddress1,
        address2: formData.billingAddress2,
        city: formData.billingCity,
        country: formData.billingCountry,
        postcode: formData.billingPostcode,
        
        // Payment Information
        paymentTerm: formData.paymentTerm,
        invoiceRunCode: formData.invoiceRunCode,
        invoiceInBatch: formData.invoiceInBatch ? 1 : 0,
        chargingStartDate: formData.chargingStartDate.toISOString(),
        
        // Additional Information
        instruction: formData.specialInstructions,
        
        // Products
        products: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          price: p.dailyRate,
          deliveryPrice: p.deliveryPrice || 0,
          collectionPrice: p.collectionPrice || 0
        })),
        
        // Vendor
        vendorId: user?._id,
        orderDate: new Date().toISOString()
      };

      const response = await axios.post(
        `${BaseURL}/order/create-order`,
        orderPayload,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Rental order created successfully",
          life: 3000
        });
        
        // Reset form
        resetForm();
        onHide();
        onSuccess?.();
        
        // Navigate to order details
        router.push(`/order/${response.data.data._id}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to create order",
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setSelectedProducts([]);
    setProductSearchTerm("");
    setIsExpanded(false);
    setIsMinimized(false);
    setFormData({
      customerId: null,
      customerPhone: "",
      customerEmail: "",
      customerReference: "",
      siteContact: "",
      salesPerson: "",
      orderedBy: "",
      deliveryDate: new Date(),
      deliveryTime: "morning",
      deliveryPlaceName: "",
      deliveryAddress1: "",
      deliveryAddress2: "",
      deliveryCity: "",
      deliveryCountry: "",
      deliveryPostcode: "",
      depot: null,
      useExpectedReturnDate: false,
      expectedReturnDate: null,
      collectionTime: "afternoon",
      billingPlaceName: "",
      billingAddress1: "",
      billingAddress2: "",
      billingCity: "",
      billingCountry: "",
      billingPostcode: "",
      copyDeliveryToBilling: false,
      paymentTerm: null,
      invoiceRunCode: null,
      invoiceInBatch: false,
      chargingStartDate: new Date(),
      specialInstructions: "",
      sendConfirmation: true,
      addToRoute: true
    });
  };

  const customerTemplate = (option) => {
    if (!option) return null;
    return (
      <div className="flex flex-col">
        <span className="font-semibold">{option.name?.name || option.name}</span>
        <span className="text-sm text-gray-600">
          {option.email} • {option.telephone}
        </span>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Customer & Contact
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Customer & Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block mb-2 font-medium">
                  Customer <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={formData.customerId}
                  options={customers}
                  onChange={(e) => handleCustomerSelect(e.value)}
                  optionLabel="name.name"
                  optionValue="_id"
                  placeholder="Select a customer"
                  filter
                  showClear
                  itemTemplate={customerTemplate}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Phone Number</label>
                <PhoneInput
                  country={'gb'}
                  value={formData.customerPhone}
                  onChange={(phone) => setFormData({ ...formData, customerPhone: phone })}
                  inputClass="w-full"
                  containerClass="w-full"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Email</label>
                <InputText
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Customer Reference</label>
                <InputText
                  value={formData.customerReference}
                  onChange={(e) => setFormData({ ...formData, customerReference: e.target.value })}
                  placeholder="Enter reference"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Site Contact</label>
                <InputText
                  value={formData.siteContact}
                  onChange={(e) => setFormData({ ...formData, siteContact: e.target.value })}
                  placeholder="Site contact name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Sales Person</label>
                <InputText
                  value={formData.salesPerson}
                  onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                  placeholder="Sales person name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Ordered By</label>
                <InputText
                  value={formData.orderedBy}
                  onChange={(e) => setFormData({ ...formData, orderedBy: e.target.value })}
                  placeholder="Person placing order"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="text-center mt-6">
              <span className="text-gray-600">Or</span>
              <Button
                label="Create New Customer"
                icon="pi pi-plus"
                className="ml-2"
                outlined
                onClick={() => router.push("/customer/create")}
              />
            </div>
          </div>
        );

      case 1: // Select Products
        const filteredProducts = products.filter(product =>
          product.productName?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
          product.companyProductName?.toLowerCase().includes(productSearchTerm.toLowerCase())
        );
        
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Select Products</h3>
            
            <div className="mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Available on {format(formData.deliveryDate, "MMMM d, yyyy")}
                </span>
                <span className="text-sm font-medium text-primary">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <i className="pi pi-info-circle mr-2"></i>
                  You can select multiple products by checking multiple boxes. Adjust quantities using the +/- buttons.
                </p>
              </div>
              
              <div className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="products-list max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {productSearchTerm ? "No products found matching your search" : "No products available"}
                </div>
              ) : (
                filteredProducts.map((product) => {
                const productId = product._id || product.id;
                const isSelected = selectedProducts.some(p => p.id === productId);
                const selectedProduct = selectedProducts.find(p => p.id === productId);
                
                return (
                  <div
                    key={`product-item-${productId}`}
                    className={`product-item border rounded-lg p-4 mb-2 transition-all ${
                      isSelected ? "border-primary bg-blue-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="checkbox-wrapper">
                          <Checkbox
                            inputId={`product-checkbox-${productId}`}
                            name={`product-checkbox-${productId}`}
                            value={productId}
                            checked={isSelected}
                            onChange={(e) => handleProductToggle(product)}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">{product.productName}</h4>
                          <p className="text-sm text-gray-600">
                            Available: {product.available} units • £{product.dailyRate}/day
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex flex-col gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-20">Quantity:</span>
                            <Button
                              icon="pi pi-minus"
                              rounded
                              text
                              size="small"
                              onClick={() => handleQuantityChange(
                                productId,
                                Math.max(1, selectedProduct.quantity - 1)
                              )}
                            />
                            <InputNumber
                              value={selectedProduct.quantity}
                              onValueChange={(e) => handleQuantityChange(productId, e.value)}
                              min={1}
                              max={product.available}
                              className="w-16"
                            />
                            <Button
                              icon="pi pi-plus"
                              rounded
                              text
                              size="small"
                              onClick={() => handleQuantityChange(
                                productId,
                                Math.min(product.available, selectedProduct.quantity + 1)
                              )}
                            />
                          </div>
                          
                          {/* Price Adjustments */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-600">Daily Rate (£)</label>
                              <InputNumber
                                value={selectedProduct.dailyRate}
                                onValueChange={(e) => handlePriceChange(productId, 'dailyRate', e.value)}
                                mode="currency"
                                currency="GBP"
                                locale="en-GB"
                                className="w-full"
                                size="small"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Delivery (£)</label>
                              <InputNumber
                                value={selectedProduct.deliveryPrice}
                                onValueChange={(e) => handlePriceChange(productId, 'deliveryPrice', e.value)}
                                mode="currency"
                                currency="GBP"
                                locale="en-GB"
                                className="w-full"
                                size="small"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600">Collection (£)</label>
                              <InputNumber
                                value={selectedProduct.collectionPrice}
                                onValueChange={(e) => handlePriceChange(productId, 'collectionPrice', e.value)}
                                mode="currency"
                                currency="GBP"
                                locale="en-GB"
                                className="w-full"
                                size="small"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
              )}
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm mb-2">Selected Products Summary:</h4>
                <div className="space-y-2">
                  {selectedProducts.map(product => (
                    <div key={product.id} className="space-y-1 pb-2 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{product.name} (x{product.quantity})</span>
                        <span>£{(product.dailyRate * product.quantity).toFixed(2)}/day</span>
                      </div>
                      {(product.deliveryPrice > 0 || product.collectionPrice > 0) && (
                        <div className="text-xs text-gray-600 pl-4">
                          {product.deliveryPrice > 0 && <div>Delivery: £{product.deliveryPrice.toFixed(2)}</div>}
                          {product.collectionPrice > 0 && <div>Collection: £{product.collectionPrice.toFixed(2)}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-300 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span>Total Daily Rate:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + (p.dailyRate * p.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Total Delivery:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + p.deliveryPrice, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Total Collection:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + p.collectionPrice, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold pt-1 border-t">
                      <span>Grand Total:</span>
                      <span className="text-primary">
                        £{selectedProducts.reduce((sum, p) =>
                          sum + (p.dailyRate * p.quantity) + p.deliveryPrice + p.collectionPrice, 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Delivery & Collection
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Delivery & Collection Details</h3>
            
            <div className="space-y-6">
              {/* Delivery Section */}
              <div>
                <h4 className="font-medium mb-3 text-primary">Delivery Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <Calendar
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.value })}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Delivery Time</label>
                    <Dropdown
                      value={formData.deliveryTime}
                      options={timeOptions}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Depot</label>
                    <Dropdown
                      value={formData.depot}
                      options={depots}
                      onChange={(e) => setFormData({ ...formData, depot: e.value })}
                      optionLabel="name"
                      optionValue="_id"
                      placeholder="Select depot"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Place Name</label>
                    <InputText
                      value={formData.deliveryPlaceName}
                      onChange={(e) => setFormData({ ...formData, deliveryPlaceName: e.target.value })}
                      placeholder="e.g., Construction Site A"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block mb-2 font-medium">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={formData.deliveryAddress1}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress1: e.target.value })}
                      placeholder="Street address"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block mb-2 font-medium">Address Line 2</label>
                    <InputText
                      value={formData.deliveryAddress2}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress2: e.target.value })}
                      placeholder="Apartment, suite, etc."
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">
                      City <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={formData.deliveryCity}
                      onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                      placeholder="City"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Country</label>
                    <InputText
                      value={formData.deliveryCountry}
                      onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value })}
                      placeholder="Country"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Postcode</label>
                    <InputText
                      value={formData.deliveryPostcode}
                      onChange={(e) => setFormData({ ...formData, deliveryPostcode: e.target.value })}
                      placeholder="Postcode"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Collection Section */}
              <div>
                <h4 className="font-medium mb-3 text-primary">Collection Information</h4>
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <InputSwitch
                      checked={formData.useExpectedReturnDate}
                      onChange={(e) => setFormData({ ...formData, useExpectedReturnDate: e.value })}
                    />
                    <label>Use expected return date</label>
                  </div>
                </div>
                
                {formData.useExpectedReturnDate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-medium">Expected Return Date</label>
                      <Calendar
                        value={formData.expectedReturnDate}
                        onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.value })}
                        dateFormat="dd/mm/yy"
                        showIcon
                        minDate={formData.deliveryDate}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-2 font-medium">Collection Time</label>
                      <Dropdown
                        value={formData.collectionTime}
                        options={timeOptions}
                        onChange={(e) => setFormData({ ...formData, collectionTime: e.value })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Special Instructions */}
              <div>
                <label className="block mb-2 font-medium">Special Instructions</label>
                <InputTextarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  rows={3}
                  className="w-full"
                  placeholder="Any special delivery or collection instructions..."
                />
              </div>
            </div>
          </div>
        );

      case 3: // Billing & Payment
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Billing & Payment Information</h3>
            
            <div className="space-y-6">
              {/* Billing Address */}
              <div>
                <h4 className="font-medium mb-3 text-primary">Billing Address</h4>
                
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.copyDeliveryToBilling}
                      onChange={(e) => handleCopyDeliveryToBilling(e.checked)}
                      inputId="copyAddress"
                    />
                    <label htmlFor="copyAddress">Same as delivery address</label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">Place Name</label>
                    <InputText
                      value={formData.billingPlaceName}
                      onChange={(e) => setFormData({ ...formData, billingPlaceName: e.target.value })}
                      placeholder="e.g., Head Office"
                      className="w-full"
                      disabled={formData.copyDeliveryToBilling}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block mb-2 font-medium">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={formData.billingAddress1}
                      onChange={(e) => setFormData({ ...formData, billingAddress1: e.target.value })}
                      placeholder="Street address"
                      className="w-full"
                      disabled={formData.copyDeliveryToBilling}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block mb-2 font-medium">Address Line 2</label>
                    <InputText
                      value={formData.billingAddress2}
                      onChange={(e) => setFormData({ ...formData, billingAddress2: e.target.value })}
                      placeholder="Apartment, suite, etc."
                      className="w-full"
                      disabled={formData.copyDeliveryToBilling}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">City</label>
                    <InputText
                      value={formData.billingCity}
                      onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                      placeholder="City"
                      className="w-full"
                      disabled={formData.copyDeliveryToBilling}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Country</label>
                    <InputText
                      value={formData.billingCountry}
                      onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                      placeholder="Country"
                      className="w-full"
                      disabled={formData.copyDeliveryToBilling}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Postcode</label>
                    <InputText
                      value={formData.billingPostcode}
                      onChange={(e) => setFormData({ ...formData, billingPostcode: e.target.value })}
                      placeholder="Postcode"
                      className="w-full"
                      disabled={formData.copyDeliveryToBilling}
                    />
                  </div>
                </div>
              </div>
              
              {/* Payment Settings */}
              <div>
                <h4 className="font-medium mb-3 text-primary">Payment Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">
                      Payment Terms <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      value={formData.paymentTerm}
                      options={paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerm: e.value })}
                      optionLabel="name"
                      optionValue="_id"
                      placeholder="Select payment terms"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Invoice Run Code</label>
                    <Dropdown
                      value={formData.invoiceRunCode}
                      options={invoiceRunCodes}
                      onChange={(e) => setFormData({ ...formData, invoiceRunCode: e.value })}
                      optionLabel="name"
                      optionValue="_id"
                      placeholder="Select invoice run code"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium">Charging Start Date</label>
                    <Calendar
                      value={formData.chargingStartDate}
                      onChange={(e) => setFormData({ ...formData, chargingStartDate: e.value })}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox
                      checked={formData.invoiceInBatch}
                      onChange={(e) => setFormData({ ...formData, invoiceInBatch: e.checked })}
                      inputId="invoiceInBatch"
                    />
                    <label htmlFor="invoiceInBatch" className="ml-2">
                      Invoice in batch
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Review & Confirm
        const selectedCustomer = customers.find(c => c._id === formData.customerId);
        const selectedDepot = depots.find(d => d._id === formData.depot);
        const selectedPaymentTerm = paymentTerms.find(pt => pt._id === formData.paymentTerm);
        const selectedInvoiceRunCode = invoiceRunCodes.find(irc => irc._id === formData.invoiceRunCode);
        
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Review & Confirm Order</h3>
            
            <div className="space-y-6">
              {/* Customer Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-primary">Customer Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Customer:</div>
                  <div className="font-medium">{selectedCustomer?.name?.name}</div>
                  <div>Phone:</div>
                  <div>{formData.customerPhone || 'Not provided'}</div>
                  <div>Email:</div>
                  <div>{formData.customerEmail || 'Not provided'}</div>
                  {formData.customerReference && (
                    <>
                      <div>Reference:</div>
                      <div>{formData.customerReference}</div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Products Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-primary">Selected Products</h4>
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{product.name} x {product.quantity}</span>
                        <span>£{(product.quantity * product.dailyRate).toFixed(2)}/day</span>
                      </div>
                      {(product.deliveryPrice > 0 || product.collectionPrice > 0) && (
                        <div className="text-xs text-gray-600 pl-4">
                          {product.deliveryPrice > 0 && <div>Delivery: £{product.deliveryPrice.toFixed(2)}</div>}
                          {product.collectionPrice > 0 && <div>Collection: £{product.collectionPrice.toFixed(2)}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total Daily Rate:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + (p.quantity * p.dailyRate), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Delivery:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + p.deliveryPrice, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Collection:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + p.collectionPrice, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t">
                      <span>One-time Charges:</span>
                      <span>£{selectedProducts.reduce((sum, p) => sum + p.deliveryPrice + p.collectionPrice, 0).toFixed(2)}</span>
                    </div>
                    {formData.useExpectedReturnDate && formData.expectedReturnDate && (
                      <div className="flex justify-between text-primary font-semibold pt-1">
                        <span>Estimated Total:</span>
                        <span>£{(calculateTotal() + selectedProducts.reduce((sum, p) => sum + p.deliveryPrice + p.collectionPrice, 0)).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Delivery Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-primary">Delivery Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Date:</div>
                  <div className="font-medium">{format(formData.deliveryDate, "dd/MM/yyyy")}</div>
                  <div>Time:</div>
                  <div>{timeOptions.find(t => t.value === formData.deliveryTime)?.label}</div>
                  {selectedDepot && (
                    <>
                      <div>Depot:</div>
                      <div>{selectedDepot.name}</div>
                    </>
                  )}
                  <div>Address:</div>
                  <div>
                    {formData.deliveryAddress1}<br />
                    {formData.deliveryAddress2 && <>{formData.deliveryAddress2}<br /></>}
                    {formData.deliveryCity}, {formData.deliveryPostcode}
                  </div>
                </div>
              </div>
              
              {/* Payment Summary */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-primary">Payment Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Payment Terms:</div>
                  <div className="font-medium">{selectedPaymentTerm?.name}</div>
                  {selectedInvoiceRunCode && (
                    <>
                      <div>Invoice Run Code:</div>
                      <div>{selectedInvoiceRunCode.name}</div>
                    </>
                  )}
                  <div>Invoice in Batch:</div>
                  <div>{formData.invoiceInBatch ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              {/* Additional Options */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <i className={`pi ${formData.sendConfirmation ? 'pi-check-circle text-green-500' : 'pi-times-circle text-gray-400'}`}></i>
                  <span>Send confirmation email</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className={`pi ${formData.addToRoute ? 'pi-check-circle text-green-500' : 'pi-times-circle text-gray-400'}`}></i>
                  <span>Add to delivery route</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const footer = (
    <div className="flex justify-between">
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={onHide}
        severity="secondary"
        outlined
      />
      <div className="flex gap-2">
        {activeStep > 0 && (
          <Button
            label="Back"
            icon="pi pi-arrow-left"
            onClick={handleBack}
            severity="secondary"
          />
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            label="Next"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleNext}
          />
        ) : (
          <Button
            label="Create Order"
            icon="pi pi-check"
            onClick={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );

  // Custom header with expand/collapse buttons
  const dialogHeader = (
    <div className="flex items-center justify-between w-full">
      <span>Create New Rental - {prefilledDate ? format(prefilledDate, "MMMM d, yyyy") : ""}</span>
      <div className="flex items-center gap-2">
        <Button
          icon={isExpanded ? "pi pi-compress" : "pi pi-expand"}
          rounded
          text
          severity="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          tooltip={isExpanded ? "Collapse" : "Expand"}
          tooltipOptions={{ position: 'bottom' }}
        />
        <Button
          icon="pi pi-minus"
          rounded
          text
          severity="secondary"
          onClick={() => setIsMinimized(true)}
          tooltip="Minimize"
          tooltipOptions={{ position: 'bottom' }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      
      {/* Minimized indicator */}
      {isMinimized && (
        <div
          className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-lg shadow-lg cursor-pointer z-50"
          onClick={() => setIsMinimized(false)}
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <div className="flex items-center gap-2">
            <i className="pi pi-file-edit text-xl"></i>
            <span className="font-medium">Create Rental (Click to restore)</span>
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.8;
                transform: scale(0.98);
              }
            }
          `}</style>
        </div>
      )}
      
      <Dialog
        visible={visible && !isMinimized}
        onHide={onHide}
        header={dialogHeader}
        footer={footer}
        style={{
          width: isExpanded ? "90vw" : "50vw",
          height: isExpanded ? "90vh" : "auto",
          transition: "all 0.3s ease"
        }}
        contentStyle={{
          height: isExpanded ? "calc(90vh - 200px)" : "auto",
          overflowY: "auto"
        }}
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
        modal
        maximizable={false}
        className={isExpanded ? "expanded-dialog" : ""}
      >
        <Steps
          model={steps}
          activeIndex={activeStep}
          className="mb-6"
          readOnly
        />
        
        {renderStepContent()}
      </Dialog>
    </>
  );
};

export default CreateRentalModalEnhanced;