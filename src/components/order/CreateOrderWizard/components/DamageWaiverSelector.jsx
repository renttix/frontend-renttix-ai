"use client";
import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { FiShield, FiInfo } from "react-icons/fi";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";

export default function DamageWaiverSelector({
  selectedLevel = null,
  onLevelChange,
  eligibleSubtotal = 0,
  onCalculationChange,
  customerType = "account",
  categoryId = null,
  productId = null,
  token,
  vendorId
}) {
  const [availableLevels, setAvailableLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState({});
  const [error, setError] = useState(null);

  // Fetch available damage waiver levels
  useEffect(() => {
    fetchAvailableLevels();
  }, [customerType, categoryId, productId, token, vendorId]);

  const fetchAvailableLevels = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (customerType) params.append('customerType', customerType);
      if (categoryId) params.append('categoryId', categoryId);
      if (productId) params.append('productId', productId);
      if (vendorId) params.append('vendorId', vendorId);

      const response = await axios.get(
        `${BaseURL}/damage-waiver/levels?${params.toString()}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setAvailableLevels(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching damage waiver levels:', err);
      setError('Failed to load damage waiver options');
    } finally {
      setLoading(false);
    }
  };

  // Calculate waiver cost for a specific level
  const calculateWaiverCost = async (levelId) => {
    if (!levelId || !eligibleSubtotal) return;

    try {
      // First, get the damage waiver level details
      const level = availableLevels.find(l => l._id === levelId);
      if (!level) {
        console.error('Damage waiver level not found:', levelId);
        return;
      }

      // Calculate waiver amount based on eligible subtotal and rate
      const waiverAmount = (eligibleSubtotal * level.rate) / 100;

      // Get vendor settings for tax calculation
      const vendorSettings = await getVendorWaiverSettings();
      const taxRate = vendorSettings?.damageWaiverTaxable ? (vendorSettings.damageWaiverTaxRate || 0) : 0;
      const taxAmount = (waiverAmount * taxRate) / 100;
      const totalAmount = waiverAmount + taxAmount;

      const calc = {
        waiverAmount: Math.round(waiverAmount * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        rate: level.rate,
        taxRate: taxRate,
        taxable: vendorSettings?.damageWaiverTaxable || false
      };

      console.log('Waiver calculation result:', calc);

      // Notify parent component of calculation change
      if (onCalculationChange) {
        onCalculationChange(calc);
      }

      setCalculations(prev => ({
        ...prev,
        [levelId]: calc
      }));

    } catch (err) {
      console.error('Error calculating waiver:', err);

      // Set fallback calculation
      const fallbackCalc = {
        waiverAmount: Math.round((eligibleSubtotal * 0.05) * 100) / 100, // 5% fallback
        taxAmount: 0,
        totalAmount: Math.round((eligibleSubtotal * 0.05) * 100) / 100,
        rate: 5,
        taxRate: 0,
        taxable: false,
        fallback: true
      };

      if (onCalculationChange) {
        onCalculationChange(fallbackCalc);
      }

      setCalculations(prev => ({
        ...prev,
        [levelId]: fallbackCalc
      }));
    }
  };


  // Get vendor damage waiver settings
  const getVendorWaiverSettings = async () => {
    try {
      const response = await axios.get(
        `${BaseURL}/damage-waiver/settings`,
        {
          headers: { authorization: `Bearer ${token}` },
          params: { vendorId: vendorId }
        }
      );

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching vendor settings:', err);
    }
    return null;
  };

  // Handle waiver level selection
  const handleLevelChange = async (levelId) => {
    if (onLevelChange) {
      onLevelChange(levelId);
    }

    if (levelId) {
      // Calculate cost for the selected level
      await calculateWaiverCost(levelId);
    } else {
      // Clear calculations when no level is selected
      setCalculations({});
      if (onCalculationChange) {
        onCalculationChange({
          waiverAmount: 0,
          taxAmount: 0,
          totalAmount: 0
        });
      }
    }
  };

  // Get current vendor ID from token or auth context
  const getCurrentVendorId = () => {
    // Decode JWT token to get vendor ID
    try {
      if (!token) return null;

      // Decode JWT token (assuming it's a JWT)
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

      // Look for vendor ID in common JWT fields
      const vendorId = decodedPayload.vendorId || decodedPayload.vendor_id || decodedPayload.sub;

      if (vendorId) {
        console.log('Extracted vendor ID from token:', vendorId);
        return vendorId;
      }

      // Fallback: try to extract from user object if present
      if (decodedPayload.user && decodedPayload.user.vendorId) {
        console.log('Extracted vendor ID from user object:', decodedPayload.user.vendorId);
        return decodedPayload.user.vendorId;
      }

      console.warn('Could not extract vendor ID from token');
      return null;
    } catch (err) {
      console.error('Error decoding token for vendor ID:', err);
      return null;
    }
  };

  // Get current calculation for the selected level
  const getCurrentCalculation = () => {
    return calculations[selectedLevel] || null;
  };


  if (loading) {
    return (
      <Card className="w-full">
        <div className="flex items-center gap-3">
          <FiShield className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Damage Waiver</h3>
            <p className="text-sm text-gray-600">Loading waiver options...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <Message severity="error" text={error} />
      </Card>
    );
  }

  if (availableLevels.length === 0) {
    return (
      <Card className="w-full">
        <div className="flex items-center gap-3">
          <FiShield className="w-6 h-6 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Damage Waiver</h3>
            <p className="text-sm text-gray-600">No damage waiver options available</p>
          </div>
        </div>
      </Card>
    );
  }

  const levelOptions = [
    { label: "No Protection", value: null },
    ...availableLevels.map(level => ({
      label: `${level.name} (${level.rate}% of rental value)`,
      value: level._id
    }))
  ];

  const currentCalculation = getCurrentCalculation();
  const selectedLevelData = availableLevels.find(l => l._id === selectedLevel);

  return (
    <Card className="w-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiShield className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Damage Waiver Protection</h3>
              <p className="text-sm text-gray-600">
                Add protection against accidental damage to your rental equipment
              </p>
            </div>
          </div>

          {currentCalculation && currentCalculation.totalAmount > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Waiver Cost</p>
              <p className="text-lg font-bold text-blue-600">
                £{currentCalculation.totalAmount.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* Waiver Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Protection Level
            </label>
            <Dropdown
              value={selectedLevel}
              options={levelOptions}
              onChange={(e) => handleLevelChange(e.value)}
              placeholder="Select protection level"
              className="w-full"
            />
          </div>

          {/* Cost Breakdown */}
          {currentCalculation && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Eligible Equipment Value:</span>
                  <span>£{eligibleSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waiver Amount ({currentCalculation.rate}%):</span>
                  <span>£{currentCalculation.waiverAmount.toFixed(2)}</span>
                </div>
                {currentCalculation.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({currentCalculation.taxRate}%):</span>
                    <span>£{currentCalculation.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <Divider />
                <div className="flex justify-between font-bold">
                  <span>Total Waiver Cost:</span>
                  <span>£{currentCalculation.totalAmount.toFixed(2)}</span>
                </div>
                {currentCalculation.fallback && (
                  <div className="text-xs text-amber-600 mt-1">
                    * Using fallback calculation
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Level Information */}
          {selectedLevelData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">{selectedLevelData.name}</p>
                  <p className="mt-1">{selectedLevelData.description || 'Damage waiver protection for your rental equipment'}</p>
                  <p className="mt-1">
                    <strong>Coverage:</strong> {selectedLevelData.rate}% of equipment value |
                    <strong> Rate:</strong> {selectedLevelData.rate}% of rental value
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Damage Waiver:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Damage waiver provides protection against accidental damage</li>
                <li>Coverage applies to the rental period only</li>
                <li>Premium is calculated as a percentage of equipment value</li>
                <li>Tax may apply to the waiver premium</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}