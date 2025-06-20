import Link from "next/link";
import React from "react";
import { FiBell, FiMail, FiMessageSquare, FiSettings, FiPackage } from "react-icons/fi";
import { SiTwilio, SiSendgrid, SiWhatsapp } from "react-icons/si";
import { MdEmail, MdQrCodeScanner } from "react-icons/md";

const IntegrationsEnhanced = () => {
  const accountIntegrations = [
    {
      id: 'quickbooks',
      title: 'QuickBooks',
      description: 'Integrate with QuickBooks accounting software to provide the ability to post your invoices into QuickBooks and keep your accounts and QuickBooks contacts in sync.',
      icon: '/images/QuickBooks.png',
      link: '/system-setup/integrations/quickbook',
      category: 'accounting'
    },
    {
      id: 'xero',
      title: 'Xero',
      description: 'Connect with Xero accounting platform to sync invoices, payment terms, and customer data. Features automatic token refresh and secure OAuth 2.0 authentication.',
      icon: '/images/Xero.png',
      link: '/system-setup/integrations/xero',
      category: 'accounting'
    },
    {
      id: 'sage',
      title: 'Sage Business Cloud',
      description: 'Integrate with Sage Business Cloud Accounting to manage your financial data. Supports multiple regions (UK, US, CA) with automatic endpoint selection.',
      icon: '/images/Sage.png',
      link: '/system-setup/integrations/sage',
      category: 'accounting'
    },
    {
      id: 'zoho',
      title: 'Zoho Books',
      description: 'Connect with Zoho Books for global accounting needs. Supports 180+ countries with multi-currency, automatic tax calculation, and real-time sync.',
      icon: '/images/Zoho.png',
      link: '/system-setup/integrations/zoho',
      category: 'accounting'
    },
    {
      id: 'tally',
      title: 'Tally',
      description: 'Integrate with Tally for Indian businesses. Features real-time sync with desktop Tally, full GST compliance, and XML-based communication.',
      icon: '/images/Tally.png',
      link: '/system-setup/integrations/tally',
      category: 'accounting'
    }
  ];

  const communicationIntegrations = [
    {
      id: 'twilio',
      title: 'Twilio SMS',
      description: 'Configure Twilio for SMS notifications including maintenance alerts, critical updates, and customer communications.',
      icon: SiTwilio,
      link: '/system-setup/integrations/twilio',
      category: 'communication',
      status: 'not_configured' // will be dynamic
    },
    {
      id: 'sendgrid',
      title: 'SendGrid Email',
      description: 'Set up SendGrid for reliable email delivery of maintenance alerts, invoices, and customer notifications.',
      icon: SiSendgrid,
      link: '/system-setup/integrations/sendgrid',
      category: 'communication',
      status: 'not_configured' // will be dynamic
    },
    {
      id: 'smtp',
      title: 'SMTP Email',
      description: 'Configure custom SMTP settings for email delivery using your own email server.',
      icon: MdEmail,
      link: '/system-setup/integrations/smtp',
      category: 'communication',
      status: 'not_configured' // will be dynamic
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Business',
      description: 'Enable WhatsApp messaging for customer communications, order updates, and two-way conversations using Twilio WhatsApp Business API.',
      icon: SiWhatsapp,
      link: '/system-setup/integrations/whatsapp',
      category: 'communication',
      status: 'not_configured' // will be dynamic
    }
  ];

  const notificationIntegrations = [
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Enable browser and mobile push notifications for real-time alerts and updates.',
      icon: FiBell,
      link: '/system-setup/integrations/push-notifications',
      category: 'notifications',
      status: 'not_configured' // will be dynamic
    }
  ];

  const operationsIntegrations = [
    {
      id: 'barcode',
      title: 'Barcode & QR Scanning',
      description: 'Enable barcode and QR code scanning for inventory management. Supports manual entry, USB/Bluetooth scanners, and mobile camera scanning.',
      icon: MdQrCodeScanner,
      link: '/system-setup/integrations/barcode',
      category: 'operations',
      status: 'not_configured' // will be dynamic
    }
  ];

  const IntegrationCard = ({ integration, isImageIcon = false }) => {
    const Icon = integration.icon;
    const statusColors = {
      configured: 'bg-green-100 text-green-800 border-green-200',
      not_configured: 'bg-gray-100 text-gray-600 border-gray-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };

    const statusLabels = {
      configured: 'Configured',
      not_configured: 'Not Configured',
      error: 'Error'
    };

    return (
      <Link href={integration.link}>
        <div className="h-full cursor-pointer rounded-[10px] border border-stroke bg-white shadow-1 hover:shadow-2 transition-shadow dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {isImageIcon ? (
                  <img
                    className="h-16 w-16 object-contain"
                    src={integration.icon}
                    alt={integration.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-gray-100 dark:bg-dark-2">
                    <Icon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
              {integration.status && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[integration.status]}`}>
                  {statusLabels[integration.status]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">{integration.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {integration.description}
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Configure →
              </span>
              {integration.status === 'configured' && (
                <FiSettings className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-12 p-4 lg:col-span-3 xl:col-span-2">
          <h3 className="font-bold text-xl mb-4">Integrations</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect third-party services to enhance your system capabilities.
          </p>
        </div>
        
        <div className="col-span-12 md:col-span-12 lg:col-span-9 xl:col-span-10 space-y-6">
          {/* Accounting Integrations */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">💼</span>
              Accounting
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accountIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                  isImageIcon={true}
                />
              ))}
            </div>
          </div>

          {/* Communication Integrations */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <FiMessageSquare className="mr-2 text-blue-600" />
              Communication & Alerts
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure email and SMS services for maintenance alerts and customer notifications.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communicationIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                />
              ))}
            </div>
          </div>

          {/* Notification Integrations */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <FiBell className="mr-2 text-yellow-600" />
              Notifications
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enable real-time notifications for critical maintenance alerts.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notificationIntegrations.map((integration) => (
                <IntegrationCard 
                  key={integration.id} 
                  integration={integration} 
                />
              ))}
            </div>
          </div>

          {/* Operations & Inventory Integrations */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center">
              <FiPackage className="mr-2 text-purple-600" />
              Operations & Inventory
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configure tools for inventory management and operational efficiency.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {operationsIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
            </div>
          </div>

          {/* Integration Status Summary */}
          <div className="rounded-[10px] border border-stroke bg-blue-50 dark:bg-dark-2 p-4">
            <div className="flex items-start">
              <FiSettings className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">
                  Integration Requirements for Maintenance Alerts
                </h5>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  To enable SMS alerts for maintenance notifications, you must configure either Twilio or another SMS provider. 
                  Email alerts require either SendGrid or SMTP configuration. Dashboard notifications are always available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsEnhanced;