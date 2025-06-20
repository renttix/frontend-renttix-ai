import { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseURL } from '../../utils/baseUrl';
import { useSelector } from 'react-redux';

export const useBarcodeConfig = () => {
  const [barcodeConfig, setBarcodeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state?.authReducer);

  useEffect(() => {
    fetchBarcodeConfig();
  }, []);

  const fetchBarcodeConfig = async () => {
    try {
      const response = await axios.get(`${BaseURL}/barcode/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success && response.data.data) {
        setBarcodeConfig(response.data.data);
      } else {
        // If no config exists, set default disabled state
        setBarcodeConfig({ enabled: false });
      }
    } catch (error) {
      console.error('Error fetching barcode configuration:', error);
      setError(error);
      // Default to disabled on error
      setBarcodeConfig({ enabled: false });
    } finally {
      setLoading(false);
    }
  };

  return {
    barcodeConfig,
    isBarcodeEnabled: barcodeConfig?.enabled || false,
    loading,
    error,
    refetch: fetchBarcodeConfig
  };
};