"use client";
import React, { useRef, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Toast, useToast } from "primereact/toast";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { BaseURL } from "../../../../utils/baseUrl";
import GoBackButton from "@/components/Buttons/GoBackButton";
import { InputTextarea } from "primereact/inputtextarea";
import GoPrevious from "@/components/common/GoPrevious/GoPrevious";
import { Dialog } from "primereact/dialog";
import CanceButton from "@/components/Buttons/CanceButton";
import Link from "next/link";

const AddTaxClassModal = ({refreshParent }) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultStatus: true,
    taxRate: 0,
    type: "product",
  });
  const { token } = useSelector((state) => state?.authReducer);
  const toast = useRef();
  const router = useRouter();

  const handleInputChange = (e, name) => {
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/tax-classes/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        refreshParent()
       setVisible(false)
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data?.message,
          life: 2000,
        });
        setFormData({
          name: "",
          description: "",
          defaultStatus: false,
          type: "product",
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data?.message,
        life: 2000,
      });
    }
    setLoading(false);
  };

  return (
    <div className="">
 <div onClick={() => setVisible(true)} className="flex justify-center items-center gap-2 text-blue-500 cursor-pointer">
 <label
        
        href={"/system-setup/tax-classes"}
        className=" block text-[0.9em] font-bold cursor-pointer "
      >
        Create Tax Class
      </label>
      <i className="pi pi-plus-circle
" />
 </div>
      {/* <Button label="Show" link icon="pi pi-external-link" onClick={() => setVisible(true)} /> */}
      <Dialog
        header="New Tax Class"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div className="w-full   border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:w-full md:col-span-12 md:w-[100%] lg:col-span-9 lg:w-[100%]  xl:col-span-9 ">
          <Toast ref={toast} />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-[0.9em] font-bold text-black">
                Name
              </label>
              <InputText
                placeholder="Name (Required)"
                value={formData.name}
                onChange={(e) => handleInputChange(e, "name")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-[0.9em] font-bold text-black">
                Description
              </label>
              <InputTextarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange(e, "description")}
              />
            </div>
            {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-[0.9em] font-bold text-black">
                  Postcode
                </label>
                <InputText
                  placeholder="Postcode (Required)"
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange(e, "postcode")}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-[0.9em] font-bold text-black">
                  Country
                </label>
                <Dropdown
                  value={formData.country}
                  options={[
                    { label: "United Kingdom", value: "United Kingdom" },
                  ]}
                  onChange={(e) => handleInputChange(e, "country")}
                />
              </div>
            </div> */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-[0.9em] font-bold text-black">
                  Tax Rate
                </label>
                <InputNumber
                  placeholder="Tax Rate (%)"
                  value={formData.taxRate}
                  onValueChange={(e) =>
                    setFormData({ ...formData, taxRate: e.value })
                  }
                  min={0}
                  max={100}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="" className="text-[0.9em] font-bold text-black">
                  Status
                </label>
                <div className="align-items-center mt-3 flex gap-2">
                  <Checkbox
                    checked={formData.defaultStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultStatus: e.checked })
                    }
                  />
                  <label>Active</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <CanceButton
                onClick={() => {
                  if (!visible) return;
                  setVisible(false);
                }}
              />
              <Button
                label="Add Tax Class"
                icon="pi pi-check"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AddTaxClassModal;
