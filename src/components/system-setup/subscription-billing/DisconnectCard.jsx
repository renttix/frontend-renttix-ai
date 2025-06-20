"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { BaseURL } from "../../../../utils/baseUrl";

const DisconnectCard = ({ customerId, last4 = "****", brand = "Visa" }) => {
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const handleDisconnect = async () => {
    if (!customerId) {
      showToast("warn", "Warning", "Customer ID is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BaseURL}/stripes/disconnect-card`, { customerId });
      showToast("success", "Success", response.data.message);
    } catch (error) {
      console.error("Error disconnecting card:", error);
      showToast("error", "Error", error.response?.data?.error || "Failed to disconnect the card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <Toast ref={toast} />

      {/* Credit Card UI */}


      {/* Disconnect Button */}

   
      <Button 
        label={loading ? "Disconnecting..." : "Disconnect Card"}
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-credit-card"}
        className="w-full p-button-outlined p-button-danger"
        onClick={handleDisconnect}
        disabled={loading}
      />
    </div>
  );
};

export default DisconnectCard;
