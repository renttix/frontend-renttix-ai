import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

export const useCustomerIntelligence = (customerId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state?.authReducer);

  const fetchCustomerIntelligence = useCallback(async () => {
    if (!customerId || !token) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BaseURL}/api/intelligence/customer/${customerId}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch customer intelligence');
      }
    } catch (err) {
      console.error('Error fetching customer intelligence:', err);
      setError(err.response?.data?.message || 'Failed to fetch customer intelligence');
    } finally {
      setLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => {
    fetchCustomerIntelligence();
  }, [fetchCustomerIntelligence]);

  const detectRepeatCustomer = useCallback(() => {
    return data?.isRepeatCustomer || false;
  }, [data]);

  const getLastOrderDetails = useCallback(() => {
    return data?.lastOrderDetails || null;
  }, [data]);

  const getCustomerType = useCallback(() => {
    return data?.customerType || 'walk-in';
  }, [data]);

  const getOrderHistory = useCallback(() => {
    return data?.orderHistory || [];
  }, [data]);

  const getPreferredProducts = useCallback(() => {
    return data?.preferredProducts || [];
  }, [data]);

  const getAverageOrderValue = useCallback(() => {
    return data?.averageOrderValue || 0;
  }, [data]);

  const getSuggestedDuration = useCallback(() => {
    return data?.suggestedDuration || null;
  }, [data]);

  const getAutofillData = useCallback(() => {
    if (!data?.isRepeatCustomer || !data?.lastOrderDetails) {
      return null;
    }

    const lastOrder = data.lastOrderDetails;
    return {
      deliveryAddress1: lastOrder.deliveryAddress1 || '',
      deliveryAddress2: lastOrder.deliveryAddress2 || '',
      deliveryCity: lastOrder.deliveryCity || '',
      deliveryCountry: lastOrder.deliveryCountry || '',
      deliveryPostcode: lastOrder.deliveryPostcode || '',
      deliveryContactName: lastOrder.deliveryContactName || '',
      deliveryContactPhone: lastOrder.deliveryContactPhone || '',
      deliveryInstructions: lastOrder.deliveryInstructions || '',
      paymentTerm: lastOrder.paymentTerm || '',
      invoiceRunCode: lastOrder.invoiceRunCode || '',
    };
  }, [data]);

  const refresh = useCallback(() => {
    fetchCustomerIntelligence();
  }, [fetchCustomerIntelligence]);

  return {
    data,
    loading,
    error,
    detectRepeatCustomer,
    getLastOrderDetails,
    getCustomerType,
    getOrderHistory,
    getPreferredProducts,
    getAverageOrderValue,
    getSuggestedDuration,
    getAutofillData,
    refresh,
  };
};