"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { BaseURL } from "../../../../utils/baseUrl";
import { useParams, useRouter } from "next/navigation";
import CanceButton from "@/components/Buttons/CanceButton";
import Loader from "@/components/common/Loader";

const UpdateInvoiceRunCode = () => {
  const [loading, setloading] = useState(false);
  const params = useParams();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const { token } = useSelector((state) => state?.authReducer);
  const router = useRouter();
  const toast = React.useRef(null);

  useEffect(() => {
    const paymentTermsFetch = async () => {
      setloading(true);
      try {
        const response = await axios.get(
          `${BaseURL}/invoice-run-code/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.data.success) {
          setloading(false);
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
        // setError("Failed to fetch invoice run code details");
        setloading(false);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail:
            error.response?.data.message || "Failed to update Invoice Run Code",
          life: 5000,
        });
      }
    };
    paymentTermsFetch();
  }, [params.id, token, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    setloading(true);
    e.preventDefault();
    try {
      await axios.put(`${BaseURL}/invoice-run-code/${params.id}`, formData, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      setloading(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Invoice Run Code added successfully",
        life: 5000,
      });
      setFormData({
        name: "",
        code: "",
        description: "",
      });
    } catch (error) {
      setloading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          error.response?.data.message || "Failed to add Invoice Run Code",
        life: 5000,
      });
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      {loading ? (
        <div className="flex h-svh items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div class="grid grid-cols-1 gap-4 md:grid-cols-12 ">
          <div class="col-span-12 p-4  lg:col-span-3 xl:col-span-2 ">
            <h3 className="font-bold">Update Invoice Run Code</h3>
          </div>
          <div class="col-span-12 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4 md:col-span-12 md:w-[100%] lg:col-span-9 lg:w-[100%]  xl:col-span-9 xl:w-[70%] 2xl:w-[70%]">
            {/* <Button
          icon="pi pi-arrow-left"
          className="p-button-rounded p-button-secondary mb-4"
          onClick={() => router.push("/system-setup/invoice-run-code")}
        /> */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-medium">
                  Name
                </label>
                <InputText
                  id="name"
                  name="name"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="font-medium">
                  Code
                </label>
                <InputText
                  id="code"
                  name="code"
                  placeholder="Enter code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-medium">
                  Description
                </label>
                <InputTextarea
                  id="description"
                  name="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-5 flex items-end justify-end gap-4">
              <div className="">
                <CanceButton onClick={() => router.back()} />
              </div>
              <Button
                loading={loading}
                onClick={handleSubmit}
                label="Update"
                className="p-button-raised p-button-success"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateInvoiceRunCode;
