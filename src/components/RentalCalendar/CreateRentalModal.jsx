"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Steps } from "primereact/steps";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { format } from "date-fns";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const CreateRentalModal = ({ visible, onHide, prefilledDate, prefilledProduct, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const toast = useRef(null);
  const router = useRouter();
  const { token, user } = useSelector((state) => state?.authReducer);

  const [formData, setFormData] = useState({
    customerId: null,
    deliveryDate: prefilledDate || new Date(),
    collectionDate: null,
    deliveryTime: "morning",
    collectionTime: "afternoon",
    deliveryAddress: "",
    specialInstructions: "",
    sendConfirmation: true,
    addToRoute: true
  });

  const steps = [
    { label: "Select Customer" },
    { label: "Select Products" },
    { label: "Delivery Details" }
  ];

  const timeOptions = [
    { label: "Morning (8-12)", value: "morning" },
    { label: "Afternoon (12-5)", value: "afternoon" },
    { label: "Evening (5-8)", value: "evening" }
  ];

  // Fetch customers
  useEffect(() => {
    if (visible && token) {
      fetchCustomers();
      fetchProducts();
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
        // Skip to step 2 if we have a prefilled product
        if (activeStep === 0) {
          setActiveStep(1);
        }
      }
    }
  }, [prefilledProduct, products]);

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
        // Transform products for display
        const transformedProducts = response.data.data.map(product => ({
          ...product,
          available: product.quantity || 10, // Mock availability
          dailyRate: product.price || 50 // Mock daily rate
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductToggle = (product) => {
    const existing = selectedProducts.find(p => p.id === product._id);
    if (existing) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product._id));
    } else {
      setSelectedProducts([...selectedProducts, {
        id: product._id,
        name: product.productName,
        quantity: 1,
        dailyRate: product.dailyRate,
        available: product.available
      }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const calculateTotal = () => {
    if (!formData.deliveryDate || !formData.collectionDate) return 0;
    
    const days = Math.ceil(
      (formData.collectionDate - formData.deliveryDate) / (1000 * 60 * 60 * 24)
    );
    
    return selectedProducts.reduce((total, product) => {
      return total + (product.quantity * product.dailyRate * days);
    }, 0);
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.customerId) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select a customer",
        life: 3000
      });
      return;
    }
    
    if (activeStep === 1 && selectedProducts.length === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please select at least one product",
        life: 3000
      });
      return;
    }
    
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        customerId: formData.customerId,
        deliveryDate: formData.deliveryDate.toISOString(),
        expectedReturnDate: formData.collectionDate.toISOString(),
        deliveryAddress1: formData.deliveryAddress,
        instruction: formData.specialInstructions,
        products: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity
        })),
        vendorId: user?._id
      };

      const response = await axios.post(
        `${BaseURL}/order/create-order`,
        orderData,
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
        setActiveStep(0);
        setSelectedProducts([]);
        setFormData({
          ...formData,
          customerId: null,
          specialInstructions: ""
        });
        
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
      case 0:
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Select Customer</h3>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Search existing customer</label>
              <Dropdown
                value={formData.customerId}
                options={customers}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.value);
                  setFormData({
                    ...formData,
                    customerId: e.value,
                    deliveryAddress: customer?.addressLine1 || ""
                  });
                }}
                optionLabel="name.name"
                optionValue="_id"
                placeholder="Select a customer"
                filter
                showClear
                itemTemplate={customerTemplate}
                className="w-full"
              />
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

      case 1:
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Select Products</h3>
            
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                Available on {format(formData.deliveryDate, "MMMM d, yyyy")}
              </span>
            </div>
            
            <div className="products-list max-h-96 overflow-y-auto">
              {products.map((product) => {
                const isSelected = selectedProducts.some(p => p.id === product._id);
                const selectedProduct = selectedProducts.find(p => p.id === product._id);
                
                return (
                  <div
                    key={product._id}
                    className={`product-item border rounded-lg p-4 mb-2 ${
                      isSelected ? "border-primary bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleProductToggle(product)}
                        />
                        <div>
                          <h4 className="font-semibold">{product.productName}</h4>
                          <p className="text-sm text-gray-600">
                            Available: {product.available} units • £{product.dailyRate}/day
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <Button
                            icon="pi pi-minus"
                            rounded
                            text
                            size="small"
                            onClick={() => handleQuantityChange(
                              product._id,
                              Math.max(1, selectedProduct.quantity - 1)
                            )}
                          />
                          <InputNumber
                            value={selectedProduct.quantity}
                            onValueChange={(e) => handleQuantityChange(product._id, e.value)}
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
                              product._id,
                              Math.min(product.available, selectedProduct.quantity + 1)
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <div className="flex justify-between items-center">
                <span>Rental Period:</span>
                <div className="flex gap-2 items-center">
                  <Calendar
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.value })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="p-inputtext-sm"
                  />
                  <span>to</span>
                  <Calendar
                    value={formData.collectionDate}
                    onChange={(e) => setFormData({ ...formData, collectionDate: e.value })}
                    dateFormat="dd/mm/yy"
                    showIcon
                    minDate={formData.deliveryDate}
                    className="p-inputtext-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2 font-semibold">
                <span>Estimated Total:</span>
                <span className="text-xl">£{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="text-lg font-semibold mb-4">Delivery & Collection Details</h3>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Delivery Address</label>
              <InputTextarea
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                rows={3}
                className="w-full"
                placeholder="Enter delivery address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
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
                <label className="block mb-2 font-medium">Collection Time</label>
                <Dropdown
                  value={formData.collectionTime}
                  options={timeOptions}
                  onChange={(e) => setFormData({ ...formData, collectionTime: e.value })}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Special Instructions</label>
              <InputTextarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={3}
                className="w-full"
                placeholder="Any special delivery instructions..."
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox
                  checked={formData.sendConfirmation}
                  onChange={(e) => setFormData({ ...formData, sendConfirmation: e.checked })}
                  inputId="sendConfirmation"
                />
                <label htmlFor="sendConfirmation" className="ml-2">
                  Send confirmation email to customer
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  checked={formData.addToRoute}
                  onChange={(e) => setFormData({ ...formData, addToRoute: e.checked })}
                  inputId="addToRoute"
                />
                <label htmlFor="addToRoute" className="ml-2">
                  Add to delivery route automatically
                </label>
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
            label="Create Rental Order"
            icon="pi pi-check"
            iconPos="right"
            onClick={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={`Create New Rental - ${prefilledDate ? format(prefilledDate, "MMMM d, yyyy") : ""}`}
        footer={footer}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "95vw" }}
        modal
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

export default CreateRentalModal;