import { useState, useCallback } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

export const useRouteEstimation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estimation, setEstimation] = useState(null);
  const [deliveryWindows, setDeliveryWindows] = useState([]);
  const [recurringOptions, setRecurringOptions] = useState(null);
  const { token, user } = useSelector((state) => state?.authReducer);

  const calculateRouteCost = useCallback(async (deliveryAddress, products, deliveryDate) => {
    if (!deliveryAddress || !products || products.length === 0 || !token) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/routes/estimate`,
        {
          deliveryAddress: {
            address1: deliveryAddress.address1,
            address2: deliveryAddress.address2,
            city: deliveryAddress.city,
            postcode: deliveryAddress.postcode,
            country: deliveryAddress.country,
            coordinates: deliveryAddress.coordinates,
          },
          products: products.map(p => ({
            productId: p.productId || p._id,
            quantity: p.quantity || 1,
            weight: p.weight || 0,
            volume: p.volume || 0,
          })),
          deliveryDate,
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setEstimation({
          cost: data.estimatedCost || 0,
          distance: data.distance || 0,
          duration: data.duration || 0,
          suggestedRoute: data.suggestedRoute || null,
          alternativeRoutes: data.alternativeRoutes || [],
        });
        return data;
      }
    } catch (err) {
      console.error('Error calculating route cost:', err);
      setError(err.response?.data?.message || 'Failed to calculate route cost');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const getDeliveryWindows = useCallback(async (deliveryDate, routeId) => {
    if (!deliveryDate || !token) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BaseURL}/api/routes/delivery-windows`,
        {
          params: {
            date: deliveryDate,
            routeId,
            vendorId: user?._id,
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const windows = response.data.data || [];
        setDeliveryWindows(windows);
        return windows;
      }
    } catch (err) {
      console.error('Error fetching delivery windows:', err);
      setError(err.response?.data?.message || 'Failed to fetch delivery windows');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const setupRecurringDelivery = useCallback(async (deliveryDetails, recurrencePattern) => {
    if (!deliveryDetails || !recurrencePattern || !token) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/routes/recurring-setup`,
        {
          deliveryDetails,
          recurrencePattern: {
            frequency: recurrencePattern.frequency, // 'weekly', 'biweekly', 'monthly'
            dayOfWeek: recurrencePattern.dayOfWeek,
            dayOfMonth: recurrencePattern.dayOfMonth,
            endDate: recurrencePattern.endDate,
          },
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setRecurringOptions(data);
        return data;
      }
    } catch (err) {
      console.error('Error setting up recurring delivery:', err);
      setError(err.response?.data?.message || 'Failed to setup recurring delivery');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const optimizeRoute = useCallback(async (deliveries) => {
    if (!deliveries || deliveries.length === 0 || !token) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/routes/optimize`,
        {
          deliveries: deliveries.map(d => ({
            address: d.address,
            products: d.products,
            priority: d.priority || 'normal',
          })),
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error optimizing route:', err);
      setError(err.response?.data?.message || 'Failed to optimize route');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const getEstimatedCost = useCallback(() => {
    return estimation?.cost || 0;
  }, [estimation]);

  const getEstimatedDistance = useCallback(() => {
    return estimation?.distance || 0;
  }, [estimation]);

  const getEstimatedDuration = useCallback(() => {
    return estimation?.duration || 0;
  }, [estimation]);

  const getSuggestedRoute = useCallback(() => {
    return estimation?.suggestedRoute || null;
  }, [estimation]);

  const getAlternativeRoutes = useCallback(() => {
    return estimation?.alternativeRoutes || [];
  }, [estimation]);

  const getNextAvailableWindow = useCallback(() => {
    if (!deliveryWindows || deliveryWindows.length === 0) {
      return null;
    }
    
    // Find the first available window
    return deliveryWindows.find(window => window.available && window.capacity > 0) || null;
  }, [deliveryWindows]);

  const clearEstimation = useCallback(() => {
    setEstimation(null);
    setDeliveryWindows([]);
    setRecurringOptions(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    estimation,
    deliveryWindows,
    recurringOptions,
    calculateRouteCost,
    getDeliveryWindows,
    setupRecurringDelivery,
    optimizeRoute,
    getEstimatedCost,
    getEstimatedDistance,
    getEstimatedDuration,
    getSuggestedRoute,
    getAlternativeRoutes,
    getNextAvailableWindow,
    clearEstimation,
    clearError,
  };
};