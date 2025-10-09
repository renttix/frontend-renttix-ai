"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useWizard } from "../context/WizardContext";
import { motion } from "framer-motion";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { TabView, TabPanel } from "primereact/tabview";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import axios from "axios";
import { BaseURL, imageBaseURL } from "../../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import { formatCurrency, calculateDaysBetween } from "../../../../../utils/helper";
import InlineMaintenanceConfig from "../components/InlineMaintenanceConfig";
import { ContextualHelp } from "../components/ContextualHelp";
import { ProductSkeleton, TableSkeleton } from "../components/LoadingSkeleton";
import AssetSelector from "../components/AssetSelector";
import DamageWaiverSelector from "../components/DamageWaiverSelector";
import { FiShield } from "react-icons/fi";

export default function ProductBuilderStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);

  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(formData.products || []);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [maintenanceConfigs, setMaintenanceConfigs] = useState({});
  const [orderDiscount, setOrderDiscount] = useState(formData.orderDiscount || 0);

  // Asset selection states
  const [assetSelectorVisible, setAssetSelectorVisible] = useState(false);
  const [currentProductForAssets, setCurrentProductForAssets] = useState(null);
  const [productAssets, setProductAssets] = useState({}); // { productId: [assets] }

  // Damage waiver states
  const [selectedDamageWaiverLevel, setSelectedDamageWaiverLevel] = useState(formData.damageWaiverLevel || null);
  const [damageWaiverCalculations, setDamageWaiverCalculations] = useState(formData.damageWaiverCalculations || {
    waiverAmount: 0,
    taxAmount: 0,
    totalAmount: 0
  });
  const [globalDamageWaiverEnabled, setGlobalDamageWaiverEnabled] = useState(false);
  const [loadingDamageWaiverSettings, setLoadingDamageWaiverSettings] = useState(true);
  const [vendorWaiverSettings, setVendorWaiverSettings] = useState(null);

  // Deposit states
  const [depositType, setDepositType] = useState(formData.depositType || "noDeposit");
  const [depositPercentage, setDepositPercentage] = useState(formData.depositPercentage || 0);
  const [depositFixedAmount, setDepositFixedAmount] = useState(formData.depositFixedAmount || 0);

  // Calculate rental duration (calendar days, used for display only)
  const rentalDuration =
    formData.chargingStartDate && formData.expectedReturnDate
      ? calculateDaysBetween(
          new Date(formData.chargingStartDate),
          new Date(formData.expectedReturnDate)
        )
      : 1;

  // Counts billable days between start/end based on rentalDaysPerWeek
  // 5 => exclude Sat+Sun, 6 => exclude Sun, 7 => count all
  const chargeableDaysForProduct = useCallback(
    (p) => {
      const start = formData.chargingStartDate ? new Date(formData.chargingStartDate) : null;
      const end = formData.expectedReturnDate ? new Date(formData.expectedReturnDate) : null;

      const fallbackMin =
        p?.minimumRentalPeriod ??
        p?.rateDefinition?.minimumRentalPeriod ??
        0;

      if (!start || !end) return Math.max(1, fallbackMin);

      const perWeek =
        p?.rentalDaysPerWeek ??
        p?.rateDefinition?.rentalDaysPerWeek ??
        7; // default: count all days

      const excludeSunday = perWeek <= 6;
      const excludeSaturday = perWeek === 5;

      // normalize to midnight to avoid TZ drift
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      let days = 0;
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay(); // 0 Sun … 6 Sat
        if ((excludeSunday && dow === 0) || (excludeSaturday && dow === 6)) continue;
        days++;
      }

      return Math.max(days, fallbackMin, 1);
    },
    [formData.chargingStartDate, formData.expectedReturnDate]
  );

  // Helper function to get product rate info (daily or weekly)
  const getProductRateInfo = useCallback((product) => {
    // Check if product has weekly rate (from product data or rate definition)
    const isWeekly = product.rate === 'weekly';
    console.log({isWeekly,product})
    const rate = product.rentPrice || product.price || 0;
    const period = isWeekly ? 'weekly' : 'daily';

    return { rate, period, isWeekly };
  }, []);

  // Calculate chargeable units (days or weeks) for a product
  const chargeableUnitsForProduct = useCallback(
    (product) => {
      const { isWeekly } = getProductRateInfo(product);
      const chargeableDays = chargeableDaysForProduct(product);
      const rentalDaysPerWeek = product.rentalDaysPerWeek || product?.rateDefinition?.rentalDaysPerWeek || 7;
console.log()
      if (isWeekly) {
        // For weekly rates, minimum period is in weeks, not days
        const minimumWeeks = 1;
        // Convert days to weeks for weekly rate products using rate definition's days per week
        const calculatedWeeks = Math.ceil(chargeableDays / rentalDaysPerWeek);
        return Math.max(calculatedWeeks, minimumWeeks);
      }

      // For daily rates, minimum period is in days (existing behavior)
      const minimumDays = product.minimumRentalPeriod || 1;
      return Math.max(chargeableDays, minimumDays);
    },
    [chargeableDaysForProduct, getProductRateInfo]
  );

  // Initialize product assets from selected products
  useEffect(() => {
    const assets = {};
    selectedProducts.forEach((product) => {
      if (product.selectedAssets) {
        assets[product.productId] = product.selectedAssets;
      }
    });
    setProductAssets(assets);
  }, []);

  // Fetch bundles
  useEffect(() => {
    fetchBundles();
    fetchDamageWaiverSettings();
  }, [user]);

  const fetchDamageWaiverSettings = async () => {
    try {
      setLoadingDamageWaiverSettings(true);
      const vendorId = user?._id || user?.vendor;

      const response = await axios.get(`${BaseURL}/damage-waiver/settings`, {
        headers: { authorization: `Bearer ${token}` },
        params: { vendorId: vendorId }
      });

      if (response.data.success) {
        const settings = response.data.data;
        setGlobalDamageWaiverEnabled(settings?.damageWaiverEnabled || false);
        setVendorWaiverSettings(settings); // Store the full settings
      } else {
        setGlobalDamageWaiverEnabled(false);
        setVendorWaiverSettings(null);
      }
    } catch (error) {
      console.error('Failed to fetch damage waiver settings:', error);
      setGlobalDamageWaiverEnabled(false);
      setVendorWaiverSettings(null);
    } finally {
      setLoadingDamageWaiverSettings(false);
    }
  };

  useEffect(() => {
    updateFormData({ orderDiscount });
  }, [orderDiscount]);

  const fetchBundles = async () => {
    try {
      setLoadingBundles(true);
      const response = await axios.get(`${BaseURL}/bundles/popular?vendorId=${user._id}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (response.data?.data) {
        setBundles(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch bundles:", error);
      // Set demo bundles as fallback
      setBundles([
        {
          _id: "demo-bundle-1",
          name: "Party Package",
          description: "50 chairs, 10 tables, PA system",
          basePrice: 299,
          discountPercentage: 10,
          image: "/images/bundles/party.jpg",
          products: [
            {
              product: { _id: "chair-1", name: "Folding Chair", price: 5 },
              quantity: 50,
            },
            {
              product: { _id: "table-1", name: "Round Table", price: 15 },
              quantity: 10,
            },
            {
              product: { _id: "pa-1", name: "PA System", price: 75 },
              quantity: 1,
            },
          ],
        },
      ]);
    } finally {
      setLoadingBundles(false);
    }
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const vendorId = user._id;

      const response = await axios.post(
        `${BaseURL}/product/product-lists?search=${searchQuery}&page=1&limit=100`,
        { vendorId },
        {
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        let productList = response.data.data || [];

        // Filter by category if selected
        if (categoryFilter) {
          productList = productList.filter((p) => p.category?.name === categoryFilter);
        }

        setProducts(productList);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(productList.map((p) => p.category?.name).filter(Boolean)),
        ].map((name) => ({ label: name, value: name }));
        setCategories([{ label: "All Categories", value: null }, ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelection = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      setCurrentProductForAssets(product);
      setAssetSelectorVisible(true);
    }
  };

  const currencyKey = useSelector((state) => state?.authReducer?.user?.currencyKey);

  const handleAssetsChange = (productId, assets) => {
    // Update product assets
    setProductAssets((prev) => ({
      ...prev,
      [productId]: assets,
    }));

    // Update selected products
    setSelectedProducts((prevSelected) => {
      const newSelectedProducts = prevSelected.filter((p) => p.productId !== productId);

      if (assets.length > 0) {
        const product = products.find((p) => p._id === productId);
        if (product) {
          const newProduct = {
            productId: product._id,
            name: product.productName || product.name,
            productName: product.productName || product.name,
            sku: product.sku,
            category: product.category?.name || "Uncategorized",
            dailyRate: product.rentPrice || product.price || 0,
            quantity: assets.length,
            selectedAssets: assets,
            image: product.images?.[0] || "/images/product/placeholder.webp",
            maintenanceRequired: product.maintenanceRequired || false,
            damageWaiverEnabled: Boolean(product.damageWaiverEnabled), // Ensure boolean value
            currency: currencyKey,
            product: product._id,
            price: product.rentPrice || product.salePrice || 0,
            salePrice: product.salePrice,
            rate:product.rate,
            taxRate: product?.taxClass?.taxRate,
            xeroTaxTypeId: product?.taxClass?.xeroTaxTypeId,
            quickBooksTaxId: product?.taxClass?.quickBooksTaxId,
            zohoTaxId: product?.taxClass?.zohoTaxId,
            rentalDaysPerWeek: product?.rateDefinition?.rentalDaysPerWeek,
            minimumRentalPeriod: product?.rateDefinition?.minimumRentalPeriod,
            // extra…
          };
          newSelectedProducts.push(newProduct);
        }
      }

      // Update form data
      updateFormData({ products: newSelectedProducts });

      return newSelectedProducts;
    });
  };

  const handleRemoveAsset = (productId, assetId) => {
    const updatedAssets = (productAssets[productId] || []).filter((a) => a.assetId !== assetId);
    handleAssetsChange(productId, updatedAssets);
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      const salePriceNum = Number(product.salePrice);
      const hasSalePrice = !isNaN(salePriceNum) && salePriceNum > 0;

      if (hasSalePrice) {
        // If salePrice exists → just multiply by quantity
        return total + product.quantity * salePriceNum;
      } else {
        // Otherwise → use rental calculation with tax and chargeable units (days or weeks)
        const { rate, isWeekly } = getProductRateInfo(product);
        const chargeableUnits = chargeableUnitsForProduct(product);

        const baseAmount = product.quantity * rate * chargeableUnits;

        const tax = baseAmount * (product.taxRate / 100);

        return total + baseAmount + tax;
      }
    }, 0);
  };

  // Calculate deposit amount based on type
  const calculateDepositAmount = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * orderDiscount) / 100;
    const baseTotal = subtotal - discountAmount;
    const damageWaiverTotal = damageWaiverCalculations.totalAmount || 0;
    const orderTotal = baseTotal + damageWaiverTotal;

    switch (depositType) {
      case "percentage":
        return (orderTotal * depositPercentage) / 100;
      case "fixedAmount":
        return depositFixedAmount;
      case "noDeposit":
      default:
        return 0;
    }
  };

  const calculateTotalWithDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * orderDiscount) / 100;
    const baseTotal = subtotal - discountAmount;
    const damageWaiverTotal = damageWaiverCalculations.totalAmount || 0;
    const depositAmount = calculateDepositAmount();
    return baseTotal + damageWaiverTotal + depositAmount;
  };

  const handleBundleSelect = async (bundle) => {
    try {
      alert(`Bundle selection with asset tracking is coming soon! For now, please select products individually.`);
      setActiveTab(1);
    } catch (error) {
      console.error("Error selecting bundle:", error);
      alert("Failed to add bundle. Please try again.");
    }
  };

  const handleMaintenanceConfigChange = (productId, config) => {
    setMaintenanceConfigs((prev) => ({
      ...prev,
      [productId]: config,
    }));

    // Update the product with maintenance config
    const updatedProducts = selectedProducts.map((p) =>
      p.productId === productId ? { ...p, maintenanceConfig: config } : p
    );

    setSelectedProducts(updatedProducts);
    updateFormData({ products: updatedProducts });
  };

  // Damage waiver handlers
  const handleDamageWaiverLevelChange = (level) => {
    setSelectedDamageWaiverLevel(level);
    updateFormData({ damageWaiverLevel: level });
  };

  const handleDamageWaiverCalculationChange = (calculations) => {
    setDamageWaiverCalculations(calculations);
    updateFormData({
      damageWaiverCalculations: calculations,
      damageWaiverAmount: calculations.totalAmount || 0
    });
  };

  // Deposit handlers
  const handleDepositTypeChange = (type) => {
    setDepositType(type);
    updateFormData({
      depositType: type,
      depositAmount: calculateDepositAmount()
    });
  };

  const handleDepositPercentageChange = (percentage) => {
    setDepositPercentage(percentage);
    if (depositType === "percentage") {
      updateFormData({
        depositPercentage: percentage,
        depositAmount: calculateDepositAmount()
      });
    }
  };

  const handleDepositFixedAmountChange = (amount) => {
    setDepositFixedAmount(amount);
    if (depositType === "fixedAmount") {
      updateFormData({
        depositFixedAmount: amount,
        depositAmount: calculateDepositAmount()
      });
    }
  };

  // Calculate eligible subtotal for damage waiver (products that support damage waiver)
  // NOTE: This is now mainly for display purposes - DamageWaiverSelector does its own filtering
  const calculateEligibleSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      // Check if product has assets selected and supports damage waiver
      const hasAssets = productAssets[product.productId]?.length > 0;
      const supportsDamageWaiver = product.damageWaiverEnabled === true; // Only true, not truthy

      if (hasAssets && supportsDamageWaiver) {
        const salePriceNum = Number(product.salePrice);
        const hasSalePrice = !isNaN(salePriceNum) && salePriceNum > 0;

        let productTotal = 0;
        if (hasSalePrice) {
          productTotal = product.quantity * salePriceNum;
        } else {
          const { rate, isWeekly } = getProductRateInfo(product);
          const chargeableUnits = chargeableUnitsForProduct(product);
          const baseAmount = product.quantity * rate * chargeableUnits;
          productTotal = baseAmount;
        }

        return total + productTotal;
      }

      return total;
    }, 0);
  };

  const validateStep = () => {
    const newErrors = {};

    if (selectedProducts.length === 0) {
      newErrors.products = "Please select at least one product";
    }

    // Check if all products have assets selected
    const productsWithoutAssets = selectedProducts.filter(
      (p) => !productAssets[p.productId] || productAssets[p.productId].length === 0
    );

    if (productsWithoutAssets.length > 0) {
      newErrors.assets = `Please select assets for: ${productsWithoutAssets.map((p) => p.name).join(", ")}`;
    }

    // Check if maintenance is configured for products that require it
    const productsNeedingMaintenance = selectedProducts.filter((p) => p.maintenanceRequired);
    const unconfiguredMaintenance = productsNeedingMaintenance.filter(
      (p) => !maintenanceConfigs[p.productId] || !maintenanceConfigs[p.productId].frequency
    );

    if (unconfiguredMaintenance.length > 0) {
      newErrors.maintenance = `Please configure maintenance for: ${unconfiguredMaintenance.map((p) => p.name).join(", ")}`;
    }

    setErrors(newErrors);
    setValidation(2, newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep()) {
      completeStep(2);
    }
  };

  // Product table columns
  const imageBodyTemplate = (product) => {
    return (
      <img
        onError={(e) => (e.currentTarget.src = "/images/product/placeholder.webp")}
        src={`${imageBaseURL}${product.images?.[0]}`}
        alt={product.name}
        className="h-16 w-16 rounded object-cover"
      />
    );
  };

  const nameBodyTemplate = (product) => {
    const displayName = product.productName || product.name || 'Unknown Product';
    const hasDamageWaiver = product.damageWaiverEnabled === true;

    return (
      <div>
        <div className="flex items-center gap-2">
          <div className="font-medium">{displayName}</div>
          {hasDamageWaiver ? (
            <Tag
              value="DW"
              severity="success"
              icon="pi pi-shield"
              className="text-xs"
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '12px'
              }}
            />
          ) : (
            <Tag
              value=""
              severity="danger"
              icon="pi pi-shield-alt"
              className="text-xs opacity-50"
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '12px'
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const priceBodyTemplate = (product) => {
    if (product.salePrice) {
      return <span>{formatCurrency(product.salePrice)}</span>;
    }

    const { rate, period } = getProductRateInfo(product);
    return <span>{formatCurrency(rate)} /{period === 'weekly' ? 'week' : 'day'}</span>;
  };

  const stockBodyTemplate = (product) => {
    const severity = product.quantity > 20 ? "success" : product.quantity > 10 ? "warning" : "danger";
    return (
      <div className="flex items-center gap-3 whitespace-nowrap">
        <Tag value={`${product.quantity} available`} severity={severity} />
      </div>
    );
  };

  const assetSelectionBodyTemplate = (product) => {
    const selectedAssets = productAssets[product._id] || [];

    // Determine product price
    let productPrice = 0;

    if (product.salePrice) {
      // Sale price: straight multiplication
      productPrice = product.salePrice;
    } else {
      // Rental price with tax included per day here (if you previously displayed per-day incl. tax)
      productPrice =
        product.rentPrice +
          (product.rentPrice * (product.taxClass?.taxRate || 0)) / 100 ||
        product.price ||
        0;
    }

    return (
      <div className="flex items-center gap-3 whitespace-nowrap">
        <Button
          label={selectedAssets.length > 0 ? `${selectedAssets.length} Assets Selected` : "Select Assets"}
          icon="pi pi-box"
          className={`px-3 py-2 text-sm ${selectedAssets.length > 0 ? "p-button-success" : "p-button-outlined"}`}
          onClick={() => handleAssetSelection(product._id)}
        />

        {selectedAssets.length > 0 && (
          <span className="text-sm font-semibold text-gray-700">
            ={" "}
            {formatCurrency(
              selectedAssets.length *
                productPrice *
                (product.salePrice ? 1 : chargeableUnitsForProduct(product))
            )}
          </span>
        )}
      </div>
    );
  };

  const maintenanceBodyTemplate = (product) => {
    const selectedAssets = productAssets[product._id] || [];
    if (selectedAssets.length === 0) return null;

    if (!product.maintenanceRequired) {
      return <Tag value="Not Required" severity="secondary" />;
    }

    return (
      <InlineMaintenanceConfig
        productId={product._id}
        productName={product.name}
        onConfigChange={(config) => handleMaintenanceConfigChange(product._id, config)}
        compact={true}
      />
    );
  };

  const selectedAssetsTemplate = (product) => {
    const assets = productAssets[product.productId] || [];

    if (assets.length === 0) return null;

    return (
      <div className="mt-2 rounded bg-gray-50 p-2">
        <div className="mb-1 text-sm font-medium">Selected Assets:</div>
        <div className="flex flex-wrap gap-1">
          {assets.map((asset) => (
            <Tag
              key={asset.assetId}
              value={asset.assetNumber}
              severity="info"
              removable
              onRemove={() => handleRemoveAsset(product.productId, asset.assetId)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="mb-2 text-2xl font-bold">Build Your Order</h2>
        <p className="text-gray-600">Select products and assign specific assets for each item</p>
      </div>

      {errors.products && <Message severity="error" text={errors.products} />}
      {errors.assets && <Message severity="warn" text={errors.assets} />}
      {errors.maintenance && <Message severity="warn" text={errors.maintenance} />}

      <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
        <TabPanel header="All Products" leftIcon="pi pi-list">
          {/* Search and Filters */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <ContextualHelp fieldId="productSearch">
                <span className="p-input-icon-left w-full">
                  <i className="pi pi-search pl-4" />
                  <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="product-search w-full pl-10"
                  />
                </span>
              </ContextualHelp>
            </div>
            <div className="w-full md:w-64">
              <Dropdown
                value={categoryFilter}
                options={categories}
                onChange={(e) => setCategoryFilter(e.value)}
                placeholder="All Categories"
                className="w-full"
              />
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <DataTable value={products} paginator rows={10} rowsPerPageOptions={[10, 25, 50]} className="p-datatable-sm" emptyMessage="No products found">
              <Column body={imageBodyTemplate} header="Image" style={{ width: "80px" }} />
              <Column body={nameBodyTemplate} header="Product" />
              <Column field="category.name" header="Category" />
              <Column
                field="rateDefinition.minimumRentalPeriod"
                body={(item) => <Tag severity={"warning"} value={`${item?.rateDefinition?.minimumRentalPeriod || 0} days`} />}
                header="MinRentalPeriod"
              />
              <Column body={priceBodyTemplate} header="Daily Rate" />
              <Column body={stockBodyTemplate} header="Stock" />
              <Column body={assetSelectionBodyTemplate} header="Asset Selection" style={{ width: "200px" }} />
              <Column body={maintenanceBodyTemplate} header="Maintenance" style={{ width: "200px" }} />
            </DataTable>
          )}
        </TabPanel>
      </TabView>

      {/* Selected Products with Assets */}
      {selectedProducts.length > 0 && (
        <Card className="mt-6">
          <h4 className="mb-4 text-lg font-semibold">
            Selected Products ({selectedProducts.length})
            <Badge
              value={selectedProducts.reduce((sum, p) => sum + p.quantity, 0) + " assets"}
              severity="info"
              className="ml-2"
            />
          </h4>

          <Accordion multiple>
            {selectedProducts.map((product, index) => {
              const salePriceNum = Number(product.salePrice);
              const hasSalePrice = !isNaN(salePriceNum) && salePriceNum > 0;

              // Use the new weekly rate calculation logic
              const { rate, isWeekly } = getProductRateInfo(product);
              const chargeableUnits = chargeableUnitsForProduct(product);
console.log({chargeableUnits})
              const rentalBase = product.quantity * rate * chargeableUnits;
              const rentalTax = rentalBase * (product.taxRate / 100);
              const rentalTotal = rentalBase + rentalTax;

              const saleTotal = product.quantity * (salePriceNum || 0);

              return (
                <AccordionTab
                  key={`selected-${product.productId}-${index}`}
                  header={
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={`${imageBaseURL}${product.image}`}
                          alt={product.name}
                          onError={(e) => (e.currentTarget.src = "/images/product/placeholder.webp")}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>

                          {hasSalePrice ? (
                            // SALE ITEM DISPLAY
                            <p className="text-sm text-gray-500">
                              {product.quantity} × {formatCurrency(salePriceNum)}
                            </p>
                          ) : (
                            // RENTAL ITEM DISPLAY
                            <>
                              <p className="text-sm text-gray-500">
                                {product.quantity} assets × {formatCurrency(rate)}/{isWeekly ? 'week' : 'day'} × {chargeableUnits} {isWeekly ? 'weeks' : 'days'} + {product.taxRate}% tax
                              </p>
                              {!isWeekly && (
                                <p className="text-sm text-red-500">
                                  Minimum rental period {product.minimumRentalPeriod} days
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mr-4 text-right">
                        <p className="font-semibold text-blue-600">
                          {hasSalePrice ? formatCurrency(saleTotal) : formatCurrency(rentalTotal)}
                        </p>
                      </div>
                    </div>
                  }
                >
                  {selectedAssetsTemplate(product)}

                  <div className="mt-3 flex gap-2">
                    <Button
                      label="Modify Asset Selection"
                      icon="pi pi-pencil"
                      className="p-button-sm p-button-outlined"
                      onClick={() => handleAssetSelection(product.productId)}
                    />
                    <Button
                      label="Remove All"
                      icon="pi pi-trash"
                      className="p-button-sm p-button-danger p-button-outlined"
                      onClick={() => handleAssetsChange(product.productId, [])}
                    />
                  </div>
                </AccordionTab>
              );
            })}
          </Accordion>
        </Card>
      )}

     

      {/* Damage Waiver Selection */}
      {selectedProducts.length > 0 && (
        <div className="mt-6">
          {!loadingDamageWaiverSettings && globalDamageWaiverEnabled ? (
            <DamageWaiverSelector
              selectedLevel={selectedDamageWaiverLevel}
              onLevelChange={handleDamageWaiverLevelChange}
              eligibleSubtotal={calculateEligibleSubtotal()}
              onCalculationChange={handleDamageWaiverCalculationChange}
              token={token}
              vendorId={user._id}
              selectedProducts={selectedProducts}
              rentalDuration={rentalDuration}
              chargeableDaysForProduct={chargeableDaysForProduct}
              externalCalculations={damageWaiverCalculations}
              vendorSettings={vendorWaiverSettings}
            />
          ) : (
            !loadingDamageWaiverSettings && (
              <Card className="border-red-200 bg-red-50">
                <div className="flex items-center gap-3">
                  <FiShield className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Damage Waiver Not Available</h3>
                    <p className="text-sm text-red-700">
                      Damage waiver is not enabled for your account. Please contact your administrator or enable it in system settings.
                    </p>
                  </div>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      {/* Deposit Selection */}
      {selectedProducts.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Security Deposit</h3>
            <Tag value="Optional" severity="info" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Deposit Type</label>
              <Dropdown
                value={depositType}
                options={[
                  { label: "No Deposit", value: "noDeposit" },
                  { label: "Percentage of Order Total", value: "percentage" },
                  { label: "Fixed Amount", value: "fixedAmount" }
                ]}
                onChange={(e) => handleDepositTypeChange(e.value)}
                placeholder="Select deposit type"
                className="w-full"
              />
            </div>

            {depositType === "percentage" && (
              <div>
                <label className="block text-sm font-medium mb-2">Deposit Percentage (%)</label>
                <InputNumber
                  value={depositPercentage}
                  onValueChange={(e) => handleDepositPercentageChange(e.value || 0)}
                  suffix="%"
                  min={0}
                  max={100}
                  showButtons
                  buttonLayout="horizontal"
                  className="w-full"
                />
              </div>
            )}

            {depositType === "fixedAmount" && (
              <div>
                <label className="block text-sm font-medium mb-2">Fixed Deposit Amount</label>
                <InputNumber
                  value={depositFixedAmount}
                  onValueChange={(e) => handleDepositFixedAmountChange(e.value || 0)}
                  mode="currency"
                  currency={user?.currencyKey || "GBP"}
                  locale="en-GB"
                  min={0}
                  showButtons
                  buttonLayout="horizontal"
                  className="w-full"
                />
              </div>
            )}

            {depositType !== "noDeposit" && calculateDepositAmount() > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Calculated Deposit:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(calculateDepositAmount())}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Security deposit will be shown on a separate receipt
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Order Summary */}
      {selectedProducts.length > 0 && (
        <Card className="bg-blue-50">
          <div className="mb-3 flex items-center gap-3">
            <label className="w-28 font-medium text-gray-700">Discount %</label>
            <InputNumber
              value={orderDiscount}
              onValueChange={(e) => setOrderDiscount(e.value || 0)}
              suffix="%"
              min={0}
              max={100}
              showButtons
              buttonLayout="horizontal"
              decrementButtonClassName="p-button-danger"
              incrementButtonClassName="p-button-success"
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Order Summary</h4>
              <p className="text-sm text-gray-600">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} |{" "}
                {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} assets | {rentalDuration} day
                {rentalDuration !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="text-right">
               <p className="text-sm text-gray-600">Subtotal</p>
               <p className="text-lg font-semibold text-gray-800">{formatCurrency(calculateSubtotal())}</p>

               {orderDiscount > 0 && (
                 <p className="text-sm text-red-500">
                   - {orderDiscount}% ({formatCurrency((calculateSubtotal() * orderDiscount) / 100)})
                 </p>
               )}

               {damageWaiverCalculations.totalAmount > 0 && (
                 <div className="mt-2 pt-2 border-t">
                   <p className="text-sm text-blue-600">
                     Damage Waiver: {formatCurrency(damageWaiverCalculations.totalAmount)}
                   </p>
                   {damageWaiverCalculations.taxAmount > 0 && (
                     <p className="text-xs text-gray-500">
                       (includes tax: {formatCurrency(damageWaiverCalculations.taxAmount)})
                     </p>
                   )}
                 </div>
               )}

               {calculateDepositAmount() > 0 && (
                 <div className="mt-2 pt-2 border-t">
                   <p className="text-sm text-green-600">
                     Security Deposit: {formatCurrency(calculateDepositAmount())}
                   </p>
                   <p className="text-xs text-gray-500">
                     (shown on separate receipt)
                   </p>
                 </div>
               )}

               <div className="mt-2 pt-2 border-t">
                 <p className="text-xl font-bold text-blue-600">{formatCurrency(calculateTotalWithDiscount())}</p>
               </div>
             </div>
          </div>
        </Card>
      )}

      {/* Asset Selector Dialog */}
      {currentProductForAssets && (
        <AssetSelector
          product={currentProductForAssets}
          selectedAssets={productAssets[currentProductForAssets._id] || []}
          onAssetsChange={(assets) => {
            handleAssetsChange(currentProductForAssets._id, assets);
            setAssetSelectorVisible(false);
            setCurrentProductForAssets(null);
          }}
          visible={assetSelectorVisible}
          onHide={() => {
            setAssetSelectorVisible(false);
            setCurrentProductForAssets(null);
          }}
          // Pass the *billable* days to the selector (keeps UI consistent)
          rentalDuration={chargeableDaysForProduct(currentProductForAssets)}
          startDate={formData.chargingStartDate}
          endDate={formData.expectedReturnDate}
        />
      )}
    </motion.div>
  );
}
