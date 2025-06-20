"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { InputText } from "primereact/inputtext";
import { useDropzone } from "react-dropzone";
import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import Link from "next/link";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import InputGroup from "../FormElements/InputGroup";
import SelectGroupOne from "../FormElements/SelectGroup/SelectGroupOne";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import CanceButton from "../Buttons/CanceButton";
import AddTaxClassModal from "../system-setup/tax-classes/AddTaxClassModal";
import AddDepotsModal from "../system-setup/depots/AddDepotsModal";
import RateDefinatonModal from "../system-setup/rate-defination/RateDefinatonModal";
import { BaseURL } from "../../../utils/baseUrl";
import ConfirmLink from "../confirmLink/ConfirmLink";
import { useDispatch } from "react-redux";
import { setDirty, clearDirty } from "../../store/dirtySlice";
import UpdateCategoryModel from "../category/UpdateCategoryModel";
import { useBarcodeConfig } from "@/hooks/useBarcodeConfig";
import BarcodeScanner from "@/components/common/BarcodeScanner/BarcodeScanner";
import BarcodeScannerInput from "@/components/common/BarcodeScanner/BarcodeScannerInput";
import { MdQrCodeScanner } from "react-icons/md";
const generateRandomAssetNo = () =>
  `Asset-${Math.floor(1000 + Math.random() * 9000)}`;

