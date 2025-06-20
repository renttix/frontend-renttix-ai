"use client";
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import axios from "axios";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import moment from "moment";
import { BaseURL } from "../../../utils/baseUrl";
import { Tag } from "primereact/tag";
import CanceButton from "../Buttons/CanceButton";
import { formatCurrency } from "../../../utils/helper";

function PaymentModel({ item }) {
  const [isVisible, setIsVisible] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token,user } = useSelector((state) => state?.authReducer);
  const [success, setSuccess] = useState(false);
  const toast = React.useRef(null);

  const payload = {
    orderId: item?.id,
    chargingStartDate: item.invoiceUptoDate,
    invoiceId: item._id,
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { authorization: `Bearer ${token}` },
      };

      const res = await axios.post(
        `${BaseURL}/invoice/invoice-payment-pay`,
        payload,
        config
      );

      if (res.data.success) {
        setSuccess(res.data.success);
        setLoading(false);
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res.data.message,
          life: 2000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "An error occurred",
        life: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => {
    return !success ? (
      <div>
        {/* <Button label="Cancel" className="p-button-text"/> */}
          <CanceButton  onClick={() => setIsVisible(false)}  />
        <Button
        size="small"
          label="Pay Invoice"
          icon="pi pi-check"
          loading={loading}
          onClick={handlePayment}
          className="p-button-warning"
        />
      </div>
    ) : null;
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        label="Pay"
        icon="pi pi-money-bill"
        className="p-button-success p-button-sm"
        onClick={() => setIsVisible(true)}
      />

      <Dialog
        header="Pay Invoice"
        visible={isVisible}
       
        modal
        footer={renderFooter()}
        onHide={() => setIsVisible(false)}
      >
        {success===true ? (
          <div className="flex flex-col items-center justify-center">
            <span className="text-green-800 text-2xl font-semibold">
              Payment paid successfully!
            </span>
            <IoCheckmarkDoneCircle className=" text-8xl text-green-700 mt-2" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 justify-center items-center">
              <div className="flex flex-col">
                <label htmlFor="name" className="font-semibold">
                  Name
                </label>
                <InputText className="" size={'small'} id="name" value={item.billingPlaceName} readOnly />
              </div>
              <div className="flex flex-col">
                <label htmlFor="invoice" className="font-semibold">
                  Invoice
                </label>
              <div className="">
                  <Tag
                  value={item.invocie}
                 
                />
              </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="status" className="font-semibold">
                  Status
                </label>
                <Tag
                  value={item.status}
                 
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="paymentDue" className="font-semibold">
                Payment Due
              </label>
              <div className="p-inputgroup flex-1">
                <Button>{user?.currencyKey}</Button>
              <InputText id="paymentDue" value={Number(item.total).toFixed(2)} readOnly />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}


export default PaymentModel;
