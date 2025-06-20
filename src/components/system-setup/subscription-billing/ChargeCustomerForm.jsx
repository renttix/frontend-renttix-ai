"use client";
import { useState, useRef } from "react";
import { BaseURL } from "../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";

export default function ChargeCustomerForm() {
  const [customerId, setCustomerId] = useState("673b145b0fab4a457b910051");
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { user } = useSelector((state) => state?.authReducer);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleCharge = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BaseURL}/stripes/payment/charge-customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          currency: user?.currencyKey,
          amount: amount*100,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast("success", "Success", "Customer charged successfully!");
      } else {
        showToast("error", "Error", data.error || "Failed to charge customer.");
      }
    } catch (error) {
      showToast("error", "Error", "An unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <div >
      <Toast ref={toast} />

      {/* <h2 className="font-medium text-dark-2 dark:text-white py-2">Charge Customer</h2> */}
      <form onSubmit={handleCharge} className="space-y-4">
        <Button
          type="submit"
          label={loading ? "Processing..." : "Charge Customer"}
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-credit-card"}
          className="w-full p-button-outlined p-button-warning"
          disabled={loading}
        />
      </form>
    </div>
  );
}
