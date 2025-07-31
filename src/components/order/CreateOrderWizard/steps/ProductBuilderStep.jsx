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
import { ProgressSpinner } from "primereact/progressspinner";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import axios from "axios";
import { BaseURL, imageBaseURL } from "../../../../../utils/baseUrl";
import { useSelector } from "react-redux";
import {
  formatCurrency,
  calculateDaysBetween,
} from "../../../../../utils/helper";
import InlineMaintenanceConfig from "../components/InlineMaintenanceConfig";
import { ContextualHelp } from "../components/ContextualHelp";
import { ProductSkeleton, TableSkeleton } from "../components/LoadingSkeleton";
import AssetSelector from "../components/AssetSelector";

export default function ProductBuilderStep() {
  const { state, updateFormData, completeStep, setValidation } = useWizard();
  const { formData } = state;
  const { token, user } = useSelector((state) => state?.authReducer);

  const [products, setProducts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(
    formData.products || [],
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [maintenanceConfigs, setMaintenanceConfigs] = useState({});

  // Asset selection states
  const [assetSelectorVisible, setAssetSelectorVisible] = useState(false);
  const [currentProductForAssets, setCurrentProductForAssets] = useState(null);
  const [productAssets, setProductAssets] = useState({}); // { productId: [assets] }

  // Calculate rental duration
  const rentalDuration =
    formData.chargingStartDate && formData.expectedReturnDate
      ? calculateDaysBetween(
          new Date(formData.chargingStartDate),
          new Date(formData.expectedReturnDate),
        )
      : 1;

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
  }, [user]);

  const fetchBundles = async () => {
    try {
      setLoadingBundles(true);

      const response = await axios.get(
        `${BaseURL}/bundles/popular?vendorId=${user._id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

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
        },
      );

      if (response.data) {
        let productList = response.data.data || [];

        // Filter by category if selected
        if (categoryFilter) {
          productList = productList.filter(
            (p) => p.category?.name === categoryFilter,
          );
        }

        setProducts(productList);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(productList.map((p) => p.category?.name).filter(Boolean)),
        ].map((name) => ({ label: name, value: name }));
        setCategories([
          { label: "All Categories", value: null },
          ...uniqueCategories,
        ]);
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

    const currencyKey = useSelector(
      (state) => state?.authReducer?.user?.currencyKey,
    );

  const handleAssetsChange = (productId, assets) => {
    // Update product assets
    setProductAssets((prev) => ({
      ...prev,
      [productId]: assets,
    }));

    // Update selected products
    setSelectedProducts((prevSelected) => {
      const newSelectedProducts = prevSelected.filter(
        (p) => p.productId !== productId,
      );

      if (assets.length > 0) {
        const product = products.find((p) => p._id === productId);
        if (product) {
          const newProduct = {
            productId: product._id,
            name: product.productName || product.name,
            productName:product.productName || product.name,
            sku: product.sku,
            category: product.category?.name || "Uncategorized",
            dailyRate: product.rentPrice || product.price || 0,
            quantity: assets.length,
            selectedAssets: assets,
            image: product.images?.[0] || "/images/product/placeholder.webp",
            maintenanceRequired: product.maintenanceRequired || false,
            currency: currencyKey,
            product: product._id,
            price: product.rentPrice || product.price || 0,
            taxRate: product?.taxClass?.taxRate,
            xeroTaxTypeId: product?.taxClass?.xeroTaxTypeId,
            quickBooksTaxId: product?.taxClass?.quickBooksTaxId,
            zohoTaxId: product?.taxClass?.zohoTaxId,
            rentalDaysPerWeek: product?.rateDefinition?.rentalDaysPerWeek,
        minimumRentalPeriod: product?.rateDefinition?.minimumRentalPeriod,


            //extra
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
    const updatedAssets = (productAssets[productId] || []).filter(
      (a) => a.assetId !== assetId,
    );
    handleAssetsChange(productId, updatedAssets);
  };

  const handleBundleSelect = async (bundle) => {
    try {
      // For bundles, we'll need to handle asset selection differently
      // This is a simplified version - you may want to enhance this
      alert(
        `Bundle selection with asset tracking is coming soon! For now, please select products individually.`,
      );
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
      p.productId === productId ? { ...p, maintenanceConfig: config } : p,
    );

    setSelectedProducts(updatedProducts);
    updateFormData({ products: updatedProducts });
  };

const calculateSubtotal = () => {
  return selectedProducts.reduce((total, product) => {
    const baseAmount = product.quantity * product.dailyRate * Number(rentalDuration<=product.minimumRentalPeriod?product.minimumRentalPeriod:rentalDuration);
    const tax = baseAmount * (product.taxRate / 100); // taxRate is assumed to be a number like 10, 13, etc.
    return total + baseAmount + tax;
  }, 0);
};


  const validateStep = () => {
    const newErrors = {};

    if (selectedProducts.length === 0) {
      newErrors.products = "Please select at least one product";
    }

    // Check if all products have assets selected
    const productsWithoutAssets = selectedProducts.filter(
      (p) =>
        !productAssets[p.productId] || productAssets[p.productId].length === 0,
    );

    if (productsWithoutAssets.length > 0) {
      newErrors.assets = `Please select assets for: ${productsWithoutAssets
        .map((p) => p.name)
        .join(", ")}`;
    }

    // Check if maintenance is configured for products that require it
    const productsNeedingMaintenance = selectedProducts.filter(
      (p) => p.maintenanceRequired,
    );
    const unconfiguredMaintenance = productsNeedingMaintenance.filter(
      (p) =>
        !maintenanceConfigs[p.productId] ||
        !maintenanceConfigs[p.productId].frequency,
    );

    if (unconfiguredMaintenance.length > 0) {
      newErrors.maintenance = `Please configure maintenance for: ${unconfiguredMaintenance
        .map((p) => p.name)
        .join(", ")}`;
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
    return (
      <div>
        <div className="font-medium">{product.productName}</div>
        {/* <div className="text-sm text-gray-500">SKU: {product.sku}</div> */}
      </div>
    );
  };

  const priceBodyTemplate = (product) => {
    return <span>{formatCurrency(product.rentPrice)}/day</span>;
  };

  const stockBodyTemplate = (product) => {
    const severity =
      product.quantity > 20
        ? "success"
        : product.quantity > 10
          ? "warning"
          : "danger";
    return <div className="flex items-center gap-3 whitespace-nowrap"><Tag value={`${product.quantity} available`} severity={severity} /></div> ;
  };

  const assetSelectionBodyTemplate = (product) => {
    const selectedAssets = productAssets[product._id] || [];
    const productPrice = product.rentPrice+product.rentPrice*product.taxClass.taxRate/100 || product.price || 0;

    return (
 <div className="flex items-center gap-3 whitespace-nowrap">
  <Button
    label={
      selectedAssets.length > 0
        ? `${selectedAssets.length} Assets Selected`
        : "Select Assets"
    }
    icon="pi pi-box"
    className={`px-3 py-2 text-sm ${
      selectedAssets.length > 0 ? "p-button-success" : "p-button-outlined"
    }`}
    onClick={() => handleAssetSelection(product._id)}
  />

  {selectedAssets.length > 0 && (
    <span className="text-sm font-semibold text-gray-700">
      ={" "}
      {formatCurrency(
        selectedAssets.length *
          productPrice *
          Number(
            rentalDuration <= product.rateDefinition?.minimumRentalPeriod
              ? product.rateDefinition?.minimumRentalPeriod
              : rentalDuration
          )
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
        onConfigChange={(config) =>
          handleMaintenanceConfigChange(product._id, config)
        }
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
              onRemove={() =>
                handleRemoveAsset(product.productId, asset.assetId)
              }
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
        <p className="text-gray-600">
          Select products and assign specific assets for each item
        </p>
      </div>

      {errors.products && <Message severity="error" text={errors.products} />}

      {errors.assets && <Message severity="warn" text={errors.assets} />}

      {errors.maintenance && (
        <Message severity="warn" text={errors.maintenance} />
      )}

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
      >
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
            <DataTable
              value={products}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              className="p-datatable-sm"
              emptyMessage="No products found"
            >
              <Column
                body={imageBodyTemplate}
                header="Image"
                style={{ width: "80px" }}
              />
              <Column body={nameBodyTemplate} header="Product" />
              <Column field="category.name" header="Category" />
              <Column field="rateDefinition.minimumRentalPeriod" body={(item)=>(
                <Tag severity={'warning'} value={`${item?.rateDefinition?.minimumRentalPeriod||0} days`}/>
              )} header="MinRentalPeriod" />
              <Column body={priceBodyTemplate} header="Daily Rate" />
              <Column body={stockBodyTemplate} header="Stock" />
              <Column
                body={assetSelectionBodyTemplate}
                header="Asset Selection"
                style={{ width: "200px" }}
              />
              <Column
                body={maintenanceBodyTemplate}
                header="Maintenance"
                style={{ width: "200px" }}
              />
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
              value={
                selectedProducts.reduce((sum, p) => sum + p.quantity, 0) +
                " assets"
              }
              severity="info"
              className="ml-2"
            />
          </h4>

          <Accordion multiple>
            {selectedProducts.map((product, index) => (
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
                        <p className="text-sm text-gray-500">
                          {product.quantity} assets ×{" "}
                          {formatCurrency(product.dailyRate)}/day ×{" "}
                          {rentalDuration<=product.minimumRentalPeriod?product.minimumRentalPeriod:rentalDuration} days +  {product.taxRate}% tax
                        </p>
                         <p className="text-sm text-red-500">Minimum rental period {product.minimumRentalPeriod} days</p>
                      </div>
                    </div>
                    <div className="mr-4 text-right">
                      <p className="font-semibold text-blue-600">
                        {formatCurrency(
                          product.quantity * product.dailyRate * Number(rentalDuration<=product.minimumRentalPeriod?product.minimumRentalPeriod:rentalDuration)+product.quantity * product.dailyRate * Number(rentalDuration<=product.minimumRentalPeriod?product.minimumRentalPeriod:rentalDuration)*product.taxRate/100,
                        )}
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
            ))}
          </Accordion>
        </Card>
      )}

      {/* Order Summary */}
      {selectedProducts.length > 0 && (
        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Order Summary</h4>
              <p className="text-sm text-gray-600">
                {selectedProducts.length} product
                {selectedProducts.length !== 1 ? "s" : ""} |{" "}
                {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}{" "}
                assets | {rentalDuration} day{rentalDuration !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(calculateSubtotal())}
              </p>
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
          rentalDuration={rentalDuration}
          startDate={formData.chargingStartDate}
          endDate={formData.expectedReturnDate}
        />
      )}
    </motion.div>
  );
}
