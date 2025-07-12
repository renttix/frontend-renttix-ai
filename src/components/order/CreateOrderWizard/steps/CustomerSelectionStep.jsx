"use client";
import React, { useState, useEffect } from 'react';
import { useWizard } from '../context/WizardContext';
import { motion } from 'framer-motion';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';

export default function CustomerSelectionStep() {
  const { state, updateFormData } = useWizard();
  const { formData } = state;
  const { user, token } = useSelector((state) => state?.authReducer);
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(formData.customerDetails);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState([]);
  
  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/order/customer?vendorId=${user?._id}&limit=1000`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCustomers(response.data.data);
        // Get recent customers (last 6)
        setRecentCustomers(response.data.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectCustomer = (customer) => {
    console.log(customer)
    setSelectedCustomer(customer);
    updateFormData({
      customerId: customer._id,
      customerDetails: customer,
      account: customer.name?.name || '',
      billingPlaceName: customer.name?.name || '',
      email: customer.email || '',
      address1: customer.addressLine1 || '',
      address2: customer.addressLine2 || '',
      city: customer.city || '',
      country: customer.country || '',
      postcode: customer.postCode || '',
      cunstomerQuickbookId: customer?.customerID || '',
      paymentTerm: customer.paymentTerm?._id || '',
      invoiceRunCode: customer.invoiceRunCode?._id || '',
    });
  };
  
  const customerTemplate = (option) => {
    if (!option) return null;
    return (
      <div className="flex items-center justify-between p-2">
        <div>
          <div className="font-medium">{option.name?.name}</div>
          <div className="text-sm text-gray-500">{option.email}</div>
        </div>
        {option.paymentTerm && (
          <div className="text-xs text-gray-500">
            {option.paymentTerm.name}
          </div>
        )}
      </div>
    );
  };
  
  const selectedCustomerTemplate = (option) => {
    if (!option) return <span className="text-gray-500">Select a customer</span>;
    return <span>{option.name?.name}</span>;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Who's renting from you?</h2>
        <p className="text-gray-600">Search for an existing customer or create a new one.</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <ProgressSpinner />
        </div>
      ) : (
        <>
          {/* Customer Search */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Customers
                </label>
                <Dropdown
                  value={selectedCustomer}
                  onChange={(e) => handleSelectCustomer(e.value)}
                  options={customers}
                  optionLabel="name.name"
                  placeholder="Type to search customers..."
                  filter
                  filterBy="name.name,email"
                  className="w-full"
                  valueTemplate={selectedCustomerTemplate}
                  itemTemplate={customerTemplate}
                  showClear
                  emptyMessage="No customers found"
                />
              </div>
              <div className="pt-6">
                <Button
                  label="New Customer"
                  icon="pi pi-plus"
                  className="p-button-outlined"
                  onClick={() => setShowCreateModal(true)}
                />
              </div>
            </div>
          </div>
          
          {/* Recent Customers */}
          {!selectedCustomer && recentCustomers.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Recent Customers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCustomers.map((customer) => (
                  <Card
                    key={customer._id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{customer.name?.name}</h4>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                        <i className="pi pi-user text-gray-400"></i>
                      </div>
                      <div className="text-xs text-gray-600">
                        {customer.paymentTerm && (
                          <span className="inline-block bg-gray-100 rounded px-2 py-1">
                            {customer.paymentTerm.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Selected Customer Details */}
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium">Selected Customer</h3>
                <Button
                  label="Change"
                  className="p-button-text p-button-sm"
                  onClick={() => {
                    setSelectedCustomer(null);
                    updateFormData({ customerId: '', customerDetails: null });
                  }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedCustomer.name?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Terms</p>
                  <p className="font-medium">
                    {selectedCustomer.paymentTerm?.name || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credit Status</p>
                  <p className="font-medium">
                    <span className="inline-flex items-center">
                      <i className="pi pi-check-circle text-green-500 mr-1"></i>
                      Good Standing
                    </span>
                  </p>
                </div>
              </div>
              
              {selectedCustomer.addressLine1 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Default Billing Address</p>
                  <p className="text-sm">
                    {selectedCustomer.addressLine1}
                    {selectedCustomer.addressLine2 && `, ${selectedCustomer.addressLine2}`}
                  </p>
                  <p className="text-sm">
                    {[selectedCustomer.city, selectedCustomer.country, selectedCustomer.postCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
      
      {/* Create Customer Modal - Placeholder for now */}
      <Dialog
        header="Create New Customer"
        visible={showCreateModal}
        style={{ width: '50vw' }}
        onHide={() => setShowCreateModal(false)}
      >
        <p>Customer creation form would go here</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            label="Cancel" 
            className="p-button-text" 
            onClick={() => setShowCreateModal(false)} 
          />
          <Button 
            label="Create" 
            onClick={() => {
              // Handle customer creation
              setShowCreateModal(false);
              fetchCustomers();
            }} 
          />
        </div>
      </Dialog>
    </motion.div>
  );
}