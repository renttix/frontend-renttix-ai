import { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseURL } from '../../utils/baseUrl';
import { useSelector } from 'react-redux';

const useIntegrationStatus = () => {
  const [integrations, setIntegrations] = useState({
    twilio: {
      configured: false,
      enabled: false,
      verified: false
    },
    sendgrid: {
      configured: false,
      enabled: false,
      verified: false
    },
    smtp: {
      configured: false,
      enabled: false,
      verified: false
    },
    push: {
      configured: false,
      enabled: false,
      verified: false
    },
    whatsapp: {
      configured: false,
      enabled: false,
      verified: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const { token } = useSelector((state) => state?.authReducer);


  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BaseURL}/integrations/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setIntegrations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching integration status:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableChannels = () => {
    const channels = ['dashboard']; // Dashboard is always available
    
    if (integrations.sendgrid?.configured || integrations.smtp?.configured) {
      channels.push('email');
    }
    
    if (integrations.twilio?.configured) {
      channels.push('sms');
    }
    
    if (integrations.whatsapp?.configured) {
      channels.push('whatsapp');
    }
    
    if (integrations.push?.configured) {
      channels.push('push');
    }
    
    return channels;
  };

  const isChannelAvailable = (channel) => {
    switch (channel) {
      case 'dashboard':
        return true;
      case 'email':
        return integrations.sendgrid?.configured || integrations.smtp?.configured;
      case 'sms':
        return integrations.twilio?.configured;
      case 'whatsapp':
        return integrations.whatsapp?.configured;
      case 'push':
        return integrations.push?.configured;
      default:
        return false;
    }
  };

  const getChannelStatus = (channel) => {
    switch (channel) {
      case 'dashboard':
        return { available: true, message: 'Always available' };
      case 'email':
        if (integrations.sendgrid?.configured) {
          return { available: true, message: 'SendGrid configured' };
        } else if (integrations.smtp?.configured) {
          return { available: true, message: 'SMTP configured' };
        } else {
          return { available: false, message: 'Configure SendGrid or SMTP in System Setup' };
        }
      case 'sms':
        if (integrations.twilio?.configured) {
          return { available: true, message: 'Twilio configured' };
        } else {
          return { available: false, message: 'Configure Twilio in System Setup' };
        }
      case 'whatsapp':
        if (integrations.whatsapp?.configured) {
          return { available: true, message: 'WhatsApp configured' };
        } else {
          return { available: false, message: 'Configure WhatsApp in System Setup' };
        }
      case 'push':
        if (integrations.push?.configured) {
          return { available: true, message: 'Push notifications enabled' };
        } else {
          return { available: false, message: 'Enable push notifications in System Setup' };
        }
      default:
        return { available: false, message: 'Unknown channel' };
    }
  };

  return {
    integrations,
    loading,
    error,
    getAvailableChannels,
    isChannelAvailable,
    getChannelStatus,
    refetch: fetchIntegrationStatus
  };
};

export default useIntegrationStatus;