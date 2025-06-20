"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../../utils/baseUrl";

const PaymentPay = ({ email, amount, priceId, mode = "payment", customerId, orderId,invoiceID }) => {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { user } = useSelector((state) => state.authReducer);

  useEffect(() => {
    const initiatePayment = async () => {
      if (!user?._id || !email || !amount || !customerId || !orderId) {
        return; // Prevent API call if required props are missing
      }

      setLoading(true);
      try {
        let requestData;
        let endpoint;

        if (mode === "payment") {
          requestData = { vendorId: user._id, email, amount, currency: user?.currencyKey, customerId, orderId,invoiceID };
          endpoint = `${BaseURL}/stripes/create-checkout-session`;
        } else if (mode === "subscription") {
          if (!priceId) throw new Error("Price ID is required for subscription.");
          requestData = { vendorId: user._id, customerId: user.stripeCustomerId, priceId, customerId, orderId,invoiceID };
          endpoint = `${BaseURL}/stripes/create-subscription`;
        }

        const { data } = await axios.post(endpoint, requestData);
        toast.current.show({
          severity: "success",
          summary: `Payment! `,
          detail: `Payment URL sent to ${email}`,
          life: 3000,
        });
        if (data?.url) {
          // window.location.href = data.url; // Redirect to Stripe checkout page
        } else {
          throw new Error("Invalid payment URL received.");
        }
      } catch (error) {
        toast?.current?.show({
          severity: "error",
          summary: "Payment Failed",
          detail: error?.response?.data?.error || "Unable to process payment",
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
  }, [email, amount, priceId, mode, customerId, orderId, user]); // Runs when any of these change

  return <Toast ref={toast} />;
};

export default PaymentPay;
