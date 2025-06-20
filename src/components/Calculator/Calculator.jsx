'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AutoComplete } from 'primereact/autocomplete';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { BaseURL, imageBaseURL } from '../../../utils/baseUrl';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../../../utils/helper';
import GoPrevious from '../common/GoPrevious/GoPrevious';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { useRouter } from 'next/navigation';

export default function PriceCalculator() {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [deposit, setDeposit] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [dateRange, setDateRange] = useState(null); // [startDate, returnDate]
  const [totals, setTotals] = useState({ days: 0, subTotal: 0, tax: 0, total: 0 });
  const { user, token } = useSelector(state => state?.authReducer);

  useEffect(() => {
    axios
      .get(`${BaseURL}/order/product/list?vendorId=${user.id}`, {
        headers: { authorization: `Bearer ${token}` }
      })
      .then(res => setAvailableProducts(res.data.data || []))
      .catch(err => console.error(err));
  }, [user, token]);

  const searchProduct = event => {
    const q = event.query?.toLowerCase() || '';
    setSuggestions(
      availableProducts.filter(p =>
        p.companyProductName.toLowerCase().includes(q)
      )
    );
  };

  const router = useRouter();

   // when you click “Create Quotation”
   const handleCreateQuotation = () => {
     // persist exactly what Quotation needs
     localStorage.setItem(
       'quotationData',
       JSON.stringify({ cartItems, dateRange, deposit })
     );
     router.push('/quotation');
   };

  const itemTemplate = item => (
    <div className="flex items-center">
      <img
        src={`${process.env.NEXT_PUBLIC_API_URL_IMAGE}${item?.thumbnail}`} 
        alt={item.companyProductName}
        className="w-8 h-8 object-cover rounded mr-2"
      />
      <span>{item.companyProductName}</span>
    </div>
  );

  const selectedItemTemplate = item => {
    if (!item) return null;
    return (
      <div className="flex items-center">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL_IMAGE}${item?.thumbnail}`}          
          alt={item.companyProductName}
          className="w-6 h-6 object-cover rounded mr-1"
        />
        <span>{item.companyProductName}</span>
      </div>
    );
  };

  // Calculates number of rental days between start and end, excluding weekends if daysPerWeek is 5
  const calculateRentalDays = (start, end, daysPerWeek) => {
    if (!start || !end || end <= start) return 0;
    const s = new Date(start).setHours(0,0,0,0);
    const e = new Date(end).setHours(0,0,0,0);
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (daysPerWeek === 7 || (day !== 0 && day !== 6)) count++;
    }
    return count;
  };

  // Ensures days are at least the minimum rental period
  const getEffectiveDays = (item, start, end) => {
    const rawDays = calculateRentalDays(start, end, item.rateDefinition.rentalDaysPerWeek);
    return rawDays < item.rateDefinition.minimumRentalPeriod
      ? item.rateDefinition.minimumRentalPeriod
      : rawDays;
  };

  const addToCart = () => {
    if (!selectedProduct || selectedQuantity <= 0) return;
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === selectedProduct.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += selectedQuantity;
        return updated;
      }
      return [...prev, { ...selectedProduct, quantity: selectedQuantity }];
    });
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const resetCalculator = () => {
    setSelectedProduct(null);
    setSelectedQuantity(1);
    setCartItems([]);
    setDateRange(null);
    setTotals({ days: 0, subTotal: 0, tax: 0, total: 0 });
    setSuggestions([]);
    setDeposit(0);
  };

  // Recompute totals whenever cart or dateRange changes
  useEffect(() => {
    const [start, end] = dateRange || [null, null];
    let subTotal = 0;
    let taxTotal = 0;
    cartItems.forEach(item => {
      const days = getEffectiveDays(item, start, end);
      subTotal += item.rentPrice * item.quantity * days;
      taxTotal += item.rentPrice * item.quantity * days * (item.taxClass.taxRate / 100);
    });
    setTotals({ days: 0, subTotal, tax: taxTotal, total: subTotal + taxTotal });
  }, [cartItems, dateRange]);

  const netPayable = totals.total - deposit;

  return (
    <>
    <div className="flex justify-between item-center py-2">
       <div className="flex gap-3">
        <GoPrevious route={"/"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          Calculator
        </h2>
       
      </div>
      <div className="">
        {/* <Link href={'/quotation'}>
      <Button  className="text-lg font-semibold">Create Quatation</Button>
      </Link> */}
          <div>
       <Button
         className="text-lg font-semibold"
         onClick={handleCreateQuotation}
         disabled={cartItems.length === 0}
       >
         Create Quotation
       </Button>
     </div>
        </div>
    </div>
      <div className="col-span-12 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-10 lg:col-span-10 xl:col-span-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Inputs Panel */}
          <div className="lg:w-1/3 bg-white dark:bg-dark-2 dark:border-dark-3 p-6 rounded-lg shadow">
            <div className="space-y-6">
              {/* product, quantity, date range, deposit, buttons... unchanged */}
              <div>
                <label className="block mb-2 font-semibold">Search & Select Product</label>
                <AutoComplete
                  value={selectedProduct}
                  suggestions={suggestions}
                  completeMethod={searchProduct}
                  field="companyProductName"
                  dropdown
                  placeholder="Search products..."
                  onChange={e => setSelectedProduct(e.value)}
                  itemTemplate={itemTemplate}
                  selectedItemTemplate={selectedItemTemplate}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Quantity</label>
                <InputNumber
                  value={selectedQuantity}
                  onValueChange={e => setSelectedQuantity(e.value)}
                  showButtons
                  min={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Charging Start Date - Expected Return Date</label>
                <Calendar
                  value={dateRange}
                  onChange={e => setDateRange(e.value)}
                  selectionMode="range"
                  readOnlyInput
                  placeholder="Select start and end dates"
                  className="w-full"
                />
              </div>
              <div className="flex space-x-4 justify-end">
                <Button label="Reset" icon="pi pi-refresh" className="p-button-outlined" onClick={resetCalculator} />
                <Button label="Add" icon="pi pi-plus" className="p-button-primary" onClick={addToCart} disabled={!selectedProduct || !dateRange} />
              </div>
              <Divider />
              <div>
                <label className="block mb-2 font-semibold">Deposit</label>
                <InputNumber
                  value={deposit}
                  onValueChange={e => setDeposit(e.value)}
                  showButtons
                  min={0}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Cart & Summary Panel */}
          <div className="lg:w-2/3">
            <DataTable value={cartItems || []} emptyMessage="No items in cart" className="mb-6 bg-white dark:bg-dark-2 rounded-lg shadow">
              <Column field="companyProductName" body={row => (
                <div className="flex items-center">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL_IMAGE}${row?.thumbnail}`}          
                    alt={row.companyProductName}
                    className="w-6 h-6 object-cover rounded mr-1"
                  />
                  <span>{row.companyProductName}</span>
                </div>
              )} header="Product" />
              <Column field="quantity" header="Qty" />
              <Column header="Min Rental Period" body={row => `${row.rateDefinition?.minimumRentalPeriod} Days`} />
              <Column header="Total Days" body={row => {
                const [start, end] = dateRange || [];
                return getEffectiveDays(row, start, end)+' ' +"Days";
              }} />
              <Column header="Price" body={row => formatCurrency(row.rentPrice.toFixed(2), user?.currencyKey)} />
              <Column header="Tax" body={row => `${row.taxClass.taxRate}%`} />
              <Column header="Total" body={row => {
                const [start, end] = dateRange || [];
                const days = getEffectiveDays(row, start, end);
                const amt = row.rentPrice * row.quantity * days * (1 + row.taxClass.taxRate / 100);
                return formatCurrency(amt.toFixed(2), user?.currencyKey);
              }} />
            </DataTable>

            <div className="bg-white p-6 rounded-lg shadow dark:bg-dark-2">
              <h2 className="text-2xl font-semibold mb-4">Summary</h2>
              <div className="grid grid-cols-2 gap-4 text-gray-800">
                <div className='dark:text-white'>Deposit:</div><div className="text-right dark:text-white">{formatCurrency(deposit.toFixed(2), user?.currencyKey)}</div>
                <div className='dark:text-white'>Subtotal:</div><div className="text-right dark:text-white">{formatCurrency(totals.subTotal.toFixed(2), user?.currencyKey)}</div>
                <div className='dark:text-white'>Tax:</div><div className="text-right dark:text-white">{formatCurrency(totals.tax.toFixed(2), user?.currencyKey)}</div>
                <div className="font-bold text-lg dark:text-white">Total Amount:</div><div className="text-right dark:text-white font-bold text-lg">{formatCurrency(netPayable.toFixed(2), user?.currencyKey)}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
