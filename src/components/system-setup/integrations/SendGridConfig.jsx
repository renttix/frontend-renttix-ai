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
import { FiCheck, FiX, FiMail, FiAlertCircle } from "react-icons/fi";
import { SiSendgrid } from "react-icons/si";
import GoPrevious from "@/components/GoPrevious";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

const SendGridConfig = () => {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  const [config, setConfig] = useState({
    apiKey: "",
    fromEmail: "",
    fromName: "",
    replyToEmail: "",
    enabled: false,
    templates: {
      maintenanceAlert: "",
      maintenanceReminder: "",
      maintenanceOverdue: "",
      maintenanceCritical: ""
    },
    dailyLimit: 1000,
    monthlyLimit: 30000
  });

  const [status, setStatus] = useState({
    configured: false,
    verified: false,
    lastVerified: null,
    dailySent: 0,
    monthlySent: 0,
    reputation: 100
  });

  const templateOptions = [
    { label: "Default Template", value: "default" },
    { label: "Custom HTML Template", value: "custom" }
  ];

  useEffect(() => {
    fetchSendGridConfig();
  }, []);

  const fetchSendGridConfig = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseURL}/integrations/sendgrid`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.data.success) {
        setConfig(response.data.data.config || config);
        setStatus(response.data.data.status || status);
      }
    } catch (error) {
      console.error("Error fetching SendGrid config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.post(
        `${BaseURL}/integrations/sendgrid/configure`,
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
          detail: "SendGrid configuration saved successfully",
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
        `${BaseURL}/integrations/sendgrid/test`,
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
          lastVerified: new Date().toISOString() 
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to send test email",
        life: 3000,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const handleTemplateChange = (template, value) => {
    setConfig({
      ...config,
      templates: {
        ...config.templates,
        [template]: value
      }
    });
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
            <SiSendgrid className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="font-bold text-xl">SendGrid Email</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure SendGrid for reliable email delivery of maintenance alerts and notifications.
          </p>
        </div>

        <div className="col-span-12 md:col-span-12 lg:col-span-9 xl:col-span-10">
          {/* Configuration Status */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Configuration Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <FiMail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Today's Usage</p>
                  <p className="text-xs text-gray-500">
                    {status.dailySent} / {config.dailyLimit}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                  status.reputation >= 95 ? 'bg-green-100' : 
                  status.reputation >= 80 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <span className={`text-sm font-bold ${
                    status.reputation >= 95 ? 'text-green-600' : 
                    status.reputation >= 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {status.reputation}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">Reputation</p>
                  <p className="text-xs text-gray-500">
                    {status.reputation >= 95 ? 'Excellent' : 
                     status.reputation >= 80 ? 'Good' : 'Needs Attention'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">API Configuration</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <Password
                value={config.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full"
                feedback={false}
                toggleMask
              />
              <p className="text-xs text-gray-500 mt-1">
                Your SendGrid API key with Mail Send permissions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  From Email <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  placeholder="noreply@yourdomain.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  From Name <span className="text-red-500">*</span>
                </label>
                <InputText
                  value={config.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Reply-To Email
              </label>
              <InputText
                value={config.replyToEmail}
                onChange={(e) => handleInputChange('replyToEmail', e.target.value)}
                placeholder="support@yourdomain.com"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Where replies should be sent
              </p>
            </div>

            <Message 
              severity="info" 
              text="Make sure your sending domain is verified in SendGrid for best deliverability"
              className="mt-4"
            />
          </div>

          {/* Email Templates */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Email Templates</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure SendGrid template IDs for different types of maintenance alerts
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Alert Template
                </label>
                <InputText
                  value={config.templates.maintenanceAlert}
                  onChange={(e) => handleTemplateChange('maintenanceAlert', e.target.value)}
                  placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Reminder Template
                </label>
                <InputText
                  value={config.templates.maintenanceReminder}
                  onChange={(e) => handleTemplateChange('maintenanceReminder', e.target.value)}
                  placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Overdue Alert Template
                </label>
                <InputText
                  value={config.templates.maintenanceOverdue}
                  onChange={(e) => handleTemplateChange('maintenanceOverdue', e.target.value)}
                  placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Critical Alert Template
                </label>
                <InputText
                  value={config.templates.maintenanceCritical}
                  onChange={(e) => handleTemplateChange('maintenanceCritical', e.target.value)}
                  placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Leave empty to use default templates. You can create custom templates in your SendGrid dashboard.
            </p>
          </div>

          {/* Sending Limits */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6 mb-6">
            <h4 className="font-semibold text-lg mb-4">Sending Limits</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Daily Limit
                </label>
                <InputText
                  type="number"
                  value={config.dailyLimit}
                  onChange={(e) => handleInputChange('dailyLimit', parseInt(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum emails per day (0 = unlimited)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Limit
                </label>
                <InputText
                  type="number"
                  value={config.monthlyLimit}
                  onChange={(e) => handleInputChange('monthlyLimit', parseInt(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum emails per month (0 = unlimited)
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start">
                <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    SendGrid Plan Limits
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    These limits help prevent exceeding your SendGrid plan. Check your SendGrid dashboard for actual plan limits.
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
                disabled={!config.apiKey || !config.fromEmail || !config.fromName}
                className="p-button-outlined"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Send a test email to verify your configuration
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
              disabled={!config.apiKey || !config.fromEmail || !config.fromName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendGridConfig;