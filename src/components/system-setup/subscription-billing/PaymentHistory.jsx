"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";

const PaymentHistory = ({data}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${BaseURL}/stripes/get-payments?customerId=${data?._id}`);
        console.log("API Response:", response.data);
        if (Array.isArray(response.data.data)) {
          setPayments(response.data.data);
        } else {
          console.error("Unexpected API response format", response.data);
          setPayments([]);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(err.response.data.error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">Transaction History</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-dark-3 rounded-lg shadow animate-pulse">
              <Skeleton width="100%" height="20px" />
              <Skeleton width="70%" height="20px" className="mt-2" />
              <Skeleton width="50%" height="20px" className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="">
      <h2 className="text-2xl font-bold text-orange-500 mb-4">Transaction History</h2>

      {/* Table for Desktop */}
      <div className="hidden md:block">
        <table className="w-full border-collapse border border-gray-200 rounded-lg shadow-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-dark-2 dark:text-white text-gray-700">
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Received</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 dark:hover:bg-dark-2">
                <td className="p-3 font-semibold">{(Number(payment?.amount) / 100).toFixed(2)} {payment?.currency.toUpperCase()}</td>
                <td className="p-3">
                    
                    <Tag value={payment?.payment_method_types.join(',')} severity={!payment?.payment_method_types.includes('link')?'warning':'success'}/>
                    {/* <Tag value={!payment.payment_method_types.includes('link')?"One Time Payment":"Recurring Payment"} severity={!payment.payment_method_types.includes('link')?'warning':'success'}/> */}
                    </td>
                <td className="p-3">{(payment.amount_received).toFixed(2)/100} {payment?.currency.toUpperCase()}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${payment?.status === "succeeded" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {payment?.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile */}
      <div className="md:hidden space-y-4">
        {payments.map((payment, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
            <p className="text-lg font-semibold">
              ${payment.amount / 100} {payment.currency.toUpperCase()}
            </p>
            <p className="text-gray-600"><strong>Method:</strong> {payment.payment_method_types.join(", ")}</p>
            <p className="text-gray-600"><strong>Received:</strong> ${(payment.amount_received / 100).toFixed(2)}</p>
            <p className={`font-semibold ${payment.status === "succeeded" ? "text-green-600" : "text-red-600"}`}>
              <strong>Status:</strong> {payment.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
