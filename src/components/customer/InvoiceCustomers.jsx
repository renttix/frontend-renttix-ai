"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import Link from "next/link";
import moment from "moment";
import { SiQuickbooks } from "react-icons/si";
import { Tag } from "primereact/tag";
import PaymentModel from "./PaymentModel";
import { formatCurrency } from "../../../utils/helper";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";

const InvoiceCustomers = ({ thData, trData, name }) => {
  const [filterData, setFilterData] = useState(trData || []);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useSelector((state) => state?.authReducer);
  const toast = useRef()

  const colorButton = (item) => {
    if (item === "Posted") return "p-button-success";
    if (item === "Draft") return "p-button-secondary";
    if (item === "Confirmed") return "p-button-warning";
    if (item === "offrent") return "p-button-danger";
    return "p-button-outlined";
  };

  const renderInvoiceLink = (item) => (
    <Link href={`/invoice/invoice-batches/${item.batchId}/invoice/${item._id}`}>
      <div className="flex items-center gap-5 cursor-pointer">
        <div className="flex flex-col">
          <span className="font-bold">{item.invocie}</span>
       
        </div>
        {item.DocNumber && <SiQuickbooks className="text-green-700 text-[18px]" />}
      </div>
    </Link>
  );

  
  
  const handleInvoicePayment = async (rowData) => {
    console.log({rowData})
    const InvoicePayload = {
      invoiceId:rowData?._id,
      amount:rowData?.total,
      currency:user?.currencyKey,
      email:rowData?.customerEmail,
      vendorId:user?._id,
      customerId:rowData?.customer_id,
      invoiceNo:rowData?.invocie,
      orderId:rowData?.orderNumber,
      chargingStartDate:rowData?.invoiceUptoDate
    }
    // setLoading(true);


  
    try {
      const { data } = await axios.post(`${BaseURL}/stripes/payment/signle-invoice`, InvoicePayload);
  
      if (data?.url) {
        console.log(data?.url)
        // window.location.href = data.url; 
      } else {
        throw new Error("Invalid payment URL received.");
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Payment Error",
        detail: error?.response?.data?.message || "Failed to initiate payment.",
        life: 3000,
      });
    }
  
    // setLoading(false);
  };



  const renderStatusButton = (rowData) => (
    <Tag value={rowData.status} className={colorButton(rowData.status)} size="small" />
  );

  const renderInvoiceDate = (rowData) => moment(rowData.invoiceDate).format("llll");

  const renderPaymentButton = (rowData) => {
  
    return <>
     {rowData.DocNumber == null && rowData.status === "Posted" ? (
                        <>
                          {" "}
                          {rowData.paymentStatus == "Paid" ? (
                            <Button size={"sm"} colorScheme={"green"}>
                              Paid
                            </Button>
                          ) : (
                            <PaymentModel item={rowData} />
                          )}
                        </>
                      ) : (
                        <Button size={"sm"} isDisabled>
                          Pay
                        </Button>
                      )}
                      {rowData.status=='Posted' && rowData.paymentStatus=="Unpaid" &&
                      <Button severity="info" onClick={async()=> await handleInvoicePayment(rowData)} className="ml-3" size="small">Reminder</Button>}
    </>
  };

  const handlePayment = (item) => {
    setSelectedItem(item);
    setPaymentDialogVisible(true);
  };



  
  return (
    <div>
            <Toast ref={toast} />
      
      <div >
        <DataTable  value={filterData || []}     paginator
        rows={4}>
          <Column header="Invoice" body={renderInvoiceLink} />
          <Column header="Status" body={renderStatusButton} />
          <Column header="Invoice" body={() => <Tag value="Invoice" size="small" />} />
          <Column header="Date" body={renderInvoiceDate} />
          <Column field="goods" header="Goods" body={(rowData)=>(
            <>
            
            <label htmlFor="" >{formatCurrency(rowData?.goods,user?.currencyKey)}</label></>
          )} />
          <Column field="tax" header="Tax" body={(rowData)=>(
            <>
            
            <label htmlFor="" >{formatCurrency(rowData?.tax,user?.currencyKey)}</label></>
          )} />
          <Column field="suspensionAmount" header="Suspension" body={(rowData)=>(
            <>
            
            <label htmlFor="" className="text-red">{formatCurrency(rowData?.suspensionAmount,user?.currencyKey)}</label></>
          )} />
          <Column
            field="total"
            header="Total"
            body={(rowData) => <span className="font-semibold">{formatCurrency(Number(rowData.total).toFixed(2),user?.currencyKey)}</span>}
          />
          <Column header="Actions" body={renderPaymentButton} />
        </DataTable>
      </div>

      {/* <Dialog
        header="Payment"
        visible={paymentDialogVisible}
        onHide={() => setPaymentDialogVisible(false)}
      >
        <div>
          <h3 className="text-center">Pay Invoice</h3>
          <p>Invoice: {selectedItem?.invocie}</p>
          <p>Amount: ${selectedItem?.total}</p>
          <Button
            label="Confirm Payment"
            className="p-button-success"
            onClick={() => setPaymentDialogVisible(false)}
          />
        </div>
      </Dialog> */}

      {/* <PaymentModel/> */}
    </div>
  );
};

export default InvoiceCustomers;
