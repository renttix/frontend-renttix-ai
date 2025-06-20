'use client';
import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { FiCheck, FiX, FiPhone, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import { SiTwilio } from "react-icons/si";
import GoPrevious from "@/components/GoPrevious";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

const TwilioConfig = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  
  const [config, setConfig] = useState({
    accountSid: "",
    authToken: "",
    phoneNumber: "",
    enabled: false,
    monthlyBudget: 100,
    alertThreshold: 80,
    costPerSms: 0.0075
  });

  const [status, setStatus] = useState({
    configured: false,
    verified: false,
    lastVerified: null,
    monthlyUsage: 0,
    messagesSent: 0
  });

  useEffect(() => {
    fetchTwilioConfig();
  }, []);

  const fetchTwilioConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseURL}/integrations/twilio`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.data.success) {
        setConfig(response.data.data.config || config);
        setStatus(response.data.data.status || status);
      }
    } catch (error) {
      console.error("Error fetching Twilio config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post(
        `${BaseURL}/integrations/twilio/configure`,
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
          detail: "Twilio configuration saved successfully",
          life: 3000,
        });
        setStatus({ ...status, configured: true });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to save configuration",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhoneNumber) {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please enter a phone number to test",
        life: 3000,
      });
      return;
    }

    setTesting(true);
    try {
      const response = await axios.post(
        `${BaseURL}/integrations/twilio/test`,
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
          detail: "Test SMS sent successfully!",
          life: 3000,
        });
        setStatus({ 
          ...status, 
          verified: true, 
          lastVerified: new Date().toISOString() 
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to send test SMS",
        life: 3000,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <GoPrevious route="/system-setup/integrations" />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-12 p-4 lg:col-span-3 xl:col-span-2">
          <div className="flex items-center mb-4">
            <SiTwilio className="h-8 w-8 text-red-600 mr-3" />
            <h3 className="font-bold text-xl">Twilio SMS</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure Twilio to enable SMS notifications for maintenance alerts and critical updates.
          </p>
        </div>

        <div className="col-span-12 md:col-span-12 lg:col-span-9 xl:col-span-10">
          {/* Configuration Status */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Configuration Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  status.configured ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {status.configured ? (
                    <FiCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <FiX className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Configuration</p>
                  <p className="text-xs text-gray-500">
                    {status.configured ? 'Configured' : 'Not configured'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  status.verified ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {status.verified ? (
                    <FiCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <FiX className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Verification</p>
                  <p className="text-xs text-gray-500">
                    {status.verified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FiDollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Monthly Usage</p>
                  <p className="text-xs text-gray-500">
                    £{status.monthlyUsage.toFixed(2)} / £{config.monthlyBudget}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* API Credentials */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">API Credentials</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Account SID <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.accountSid}
                  onChange={(e) => handleInputChange('accountSid', e.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Auth Token <span className="text-red-500">*</span>
                </label>
                <Password
                  value={config.authToken}
                  onChange={(e) => handleInputChange('authToken', e.target.value)}
                  placeholder="Enter your auth token"
                  className="w-full"
                  feedback={false}
                  toggleMask
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Twilio Phone Number <span className="text-red-500">*</span>
              </label>
              <InputText
                value={config.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Twilio phone number in E.164 format (e.g., +1234567890)
              </p>
            </div>

            <Message 
              severity="info" 
              text="You can find these credentials in your Twilio Console at twilio.com/console"
              className="mt-4"
            />
          </div>

          {/* Cost Management */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Cost Management</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Budget (£)
                </label>
                <InputText
                  type="number"
                  value={config.monthlyBudget}
                  onChange={(e) => handleInputChange('monthlyBudget', parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  SMS sending will be disabled when this limit is reached
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Alert Threshold (%)
                </label>
                <InputText
                  type="number"
                  value={config.alertThreshold}
                  onChange={(e) => handleInputChange('alertThreshold', parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Receive an alert when usage reaches this percentage
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start">
                <FiAlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Estimated Cost: £{config.costPerSms} per SMS
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Actual costs may vary based on destination and message length. 
                    Check your Twilio pricing for accurate rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Test Configuration</h4>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Test Phone Number
                </label>
                <InputText
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+447123456789"
                  className="w-full"
                />
              </div>
              <Button
                label="Send Test SMS"
                icon={<FiPhone className="mr-2" />}
                onClick={handleTest}
                loading={testing}
                disabled={!config.accountSid || !config.authToken || !config.phoneNumber}
                className="p-button-outlined"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter a phone number to receive a test SMS message
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              className="p-button-outlined"
              onClick={() => window.history.back()}
            />
            <Button
              label="Save Configuration"
              icon={<FiCheck className="mr-2" />}
              onClick={handleSave}
              loading={saving}
              disabled={!config.accountSid || !config.authToken || !config.phoneNumber}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwilioConfig;