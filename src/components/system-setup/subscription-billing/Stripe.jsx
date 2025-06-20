"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";

export default function Stripe() {
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stripeDetails, setStripeDetails] = useState(null);
  const toast = useRef(null);
  const { token, user } = useSelector((state) => state.authReducer);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BaseURL}/stripe/connect`,
        { email: user.email },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.href = data.url; // Redirect to Stripe onboarding
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Connection Failed",
        detail: error?.response?.data?.error || "Stripe connection failed!",
        life: 3000,
      });
    }
    setLoading(false);
  };

  const handleDisconnectStripe = async () => {
    setDisconnecting(true);
    try {
      const res = await axios.post(
        `${BaseURL}/stripe/disconnect`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsConnected(false);
      setStripeDetails(null); // Reset Stripe details

      toast.current.show({
        severity: "success",
        summary: "Disconnected",
        detail: "Your Stripe account has been disconnected.",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Disconnection Failed",
        detail: error?.response?.data?.error || "Failed to disconnect Stripe account.",
        life: 3000,
      });
    }
    setDisconnecting(false);
  };

  useEffect(() => {
    axios
      .get(`${BaseURL}/stripe/verify`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const account = response.data.stripeAccount;
        if (account && account.payouts_enabled) {
          setIsConnected(true);
          setStripeDetails(account);
          toast.current.show({
            severity: "success",
            summary: "Stripe Connected",
            detail: "Your Stripe account is successfully linked!",
            life: 3000,
          });
        } else {
          setIsConnected(false);
          toast.current.show({
            severity: "warn",
            summary: "Stripe Not Connected",
            detail: "Your Stripe account is not fully set up. Complete onboarding.",
            life: 3000,
          });
        }
      })
      .catch(() => {
        setIsConnected(false);
      });
  }, [token]);

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
                <GoPrevious route={"/system-setup/subscription-billing"} />
        
      <Toast ref={toast} />
      <Card className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-white">
          Payment Setup
        </h2>
        <p className="text-gray-600 mb-6">
          {isConnected
            ? "Your Stripe account is connected."
            : "Connect your Stripe account to receive payments."}
        </p>

        {isConnected ? (
          <div className="flex flex-col items-center">
            <i className="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
            <p className="text-green-600 font-semibold">Stripe Connected!</p>

            {/* Show Stripe Account Details */}
            {stripeDetails && (
              <div className="text-left w-full mt-4 bg-gray-100 p-3 rounded-lg dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Account:</strong> {stripeDetails.email}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      stripeDetails.status === "Active"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {stripeDetails.status}
                  </span>
                </p>
              </div>
            )}

            {/* Disconnect Button with Loader */}
            <Button
              label={disconnecting ? "Disconnecting..." : "Disconnect Stripe"}
              icon={disconnecting ? "pi pi-spin pi-spinner" : "pi pi-times"}
              className="p-button-rounded p-button-danger w-full mt-4"
              onClick={handleDisconnectStripe}
              disabled={disconnecting}
            />
          </div>
        ) : (
          <Button
            label={loading ? "Redirecting..." : "Connect Stripe"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-external-link"}
            className="p-button-rounded p-button-warning w-full"
            onClick={handleConnectStripe}
            disabled={loading}
          />
        )}
      </Card>
    </div>
  );
}
