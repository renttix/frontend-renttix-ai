"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import Link from "next/link";
import React from "react";
import { BaseURL } from "../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import ChargeCustomerForm from "./ChargeCustomerForm";

const SubscriptionBilling = () => {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { token, user } = useSelector((state) => state.authReducer);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BaseURL}/stripes/create-checkout-session`,
        {vendorId:user._id,amount: 100, currency: "usd" }
      );
      window.location.href = data.url; // Redirect customer to Stripe checkout
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Payment Failed",
        detail: error?.response?.data?.error || "Unable to process payment",
        life: 3000,
      });
    }
    setLoading(false);
  };
  return (
    <div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-12 ">
        <div class="col-span-12 p-4  lg:col-span-3 xl:col-span-2 ">
          <h3 className="font-bold"> Subscription And Billing</h3>
        </div>
        <div class="col-span-12 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4  md:col-span-12 md:w-[100%] lg:col-span-9 lg:w-[100%]  xl:col-span-9 xl:w-[100%] 2xl:w-[100%]">
          <label className="my-3 font-bold">Payment Gateway</label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="h-auto cursor-pointer  rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
              <div className="col-2 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
                <Link href={"/system-setup/subscription-billing/stripe"}>
                  <div className="flex items-center justify-center">
                    <img
                      className="h-32 w-32"
                      src="/images/stripe.svg"
                      alt=""
                    />
                  </div>
                </Link>
                <Link href={"/system-setup/subscription-billing/stripe"}>
                  <div className="flex flex-col">
                    <label className="font-bold">Stripe</label>
                    <label>
                    Reduce costs, grow revenue, and run your business more efficiently on a fully integrated platform. Use Stripe to handle all of your payments-related needs.
                    </label>
                  </div>
                </Link>
              </div>
            </div>
            {/* <div className="h-auto border-2 p-4 rounded-md">
            <label>Quick Book</label>
          </div>
          <div className="h-auto border-2 p-4 rounded-md">
            <label>Quick Book</label>
            
          </div> */}
          </div>
          <div className="text-center">
      <Toast ref={toast} />

      {/* <Button
        label={loading ? "Redirecting..." : "Pay Vendor"}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-credit-card"}
        className="p-button-success p-button-rounded"
        onClick={handlePay}
        disabled={loading}
      /> */}
    </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBilling;

