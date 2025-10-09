import React, { useEffect, useState } from "react";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { TabView, TabPanel } from "primereact/tabview";
import { motion } from "framer-motion";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import {
  FiDollarSign, FiPercent, FiCalendar, FiTrendingUp,
  FiClock, FiPlus, FiInfo, FiZap, FiShield
} from "react-icons/fi";
import AddTaxClassModal from "../../../system-setup/tax-classes/AddTaxClassModal";
import RateDefinatonModal from "../../../system-setup/rate-defination/RateDefinatonModal";
import ConfirmLink from "../../../confirmLink/ConfirmLink";

export default function PricingStep({
  formData,
  updateFormData,
  errors,
  taxClasses,
  setTaxClasses,
  rateDefinitions,
  setRateDefinitions,
  token,
  user
}) {
  const [loadingTaxClasses, setLoadingTaxClasses] = useState(false);
  const [loadingRateDefinitions, setLoadingRateDefinitions] = useState(false);
  const [taxClassRefresh, setTaxClassRefresh] = useState(false);
  const [rateDefRefresh, setRateDefRefresh] = useState(false);
  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false);
  const [pricingTiers, setPricingTiers] = useState([
    { duration: 1, unit: "day", price: formData.rentPrice || 0 },
    { duration: 7, unit: "day", price: 0 },
    { duration: 1, unit: "month", price: 0 }
  ]);
  
  // Fetch tax classes
  useEffect(() => {
    const fetchTaxClasses = async () => {
      setLoadingTaxClasses(true);
      try {
        const response = await axios.get(`${BaseURL}/tax-classes/product`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setTaxClasses(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching tax classes:", err);
      } finally {
        setLoadingTaxClasses(false);
      }
    };
    
    fetchTaxClasses();
  }, [taxClassRefresh, token]);
  
  // Fetch rate definitions
  useEffect(() => {
    const fetchRateDefinitions = async () => {
      if (formData.status !== "Rental") return;
      
      setLoadingRateDefinitions(true);
      try {
        const response = await axios.get(`${BaseURL}/rate-definition/list`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setRateDefinitions(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching rate definitions:", err);
      } finally {
        setLoadingRateDefinitions(false);
      }
    };
    
    fetchRateDefinitions();
  }, [formData.status, rateDefRefresh, token]);
  
  const calculateSuggestedPrices = () => {
    const basePrice = parseFloat(formData.rentPrice) || 0;
    if (basePrice > 0) {
      setPricingTiers([
        { duration: 1, unit: "day", price: basePrice },
        { duration: 7, unit: "day", price: Math.round(basePrice * 6.5) }, // Small discount for weekly
        { duration: 1, unit: "month", price: Math.round(basePrice * 25) } // Larger discount for monthly
      ]);
    }
  };
  
  const selectedTaxClass = taxClasses.find(tc => tc._id === formData.taxClass);
  const selectedRateDef = rateDefinitions.find(rd => rd._id === formData.rateDefinition);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiDollarSign className="mr-3 text-blue-600" />
          Pricing & Tax Configuration
        </h2>
        <p className="mt-2 text-gray-600">
          Set competitive prices and configure tax settings
        </p>
      </div>
      
      {/* Pricing Strategy Tips */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6"
      >
        <div className="flex items-start">
          <FiTrendingUp className="text-green-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pricing Strategy Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Market Research</p>
                <p className="text-gray-600 text-xs mt-1">
                  Check competitor prices for similar items in your area
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Value Pricing</p>
                <p className="text-gray-600 text-xs mt-1">
                  Consider the value you provide beyond just the product
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Flexible Rates</p>
                <p className="text-gray-600 text-xs mt-1">
                  Offer discounts for longer rental periods
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Main Pricing Section */}
      {formData.status === "Rental" ? (
        <div className="space-y-6">
          {/* Rate Definition */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Rate Definition <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <ConfirmLink href="/system-setup/rate-definition">
                  <Button
                    icon={<FiCalendar className="w-4 h-4" />}
                    label="Manage"
                    className="p-button-text p-button-sm"
                  />
                </ConfirmLink>
                <RateDefinatonModal refreshParent={() => setRateDefRefresh(!rateDefRefresh)} />
              </div>
            </div>
            
            <Dropdown
              value={formData.rateDefinition}
              onChange={(e) => updateFormData({ rateDefinition: e.value })}
              options={rateDefinitions}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select rate definition"
              loading={loadingRateDefinitions}
              className={`w-full ${errors.rateDefinition ? 'p-invalid' : ''}`}
              itemTemplate={(option) => (
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500">
                    Min: {option.minDuration} {option.unit}
                  </div>
                </div>
              )}
            />
            
            {errors.rateDefinition && (
              <small className="text-red-500 text-xs mt-1">{errors.rateDefinition}</small>
            )}
            
            {selectedRateDef && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-blue-50 rounded-lg text-sm"
              >
                <p className="text-blue-900">
                  Minimum rental period: <span className="font-medium">{selectedRateDef.minDuration} {selectedRateDef.unit}</span>
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Rental Pricing */}
          <div>
            <TabView>
              <TabPanel header="Simple Pricing" leftIcon="pi pi-dollar">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rental Rate <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="p-inputgroup">
                            <span className="p-inputgroup-addon bg-gray-100">
                              {user?.currencyKey || '$'}
                            </span>
                            <InputNumber
                              value={formData.rentPrice}
                              onValueChange={(e) => updateFormData({ rentPrice: e.value })}
                              mode="currency"
                              currency={user?.currencyKey || 'USD'}
                              locale="en-US"
                              placeholder="0.00"
                              className={`flex-1 ${errors.rentPrice ? 'p-invalid' : ''}`}
                            />
                          </div>
                        </div>
                        <div className="w-32">
                          <Dropdown
                            value={formData.rate || 'daily'}
                            onChange={(e) => updateFormData({ rate: e.value })}
                            options={[
                              { label: 'Daily', value: 'daily' },
                              { label: 'Weekly', value: 'weekly' }
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select period"
                            className={`w-full ${errors.rate ? 'p-invalid' : ''}`}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <small className="text-gray-500 text-xs">
                          Enter the rate for the selected period
                        </small>
                        {formData.rate && (
                          <small className="text-gray-500 text-xs">
                            {formData.rate === 'weekly' && formData.rentPrice ?
                              `Daily equivalent: ${user?.currencyKey || '$'}${(formData.rentPrice / 7).toFixed(2)}` : ''
                            }
                          </small>
                        )}
                      </div>
                      {errors.rentPrice && (
                        <small className="text-red-500 text-xs mt-1">{errors.rentPrice}</small>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    label="Generate Suggested Prices"
                    icon={<FiZap className="mr-2" />}
                    onClick={calculateSuggestedPrices}
                    className="p-button-outlined p-button-sm"
                    disabled={!formData.rentPrice}
                  />
                </div>
              </TabPanel>
              
              <TabPanel header="Advanced Pricing" leftIcon="pi pi-chart-line">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Set different rates for various rental durations
                  </p>
                  
                  {pricingTiers.map((tier, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">
                          {tier.duration} {tier.unit}
                        </label>
                      </div>
                      <div className="flex-1">
                        <div className="p-inputgroup">
                          <span className="p-inputgroup-addon">
                            {user?.currencyKey || '$'}
                          </span>
                          <InputNumber
                            value={tier.price}
                            onValueChange={(e) => {
                              const newTiers = [...pricingTiers];
                              newTiers[index].price = e.value;
                              setPricingTiers(newTiers);
                            }}
                            mode="currency"
                            currency={user?.currencyKey || 'USD'}
                            locale="en-US"
                          />
                        </div>
                      </div>
                      {index === 0 && tier.price > 0 && (
                        <div className="text-sm text-gray-500">
                          Base rate
                        </div>
                      )}
                      {index > 0 && tier.price > 0 && pricingTiers[0].price > 0 && (
                        <div className="text-sm text-green-600">
                          {Math.round((1 - (tier.price / (pricingTiers[0].price * tier.duration))) * 100)}% discount
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  <Button
                    label="Add Pricing Tier"
                    icon={<FiPlus className="mr-2" />}
                    className="p-button-outlined p-button-sm"
                    onClick={() => setPricingTiers([...pricingTiers, { duration: 1, unit: "week", price: 0 }])}
                  />
                </div>
              </TabPanel>
            </TabView>
          </div>
        </div>
      ) : (
        // Sale Pricing
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sale Price <span className="text-red-500">*</span>
          </label>
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon bg-gray-100">
              {user?.currencyKey || '$'}
            </span>
            <InputNumber
              value={formData.salePrice}
              onValueChange={(e) => updateFormData({ salePrice: e.value })}
              mode="currency"
              currency={user?.currencyKey || 'USD'}
              locale="en-US"
              placeholder="0.00"
              className={`flex-1 ${errors.salePrice ? 'p-invalid' : ''}`}
            />
          </div>
          {errors.salePrice && (
            <small className="text-red-500 text-xs mt-1">{errors.salePrice}</small>
          )}
        </div>
      )}
      
      {/* Tax Configuration */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <FiPercent className="text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Tax Configuration</h3>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Tax Class <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <ConfirmLink href="/system-setup/tax-classes">
                <Button
                  icon={<FiPercent className="w-4 h-4" />}
                  label="Manage"
                  className="p-button-text p-button-sm"
                />
              </ConfirmLink>
              <AddTaxClassModal refreshParent={() => setTaxClassRefresh(!taxClassRefresh)} />
            </div>
          </div>
          
          <Dropdown
            value={formData.taxClass}
            onChange={(e) => updateFormData({ taxClass: e.value })}
            options={taxClasses}
            optionLabel="name"
            optionValue="_id"
            placeholder="Select tax class"
            loading={loadingTaxClasses}
            className={`w-full ${errors.taxClass ? 'p-invalid' : ''}`}
            itemTemplate={(option) => (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {option.rate}%
                </span>
              </div>
            )}
          />
          
          {errors.taxClass && (
            <small className="text-red-500 text-xs mt-1">{errors.taxClass}</small>
          )}
          
          {selectedTaxClass && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedTaxClass.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedTaxClass.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{selectedTaxClass?.taxRate}%</p>
                  <p className="text-xs text-gray-500">Tax Rate</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Damage Waiver Configuration */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <FiShield className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Damage Waiver</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                inputId="damageWaiverEnabled"
                checked={formData.damageWaiverEnabled || false}
                onChange={(e) => updateFormData({ damageWaiverEnabled: e.checked })}
              />
              <label htmlFor="damageWaiverEnabled" className="text-sm font-medium cursor-pointer">
                Enable Damage Waiver for this product
              </label>
            </div>

            <p className="text-xs text-gray-500 ml-6">
              When enabled, this product will be eligible for damage waiver coverage during rental periods.
            </p>
          </div>
        </div>
      </div>
      
      {/* Pricing Summary */}
      {(formData.rentPrice || formData.salePrice) && selectedTaxClass && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 rounded-lg p-6"
        >
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <FiInfo className="mr-2 text-blue-600" />
            Pricing Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium text-gray-900">
                {user?.currencyKey || '$'} {formData.status === "Rental" ? formData.rentPrice : formData.salePrice}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({selectedTaxClass?.taxRate}%):</span>
              <span className="font-medium text-gray-900">
                {user?.currencyKey || '$'} {( selectedTaxClass?.taxRate / 100)*(formData.status === "Rental" ? formData.rentPrice : formData.salePrice)?.toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium text-gray-900">Total Price:</span>
              <span className="font-bold text-lg text-blue-600">
                {user?.currencyKey || '$'} {((formData.status === "Rental" ? formData.rentPrice : formData.salePrice))+( selectedTaxClass?.taxRate / 100)*(formData.status === "Rental" ? formData.rentPrice : formData.salePrice).toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}