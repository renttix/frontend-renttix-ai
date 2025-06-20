"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import Link from "next/link";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { useParams, useRouter } from "next/navigation";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import ConfirmLink from "@/components/confirmLink/ConfirmLink";

const UpdatePaymentTerms = () => {
  const [valueList, setValueList] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setformLoading] = useState(false)
  const toast = React.useRef(null);
  const router = useRouter()
  const { token } = useSelector((state) => state?.authReducer);
  const params = useParams()

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    periodType: "",
    days: "",
  });
const [periodTypeOptions, setPeriodTypeOptions] = useState([]);
const [parentId, setParentId] = useState("");

useEffect(() => {
  const fetchPeriodTypes = async () => {
    try {
      const resp = await axios.get(
        `${BaseURL}/list/value-list/children`,
        {
          headers: { authorization: `Bearer ${token}` },
          params: { parentName: "Payment Term Period Type" },
        }
      );
      if (resp.data.success) {
        setPeriodTypeOptions(resp.data.children);
        setParentId(resp.data.parentId);    // in case you need it later
      }
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error loading period types",
        detail: err.message,
        life: 3000,
      });
    }
  };
  fetchPeriodTypes();
}, [token]);

  useEffect(() => {
    const paymentTermsFetch = async () => {
      try {
        const response = await axios.get(
          `${BaseURL}/payment-terms/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
        //   setdata(response.data.data);
          setFormData({
            name: response.data.data.name,
            description: response.data.data.description,
            code: response.data.data.code,
            periodType: response.data.data.periodType,
            days: response.data.data.days,
            // taxRate: response.data.data.taxRate,
            // type: response.data.data.type,
          });
        }
      } catch (error) {
        // setError("Failed to fetch tax class details");
        // toast.current?.show({
        //     severity: "error",
        //     summary: "Error",
        //     detail: err.message,
        //     life: 3000,
        //   });
   
      }
    };
    paymentTermsFetch();
  }, [params.id, token, toast]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BaseURL}/list/value-list`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        setValueList(response?.data);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err.message,
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  const paymentPeriodList = valueList?.data?.map((item) => {
    if (item.name === "Payment Term Period Type") {
      return item._id;
    }
  });
  const paymentTermId = paymentPeriodList?.filter((item) => item)[0];

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(
          `${BaseURL}/list/value-sub-list?parentId=${paymentTermId}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        setPaymentTerms(response?.data);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: err.message,
          life: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (paymentTermId) {
      fetchSubCategories();
    }
  }, [paymentTermId, valueList, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    setformLoading(true)

    try {
        const response = await axios.put(
            `${BaseURL}/payment-terms/${params.id}`,
            formData,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.success) {
            setformLoading(false);
            router.push("/system-setup/payment-terms");
          }
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Payment Term added successfully",
        life: 3000,
      });
      setFormData({
        name: "",
        code: "",
        description: "",
        periodType: "",
        days: "",
      });
    } catch (error) {
        setformLoading(false)
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data.message || "Failed to add Payment Term",
        life: 3000,
      });
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
    <GoPrevious route={'/system-setup/payment-terms'}/>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-12 ">
        <div class="col-span-12 p-4  lg:col-span-3 xl:col-span-2 ">
        <h2 className="text-lg font-semibold mb-4">New Payment Term</h2>
        </div>
        <div class="col-span-12 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-12 md:w-[100%] lg:col-span-9 lg:w-[100%]  xl:col-span-9 xl:w-[70%] 2xl:w-[70%]">
        <div className="card p-4">
         
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="name">Name</label>
              <InputText
                id="name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="code">Code</label>
              <InputText
                id="code"
                type="number"
                name="code"
                placeholder="Code"
                value={formData.code}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <label htmlFor="description">Description</label>
            <InputTextarea
              id="description"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="flex flex-col gap-1">
                   <ConfirmLink href={`/system-setup/list-value/${parentId}`}>
                    <label className="block cursor-pointer text-[0.9em] font-bold text-blue-500">
                        <label htmlFor="periodType">Period Type</label>
                    </label>
                  </ConfirmLink>
                 
               
                  <Dropdown
                    id="periodType"
                    name="periodType"
                    value={formData.periodType}
                    options={periodTypeOptions}
                    optionLabel="name"
                    optionValue="name"
                    onChange={handleChange}
                    placeholder="Select Period Type"
                  />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="days">Days</label>
              <InputText
                id="days"
                type="number"
                name="days"
                placeholder="Days"
                value={formData.days}
                onChange={handleChange}
              />
            </div>
          </div>
         <div className="flex justify-end items-end">
         <div className="flex justify-content-end  gap-3 mt-4">
          <CanceButton onClick={()=>router.back()}/>
            <Button loading={formLoading} onClick={handleSubmit} size="small" label="Update Payment Terms"  />
          </div>
         </div>
        </div>
    </div>
    </div>
    </div>
  );
};

export default UpdatePaymentTerms;