const AddProduct = () => {
  const [status, setStatus] = useState("Rental");
  const showstatus = status;
  console.log(showstatus);
  const [minHireData, setminHireData] = useState([]);
  const [postLoader, setpostLoader] = useState(false);
  const [categoryValue, setcategoryValue] = useState({});
  const [subCategoryValue, setSubcategoryValue] = useState({});
  const [taxClassValue, setTaxClassValue] = useState({});
  const [depotsValue, setdepotsValue] = useState({});
  const [rateDefinitionValue, setrateDefinitionValue] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [taxClassRefresh, setTaxClassRefresh] = useState(false); // State to trigger refresh
  const [depotRefresh, setdepotRefresh] = useState(false);
  const { isBarcodeEnabled, barcodeConfig } = useBarcodeConfig();
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [validatingBarcode, setValidatingBarcode] = useState(false);
  console.log(categoryValue, "ss");
  const [formData, setFormData] = useState({
    productName: "",
    companyProductName: "",
    productDescription: "",
    subCategory: "",
    category: "",
    // minHireTime: "",
    rentPrice: "",
    // rentDuration: "",
    // rateDefinition: "",
    range: "",
    vat: "",
    rate: "daily",
    uniqueAssetNo: generateRandomAssetNo(),
    salePrice: "",
    quantity: 1,
    lenghtUnit: "cm",
    weightUnit: "kg",
    weight: "",
    length: "",
    width: "",
    height: "",
    // Barcode fields
    barcode: "",
    barcodeType: "CODE128",
    barcodeEnabled: false,
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  console.log({ categories });
  const [taxClass, settaxClass] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [prompt, setprompt] = useState("");
  const [openAiError, setopenAiError] = useState("");
  const [promptLoader, setpromptLoader] = useState(false);
  const [depots, setdepots] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [refreshCategory, setRefreshCategory] = useState(false);
  const [refreshSubCategory, setRefreshSubCategory] = useState(false);

  console.log(depots, "depotss");
  const dispatch = useDispatch();
  // const generateAssetNo = () => {
  //   const newNo = generateRandomAssetNo();
  //   setFormData((prev) => ({ ...prev, uniqueAssetNo: newNo }));
  // };
  const router = useRouter();
  //   const toast = useToast();
  const handleRefresh = () => {
    setRefreshCategory((prevFlag) => !prevFlag);
  };
  const handleSubRefresh = () => {
    setRefreshSubCategory((prevFlag) => !prevFlag);
  };
  const debouncedSearch = useDebounce(prompt, 500); // Add debounce with a 500ms delay
  const { token, user } = useSelector((state) => state?.authReducer);
  const toast = useRef(null);
  const id = ["Editor", "Operator"].includes(user?.role)
    ? user?.vendor
    : user?._id;
  if (status === "Sale") {
    delete formData.rateDefinition;
  }
  const onDrop = useCallback((acceptedFiles) => {
    const newPreviews = acceptedFiles.slice(0, 4).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviews(newPreviews);
    setFiles(acceptedFiles.slice(0, 4));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
    maxFiles: 4,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BaseURL}/category`,{
          headers: { authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, [refreshCategory]); // Runs only on mount (empty dependency array)

  useEffect(() => {
    const fetchDepots = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${BaseURL}/depots`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setdepots(response.data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDepots();
  }, [token, depotRefresh]); // Runs only when `token` changes

  useEffect(() => {
    const fetchTaxClasses = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${BaseURL}/tax-classes/product`, {
          headers: { authorization: `Bearer ${token}` },
        });
        settaxClass(response.data?.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchTaxClasses();
  }, [token, taxClassRefresh]); // Runs only when `token` changes

  useEffect(() => {
    const fetchRateDefinitions = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${BaseURL}/rate-definition/list`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setminHireData(response.data?.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRateDefinitions();
  }, [token, refresh]); // Runs when `token` or `refresh` changes

  const refreshData = () => setRefresh((prev) => !prev);
  const refreshTaxClass = () => {
    setTaxClassRefresh((prev) => !prev);
  };
  const refreshDepots = () => {
    setdepotRefresh((prev) => !prev);
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      const selectedCategory = categories.find(
        (item) => item._id === formData.category,
      );
      if (selectedCategory) {
        try {
          const response = await axios.get(
            `${BaseURL}/sub-category?parentId=${formData.category}`,
          {
          headers: { authorization: `Bearer ${token}` },
        });
          setSubCategories(response?.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    console.log(formData);
    // if (formData.category ||refreshSubCategory) {
    fetchSubCategories();
    // }
  }, [formData.category, categories, refreshSubCategory]);

  const handleChange = (e) => {
    dispatch(setDirty());

    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  // const [selectedValue, setSelectedValue] = useState("");

  // const handleSelectChange = (event) => {
  //   setSelectedValue(event.target.value); // Update parent state
  //   console.log("Selected Value:", event.target.value); // Log the selected value
  // };

  const handleSubmit = async () => {
    dispatch(clearDirty());

    setpostLoader(true);
    setError(true);
    const productData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      productData.append(key, value);
    });
    productData.append("vendorId", id);

    productData.append("status", showstatus);
    // productData.append("category", categoryValue._id);
    // productData.append("subCategory", subCategoryValue._id);
    productData.append("taxClass", taxClassValue._id);
    productData.append("depots", depotsValue.name);
    if (status != "Sale") {
      productData.append("rateDefinition", rateDefinitionValue._id);
    }

    files.forEach((file) => {
      productData.append("image", file);
    });

    if (status === "Sale") {
      delete productData.rateDefinition;
    }

    try {
      const res = await axios.post(
        `${BaseURL}/product/add-product`,
        productData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.data.success) {
        // Show success message with asset numbers
        if (res.data.assetNumbers && res.data.assetNumbers.length > 0) {
          toast.current.show({
            severity: "success",
            summary: "Product Created Successfully",
            detail: `Generated ${res.data.assetNumbers.length} asset numbers: ${res.data.assetNumbers.join(", ")}`,
            life: 5000,
          });
        } else {
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: res.data.message,
            life: 3000,
          });
        }
        
        setFormData({
          productName: "",
          companyProductName: "",
          productDescription: "",
          category: "",
          // taxClass: "",
          subCategory: "",
          // rateDefinition: "",
          rentPrice: "",
          rentDuration: "",
          salePrice: "",
          range: "",
          vat: "",
          rate: "daily",
          quantity: 1,
          lenghtUnit: "",
          weightUnit: "",
          weight: "",
          length: "",
          width: "",
          height: "",
        });
        setError(false);
        setpostLoader(false);
        setPreviews([]);
        setFiles([]);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res.data.message,
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 3000,
      });
      setpostLoader(false);
      console.error("Error adding product", error);
    }
  };

  const isRequired = () => {
    return <span className="text-red">*</span>;
  };

  const subCategoryName = categories.find(
    (item) => item._id == formData.category,
  );
  console.log(subCategoryName, formData.category, categories);
  const handleDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchData = async () => {
      setpromptLoader(true);
      try {
        const response = await axios.post(
          `${BaseURL}/product/product/description`,
          { prompt: debouncedSearch },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          setpromptLoader(false);
          console.log(response.data.message);
          setFormData((prevFormData) => ({
            ...prevFormData,
            productDescription: response.data.message,
          }));
        } else {
          setpromptLoader(false);
          setopenAiError(response.data.error);
        }
      } catch (error) {
        setpromptLoader(false);
        setopenAiError(error.response?.data?.error || "An error occurred");
        console.error("Error fetching data", error);
      }
    };

    if (debouncedSearch) {
      fetchData();
    }
  }, [debouncedSearch]); // Only re-run the effect if debouncedSearch changes

  const generateAssetNo = () => {
    const newNo = generateRandomAssetNo();
    setFormData((prev) => ({ ...prev, uniqueAssetNo: newNo }));
  };

  const handleBarcodeScan = async (scanResult) => {
    const { code, format } = scanResult;
    
    // Validate the scanned barcode
    setValidatingBarcode(true);
    try {
      const response = await axios.post(
        `${BaseURL}/barcode/validate`,
        { barcode: code, productId: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          barcode: code,
          barcodeType: format,
          barcodeEnabled: true
        }));
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: `Barcode ${code} scanned successfully`,
          life: 3000,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Invalid Barcode",
          detail: response.data.message || "This barcode is already in use",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Barcode validation error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to validate barcode",
        life: 3000,
      });
    } finally {
      setValidatingBarcode(false);
      setShowBarcodeScanner(false);
    }
  };

  const validateBarcodeManual = async (value) => {
    if (!value || !barcodeConfig?.requireUnique) return;
    
    try {
      const response = await axios.post(
        `${BaseURL}/barcode/validate`,
        { barcode: value, productId: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.data.success) {
        toast.current?.show({
          severity: "warn",
          summary: "Barcode In Use",
          detail: "This barcode is already assigned to another product",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Barcode validation error:", error);
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        <GoPrevious route={"/product/product-list"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Create Product
        </h2>
      </div>
      <Toast ref={toast} position="top-right" />
      <div class="grid grid-cols-12 gap-4 lg:grid-cols-12 xl:grid-cols-10">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Name and Description</h3>
        </div>
        <div class="col-span-12 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-10 lg:col-span-10 xl:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              <InputGroup
                required
                label={" Product Name"}
                name="productName"
                placeholder="Product Name"
                value={formData.productName}
                onChange={handleChange}
              />

              {error && formData.productName == ""
                ? formData.productName == "" && (
                    <label className="text-[0.8em] text-red">
                      Product name is required.
                    </label>
                  )
                : ""}
            </div>
            <div className="">
              <InputGroup
                label={"Manufacturer"}
                name="companyProductName"
                placeholder="Manufacturer"
                value={formData.companyProductName}
                onChange={handleChange}
              />
              {/* {error && formData.companyProductName == ""
                ? formData.companyProductName == "" && (
                    <label className="text-[0.8em] text-red">
                      Company Product name is required.
                    </label>
                  )
                : ""} */}
            </div>
          </div>
          <div className="">
            <div className="mt-4 flex justify-between">
              <label className="mb-2  block text-[0.9em] font-bold text-black">
                Product Description {isRequired()}
              </label>

              <div
                className={`flex items-center gap-4  ${
                  formData.productName == "" ? "hidden" : "block"
                } `}
              >
                <label className="mb-2 text-[0.9em]">Write with AI?</label>

                <>
                  {promptLoader ? (
                    <ProgressSpinner
                      style={{ width: "30px", height: "30px" }}
                      strokeWidth="4"
                      fill="var(--surface-ground)"
                      animationDuration=".5s"
                    />
                  ) : (
                    <i
                      onClick={() =>
                        setprompt(
                          `write a concise product descripton about ${formData.productName}? `,
                        )
                      }
                      className="pi pi-refresh mb-1 cursor-pointer text-[30px] text-[#1a7f64]"
                    />
                  )}
                </>
              </div>
            </div>
            <div className="mb-2">
              <textarea
                rows={6}
                name="productDescription"
                placeholder="Product Description"
                value={formData.productDescription}
                onChange={handleChange}
                className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>

            {openAiError !== "" && (
              <label className="text-[0.8em] text-red">{openAiError}</label>
            )}
            {error && formData.productDescription == ""
              ? formData.productDescription == "" && (
                  <label className="text-[0.8em] text-red">
                    Product Description is required.
                  </label>
                )
              : ""}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
             
                <div className="flex items-center justify-between">
                  <ConfirmLink href="/system-setup/category">
                    <label className=" block cursor-pointer text-[0.9em] font-bold text-blue-500">
                      Category
                    </label>
                  </ConfirmLink>
                  {/* <AddTaxClassModal refreshParent={refreshTaxClass} /> */}
                  <UpdateCategoryModel
                    title={`Add New Category`}
                    parent={null}
                    fetchDataList={handleRefresh}
                    pageName="product"
                  />
                </div>
             
                <Dropdown
                  value={formData.category}
                  placeholder="Category Type"
                  onChange={handleChange}
                  options={categories}
                  optionLabel="name"
                  optionValue="_id"
                  filter
                  showClear
                  name="category"
                  className="md:w-14rem w-full text-[0.9em]"
                  checkmark={true}
                  highlightOnSelect={false}
                />

            
            </div>
            {/* {subCategories.length>0 && ( */}
              <div className="">
                <div className="">
                  <div className="flex items-center justify-between">
                    <ConfirmLink href={`/system-setup/category/sub-category/${formData.category}`}>
                      <label className=" block cursor-pointer text-[0.9em] font-bold text-blue-500">
                        Sub Category Type
                      </label>
                    </ConfirmLink>
                    {/* <AddTaxClassModal refreshParent={refreshTaxClass} /> */}
                    <UpdateCategoryModel
                      id={formData?.category}
                      title={`Add New Sub-category`}
                      parent={subCategoryName?.name}
                      fetchDataList={handleSubRefresh}
                      pageName="product"
                    />
                  </div>
          

                  <Dropdown
                    value={formData.subCategory}
                    onChange={handleChange}
                    options={subCategories}
                    optionLabel="name"
                    optionValue="_id"
                    filter
                    placeholder="Sub Category Type"
                    name="subCategory"
                    className="md:w-14rem w-full text-[0.9em]"
                    checkmark={true}
                    highlightOnSelect={false}
                  />

                  {/* {error && formData.subCategory == ""
                    ? formData.subCategory == "" && (
                        <label className="text-[0.8em] text-red">
                          Sub Category Type is required.
                        </label>
                      )
                    : ""} */}
                </div>
              </div>
            {/* )} */}
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="">
              <div className="flex items-center justify-between">
                <ConfirmLink href="/system-setup/depots">
                  <label className=" block cursor-pointer text-[0.9em] font-bold text-blue-500">
                    Depots
                  </label>
                </ConfirmLink>
                <AddDepotsModal refreshParent={refreshDepots} />
              </div>
              <Dropdown
                value={depotsValue}
                onChange={(e) => setdepotsValue(e.value)}
                options={depots}
                optionLabel="name"
                placeholder="Select Depots"
                name="depotsValue"
                className="md:w-14rem w-full text-[0.9em]"
                checkmark={true}
                highlightOnSelect={false}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex items-center gap-6 py-6">
              <div className="flex items-center">
                <RadioButton
                  inputId="rental"
                  name="status"
                  value="Rental"
                  onChange={(e) => setStatus(e.value)}
                  checked={status === "Rental"}
                />
                <label htmlFor="rental" className="ml-2 font-bold text-black">
                  Rental product
                </label>
              </div>

              <div className="flex items-center">
                <RadioButton
                  inputId="sale"
                  name="status"
                  value="Sale"
                  onChange={(e) => setStatus(e.value)}
                  checked={status === "Sale"}
                />
                <label htmlFor="sale" className="ml-2  font-bold text-black">
                  Sale item
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Quantity</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              <label className=" block text-[0.9em] font-bold text-black">
                Quantity
              </label>

              <InputText
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
            <div className="">
              <label className=" block text-[0.9em] font-bold text-black">
                Starting Asset No
              </label>
              <div className="flex items-center gap-2">
                <InputText
                  name="uniqueAssetNo"
                  minLength={10}
                  placeholder="Starting Asset No"
                  value={formData.uniqueAssetNo}
                  onChange={handleChange}
                />
                <Button
                  icon="pi pi-refresh"
                  className="p-button-text p-button-sm"
                  onClick={generateAssetNo}
                  tooltip="Starting Asset No"
                  tooltipOptions={{ position: "top" }}
                />
              </div>
            </div>
            {isBarcodeEnabled && (
              <div className="">
                <label className=" block text-[0.9em] font-bold text-black">
                  Barcode {barcodeConfig?.requireUnique && <span className="text-xs text-gray-500">(Optional)</span>}
                </label>
                <div className="flex items-center gap-2">
                  <BarcodeScannerInput
                    name="barcode"
                    placeholder={barcodeConfig?.allowManualEntry ? "Enter or scan barcode" : "Scan barcode"}
                    value={formData.barcode}
                    onChange={handleChange}
                    onScan={handleBarcodeScan}
                    onBlur={(e) => validateBarcodeManual(e.target.value)}
                    disabled={!barcodeConfig?.allowManualEntry}
                    scannerConfig={{
                      scanThreshold: 100,
                      minLength: 4,
                      successDuration: 2000
                    }}
                    showScanIndicator={barcodeConfig?.scannerTypes?.usb || barcodeConfig?.scannerTypes?.bluetooth}
                  />
                  {barcodeConfig?.scannerTypes?.camera && (
                    <Button
                      icon={validatingBarcode ? "pi pi-spinner pi-spin" : "pi pi-camera"}
                      className="p-button-text p-button-sm"
                      onClick={() => setShowBarcodeScanner(true)}
                      disabled={validatingBarcode}
                      tooltip="Scan barcode with camera"
                      tooltipOptions={{ position: "top" }}
                    />
                  )}
                </div>
                {barcodeConfig?.autoGenerate && !formData.barcode && (
                  <small className="text-gray-500 text-xs mt-1">
                    A barcode will be auto-generated if not provided
                  </small>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Rate Definition</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            {status === "Rental" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
                  <div className="">
                    <div className="flex w-full items-center justify-between">
                      <ConfirmLink href="/system-setup/rate-definition">
                        <label className=" block cursor-pointer text-[0.9em] font-bold text-blue-500">
                          Rate Definition
                        </label>
                      </ConfirmLink>
                      <RateDefinatonModal refreshParent={refreshData} />
                    </div>

                    <Dropdown
                      value={rateDefinitionValue}
                      onChange={(e) => setrateDefinitionValue(e.value)}
                      options={minHireData}
                      optionLabel="name"
                      placeholder="Select Rate Definiton"
                      name="rateDefinitionValue"
                      className="md:w-14rem w-full text-[0.9em]"
                      checkmark={true}
                      highlightOnSelect={false}
                    />
                    {/* <Select
                    className="text-[0.9em]"
                    name="rateDefinition"
                    placeholder="Select Rate Definiton"
                    value={formData.rateDefinition}
                    onChange={handleChange}
                  >
                    {minHireData?.map((item, index) => (
                      <option key={index} value={item?._id}>
                        {item.name}
                      </option>
                    ))}
                  </Select> */}
                  </div>
                  <div className=""></div>
                </div>
              </>
            )}
          </div>
          <div className="">
            {status === "Rental" && (
              <>
                <label className=" mt-3 block text-[0.9em] font-bold text-black">
                  Rental Price
                </label>
                {/* <label className="m-0 text-[14px]">
                  Flat rate per period (for example: $50 per day)
                </label> */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="">
                    <label className=" block text-[0.9em] font-bold text-black">
                      Price
                    </label>
                    {/* <InputText
                      name="rentPrice"
                      type="number"
                      placeholder="50"
                      value={formData.rentPrice}
                      onChange={handleChange}
                    /> */}
                    <div className="p-inputgroup flex-1">
                      <span className="p-inputgroup-addon">
                        {user?.currencyKey}
                      </span>
                      <InputText
                        name="rentPrice"
                        type="number"
                        placeholder="Price"
                        value={formData.rentPrice}
                        onChange={handleChange}
                      />
                      <span className="p-inputgroup-addon">.00</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            {status === "Sale" && (
              <>
                <label className=" block text-[0.9em] font-bold text-black">
                  Sale Price
                </label>
                <label className="m-0 text-[14px]"></label>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="">
                    <label className=" block text-[0.9em] font-bold text-black">
                      Price
                    </label>

                    <div className="p-inputgroup flex-1">
                      <span className="p-inputgroup-addon">
                        {user?.currencyKey}
                      </span>
                      <InputText
                        name="salePrice"
                        type="number"
                        // placeholder="50"
                        value={formData.salePrice}
                        onChange={handleChange}
                      />
                      <span className="p-inputgroup-addon">.00</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            {/* <div className="">
              <label className=" block text-[0.9em] font-bold text-black">
                Quantity
              </label>

              <InputText
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div> */}
            <div className="">
              <div className="flex items-center justify-between">
                <ConfirmLink href="/system-setup/tax-classes">
                  <label className=" block cursor-pointer text-[0.9em] font-bold text-blue-500">
                    Tax Class {isRequired()}
                  </label>
                </ConfirmLink>
                <AddTaxClassModal refreshParent={refreshTaxClass} />
              </div>

              <Dropdown
                value={taxClassValue}
                onChange={(e) => setTaxClassValue(e.value)}
                options={taxClass}
                optionLabel="name"
                placeholder="Select Tax Class"
                name="taxClass"
                className="md:w-14rem w-full text-[0.9em]"
                checkmark={true}
                highlightOnSelect={false}
              />
            </div>
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Additional Info</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-[0.9em]">Length Unit</label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  {formData.lenghtUnit}
                </span>
                <Dropdown
                  value={formData.lenghtUnit}
                  onChange={handleChange}
                  options={[
                    { name: "Centimetre", value: "cm" },
                    { name: "Feet", value: "ft" },
                    { name: "Inch", value: "in" },
                    { name: "Metre", value: "m" },
                    { name: "Millimetre", value: "mm" },
                    { name: "Yard", value: "yd" },
                  ]}
                  optionLabel="name"
                  name="lenghtUnit"
                  className="md:w-14rem w-full text-[0.9em]"
                  checkmark={true}
                  highlightOnSelect={false}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[0.9em]">Weight Unit</label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  {formData.weightUnit}
                </span>
                <Dropdown
                  value={formData.weightUnit}
                  onChange={handleChange}
                  options={[
                    { name: "Kilogrammes", value: "kg" },
                    { name: "Pounds", value: "lb" },
                  ]}
                  optionLabel="name"
                  name="weightUnit"
                  className="md:w-14rem w-full text-[0.9em]"
                  checkmark={true}
                  highlightOnSelect={false}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[0.9em]">Weight</label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  {formData.weightUnit}
                </span>
                <InputText
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  type="number"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[0.9em]">Length</label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  {formData.lenghtUnit}
                </span>
                <InputText
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  type="number"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[0.9em]">Width</label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  {formData.lenghtUnit}
                </span>
                <InputText
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  type="number"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-[0.9em]">Height</label>
              <div className="p-inputgroup flex-1">
                <span className="p-inputgroup-addon">
                  {formData.lenghtUnit}
                </span>
                <InputText
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  type="number"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Upload Product Photos </h3>
        </div>
        <div class="col-span-8 rounded-lg bg-white p-4 dark:bg-dark-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div {...getRootProps()} className="dropzone mt-2">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <div className="flex  h-26 items-center justify-center rounded-xl border-2  border-dashed bg-[#fafafa] dark:bg-dark-2">
                  <i className="pi pi-upload text-[40px]" />
                </div>
              )}
            </div>
            {previews.length > 0 && (
              <div className="p-5">
                <div className="item-center flex justify-start gap-3">
                  {previews.map(({ preview }, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center"
                    >
                      <div
                        key={index}
                        onClick={() => handleDelete(index)}
                        className="group relative flex items-center justify-center hover:bg-gray"
                      >
                        <div
                          style={{ position: "absolute" }}
                          className="group-hover: hidden  group-hover:block"
                        >
                          <i
                            color={"black"}
                            className="pi pi-trash text-[30px]"
                          />
                        </div>
                        <div className="flex h-40 w-40 bg-[#fafafa]">
                          <img
                            className="group-hover:opacity-40"
                            src={preview}
                            alt={`Preview ${index + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* {error && files.length == 0
              ? files.length == 0 && (
                  <label className="text-[0.8em] text-red">
                    Product images is required.
                  </label>
                )
              : ""} */}
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="mt-5 grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          {/* <h3 className="font-bold">Upload Product Photos </h3> */}
        </div>
        <div class="col-span-8  p-4">
          <div className="flex justify-end gap-7 ">
            <div className="">
              <CanceButton
                onClick={() => {
                  dispatch(setDirty());
                  router.push("/product/product-list");
                }}
              />
            </div>
            <div className="">
              <Button
                label="Save"
                size="small"
                loading={postLoader}
                className="font-bold"
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onHide={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScan}
        acceptedFormats={barcodeConfig?.barcodeTypes || ['CODE128', 'CODE39', 'EAN13', 'QR_CODE']}
        continuousScanning={barcodeConfig?.mobileSettings?.continuousScanning || false}
        scanDelay={barcodeConfig?.mobileSettings?.scanDelay || 1000}
        showFlashlight={barcodeConfig?.mobileSettings?.enableFlashlight || true}
      />
    </div>
  );
};

export default AddProduct;
