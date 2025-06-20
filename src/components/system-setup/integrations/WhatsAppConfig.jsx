"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { Card } from "primereact/card";
import { SiWhatsapp } from "react-icons/si";
import { FiCheck, FiX, FiPhone, FiMessageSquare, FiSettings } from "react-icons/fi";
import GoPrevious from "@/components/GoPrevious";

const WhatsAppConfig = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [config, setConfig] = useState({
    accountSid: "",
    authToken: "",
    whatsappNumber: "",
    isActive: false,
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const response = await axios.get(`${BaseURL}/whatsapp/configuration`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.data.success && response.data.data) {
        setConfig(response.data.data);
        setIsConfigured(response.data.data.isActive);
      }
    } catch (error) {
      console.error("Error fetching WhatsApp configuration:", error);
    }
  };

  const handleSave = async () => {
    if (!config.accountSid || !config.authToken || !config.whatsappNumber) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all required fields",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/whatsapp/configuration`,
        config,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "WhatsApp configuration saved successfully",
          life: 3000,
        });
        setIsConfigured(true);
        fetchConfiguration(); // Refresh to get masked token
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to save configuration",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!testPhoneNumber) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please enter a phone number to test",
        life: 3000,
      });
      return;
    }

    setTestLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/whatsapp/test-configuration`,
        { phoneNumber: testPhoneNumber },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Test message sent successfully!",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to send test message",
        life: 3000,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Format as needed
    return cleaned;
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <GoPrevious route="/system-setup/integrations" />

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <SiWhatsapp className="text-green-600" />
          WhatsApp Business Configuration
        </h2>
        <p className="text-gray-600 mt-2">
          Configure WhatsApp Business API using Twilio for customer messaging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-1">
            <div className="space-y-6">
              {/* Twilio Credentials Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiSettings className="text-gray-600" />
                  Twilio Credentials
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Account SID <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={config.accountSid}
                      onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full"
                      disabled={loading}
                    />
                    <small className="text-gray-500">
                      Found in your Twilio Console Dashboard
                    </small>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Auth Token <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Password
                        value={config.authToken}
                        onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                        placeholder="Enter your Twilio Auth Token"
                        className="w-full"
                        disabled={loading}
                        feedback={false}
                        toggleMask={true}
                      />
                    </div>
                    <small className="text-gray-500">
                      Keep this secret and secure
                    </small>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={config.whatsappNumber}
                      onChange={(e) => setConfig({ ...config, whatsappNumber: formatPhoneNumber(e.target.value) })}
                      placeholder="+1234567890"
                      className="w-full"
                      disabled={loading}
                    />
                    <small className="text-gray-500">
                      Your Twilio WhatsApp-enabled phone number (with country code)
                    </small>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  label="Save Configuration"
                  icon="pi pi-save"
                  onClick={handleSave}
                  loading={loading}
                  className="bg-primary text-white"
                />
              </div>

              {/* Test Configuration Section */}
              {isConfigured && (
                <>
                  <Divider />
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiMessageSquare className="text-gray-600" />
                      Test Configuration
                    </h3>
                    
                    <div className="flex gap-3">
                      <InputText
                        value={testPhoneNumber}
                        onChange={(e) => setTestPhoneNumber(formatPhoneNumber(e.target.value))}
                        placeholder="+1234567890"
                        className="flex-1"
                        disabled={testLoading}
                      />
                      <Button
                        label="Send Test Message"
                        icon="pi pi-send"
                        onClick={handleTest}
                        loading={testLoading}
                        className="bg-green-600 text-white hover:bg-green-700"
                      />
                    </div>
                    <small className="text-gray-500 mt-2 block">
                      Enter a phone number to receive a test WhatsApp message
                    </small>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="shadow-1">
            <h3 className="text-lg font-semibold mb-4">Configuration Status</h3>
            <div className="flex items-center gap-3">
              {isConfigured ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Configured</p>
                    <p className="text-sm text-gray-600">WhatsApp is ready to use</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiX className="text-gray-400 text-xl" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Not Configured</p>
                    <p className="text-sm text-gray-600">Complete setup to enable</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Setup Instructions */}
          <Card className="shadow-1">
            <h3 className="text-lg font-semibold mb-4">Setup Instructions</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-primary">1.</span>
                <div>
                  <p className="font-medium">Create Twilio Account</p>
                  <p className="text-gray-600">Sign up at twilio.com</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">2.</span>
                <div>
                  <p className="font-medium">Enable WhatsApp</p>
                  <p className="text-gray-600">Request WhatsApp access in Twilio Console</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">3.</span>
                <div>
                  <p className="font-medium">Get Credentials</p>
                  <p className="text-gray-600">Copy Account SID and Auth Token</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">4.</span>
                <div>
                  <p className="font-medium">Configure Webhook</p>
                  <p className="text-gray-600">Set webhook URL in Twilio</p>
                </div>
              </li>
            </ol>
          </Card>

          {/* Features Card */}
          <Card className="shadow-1">
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span>Two-way messaging</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span>Order updates & notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span>Customer support chat</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span>Message history tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCheck className="text-green-600" />
                <span>Automated responses</span>
              </li>
            </ul>
          </Card>

          {/* Webhook Info */}
          <Message 
            severity="info" 
            text={`Webhook URL: ${window.location.origin}/api/whatsapp/webhook`}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConfig;