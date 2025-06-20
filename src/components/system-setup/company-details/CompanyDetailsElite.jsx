"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { ProgressSpinner } from "primereact/progressspinner";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Building2, 
  Mail, 
  Globe, 
  DollarSign, 
  Edit3, 
  Save,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { setUpdateUser } from "@/store/authSlice";
import { BaseURL } from "../../../../utils/baseUrl";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const CompanyDetailsElite = () => {
  const { user } = useSelector((state) => state?.authReducer);
  const [visible, setVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useRef();
  const dispatch = useDispatch();

  // Fetch countries with proper error handling
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        // Using the correct API endpoint with specific fields
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags,currencies");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const countryList = data.map((country) => ({
            label: country.name?.common || "Unknown",
            value: country.cca2 || "",
            flag: country.flags?.png || country.flags?.svg || "",
            currency: country.currencies ? Object.keys(country.currencies)[0] : "USD",
            currencySymbol: country.currencies ? Object.values(country.currencies)[0]?.symbol : "$"
          }));
          
          countryList.sort((a, b) => a.label.localeCompare(b.label));
          setCountries(countryList);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        toast.current?.show({
          severity: "warn",
          summary: "Warning",
          detail: "Could not load country list. Using default values.",
          life: 3000,
        });
        
        // Fallback countries
        setCountries([
          { label: "United States", value: "US", currency: "USD", currencySymbol: "$" },
          { label: "United Kingdom", value: "GB", currency: "GBP", currencySymbol: "£" },
          { label: "European Union", value: "EU", currency: "EUR", currencySymbol: "€" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const countryOptionTemplate = (option) => (
    <div className="flex items-center gap-3 p-2">
      {option.flag && (
        <img 
          src={option.flag} 
          alt={option.label} 
          className="w-6 h-4 object-cover rounded"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <span className="font-medium">{option.label}</span>
      {option.currencySymbol && (
        <span className="ml-auto text-gray-500">({option.currencySymbol})</span>
      )}
    </div>
  );

  const updateCompanyDetails = async (values) => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${BaseURL}/vender/${user?._id}`,
        values,
      );
      
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Company details updated successfully",
        life: 3000,
      });
      
      dispatch(setUpdateUser(response?.data?.data?.user));
      setVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update company details",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const InfoCard = ({ icon: Icon, label, value, editable, onEdit }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {value || "Not set"}
              </p>
            </div>
          </div>
          {editable && (
            <button
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <Edit3 className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <ProgressSpinner 
            style={{ width: '50px', height: '50px' }} 
            strokeWidth="4" 
            animationDuration=".5s"
          />
          <p className="mt-4 text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="company-details-elite">
      <Toast ref={toast} position="top-right" />
      
      <Breadcrumb pageName="Company Details" />
      
      {/* Update Dialog */}
      <Dialog
        header={
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <span>Update Location & Currency</span>
          </div>
        }
        visible={visible}
        style={{ width: '90vw', maxWidth: '500px' }}
        onHide={() => setVisible(false)}
        className="elite-dialog"
      >
        <Formik
          initialValues={{
            currencyKey: user?.currencyKey || "USD",
            country: user?.country || "",
            countryCode: user?.countryCode || "",
          }}
          onSubmit={updateCompanyDetails}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="space-y-6">
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <Dropdown
                    value={values.countryCode}
                    options={countries}
                    onChange={(e) => {
                      const selectedCountry = e.value;
                      const countryObj = countries.find((c) => c.value === selectedCountry);
                      
                      setFieldValue("countryCode", selectedCountry);
                      setFieldValue("currencyKey", countryObj?.currency || "");
                      setFieldValue("country", countryObj?.label || "");
                    }}
                    placeholder="Select your country"
                    filter
                    filterPlaceholder="Search countries..."
                    showClear
                    optionLabel="label"
                    itemTemplate={countryOptionTemplate}
                    className="w-full"
                  />
                </div>

                {/* Currency Display */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{values.currencyKey || "Not selected"}</span>
                      {values.currencyKey && (
                        <span className="text-2xl">
                          {countries.find(c => c.currency === values.currencyKey)?.currencySymbol || "$"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    severity="secondary"
                    onClick={() => setVisible(false)}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <div className="text-center">
              <div className="mb-6">
                <Avatar
                  label={user?.legalName?.charAt(0) || "C"}
                  size="xlarge"
                  shape="circle"
                  className="bg-primary text-white text-3xl font-bold"
                  style={{ width: '100px', height: '100px' }}
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.legalName || "Company Name"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Member since {new Date(user?.createdAt).getFullYear() || "2024"}
              </p>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Verified Account</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Company Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Company Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={Building2}
                label="Company Name"
                value={user?.legalName}
                editable={false}
              />
              
              <InfoCard
                icon={Mail}
                label="Email Address"
                value={user?.email}
                editable={false}
              />
              
              <InfoCard
                icon={Globe}
                label="Country"
                value={user?.country}
                editable={true}
                onEdit={() => setVisible(true)}
              />
              
              <InfoCard
                icon={DollarSign}
                label="Currency"
                value={user?.currencyKey}
                editable={true}
                onEdit={() => setVisible(true)}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Location & Currency Settings
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    These settings affect how prices are displayed and which tax rules apply to your rentals.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyDetailsElite;