"use client";
import { useState } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { BaseURL } from "../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { Button } from "primereact/button";

export default function AddCardButton({customerId}) {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const { user } = useSelector((state) => state?.authReducer);

  const handleAddCard = async () => {
    if (!customerId) {
      toast.current.show({ severity: "error", summary: "Error", detail: "Customer ID not found!" });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BaseURL}/stripes/generate-setup-intent`, {
        customerId: customerId,
      });

      if (response.data.success) {
        window.location.href = response.data.setupLink; // 🔗 Redirect to Stripe
      } else {
        toast.current.show({ severity: "error", summary: "Error", detail: response.data.error });
      }
    } catch (error) {
      toast.current.show({ severity: "error", summary: "Error", detail: "Failed to generate link" });
    }

    setLoading(false);
  };

  return (
    <div className="text-center">
      <Toast ref={toast} />
      <Button
        onClick={handleAddCard}
        label={loading ? "Generating Link..." : "Add Card"}
        // className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition"
        disabled={loading}
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-credit-card"}
        className="w-full p-button-outlined p-button-info"
      />
      
      
    </div>
  );
}
