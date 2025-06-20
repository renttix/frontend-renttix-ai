"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { BaseURL, imageBaseURL } from "../../../utils/baseUrl";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import Loader from "../common/Loader";
import CanceButton from "../Buttons/CanceButton";
import { formatCurrency } from "../../../utils/helper";
import PaymentPay from "../system-setup/subscription-billing/PaymentPay";

const Note = () => {
  const [allInvoice, setAllInvoice] = useState(null);
  const [saleInvoice, setSaleInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickBook, setQuickBook] = useState("");
  const [fullLoading, setFullLoading] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { token, user } = useSelector((state) => state.authReducer);
  const [invoiceID, invoiceType] = decodeURIComponent(params.id).split("-");

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      try {
        const { data: res } = await axios.post(
          `${BaseURL}/order/generate-order-note/`,
          { id: invoiceID, type: invoiceType },
          { headers: { authorization: `Bearer ${token}` } }
        );
        if (res.success) {
          setAllInvoice(invoiceType === 'RN' ? res.data : res.data.allInvoice);
          setSaleInvoice(res.data.saleInvoice);
        } else {
          setQuickBook(res.message);
          if (user?.isQuickBook && res.message !== 'AUTHENTICATION') {
            window.location.href = `${BaseURL}/auth?vendorId=${user?._id}&redirctURL=${window.location.href}`;
          }
        }
      } catch (err) {
        console.error(err);
        setQuickBook(err?.response?.data?.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [invoiceID, invoiceType, token, user]);

  const handleDownload = async (type) => {
    if (type === 'SN') setSaleLoading(true);
    else setFullLoading(true);

    try {
      const { data: res } = await axios.post(
        `${BaseURL}/order/generate-invoice-pdf/`,
        { id: invoiceID, type },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.url) window.open(res.url, '_blank');
    } catch (err) {
      console.error(err);
    } finally {
      if (type === 'SN') setSaleLoading(false);
      else setFullLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
    <Loader fullScreen />
  </div>;
  if (quickBook === 'AUTHENTICATION')
    return (
      <div className="flex items-center justify-center h-screen">
        <span>Connecting to QuickBooks...</span>
      </div>
    );

  const InvoicePane = ({ invoice, title, downloadType, accentColor, isSale }) => {
    const loadingState = isSale ? saleLoading : fullLoading;
    return (
      <div className="border rounded-lg overflow-hidden shadow-md">
        <div className={`${accentColor} h-2 w-full`} />
        <div className="p-6 flex flex-col space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <img src={`${imageBaseURL}${user?.brandLogo}`} alt="Logo" className="h-8 object-contain" />
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase">{title}</p>
              <h2 className="text-2xl font-bold">{invoice?.invoiceNumber}</h2>
              <p className="text-sm text-gray-400">{moment(invoice?.invoiceDate).format('LL')}</p>
            </div>
          </div>

          {/* Bill To & Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700">Bill To</h4>
              <p className="text-gray-600">{invoice?.customerName}</p>
              <p className="text-gray-600">{invoice?.customerAddress}</p>
              <p className="text-gray-600">{invoice?.customerCity}, {invoice?.customerCountry}</p>
              <p className="text-gray-600">{invoice?.customerEmail}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Order Info</h4>
              <p className="text-gray-600">Order #: {invoice?.orderNumber}</p>
              <p className="text-gray-600">Delivery: {moment(invoice?.deliveryDate).format('LL')}</p>
              <p className="text-gray-600">Terms: {invoice?.paymentTerms} days</p>
            </div>
          </div>

          {/* Products Table */}
          <DataTable value={invoice?.products || []} showGridlines className="mt-4">
            <Column field="productName" header="Description" />
            <Column field="quantity" header="Qty" />
            <Column field="type" header="Type" />
            {downloadType !== 'DN' && <Column body={(row) => formatCurrency(row?.total, user?.currencyKey)} header="Amount" />}  
          </DataTable>

          {/* Totals (only for non-DN) */}
          {downloadType !== 'DN' && (
            <div className="flex justify-end space-x-6 mt-4">
              <div className="text-right">
                <p className="text-gray-600">Subtotal: {formatCurrency(invoice?.totalPrice, user?.currencyKey)}</p>
                <p className="text-gray-600">Tax: {formatCurrency(invoice?.vatTotal, user?.currencyKey)}</p>
                <p className="text-xl font-bold">Total: {formatCurrency(invoice?.vattotalPrice, user?.currencyKey)}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-between items-center">
            <CanceButton onClick={() => router.back()} />
            <div className="flex space-x-2">
              <Button
                label={loadingState ? 'Downloading...' : 'Download'}
                icon="pi pi-download"
                onClick={() => handleDownload(downloadType)}
                className="p-button-outlined"
                disabled={loadingState}
              />
          {invoice?.invoiceNumber.startsWith('RN') && !invoice?.isEmailSent && (
                <PaymentPay
                invoiceID={invoiceID}
                  email={invoice?.customerEmail}
                  customerId={invoice?.customerId}
                  orderId={invoice?.order_Id}
                  amount={parseInt(invoice?.vattotalPrice, 10)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 grid gap-8 lg:grid-cols-2">
      {allInvoice && (
        <InvoicePane
          invoice={allInvoice}
          title={invoiceType === 'DN' ? 'Delivery Note' : 'Return Note'}
          downloadType={invoiceType}
          accentColor="bg-teal-500"
          isSale={false}
        />
      )}
      {saleInvoice?.products?.length>0  && (
        <InvoicePane
          invoice={saleInvoice}
          title="Sale Invoice"
          downloadType="SN"
          accentColor="bg-orange-500"
          isSale={true}
        />
      )}
    </div>
  );
};

export default Note;