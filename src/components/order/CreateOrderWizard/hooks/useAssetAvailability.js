import { useState, useCallback } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../../../utils/baseUrl';
import { useSelector } from 'react-redux';

export const useAssetAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [availableAssets, setAvailableAssets] = useState({});
  const { token, user } = useSelector((state) => state?.authReducer);

  const checkAvailability = useCallback(async (productId, quantity, startDate, endDate) => {
    if (!productId || !quantity || !startDate || !endDate || !token) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/assets/check-availability`,
        {
          productId,
          quantity,
          startDate,
          endDate,
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
        
        // Update available assets for this product
        setAvailableAssets(prev => ({
          ...prev,
          [productId]: data.availableAssets || [],
        }));

        // Update conflicts if any
        if (data.conflicts && data.conflicts.length > 0) {
          setConflicts(prev => {
            const newConflicts = [...prev];
            // Remove old conflicts for this product
            const filtered = newConflicts.filter(c => c.productId !== productId);
            // Add new conflicts
            return [...filtered, ...data.conflicts];
          });
        } else {
          // Clear conflicts for this product if none found
          setConflicts(prev => prev.filter(c => c.productId !== productId));
        }

        return data;
      }
    } catch (err) {
      console.error('Error checking asset availability:', err);
      setError(err.response?.data?.message || 'Failed to check asset availability');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const checkBulkAvailability = useCallback(async (products, startDate, endDate) => {
    if (!products || products.length === 0 || !startDate || !endDate || !token) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/assets/check-bulk-availability`,
        {
          products: products.map(p => ({
            productId: p.productId || p._id,
            quantity: p.quantity || 1,
          })),
          startDate,
          endDate,
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const results = response.data.data;
        
        // Update available assets for all products
        const newAvailableAssets = {};
        const allConflicts = [];

        results.forEach(result => {
          if (result.availableAssets) {
            newAvailableAssets[result.productId] = result.availableAssets;
          }
          if (result.conflicts && result.conflicts.length > 0) {
            allConflicts.push(...result.conflicts);
          }
        });

        setAvailableAssets(newAvailableAssets);
        setConflicts(allConflicts);

        return results;
      }
    } catch (err) {
      console.error('Error checking bulk availability:', err);
      setError(err.response?.data?.message || 'Failed to check bulk availability');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const assignBulkAssets = useCallback(async (productId, assetIds) => {
    if (!productId || !assetIds || assetIds.length === 0 || !token) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/assets/assign-bulk`,
        {
          productId,
          assetIds,
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update available assets after assignment
        setAvailableAssets(prev => ({
          ...prev,
          [productId]: prev[productId]?.filter(asset => !assetIds.includes(asset._id)) || [],
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error assigning bulk assets:', err);
      setError(err.response?.data?.message || 'Failed to assign assets');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const resolveConflict = useCallback(async (conflictId, resolution) => {
    if (!conflictId || !resolution || !token) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${BaseURL}/api/assets/resolve-conflict`,
        {
          conflictId,
          resolution, // 'force', 'alternative', 'cancel'
          vendorId: user?._id,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove resolved conflict
        setConflicts(prev => prev.filter(c => c.id !== conflictId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resolving conflict:', err);
      setError(err.response?.data?.message || 'Failed to resolve conflict');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  const getAvailableAssetsForProduct = useCallback((productId) => {
    return availableAssets[productId] || [];
  }, [availableAssets]);

  const getConflictsForProduct = useCallback((productId) => {
    return conflicts.filter(c => c.productId === productId);
  }, [conflicts]);

  const hasConflicts = useCallback(() => {
    return conflicts.length > 0;
  }, [conflicts]);

  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    conflicts,
    availableAssets,
    checkAvailability,
    checkBulkAvailability,
    assignBulkAssets,
    resolveConflict,
    getAvailableAssetsForProduct,
    getConflictsForProduct,
    hasConflicts,
    clearConflicts,
    clearError,
  };
};