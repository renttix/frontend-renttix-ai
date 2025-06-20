"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { InputText } from "primereact/inputtext";
import { useDropzone } from "react-dropzone";
import useDebounce from "@/hooks/useDebounce";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import Link from "next/link";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { imageBaseURL } from "../../../utils/baseUrl";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import CanceButton from "../Buttons/CanceButton";
import RateDefinatonModal from "../system-setup/rate-defination/RateDefinatonModal";
import AddDepotsModal from "../system-setup/depots/AddDepotsModal";
import InputGroup from "../FormElements/InputGroup";
import AddTaxClassModal from "../system-setup/tax-classes/AddTaxClassModal";
import UpdateCategoryModel from "../category/UpdateCategoryModel";
import ConfirmLink from "../confirmLink/ConfirmLink";

const UpdateProduct = () => {
  const [status, setStatus] = useState("Rental");
  const showstatus = status;
  console.log(showstatus);
  const [minHireData, setminHireData] = useState([]);
  const [postLoader, setpostLoader] = useState(false);
  const [categoryValue, setcategoryValue] = useState({});
  const [subCategoryValue, setSubcategoryValue] = useState({});
  const [taxClassValue, setTaxClassValue] = useState({});
  const [deleteImage, setdeleteImage] = useState([]);
  const [rateDefinitionValue, setrateDefinitionValue] = useState({});

  const [formData, setFormData] = useState({
    productName: "",
    companyProductName: "",
    productDescription: "",
    // category: categoryValue._id,
    // minHireTime: "",
    rentPrice: "",
    // rentDuration: "",
    // rateDefinition: "",
    range: "",
    vat: "",
    rate: "daily",
    salePrice: "",
    uniqueAssetNo: "",
    quantity: 1,
    lenghtUnit: "cm",
    weightUnit: "kg",
    weight: "",
    length: "",
    width: "",
    height: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [rateDefinition, setrateDefinition] = useState([]);
  const [taxClass, settaxClass] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [prompt, setprompt] = useState("");
  const [openAiError, setopenAiError] = useState("");
  const [promptLoader, setpromptLoader] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [taxClassRefresh, setTaxClassRefresh] = useState(false); // State to trigger refresh
  const [depotRefresh, setdepotRefresh] = useState(false);
  const [depotsValue, setdepotsValue] = useState({});
  const [depots, setdepots] = useState([]);

  const router = useRouter();
  const params = useParams();
  //   const toast = useToast();
  const debouncedSearch = useDebounce(prompt, 500); // Add debounce with a 500ms delay
  const { user } = useSelector((state) => state?.authReducer);
  const { token } = useSelector((state) => state?.authReducer);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [refreshCategory, setRefreshCategory] = useState(false);
  const [refreshSubCategory, setRefreshSubCategory] = useState(false);
  const BaseURL = process.env.NEXT_PUBLIC_API_URL;
  const toast = useRef(null);
  const handleRefresh = () => {
    setRefreshCategory((prevFlag) => !prevFlag);
  };
  const handleSubRefresh = () => {
    setRefreshSubCategory((prevFlag) => !prevFlag);
  };
  const handleDelete = (id, previews) => {
    setdeleteImage(previews, "dddsss");
    console.log(previews);
    setPreviews((prevData) => prevData.filter((item, index) => index !== id));
  };

  const id = !["Admin"].includes(user?.role)
    ? user?.vendor
    : user?._id;
  if (status === "Sale") {
    delete formData.rateDefinition;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BaseURL}/product/product-detail/${params.id}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );

        const productData = response?.data?.product;
        const checkDepot =
          depots?.find((item) => item?.name === productData?.depots) || {};
        // Fill the formData state with fetched product data
        setFormData({
          productName: productData?.productName || "",
          companyProductName: productData?.companyProductName || "",
          productDescription: productData?.productDescription || "",
          rentPrice: productData?.rentPrice || "",
          salePrice: productData?.salePrice || "",
          range: productData?.range || "",
          vat: productData?.vat || "",
          rate: productData?.rate || "daily",
          quantity: productData?.quantity || 1,
          lenghtUnit: productData?.lenghtUnit || "cm",
          weightUnit: productData?.weightUnit || "kg",
          weight: productData?.weight || "",
          uniqueAssetNo: productData?.uniqueAssetNo || "",
          length: productData?.length || "",
          width: productData?.width || "",
          height: productData?.height || "",
        });

        // Set other related states like category, subcategory, taxClass
        setcategoryValue(productData?.category || {});
        setSelectedCurrency(productData?.currency);
        setSubcategoryValue(productData?.subCategory || {});
        setTaxClassValue(productData?.taxClass || {});
        setrateDefinitionValue(productData?.rateDefinition || {});
        setdepotsValue(
          depots?.find((item) => item?.name === productData?.depots) || {},
        );
        setStatus(productData?.status || "Rental");
        setPreviews(
          productData?.images?.map((image) => ({
            preview: image,
          })),
        );
        // Handle image previews
        setPreviews(
          productData?.images?.map((image) => ({
            preview: image,
          })) || [],
        );
      } catch (error) {
        console.error("Error fetching product data", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, token, depots]);
  const subCategoryName = categories.find(
    (item) => item._id == formData.category,
  );
  const onDrop = useCallback((acceptedFiles) => {
    const newPreviews = acceptedFiles.slice(0, 4).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles.slice(0, 4)]);
  }, []);

  console.log(files, "filee");
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: true,
    maxFiles: 4,
  });
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       const [categoriesRes, taxClassRes, rateDefRes] = await Promise.all([
  //         axios.get(`${BaseURL}/category`),
  //         axios.get(`${BaseURL}/tax-classes/product`, {
  //           headers: { authorization: `Bearer ${token}` },
  //         }),
  //         axios.get(`${BaseURL}/rate-definition/list`, {
  //           headers: { authorization: `Bearer ${token}` },
  //         }),
  //       ]);

  //       setCategories(categoriesRes.data);
  //       settaxClass(taxClassRes?.data?.data);
  //       setrateDefinition(rateDefRes?.data?.data);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchInitialData();
  // }, [token]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BaseURL}/category`);
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
    const fetchCurrencies = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest");
        const data = await response.json();

        if (data && data.rates) {
          const currencyList = Object.keys(data.rates).map((code) => ({
            label: code,
            value: code,
          }));
          setCurrencies(currencyList);
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };

    const fetchUserCurrency = async () => {
      try {
        const response = await fetch("http://ip-api.com/json/?fields=currency");
        const data = await response.json();
        if (data && data.currency) {
          setSelectedCurrency(data.currency);
        }
      } catch (error) {
        console.error("Error fetching user currency:", error);
      }
    };

    fetchCurrencies();
    fetchUserCurrency();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      const selectedCategory = categories.find(
        (item) => item._id === categoryValue._id,
      );
      if (selectedCategory) {
        try {
          const response = await axios.get(
            `${BaseURL}/sub-category?parentId=${categoryValue._id}`,
          );
          setSubCategories(response?.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    // console.log(formData);
    // if (categoryValue) {
    fetchSubCategories();
    // }
  }, [categoryValue, categories, refreshSubCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setpostLoader(true);
    setError(true);
    const productData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      productData.append(key, value);
    });
    productData.append("vendorId", id);
    files.slice(0, 4).forEach((file) => {
      productData.append("image", file);
    });

    productData.append("status", showstatus);
    productData.append("category", categoryValue._id);
    productData.append("subCategory", subCategoryValue._id);
    productData.append("currency", selectedCurrency);
    productData.append("taxClass", taxClassValue._id);
    productData.append("depots", depotsValue.name);
    if (status != "Sale") {
      productData.append("rateDefinition", rateDefinitionValue._id);
    }

    if (status === "Sale") {
      delete productData.rateDefinition;
    }

    try {
      const res = await axios.put(
        `${BaseURL}/product/update-product/${params.id}`,
        productData,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      setpostLoader(false);
      router.push("/product/product-list");
      if (res.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: res.data.message,
          life: 3000,
        });

        setError(false);

        setPreviews([]);
        setFiles([]);
      }
    } catch (error) {
      setpostLoader(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.message,
        life: 3000,
      });

      console.error("Error adding product", error);
    }
  };

  const isRequired = () => {
    return <span className="text-red">*</span>;
  };

  useEffect(() => {
    const delteProductImage = async () => {
      console.log(token);
      try {
        await axios.delete(`${BaseURL}/product/${params.id}`, {
          data: { imageUrl: `${deleteImage}` },
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.log(error);
      }
    };
    delteProductImage();
  }, [deleteImage, token, params]);
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
  }, [debouncedSearch]);

  return (
    <div>
      {/* <Breadcrumb  pageName="Update Product" /> */}

      <div className="flex gap-3">
        <GoPrevious route={"/product/product-list"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Update Prodcut
        </h2>
      </div>
      <Toast ref={toast} position="top-right" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Name and Description</h3>
        </div>
        <div class="col-span-8 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-8 lg:col-span-8 xl:col-span-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            <div className="">
              <label className=" block text-[0.9em] font-bold  text-black">
                Product Name {isRequired()}
              </label>
              <InputText
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
              <label className=" block text-[0.9em] font-bold text-black">
                Company Product Name {isRequired()}
              </label>
              <InputText
                name="companyProductName"
                placeholder="Company Product Name"
                value={formData.companyProductName}
                onChange={handleChange}
              />
              {error && formData.companyProductName == ""
                ? formData.companyProductName == "" && (
                    <label className="text-[0.8em] text-red">
                      Company Product name is required.
                    </label>
                  )
                : ""}
            </div>
          </div>
          <div className="">
            <div className="mt-4 flex justify-between">
              <label className=" block text-[0.9em] font-bold text-black ">
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
            <InputTextarea
              rows={6}
              name="productDescription"
              placeholder="Product Description"
              value={formData.productDescription}
              onChange={handleChange}
            />
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
                  value={categoryValue}
                  onChange={(e) => setcategoryValue(e.value)}
                  options={categories}
                  optionLabel="name"
                  placeholder="Category Type"
                  name="category"
                  className="md:w-14rem w-full text-[0.9em]"
                  checkmark={true}
                  highlightOnSelect={false}
                />

                {/* {error && formData.category == ""
                  ? formData.category == "" && (
                      <lable className="text-[0.8em] text-red">
                        Category Type is required.
                      </lable>
                    )
                  : ""} */}
              </div>
            </div>
            {subCategories.length > 0 && (
              <div className="">
                <div className="">
                  <div className="flex items-center justify-between">
                    <ConfirmLink href={`/system-setup/category/sub-category/${categoryValue?._id}`}>
                      <label className=" block cursor-pointer text-[0.9em] font-bold text-blue-500">
                        Sub Category Type
                      </label>
                    </ConfirmLink>
                    {/* <AddTaxClassModal refreshParent={refreshTaxClass} /> */}
                    <UpdateCategoryModel
                      id={categoryValue?._id}
                      title={`Add New Sub-category`}
                      parent={categoryValue?.name}
                      fetchDataList={handleSubRefresh}
                      pageName="product"
                    />
                  </div>

                  <Dropdown
                    value={subCategoryValue}
                    onChange={(e) => setSubcategoryValue(e.value)}
                    options={subCategories}
                    optionLabel="name"
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
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="">
              <div className="flex items-center justify-between">
                <Link
                  href={"/system-setup/depots"}
                  className="mb-1 block text-[0.9em] font-bold text-blue-500"
                >
                  Depots
                </Link>
                <AddDepotsModal refreshParent={refreshDepots} />
              </div>
              <Dropdown
                value={depotsValue}
                onChange={(e) => setdepotsValue(e.value)}
                options={depots}
                optionLabel="name"
                // optionValue="_id"
                placeholder="Select Depots"
                name="depotsValue"
                className="md:w-14rem w-full text-[0.9em]"
                checkmark={true}
                highlightOnSelect={false}
              />
            </div>
            <div className="">
              <InputGroup
                label={"Unique Asset No"}
                name="uniqueAssetNo"
                placeholder="Unique Asset No"
                value={formData.uniqueAssetNo}
                onChange={handleChange}
              />
            </div>
          </div>
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
      <hr className="hr my-6" />
      <div class="grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          <h3 className="font-bold">Rate Definition</h3>
        </div>
        <div class="col-span-5 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
            {status === "Rental" && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
                  <div className="">
                    <div className="w-full">
                      <div className="flex w-full items-center justify-between">
                        <Link href={"/system-setup/rate-definition"}>
                          <label className=" block cursor-pointer text-[0.9em]  font-bold text-blue-500">
                            Rate Definition
                          </label>
                        </Link>
                        <RateDefinatonModal refreshParent={refreshData} />
                      </div>

                      <Dropdown
                        value={rateDefinitionValue}
                        onChange={(e) => setrateDefinitionValue(e.value)}
                        options={minHireData}
                        optionLabel="name"
                        placeholder="Select Rate Definiton"
                        name="rateDefinition"
                        className="md:w-14rem w-full text-[0.9em]"
                        checkmark={true}
                        // highlightOnSelect={false}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
                  <div className="">
                    <label className=" block text-[0.9em] font-bold text-black">
                      Price
                    </label>

                    <div className="p-inputgroup flex-1">
                      <span className="p-inputgroup-addon">
                        {user?.currencyKey}
                      </span>
                      <InputText
                        name="rentPrice"
                        type="number"
                        placeholder="50"
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
                        placeholder="50"
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
              <div className="flex items-center justify-between">
                <Link
                  href={"/system-setup/tax-classes"}
                  className="  block text-[0.9em] font-bold text-blue-500"
                >
                  Tax Class {isRequired()}
                </Link>
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
        <div class="col-span-5 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
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
        <div class="col-span-5 rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div {...getRootProps()} className="dropzone mt-2">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <div className="flex h-26 items-center justify-center rounded-xl border-2 border-dashed bg-[#fafafa] dark:bg-dark-2">
                  <i className="pi pi-upload text-[40px]" />
                </div>
              )}
            </div>
            {previews.length > 0 && (
              <div className="p-5">
                <div className="item-center flex justify-start gap-3">
                  {previews.slice(0, 4).map(({ preview }, index) => {
                    const image = preview.startsWith("blob:http")
                      ? `${preview}`
                      : `${imageBaseURL}${preview}`;
                    return (
                      <div
                        key={index}
                        onClick={() => handleDelete(index, preview)}
                        className="group relative flex items-center justify-center hover:bg-gray"
                      >
                        <div
                          style={{ position: "absolute" }}
                          className="group-hover: hidden  group-hover:block"
                        >
                          <i
                            color={"black"}
                            className="pi pi-trash cursor-pointer text-[30px] text-red"
                          />
                        </div>
                        <div className="flex h-40 w-40 rounded-lg bg-[#fafafa] dark:bg-dark-4">
                          <img
                            className="group-hover:opacity-40"
                            src={image}
                            alt={`Preview ${index + 1}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="hr my-6" />
      <div class="mt-5 grid grid-cols-10 gap-4">
        <div class="col-span-2  p-4 ">
          {/* <h3 className="font-bold">Upload Product Photos </h3> */}
        </div>
        <div class="col-span-5  p-4">
          <div className="flex justify-end gap-7 ">
            <div className="">
              <CanceButton onClick={() => router.back()} />
            </div>
            <div className="">
              <Button
                loading={postLoader}
                className="font-bold"
                size="small"
                onClick={handleSubmit}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
