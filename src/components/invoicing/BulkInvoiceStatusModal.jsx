import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import axios from "axios";
import CanceButton from "../Buttons/CanceButton";

const BulkInvoiceStatusModal = ({
  visible,
  setVisible,
  title,
  description,
  status, // 'Confirmed' or 'Posted'
  selectedInvoiceIds,
  fetchOldData,
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useRef();
  const { token } = useSelector((state) => state?.authReducer);

  const handleBulkStatusChange = async () => {
    if (!selectedInvoiceIds?.length) return;

    setLoading(true);
    try {
      const url =
        status === "Posted"
          ? `${BaseURL}/invoice/bulk-invoice-post-all`
          : `${BaseURL}/invoice/bulk-invoice-status`;

      const payload =
        status === "Posted"
          ? { invoiceIds: selectedInvoiceIds }
          : { invoiceId: selectedInvoiceIds, status };

      const method = status === "Posted" ? "post" : "put";

      const response = await axios[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data?.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data.message,
          life: 3000,
        });
        fetchOldData();
        setVisible(false);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error?.response?.data?.message || "Failed to update status.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header={title}
        visible={visible}
        style={{ width: "40vw" }}
        onHide={() => setVisible(false)}
        footer={
          <div>
            <CanceButton onClick={() => setVisible(false)} />
            <Button
              label="Yes"
              icon="pi pi-check"
              onClick={handleBulkStatusChange}
              loading={loading}
              autoFocus
            />
          </div>
        }
        draggable={false}
        resizable={false}
      >
        <p className="text-sm text-gray-700">{description}</p>
      </Dialog>
    </>
  );
};

export default BulkInvoiceStatusModal;
