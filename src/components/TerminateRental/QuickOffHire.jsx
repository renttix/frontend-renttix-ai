"use client"
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BaseURL } from '../../../utils/baseUrl';

const QuickOffHire = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [offHireDate, setOffHireDate] = useState(null);
  const [collectionDate, setCollectionDate] = useState(null);
  const [sameAsOffHire, setSameAsOffHire] = useState(false);
  const [notes, setNotes] = useState("");
    const { token ,user} = useSelector((state) => state?.authReducer);


 useEffect(() => {
  const fetchCustomers = async () => {
    const res = await axios.get(`${BaseURL}/customer`, {
      headers: { authorization: `Bearer ${token}` },
    });

    if (Array.isArray(res.data)) {
      setCustomers(res.data);
    } else if (Array.isArray(res.data.data)) {
      setCustomers(res.data.data);
    } else {
      console.error("Unexpected customer API response:", res.data);
      setCustomers([]);
    }
  };

  fetchCustomers();
}, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [selectedCustomer]);

  const fetchOrders = async () => {
    const res = await axios.get(
      `${BaseURL}/termination/active-rentals?customerId=${selectedCustomer._id}`,{
      headers: { authorization: `Bearer ${token}` },
    }
    );
    const rentals = res.data?.data?.rentals || [];
    setOrders(rentals);
  };

  const handleOrderChange = (order) => {
    setSelectedOrder(order);
    const assetRows = order.products.flatMap((product) =>
      product.selectedAssets.map((asset) => ({
        ...asset,
        description: product.productName,
      }))
    );
    setAssets(assetRows);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">New Off-Hire Request</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
     <Dropdown
  value={selectedCustomer?._id || null}
  options={customers}
  onChange={(e) => {
    const customer = customers.find((c) => c._id === e.value);
    setSelectedCustomer(customer);
  }}
  optionLabel="name"
  optionValue="_id"
  placeholder="Select a Customer"
/>

      <Dropdown
  value={selectedOrder?._id || null}
  options={orders}
  onChange={(e) => {
    const order = orders.find((o) => o._id === e.value);
    handleOrderChange(order); // you already have this
  }}
  optionLabel="orderId"
  optionValue="_id"
  placeholder="Select an Order"
/>

      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
       <div className="">
         <Calendar
          value={offHireDate}
          className='w-full'
          onChange={(e) => setOffHireDate(e.value)}
          placeholder="Off-Hire Date"
          showIcon
        />
       </div>

        <div>
          <Calendar
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.value)}
            placeholder="Collection Date"
            showIcon
            className='w-full'
            disabled={sameAsOffHire}
          />
          <div className="mt-2">
            <Checkbox
              checked={sameAsOffHire}
              onChange={(e) => {
                setSameAsOffHire(e.checked);
                if (e.checked) setCollectionDate(offHireDate);
              }}
            />{' '}
            <label>Collection date is same as off-hire date</label>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <DataTable value={assets} selection={selectedAssets} onSelectionChange={(e) => setSelectedAssets(e.value)} dataKey="assetNumber" responsiveLayout="scroll">
          <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
          <Column field="assetNumber" header="Asset Number" sortable></Column>
          <Column field="description" header="Description" sortable></Column>
        </DataTable>
      </div>

      <div className="mb-4">
        <InputTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any relevant notes..."
          rows={3}
          className="w-full"
        />
      </div>

      <div className="flex justify-end">
        <Button label="Off Rent" className="p-button-danger" />
      </div>
    </div>
  );
};

export default QuickOffHire;


