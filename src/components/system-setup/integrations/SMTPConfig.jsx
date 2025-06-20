'use client';

import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { FiCheck, FiX, FiMail, FiShield, FiAlertCircle } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import GoPrevious from "@/components/GoPrevious";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

const SMTPConfig = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  const [config, setConfig] = useState({
    host: "",
    port: 587,
    secure: false,
    auth: {
      user: "",
      pass: ""
    },
    from: {
      name: "",
      address: ""
    },
    tls: {
      rejectUnauthorized: true
    },
    enabled: false,
    maxConnections: 5,
    maxMessages: 100
  });

  const [status, setStatus] = useState({
    configured: false,
    verified: false,
    lastVerified: null,
    lastError: null
  });

  const securityOptions = [
    { label: "STARTTLS (Port 587)", value: "starttls", port: 587, secure: false },
    { label: "SSL/TLS (Port 465)", value: "ssl", port: 465, secure: true },
    { label: "None (Port 25)", value: "none", port: 25, secure: false }
  ];

  const commonProviders = [
    { label: "Custom SMTP Server", value: "custom" },
    { label: "Gmail", value: "gmail", host: "smtp.gmail.com", port: 587 },
    { label: "Outlook/Office 365", value: "outlook", host: "smtp.office365.com", port: 587 },
    { label: "Yahoo", value: "yahoo", host: "smtp.mail.yahoo.com", port: 587 },
    { label: "Amazon SES", value: "ses", host: "email-smtp.eu-west-1.amazonaws.com", port: 587 }
  ];

  const [selectedProvider, setSelectedProvider] = useState("custom");
  const [selectedSecurity, setSelectedSecurity] = useState("starttls");

  useEffect(() => {
    fetchSMTPConfig();
  }, []);

  const fetchSMTPConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseURL}/integrations/smtp`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.data.success) {
        setConfig(response.data.data.config || config);
        setStatus(response.data.data.status || status);
      }
    } catch (error) {
      console.error("Error fetching SMTP config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    const providerConfig = commonProviders.find(p => p.value === provider);
    if (providerConfig && providerConfig.host) {
      setConfig({
        ...config,
        host: providerConfig.host,
        port: providerConfig.port
      });
    }
  };

  const handleSecurityChange = (security) => {
    setSelectedSecurity(security);
    const securityConfig = securityOptions.find(s => s.value === security);
    if (securityConfig) {
      setConfig({
        ...config,
        port: securityConfig.port,
        secure: securityConfig.secure
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post(
        `${BaseURL}/integrations/smtp/configure`,
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
          detail: "SMTP configuration saved successfully",
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
    if (!testEmail) {
      toast.current.show({
        severity: "warn",
        summary: "Warning",
        detail: "Please enter an email address to test",
        life: 3000,
      });
      return;
    }

    setTesting(true);
    try {
      const response = await axios.post(
        `${BaseURL}/integrations/smtp/test`,
        { email: testEmail },
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
          detail: "Test email sent successfully!",
          life: 3000,
        });
        setStatus({ 
          ...status, 
          verified: true, 
          lastVerified: new Date().toISOString(),
          lastError: null
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send test email";
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
      setStatus({
        ...status,
        lastError: errorMessage
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig({
        ...config,
        [parent]: {
          ...config[parent],
          [child]: value
        }
      });
    } else {
      setConfig({ ...config, [field]: value });
    }
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
            <MdEmail className="h-8 w-8 text-gray-600 mr-3" />
            <h3 className="font-bold text-xl">SMTP Email</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure custom SMTP settings for email delivery using your own email server.
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
                  <p className="text-sm font-medium">Connection</p>
                  <p className="text-xs text-gray-500">
                    {status.verified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  config.secure || config.port === 587 ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <FiShield className={`h-5 w-5 ${
                    config.secure || config.port === 587 ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium">Security</p>
                  <p className="text-xs text-gray-500">
                    {config.secure ? 'SSL/TLS' : config.port === 587 ? 'STARTTLS' : 'None'}
                  </p>
                </div>
              </div>
            </div>

            {status.lastError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start">
                  <FiAlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Last Error
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                      {status.lastError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Server Configuration */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Server Configuration</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Email Provider
              </label>
              <Dropdown
                value={selectedProvider}
                options={commonProviders}
                onChange={(e) => handleProviderChange(e.value)}
                placeholder="Select a provider"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  SMTP Host <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="smtp.example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Security
                </label>
                <Dropdown
                  value={selectedSecurity}
                  options={securityOptions}
                  onChange={(e) => handleSecurityChange(e.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.auth.user}
                  onChange={(e) => handleInputChange('auth.user', e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <Password
                  value={config.auth.pass}
                  onChange={(e) => handleInputChange('auth.pass', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                  feedback={false}
                  toggleMask
                />
              </div>
            </div>

            {selectedProvider === 'gmail' && (
              <Message 
                severity="warn" 
                text="For Gmail, use an App Password instead of your regular password. Enable 2-factor authentication and generate an app password."
                className="mt-4"
              />
            )}
          </div>

          {/* Sender Configuration */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Sender Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  From Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.from.name}
                  onChange={(e) => handleInputChange('from.name', e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  From Email <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.from.address}
                  onChange={(e) => handleInputChange('from.address', e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  className="w-full"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Some email providers require the from address to match the authenticated user
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Advanced Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Connections
                </label>
                <InputText
                  type="number"
                  value={config.maxConnections}
                  onChange={(e) => handleInputChange('maxConnections', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum simultaneous connections to SMTP server
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Messages per Connection
                </label>
                <InputText
                  type="number"
                  value={config.maxMessages}
                  onChange={(e) => handleInputChange('maxMessages', parseInt(e.target.value) || 100)}
                  min="1"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Messages to send before creating new connection
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <InputSwitch
                checked={config.tls.rejectUnauthorized}
                onChange={(e) => handleInputChange('tls.rejectUnauthorized', e.value)}
              />
              <label className="ml-3 text-sm">
                Verify SSL certificates (recommended)
              </label>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Test Configuration</h4>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Test Email Address
                </label>
                <InputText
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full"
                />
              </div>
              <Button
                label="Send Test Email"
                icon={<FiMail className="mr-2" />}
                onClick={handleTest}
                loading={testing}
                disabled={!config.host || !config.auth.user || !config.auth.pass || !config.from.address}
                className="p-button-outlined"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Send a test email to verify your SMTP configuration
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
              disabled={!config.host || !config.auth.user || !config.auth.pass || !config.from.address || !config.from.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTPConfig;