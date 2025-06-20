"use client";
import React, { useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";
import { setUpdateUser } from "@/store/authSlice";
import { BaseURL } from "../../../../utils/baseUrl";
import axios from "axios";
import CanceButton from "@/components/Buttons/CanceButton";
import { useRouter } from "next/navigation";
import EnhancedBrandLogo from "./EnhancedBrandLogo";
import TermsAndConditionsUpload from "./TermsAndConditionsUpload";
import CustomDocumentsManager from "./CustomDocumentsManager";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";

const CompanyDetailsForm = () => {
  const toast = useRef();
  const { user } = useSelector((state) => state?.authReducer);
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    companyName: Yup.string().required("Company name is required"),
    legalName: Yup.string().required("Legal Name is required"),
    businessType: Yup.string().required("Business Type is required"),
    taxId: Yup.string().required("Tax ID is required"),
    swiftCode: Yup.string().required("SWIFT Code is required"),
    iban: Yup.string().required("IBAN is required"),
    primaryPhone: Yup.string().required("Phone Number is required"),
    email: Yup.string().required("Email is required"),
    zip: Yup.string().required("Zip code is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    country: Yup.string().required("Country is required"),
    primaryContact: Yup.string().required("Primary Contact is required"),
    bankName: Yup.string().required("Bank Name is required"),
    accountName: Yup.string().required("Account Name is required"),
    accountNumber: Yup.string().required("Account Number is required"),
    bankAddress: Yup.string().required("Bank Address is required"),
    street: Yup.string().required("Street is required"),
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${BaseURL}/vender/${user?._id}`,
        values
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: response.data?.message,
        life: 3000,
      });

      dispatch(setUpdateUser(response?.data?.data?.user));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "An error occurred",
        life: 3000,
      });
      console.error("Error updating company details:", error);
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        <GoPrevious route={`/system-setup`} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
          Company Details
        </h2>
      </div>

      <Toast ref={toast} position="top-right" />
      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      {/* Company Logo Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
        <div className="col-span-2 p-4">
          <h3 className="font-bold">Company Logo</h3>
        </div>
        <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
          <EnhancedBrandLogo />
        </div>
      </div>

      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      {/* Terms and Conditions Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
        <div className="col-span-2 p-4">
          <h3 className="font-bold">Terms & Conditions</h3>
        </div>
        <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
          <TermsAndConditionsUpload />
        </div>
      </div>

      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      {/* Custom Documents Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
        <div className="col-span-2 p-4">
          <h3 className="font-bold">Custom Documents</h3>
        </div>
        <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
          <CustomDocumentsManager />
        </div>
      </div>

      <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

      <Formik
        initialValues={{
          primaryContact: user?.primaryContact || "",
          bankName: user?.bankName || "",
          bankAddress: user?.bankAddress || "",
          street: user?.street || "",
          companyName: user?.companyName || "",
          legalName: user?.legalName || "",
          businessType: user?.businessType || "",
          taxId: user?.taxId || "",
          swiftCode: user?.swiftCode || "",
          iban: user?.iban || "",
          zip: user?.zip || "",
          city: user?.city || "",
          state: user?.state || "",
          email: user?.email || "",
          primaryPhone: user?.primaryPhone || "",
          country: user?.country || "",
          accountName: user?.accountName || "",
          accountNumber: user?.accountNumber || "",
          currencyKey: user?.currencyKey || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange }) => (
          <Form>
            {/* Company Information Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Company Information</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Company Name <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.companyName}
                      name="companyName"
                      placeholder="Company Name"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="companyName"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Tax Identification Number <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.taxId}
                      name="taxId"
                      placeholder="Tax Identification Number"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="taxId"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Legal Name <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.legalName}
                      name="legalName"
                      placeholder="Legal Name"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="legalName"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Business Type <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.businessType}
                      name="businessType"
                      placeholder="Business Type"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="businessType"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Currency
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.currencyKey}
                      name="currencyKey"
                      placeholder="Currency"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Contact Information Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Contact Information</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 md:grid-cols-1">
                  <label className="mb-1 block font-medium text-black dark:text-white">
                    Primary Contact Person <span className="text-red">*</span>
                  </label>
                  <Field
                    as={InputText}
                    onChange={handleChange}
                    value={values?.primaryContact}
                    name="primaryContact"
                    placeholder="Primary Contact Person"
                    className="w-full"
                  />
                  <ErrorMessage
                    name="primaryContact"
                    component="div"
                    className="text-red"
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Phone Number <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.primaryPhone}
                      name="primaryPhone"
                      placeholder="Phone Number"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="primaryPhone"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-black dark:text-white">
                      Email Address <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.email}
                      name="email"
                      placeholder="Email Address"
                      className="w-full"
                      disabled
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Banking Information Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Banking Information</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Bank Name <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.bankName}
                      name="bankName"
                      placeholder="Bank Name"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="bankName"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Bank Address <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.bankAddress}
                      name="bankAddress"
                      placeholder="Bank Address"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="bankAddress"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Account Name <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.accountName}
                      name="accountName"
                      placeholder="Account Name"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="accountName"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Account Number <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.accountNumber}
                      name="accountNumber"
                      placeholder="Account Number"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="accountNumber"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      SWIFT/BIC Code <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.swiftCode}
                      name="swiftCode"
                      placeholder="SWIFT/BIC Code"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="swiftCode"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      IBAN <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.iban}
                      name="iban"
                      placeholder="IBAN"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="iban"
                      component="div"
                      className="text-red"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Business Address Section */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2 p-4">
                <h3 className="font-bold">Business Address</h3>
              </div>
              <div className="col-span-8 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Street <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.street}
                      name="street"
                      placeholder="Street"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="street"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div></div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      City <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.city}
                      name="city"
                      placeholder="City"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      State/Province <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.state}
                      name="state"
                      placeholder="State/Province"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="state"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Zip/Postal Code <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.zip}
                      name="zip"
                      placeholder="Zip/Postal Code"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="zip"
                      component="div"
                      className="text-red"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                      Country <span className="text-red">*</span>
                    </label>
                    <Field
                      as={InputText}
                      onChange={handleChange}
                      value={values?.country}
                      name="country"
                      placeholder="Country"
                      className="w-full"
                    />
                    <ErrorMessage
                      name="country"
                      component="div"
                      className="text-red"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark" />

            {/* Submit Buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-10">
              <div className="col-span-2"></div>
              <div className="col-span-8 md:col-span-8 lg:col-span-8 xl:col-span-5">
                <div className="flex justify-end gap-4 p-3">
                  <CanceButton onClick={() => router.back()} />
                  <Button 
                    label="Update" 
                    type="submit" 
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CompanyDetailsForm;