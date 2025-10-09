"use client";
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";
import CanceButton from "@/components/Buttons/CanceButton";
import { Dialog } from "primereact/dialog";

const RateDefinatonModal = ({refreshParent}) => {
  const [loading, setloading] = useState(false);
  const [visible, setVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rentalDaysPerWeek: 1,
    minimumRentalPeriod: 1,
    rateType: "Percentage",
    isActive: false,
    dayRates: Array(7).fill({ active: false, rate: "" }),
    partialWeeksHandling: "chargePerDay", // "chargePerDay" or "roundUpToFullWeek"
  });

  const toast = React.useRef(null);
  const router = useRouter();
  const { token } = useSelector((state) => state?.authReducer);

  const handleChange = (e, fieldName) => {
    setFormData({
      ...formData,
      [fieldName]: e.target.value,
    });
  };

  const handleSwitchChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };



  const handleSubmit = async () => {
    setloading(true);
    try {
      const response = await axios.post(
        `${BaseURL}/rate-definition`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },
      );
    //   router.push("/system-setup/rate-definition/");
    refreshParent()
    setFormData({
        name: "",
        description: "",
        rentalDaysPerWeek: 1,
        minimumRentalPeriod: 1,
        rateType: "Percentage",
        isActive: false,
        partialWeeksHandling: "chargePerDay",
    })
    setVisible(false)
      setloading(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: response.data?.message,
        life: 2000,
      });
    } catch (error) {
      setloading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data?.message,
        life: 2000,
      });
    }
  };

  return (
    <div className="rounded-lg ">
      <Toast ref={toast} />      <div className="flex cursor-pointer items-center justify-center gap-2 text-blue-500">
        <label
          onClick={() => setVisible(true)}
          className=" block cursor-pointer text-[0.9em] font-bold "
        >
          Create Rate Definition
        </label>
        <i onClick={() => setVisible(true)}
          className="pi pi-plus-circle
"
        />
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-12 ">
       
  
        <Dialog
        header="New Rate Definition"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div class="col-span-12  border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card md:col-span-12 md:w-[100%] lg:col-span-9 lg:w-[100%]">
          <div className="grid gap-4">
            {/* Name */}
            <div className="field">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="name"
              >
                Name
              </label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => handleChange(e, "name")}
              />
            </div>

            {/* Description */}
            <div className="field">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="description"
              >
                Description
              </label>
              <InputTextarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange(e, "description")}
                rows={3}
              />
            </div>

            {/* Rate Type and Active */}

            <div className="align-items-center flex  justify-between">
              {/* <div className="align-items-center flex  gap-14">
                <div className="field-radiobutton flex items-center justify-center gap-4">
                  <RadioButton
                    inputId="percentage"
                    name="rateType"
                    value="Percentage"
                    onChange={(e) => handleChange(e, "rateType")}
                    checked={formData.rateType === "Percentage"}
                  />
                  <label
                    className=" text-[0.9em] font-bold text-black"
                    htmlFor="percentage"
                  >
                    Percentage
                  </label>
                </div>
                <div className="field-radiobutton flex items-center justify-center gap-4">
                  <RadioButton
                    inputId="amount"
                    name="rateType"
                    value="Amount"
                    onChange={(e) => handleChange(e, "rateType")}
                    checked={formData.rateType === "Amount"}
                  />
                  <label
                    className=" text-[0.9em] font-bold text-black"
                    htmlFor="amount"
                  >
                    Amount
                  </label>
                </div>
              </div> */}
              <div className="align-items-center flex items-center justify-center  gap-4">
                <label
                  className=" text-[0.9em] font-bold text-black"
                  htmlFor="isActive"
                >
                  Active
                </label>
                <InputSwitch
                  checked={formData.isActive}
                  onChange={(e) => handleSwitchChange("isActive", e.value)}
                />
              </div>
            </div>
            <hr className="my-4  bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark " />


            {/* Day Rates */}
            {/* <div className="grid gap-2">
              {formData.dayRates.map((day, index) => (
                <div key={index} className="align-items-center flex gap-4">
                  <label className=" text-[0.9em] font-bold text-black">
                    Day {index + 1}
                  </label>
                  <InputSwitch
                    checked={day.active}
                    onChange={(e) =>
                      handleDayRateChange(index, "active", e.value)
                    }
                  />
                  <InputNumber
                    value={day.rate}
                    disabled={!day.active}
                    onValueChange={(e) =>
                      handleDayRateChange(index, "rate", e.value)
                    }
                    placeholder="Rate"
                    suffix={formData.rateType === "Percentage" ? "%" : ""}
                  />
                </div>
              ))}
            </div> */}
            {/* <hr className="my-4  bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark " /> */}

            {/* Rental Days Per Week */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
     <div className="field flex flex-col">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="rentalDaysPerWeek"
              >
                Rental Days Per Week
              </label>
              <InputNumber
                id="rentalDaysPerWeek"
                placeholder="5"
                value={formData.rentalDaysPerWeek}
                onValueChange={(e) => handleChange(e, "rentalDaysPerWeek")}
                min={1}
                max={7}
              />
            </div>

            {/* Minimum Rental Period */}
            <div className="field flex flex-col">
              <label
                className=" text-[0.9em] font-bold text-black"
                htmlFor="minimumRentalPeriod"
              >
                Minimum Rental Period
              </label>
              <InputNumber
                id="minimumRentalPeriod"
                value={formData.minimumRentalPeriod}
                onValueChange={(e) => handleChange(e, "minimumRentalPeriod")}
                placeholder="5"
              />
            </div>

            {/* Partial Weeks (Remainder Days) */}
            <div className="field">
              <label className="text-[0.9em] font-bold text-black mb-3 block">
                Partial Weeks (Remainder Days) <span className="text-gray-500 text-sm">(?)</span>
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <RadioButton
                    inputId="chargePerDay"
                    name="partialWeeksHandling"
                    value="chargePerDay"
                    onChange={(e) => handleChange(e, "partialWeeksHandling")}
                    checked={formData.partialWeeksHandling === "chargePerDay"}
                  />
                  <label htmlFor="chargePerDay" className="text-[0.9em] font-medium text-black cursor-pointer">
                    Charge per day
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <RadioButton
                    inputId="roundUpToFullWeek"
                    name="partialWeeksHandling"
                    value="roundUpToFullWeek"
                    onChange={(e) => handleChange(e, "partialWeeksHandling")}
                    checked={formData.partialWeeksHandling === "roundUpToFullWeek"}
                  />
                  <label htmlFor="roundUpToFullWeek" className="text-[0.9em] font-medium text-black cursor-pointer">
                    Round up to full week
                  </label>
                </div>
              </div>
            </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-5">
              <div className="">
                <CanceButton onClick={() => router.back()} />
              </div>
              <Button
              size="small"
                label="Add Rate Definition"
                loading={loading}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
        </Dialog>
      </div>
    </div>
  );
};

export default RateDefinatonModal;


