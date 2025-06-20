"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (session_id) {
      axios
        .get(`${BaseURL}/stripes/verify-single-invoice-payment?session_id=${session_id}`)
        .then((res) => {
          setDetails(res.data);
          setPaymentStatus("success");
        })
        .catch((err) => {
          console.error(err);
          setPaymentStatus("error");
        })
        .finally(() => setLoading(false));
    }
  }, [session_id]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      {loading ? (
        <div className="text-lg font-medium text-gray-700">Verifying payment...</div>
      ) : paymentStatus === "success" ? (
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-700 mb-4">Thank you for your payment.</p>
          <div className="text-left text-sm text-gray-600 mb-4">
            <p><span className="font-semibold">Invoice ID:</span> {details?.invoiceId}</p>
            <p><span className="font-semibold">Amount:</span> {details?.amount} {details?.currency?.toUpperCase()}</p>
            <p><span className="font-semibold">Customer:</span> {details?.customerDetails?.email}</p>
            <p><span className="font-semibold">Payment ID:</span> {details?.session_id}</p>
          </div>
          <button
            onClick={() => router.push("/invoice/invoice-batches")}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Go to Invoices
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
          <p className="text-gray-700 mb-4">Something went wrong during the payment process.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Return Home
          </button>
        </div>
      )}
    </div>
  );
}
