"use client";
import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

export default function CreateOrderPrototypePage() {
  const { token, user } = useSelector((state) => state?.authReducer);
  const router = useRouter();

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Product selection state
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Damage waiver state
  const [damageWaiverLevels, setDamageWaiverLevels] = useState([]);
  const [selectedDamageWaiver, setSelectedDamageWaiver] = useState(null);

  // Deposit state
  const [depositType, setDepositType] = useState('none');
  const [depositPercentage, setDepositPercentage] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  // Order items state
  const [orderItems, setOrderItems] = useState([]);

  // Calculations state
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    damageWaiverAmount: 0,
    damageWaiverTaxAmount: 0,
    taxAmount: 0,
    depositAmount: 0,
    total: 0
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    updateCalculations();
  }, [orderItems, selectedDamageWaiver, depositType, depositPercentage, depositAmount]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load products
      const productsResponse = await axios.post(`${BaseURL}/products/product-lists`, {
        vendorId: user._id
      }, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (productsResponse.data.success) {
        setAvailableProducts(productsResponse.data.data || []);
      }

      // Load damage waiver settings and levels
      const waiverResponse = await axios.get(`${BaseURL}/damage-waiver/settings`, {
        headers: { authorization: `Bearer ${token}` },
        params: { vendorId: user._id }
      });

      if (waiverResponse.data.success && waiverResponse.data.data?.damageWaiverEnabled) {
        setDamageWaiverLevels(waiverResponse.data.data.damageWaiverLevels || []);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ general: 'Failed to load data. Please refresh the page.' });
    } finally {
      setLoading(false);
    }
  };

  const addOrderItem = () => {
    if (!selectedProduct) {
      setErrors({ product: 'Please select a product' });
      return;
    }

    const product = availableProducts.find(p => p._id === selectedProduct);
    if (!product) return;

    const newItem = {
      id: `item-${Date.now()}`,
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      damageWaiverEligible: product.damageWaiverEligible || false
    };

    setOrderItems(prev => [...prev, newItem]);
    setSelectedProduct(null);
    setQuantity(1);
    setErrors({});
  };

  const removeOrderItem = (itemId) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateEligibleSubtotal = () => {
    return orderItems
      .filter(item => item.damageWaiverEligible)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const updateCalculations = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let damageWaiverAmount = 0;
    let damageWaiverTaxAmount = 0;

    if (selectedDamageWaiver && orderItems.some(item => item.damageWaiverEligible)) {
      const eligibleSubtotal = calculateEligibleSubtotal();
      const waiverLevel = damageWaiverLevels.find(l => l._id === selectedDamageWaiver);

      if (waiverLevel && eligibleSubtotal > 0) {
        damageWaiverAmount = eligibleSubtotal * (waiverLevel.rate / 100);
        // Add tax on damage waiver if applicable (20% VAT)
        damageWaiverTaxAmount = damageWaiverAmount * 0.20;
      }
    }

    const taxAmount = subtotal * 0.20; // 20% VAT on products only
    const preDepositTotal = subtotal + damageWaiverAmount + damageWaiverTaxAmount + taxAmount;

    let finalDepositAmount = 0;
    if (depositType === 'percentage' && depositPercentage > 0) {
      finalDepositAmount = preDepositTotal * (depositPercentage / 100);
    } else if (depositType === 'fixed' && depositAmount > 0) {
      finalDepositAmount = depositAmount;
    }

    const total = preDepositTotal;

    setCalculations({
      subtotal,
      damageWaiverAmount,
      damageWaiverTaxAmount,
      taxAmount,
      depositAmount: finalDepositAmount,
      total
    });
  };

  const createOrder = async () => {
    // Validation
    if (!customerInfo.name || !customerInfo.email) {
      setErrors({ customer: 'Customer name and email are required' });
      return;
    }

    if (orderItems.length === 0) {
      setErrors({ items: 'Please add at least one item to the order' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const orderData = {
        customerId: customerInfo.email, // Using email as customer ID for now
        account: customerInfo.name,
        email: customerInfo.email,
        cunstomerQuickbookId: "",
        billingPlaceName: customerInfo.name,
        address1: "",
        address2: "",
        city: "",
        country: "",
        postcode: "",
        orderDate: new Date().toISOString(),
        instruction: "",
        deliveryPlaceName: customerInfo.name,
        phoneNumber: customerInfo.phone,
        deliveryAddress1: "",
        deliveryAddress2: "",
        deliveryCity: "",
        deliveryCountry: "",
        deliveryPostcode: "",
        deliveryDate: new Date().toISOString(),
        chargingStartDate: new Date().toISOString(),
        expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        useExpectedReturnDate: true,
        customerReference: "",
        invoiceInBatch: 1,
        siteContact: customerInfo.name,
        depot: "",
        salesPerson: "",
        orderedBy: customerInfo.name,
        invoiceRunCode: "",
        paymentTerm: "",
        products: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          damageWaiverEligible: item.damageWaiverEligible
        })),
        damageWaiver: selectedDamageWaiver ? {
          levelId: selectedDamageWaiver,
          amount: calculations.damageWaiverAmount,
          taxAmount: calculations.damageWaiverTaxAmount
        } : null,
        deposit: {
          type: depositType,
          amount: calculations.depositAmount,
          percentage: depositType === 'percentage' ? depositPercentage : 0
        }
      };

      const response = await axios.post(`${BaseURL}/order/create-order`, orderData, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Order created successfully!');
        setTimeout(() => {
          router.push(`/order/${response.data.orderId}`);
        }, 2000);
      }

    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ general: error.response?.data?.message || 'Failed to create order' });
    } finally {
      setLoading(false);
    }
  };

  const generateProforma = async () => {
    // Similar validation as createOrder
    if (!customerInfo.name || !customerInfo.email) {
      setErrors({ customer: 'Customer name and email are required' });
      return;
    }

    if (orderItems.length === 0) {
      setErrors({ items: 'Please add at least one item to the order' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Generate proforma number
      const timestamp = Date.now();
      const proformaNumber = `PRO-${timestamp}`;

      const proformaData = {
        id: `proforma-${timestamp}`,
        proformaNumber: proformaNumber,
        customer: customerInfo,
        items: orderItems,
        damageWaiver: selectedDamageWaiver ? {
          levelId: selectedDamageWaiver,
          levelName: damageWaiverLevels.find(l => l._id === selectedDamageWaiver)?.name || 'Standard Coverage',
          rate: damageWaiverLevels.find(l => l._id === selectedDamageWaiver)?.rate || 0,
          amount: calculations.damageWaiverAmount,
          taxAmount: calculations.damageWaiverTaxAmount,
          taxable: true,
          taxRate: 20
        } : null,
        deposit: {
          type: depositType,
          amount: calculations.depositAmount,
          percentage: depositType === 'percentage' ? depositPercentage : 0
        },
        pricing: calculations,
        subtotal: calculations.subtotal,
        taxAmount: calculations.taxAmount,
        invoiceTotal: calculations.total,
        status: 'draft',
        createdAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      // Store proforma data in localStorage (like the prototype)
      const existingProformas = JSON.parse(localStorage.getItem('proformas') || '[]');
      existingProformas.push(proformaData);
      localStorage.setItem('proformas', JSON.stringify(existingProformas));
      localStorage.setItem('lastProformaId', proformaData.id);

      setSuccess('Pro-forma invoice generated successfully!');
      setTimeout(() => {
        // For now, just show success message since we don't have a proforma display page
        alert(`Pro-forma ${proformaNumber} has been generated and saved. You can access it from the order management system.`);
        setSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error generating pro-forma:', error);
      setErrors({ general: error.response?.data?.message || 'Failed to generate pro-forma' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Order</h1>
        <p className="text-gray-600">
          Create a new rental order with damage waiver protection and deposit options
        </p>
      </div>

      {errors.general && <Message severity="error" text={errors.general} className="mb-4" />}
      {success && <Message severity="success" text={success} className="mb-4" />}

      {/* Customer Information Section */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <InputText
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter customer name"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <InputText
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <InputText
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
            className="w-full md:w-1/2"
          />
        </div>
        {errors.customer && <small className="text-red-500 mt-2 block">{errors.customer}</small>}
      </Card>

      {/* Add Products Section */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Select Product</label>
            <Dropdown
              value={selectedProduct}
              options={availableProducts.map(product => ({
                label: `${product.name} - £${product.price.toFixed(2)}`,
                value: product._id
              }))}
              onChange={(e) => setSelectedProduct(e.value)}
              placeholder="Select a product"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <InputNumber
              value={quantity}
              onValueChange={(e) => setQuantity(e.value || 1)}
              min={1}
              className="w-full"
            />
          </div>
        </div>
        <Button
          label="Add Item"
          icon="pi pi-plus"
          onClick={addOrderItem}
          className="mb-4"
        />

        {/* Damage Waiver Options */}
        {damageWaiverLevels.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">Damage Waiver Options</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Select Damage Waiver Level</label>
              <Dropdown
                value={selectedDamageWaiver}
                options={[
                  { label: "No damage waiver", value: null },
                  ...damageWaiverLevels.map(level => ({
                    label: `${level.name} - ${level.rate}%`,
                    value: level._id
                  }))
                ]}
                onChange={(e) => setSelectedDamageWaiver(e.value)}
                placeholder="Select damage waiver level"
                className="w-full md:w-1/2"
              />
            </div>
          </div>
        )}

        {/* Deposit Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Deposit (Optional)</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Deposit Type</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <RadioButton
                  inputId="deposit-none"
                  name="depositType"
                  value="none"
                  checked={depositType === 'none'}
                  onChange={(e) => setDepositType(e.value)}
                />
                <label htmlFor="deposit-none" className="ml-2 cursor-pointer">No Deposit</label>
              </div>
              <div className="flex items-center">
                <RadioButton
                  inputId="deposit-percentage"
                  name="depositType"
                  value="percentage"
                  checked={depositType === 'percentage'}
                  onChange={(e) => setDepositType(e.value)}
                />
                <label htmlFor="deposit-percentage" className="ml-2 cursor-pointer">Percentage</label>
              </div>
              <div className="flex items-center">
                <RadioButton
                  inputId="deposit-fixed"
                  name="depositType"
                  value="fixed"
                  checked={depositType === 'fixed'}
                  onChange={(e) => setDepositType(e.value)}
                />
                <label htmlFor="deposit-fixed" className="ml-2 cursor-pointer">Fixed Amount</label>
              </div>
            </div>
          </div>

          {depositType === 'percentage' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Deposit Percentage</label>
              <div className="flex items-center gap-2">
                <InputNumber
                  value={depositPercentage}
                  onValueChange={(e) => setDepositPercentage(e.value || 0)}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                  className="w-32"
                />
              </div>
            </div>
          )}

          {depositType === 'fixed' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Deposit Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-lg">£</span>
                <InputNumber
                  value={depositAmount}
                  onValueChange={(e) => setDepositAmount(e.value || 0)}
                  min={0}
                  step={0.01}
                  mode="decimal"
                  className="w-32"
                />
              </div>
            </div>
          )}

          <small className="text-gray-600">Security deposit will be shown on a separate receipt</small>
        </div>
      </Card>

      {/* Order Items Section */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        {orderItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="pi pi-info-circle text-2xl mb-2"></i>
            <p>No items added to the order yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="font-medium">{item.productName}</h4>
                  <p className="text-sm text-gray-600">
                    £{item.price.toFixed(2)} × {item.quantity} = £{(item.price * item.quantity).toFixed(2)}
                  </p>
                  {item.damageWaiverEligible && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Damage Waiver Eligible
                    </span>
                  )}
                </div>
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger p-button-text"
                  onClick={() => removeOrderItem(item.id)}
                />
              </div>
            ))}
          </div>
        )}
        {errors.items && <small className="text-red-500 mt-2 block">{errors.items}</small>}
      </Card>

      {/* Order Summary Section */}
      {orderItems.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>£{calculations.subtotal.toFixed(2)}</span>
            </div>

            {calculations.damageWaiverAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Damage Waiver ({damageWaiverLevels.find(l => l._id === selectedDamageWaiver)?.rate || 0}%):</span>
                  <span>£{calculations.damageWaiverAmount.toFixed(2)}</span>
                </div>
                {calculations.damageWaiverTaxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Damage Waiver Tax (20%):</span>
                    <span>£{calculations.damageWaiverTaxAmount.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between">
              <span>VAT (20%):</span>
              <span>£{calculations.taxAmount.toFixed(2)}</span>
            </div>

            <Divider />

            <div className="flex justify-between font-bold text-lg">
              <span>Invoice Total:</span>
              <span>£{calculations.total.toFixed(2)}</span>
            </div>

            {calculations.depositAmount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>
                  Deposit Required ({depositType === 'percentage' ? depositPercentage + '%' : 'Fixed'}):
                </span>
                <span>£{calculations.depositAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          label="Generate Pro-forma"
          icon="pi pi-file"
          className="p-button-secondary"
          onClick={generateProforma}
          disabled={orderItems.length === 0 || loading}
          loading={loading}
        />
        <Button
          label="Create Order & Invoices"
          icon="pi pi-check"
          className="p-button-primary"
          onClick={createOrder}
          disabled={orderItems.length === 0 || loading}
          loading={loading}
        />
      </div>
    </div>
  );
}