"use client";
import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { PiPlugFill } from "react-icons/pi";
import axios from "axios";
import { IoArrowBackOutline } from "react-icons/io5";
import { InputTextarea } from "primereact/inputtextarea";
import { BaseURL } from "../../../../../utils/baseUrl";

const IntegrationAccount = () => {
  const [loading, setLoading] = useState(false);
  const { user,token } = useSelector((state) => state?.authReducer);
  const [quickBookStatus, setQuickBookStatus] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
const [syncLoading, setSyncLoading] = useState(false);

  const toast = React.useRef(null);

  const startQuickBooksAuth = () => {
    window.location.href = `${BaseURL}/auth?vendorId=${user._id}&redirctURL=${window.location.href}`;
  };

  const RevokeQuickbookAuth = () => {
    setLoading(true);
    axios
      .post(`${BaseURL}/disconnect-quickbook`, {
        vendorId: user._id,
      })
      .then((response) => {
        console.log(response.data);
        setQuickBookStatus(response.data.status);
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "QuickBooks",
          detail: response.data.message,
          life: 2000,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card p-4">
      <Toast ref={toast} />
      <div className="w-[80%]">
        {/* <GoBackButton title={<IoArrowBackOutline className="text-lg" />} /> */}
        <h2 className="font-bold">Integration: QuickBooks</h2>
        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <img
              className="w-32"
              src="/images/QuickBooks.png"
              alt="QuickBooks"
            />
          </div>
          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="name">Name</label>
              <InputText id="name" value="QuickBooks" readOnly />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value="Integrate with QuickBooks accounting software to provide the ability to post your invoices into QuickBooks and keep your accounts and QuickBooks contacts in sync."
                readOnly
                rows={5}
              />
            </div>
          </div>
        </div>
        <hr className="my-8  bg-white dark:shadow-1 dark:border-dark-3 dark:bg-gray-dark " />

        <div className="mt-8 flex">
          <div className="flex w-[20%] items-center justify-center">
            <PiPlugFill className="text-[120px] text-[#DDD]" />
          </div>
          <div className="flex w-[60%] flex-col gap-4">
            <div className="flex flex-col">
              <h3
                className={`text-xl font-semibold ${
                  !quickBookStatus && user?.isQuickBook
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {!quickBookStatus && user?.isQuickBook
                  ? "QuickBooks Connected!"
                  : "QuickBooks Not Connected!"}
              </h3>
            </div>
            <div className="flex flex-col">
  <div className="flex gap-3 flex-wrap">
    {!quickBookStatus && user?.isQuickBook ? (
      <>
   <Button
  label="Revoke QuickBooks"
  loading={revokeLoading}
  style={{ background: "red" }}
  icon="pi pi-times"
  className="p-button-danger"
  onClick={() => {
    setRevokeLoading(true);
    axios
      .post(`${BaseURL}/disconnect-quickbook`, {
        vendorId: user._id,
      })
      .then((response) => {
        setQuickBookStatus(response.data.status);
        toast.current.show({
          severity: "error",
          summary: "QuickBooks",
          detail: response.data.message,
          life: 2000,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setRevokeLoading(false);
      });
  }}
/>

<Button
  label="Sync Customers to QuickBooks"
  icon="pi pi-refresh"
  className="p-button-success"
  loading={syncLoading}
  onClick={async () => {
    setSyncLoading(true);
    try {
      const { data } = await axios.post(
        `${BaseURL}/sync-customers-to-quickbooks`,
        { vendorId: user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.current.show({
        severity: "success",
        summary: "Sync Complete",
        detail: `${data.synced.length} customers synced.`,
        life: 3000,
      });
    } catch (error) {
      console.error("❌ Sync error:", error);
      toast.current.show({
        severity: "error",
        summary: "Sync Failed",
        detail:
          error.response?.data?.message ||
          "Failed to sync customers.",
        life: 3000,
      });
    } finally {
      setSyncLoading(false);
    }
  }}
/>

      </>
    ) : (
      <Button
        label="Connect to QuickBooks"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={startQuickBooksAuth}
      />
    )}
  </div>
</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationAccount;
