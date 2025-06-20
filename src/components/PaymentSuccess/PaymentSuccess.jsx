"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { currentDateFormate, formatCurrency } from "../../../utils/helper";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [detail, setdetail] = useState({})
  const [paymentStatus, setPaymentStatus] = useState(null);
  const toast = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (sessionId) {
     const res =  axios
        .get(`${BaseURL}/stripes/verify-payment?session_id=${sessionId}`)
        .then((res) => {
          setPaymentStatus("success");
          setdetail(res?.data)
          toast.current.show({
            severity: "success",
            summary: "Payment Successful",
            detail: "Thank you for your payment!",
            life: 3000,
          });
        })
        .catch(() => {
          setPaymentStatus("failed");
          toast.current.show({
            severity: "error",
            summary: "Payment Failed",
            detail: "Could not verify payment. Please contact support.",
            life: 3000,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-dark">
      <Toast ref={toast} />
      <Card className="w-full max-w-md p-6 rounded-lg shadow-lg bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex flex-col items-center">
            <ProgressSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying Payment...</p>
          </div>
        ) : paymentStatus === "success" ? (
          <div className="text-center">
            <i className="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white"> {formatCurrency(detail?.amount,detail?.currency)}</h2>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white py-3">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Thank you <span className="font-semibold">{detail?.customerDetails?.name}</span> for your payment. Your transaction is confirmed.
            </p>
            <Button
              label={detail?.status}
              // icon="pi pi-home"
              className="p-button-success w-full mt-4"
              // onClick={() => router.push("/dashboard")}
            />
          </div>
        ) : (
          <div className="text-center">
            <i className="pi pi-times-circle text-red-500 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              We could not verify your payment. Please try again or contact support.
            </p>
            <Button
              label="Retry Payment"
              icon="pi pi-refresh"
              className="p-button-danger w-full mt-4"
              onClick={() => router.push("/system-setup/subscription-billing")}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
