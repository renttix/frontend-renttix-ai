"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { addressAPI } from '../../../../services/apiService';
import debounce from 'lodash/debounce';

const AddressAutocomplete = ({ 
  value, 
  onSelect, 
  placeholder = "Start typing address...",
  className = "",
  disabled = false,
  validatePostcode = true,
  country = "UK"
}) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    street: '',
    city: '',
    postcode: '',
    country: country
  });
  
  const autocompleteRef = useRef(null);

  // Debounced search function
  const searchAddresses = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await addressAPI.getAddressSuggestions(searchQuery);
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query && query !== value) {
      searchAddresses(query);
    }
  }, [query, searchAddresses]);

  const handleSelect = async (e) => {
    const address = e.value;
    setSelectedAddress(address);
    setQuery(address.formatted);
    
    // Get full address details
    try {
      setLoading(true);
      const response = await addressAPI.geocodeAddress({
        placeId: address.placeId,
        address: address.formatted
      });
      
      if (response.data.success) {
        const fullAddress = response.data.address;
        
        // Validate UK postcode if required
        if (validatePostcode && country === 'UK' && fullAddress.postcode) {
          const postcodeValid = validateUKPostcode(fullAddress.postcode);
          if (!postcodeValid) {
            console.warn('Invalid UK postcode:', fullAddress.postcode);
          }
        }
        
        onSelect({
          ...fullAddress,
          formatted: address.formatted,
          placeId: address.placeId
        });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUKPostcode = (postcode) => {
    // UK postcode regex pattern
    const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$/i;
    return ukPostcodeRegex.test(postcode.trim());
  };

  const handleManualSubmit = () => {
    if (validatePostcode && country === 'UK' && manualAddress.postcode) {
      const postcodeValid = validateUKPostcode(manualAddress.postcode);
      if (!postcodeValid) {
        // Show error
        return;
      }
    }
    
    onSelect({
      street: manualAddress.street,
      city: manualAddress.city,
      postcode: manualAddress.postcode,
      country: manualAddress.country,
      formatted: `${manualAddress.street}, ${manualAddress.city}, ${manualAddress.postcode}`,
      manualEntry: true
    });
    
    setShowManualEntry(false);
    setQuery(`${manualAddress.street}, ${manualAddress.city}, ${manualAddress.postcode}`);
  };

  const itemTemplate = (item) => {
    return (
      <div className="flex flex-col">
        <span className="font-semibold">{item.main}</span>
        <small className="text-gray-500">{item.secondary}</small>
      </div>
    );
  };

  const searchTemplate = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-2">
          <ProgressSpinner style={{ width: '20px', height: '20px' }} />
          <span className="ml-2">Searching...</span>
        </div>
      );
    }
    
    if (query.length >= 3 && suggestions.length === 0 && !loading) {
      return (
        <div className="p-2 text-center">
          <p className="text-gray-500 mb-2">No addresses found</p>
          <Button
            label="Enter manually"
            icon="pi pi-pencil"
            size="small"
            outlined
            onClick={() => setShowManualEntry(true)}
          />
        </div>
      );
    }
    
    return null;
  };

  if (showManualEntry) {
    return (
      <div className={`manual-address-entry ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Enter Address Manually</h4>
          <Button
            icon="pi pi-times"
            rounded
            text
            size="small"
            onClick={() => setShowManualEntry(false)}
          />
        </div>
        
        <div className="space-y-3">
          <div className="field">
            <label htmlFor="street" className="text-sm font-medium">Street Address *</label>
            <InputText
              id="street"
              value={manualAddress.street}
              onChange={(e) => setManualAddress({ ...manualAddress, street: e.target.value })}
              className="w-full"
              placeholder="123 Main Street"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label htmlFor="city" className="text-sm font-medium">City *</label>
              <InputText
                id="city"
                value={manualAddress.city}
                onChange={(e) => setManualAddress({ ...manualAddress, city: e.target.value })}
                className="w-full"
                placeholder="London"
              />
            </div>
            
            <div className="field">
              <label htmlFor="postcode" className="text-sm font-medium">Postcode *</label>
              <InputText
                id="postcode"
                value={manualAddress.postcode}
                onChange={(e) => setManualAddress({ ...manualAddress, postcode: e.target.value })}
                className="w-full"
                placeholder="SW1A 1AA"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              size="small"
              onClick={() => setShowManualEntry(false)}
            />
            <Button
              label="Use This Address"
              icon="pi pi-check"
              size="small"
              onClick={handleManualSubmit}
              disabled={!manualAddress.street || !manualAddress.city || !manualAddress.postcode}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`address-autocomplete ${className}`}>
      <AutoComplete
        ref={autocompleteRef}
        value={query}
        suggestions={suggestions}
        completeMethod={(e) => setQuery(e.query)}
        onChange={(e) => setQuery(e.value)}
        onSelect={handleSelect}
        placeholder={placeholder}
        disabled={disabled}
        itemTemplate={itemTemplate}
        panelFooterTemplate={searchTemplate}
        field="formatted"
        forceSelection={false}
        className="w-full"
        inputClassName="w-full"
        panelClassName="address-autocomplete-panel"
      />
      
      {!loading && query.length < 3 && query.length > 0 && (
        <small className="text-gray-500 mt-1">
          Type at least 3 characters to search
        </small>
      )}
      
      {selectedAddress && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <div className="flex items-start">
            <i className="pi pi-check-circle text-green-600 mr-2"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Address selected</p>
              <p className="text-xs text-green-600 mt-1">{selectedAddress.formatted}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AddressAutocomplete);