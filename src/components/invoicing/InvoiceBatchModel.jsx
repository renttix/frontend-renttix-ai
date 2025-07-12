import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useParams, useRouter } from "next/navigation";

import { useSelector } from "react-redux";
import CanceButton from "../Buttons/CanceButton";
import { Toast } from "primereact/toast";
import { BaseURL } from "../../../utils/baseUrl";
import axios from "axios";

const InvoiceBatchModel = ({
  title,
  batchId,
  description,
  subTitle,
  invoiceId,
  data,
  code,
  fetchOldData,
  selectedInvoices
}) => {
  //   const { isOpen, onOpen, onClose } = useDisclosure()
  const [loading, setloading] = useState(false);
  const toast = useRef();
  const { token,user } = useSelector((state) => state?.authReducer);

  const router = useRouter();
  const params = useParams();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState("center");
console.log({ title,data,user})

console.log({selectedInvoices})
const multipleInvoices = (() => {
  if (title === "Post All" && data?.invoices?.length) {
    return data.invoices.map(item => ({
      invoiceId: item?._id,
      amount: item?.total,
      currency: user?.currencyKey,
      email: item?.customerEmail,
      vendorId: user?._id,
      customerId: item?.customer_id,
      invoiceNo: item?.invocie,
      orderId: item?.orderNumber,
      chargingStartDate: item?.invoiceUptoDate
    }));
  }
  return []; // fallback if condition fails
})();

  console.log({multipleInvoices})


const handleMultipleInvoicePayment = async (invoices) => {
  try {
    const response = await axios.post(`${BaseURL}/stripes/payment/group-invoice`, invoices);

    if (response.data?.success) {
      const sessions = response.data.sessions;

      // Option 1: Redirect the user to the first session
      // if (sessions.length === 1) {
      //   window.location.href = sessions[0].sessionUrl;
      // } 
      // Option 2: Show links for each grouped customer (if multiple customers involved)
      // else {
      //   sessions.forEach((session) => {
      //     window.open(session.sessionUrl, '_blank'); // Open each in new tab
      //   });

        // OR show them in a UI modal with copy/share options
        // Example:
        // setPaymentLinks(sessions); // then display in a popup/modal
      // }
    } else {
      throw new Error("Failed to create Stripe sessions");
    }
  } catch (error) {
    console.error("Payment error:", error);
    toast.current.show({
      severity: "error",
      summary: "Payment Error",
      detail: error?.response?.data?.message || "Failed to initiate payment.",
      life: 3000,
    });
  }
};





const InvoicePayload = {
  invoiceId:data?._id,
  amount:data?.total,
  currency:user?.currencyKey,
  email:data?.customerEmail,
  vendorId:user?._id,
  customerId:data?.customer_id,
  invoiceNo:data?.invocie,
  orderId:data?.orderNumber,
  chargingStartDate:data?.invoiceUptoDate
}

const handleInvoicePayment = async () => {
  // setLoading(true);

  try {
    const { data } = await axios.post(`${BaseURL}/stripes/payment/signle-invoice`, InvoicePayload);

    if (data?.url) {
      console.log(data?.url)
      // window.location.href = data.url; 
    } else {
      throw new Error("Invalid payment URL received.");
    }
  } catch (error) {
    toast.current.show({
      severity: "error",
      summary: "Payment Error",
      detail: error?.response?.data?.message || "Failed to initiate payment.",
      life: 3000,
    });
  }

  // setLoading(false);
};


  const show = (position) => {
    setPosition(position);
    setVisible(true);
  };

  const payload = {
    id: batchId,
    status: "Confirmed",
  };

  const allocationData = {
    id: batchId,
    invoiceId: invoiceId,
  };

  // const handleSubmit = async () => {
  //   setloading(true);

  //   try {
  //     const config = {
  //       headers: { authorization: `Bearer ${token}` },
  //     };

  //     const res =
  //       title === "Confirm All"
  //         ? await axios.put(
  //             `${BaseURL}/invoice/invoice-status`,
  //             payload,
  //             config,
  //           )
  //         : title === "Post invoice"
  //           ? await axios.post(
  //               `${BaseURL}/invoice/invoice-post/`,
  //               allocationData,
  //               config,
  //             )
  //           : title === "Post All"
  //             ? await axios.post(
  //                 `${BaseURL}/invoice/invoice-post-all/`,
  //                 { id: params.id },
  //                 config,
  //               )
  //             : title === "Confirm Invoice"
  //               ? await axios.post(
  //                   `${BaseURL}/invoice/invoice-confirmed`,
  //                   allocationData,

  //                   config,
  //                 )
  //               : await axios.delete(`${BaseURL}/invoice/${batchId}`, config);

  //     if (user.isQuickBook && res?.data?.message == "AUTHENTICATION") {
  //       window.location.href = `${BaseURL}/auth?vendorId=${user._id}&redirctURL=${window.location.href}`;
  //     }

  //     if (res.data.success) {
  //       setloading(false);
  //       toast.current.show({
  //         severity: "success",
  //         summary: "Successful",
  //         detail: res.data.message,
  //         life: 3000,
  //       });

  //       if (title === "Delete Invoice Batch") {
  //         router.push("/invoice/invoice-batches");
  //       } else {
  //         fetchOldData();
  //       }
  //     }
  //   } catch (error) {
  //     toast.current.show({
  //       severity: "error",
  //       summary: "Error",
  //       detail: error.response?.data?.message || "An error occurred",
  //       life: 3000,
  //     });
  //   } finally {
  //     setloading(false);
  //   }
  // };

  const handleSubmit = async () => {
    setloading(true);
  
    try {
      const config = {
        headers: { authorization: `Bearer ${token}` },
      };
  
      let res;
  
      if (title === "Confirm All") {
        res = await axios.put(`${BaseURL}/invoice/invoice-status`, payload, config);
      } else if (title === "Post invoice") {
        res = await axios.post(`${BaseURL}/invoice/invoice-post/`, allocationData, config);
  
        // ✅ If "Post invoice" succeeds, call handleInvoicePayment()
        if (res?.data?.success) {
          await handleInvoicePayment();
        }
      } else if (title === "Post All") {
        console.log("🚀 Sending Post All request");
        try {
          res = await axios.post(`${BaseURL}/invoice/invoice-post-all/`, { id: params.id }, config);
         if(res.data.success){
          await handleMultipleInvoicePayment(multipleInvoices);

         }
        } catch (err) {
          console.error("❌ Post All error:", err.response?.data || err.message);
        }
      } else if (title === "Confirm Invoice") {
        res = await axios.post(`${BaseURL}/invoice/invoice-confirmed`, allocationData, config);
      } else {
        res = await axios.delete(`${BaseURL}/invoice/${batchId}`, config);
      }
  
      // 🔄 Redirect to authentication if QuickBook requires it
      if (user.isQuickBook && res?.data?.message === "AUTHENTICATION") {
        window.location.href = `${BaseURL}/auth?vendorId=${user._id}&redirctURL=${window.location.href}`;
      }
  
      if (res?.data?.success) {
        setloading(false);
        toast.current.show({
          severity: "success",
          summary: "Successful",
          detail: res.data.message,
          life: 3000,
        });
  
        if (title === "Delete Invoice Batch") {
          router.push("/invoice/invoice-batches");
        } else {
          fetchOldData();
        }
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "An error occurred",
        life: 3000,
      });
    } finally {
      setloading(false);
    }
  };
  
  return (
    <div className="card">
      <Toast ref={toast} />
      <div className="justify-content-center mb-2 flex flex-wrap gap-2">
        <Button
          label={title}
          unstyled
          onClick={() => show("top")}
          className="cursor-pointer text-[#3182ce] text-[14px]"
        />
      </div>
      {/* <Button onClick={handleInvoicePayment}>pay</Button> */}

      <Dialog
        header={title}
        visible={visible}
        position={position}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
        footer={() => {
          return (
            <div>
              <CanceButton onClick={() => setVisible(false)} />
              {/* <Button
                label="No"
                icon="pi pi-times"
                onClick={() => setVisible(false)}
                className="p-button-text"
              /> */}
              <Button
                label="Yes"
                loading={loading}
                icon="pi pi-check"
                onClick={handleSubmit}
                autoFocus
              />
            </div>
          );
        }}
        draggable={false}
        resizable={false}
      >
        {subTitle == "Post invoice" && (
          <div className="mb-5 flex flex-col gap-3">
            <div>
              <label className="font-semibold text-red">
                This action is irreversible!
              </label>
            </div>
            <div className="">
              <label>
                IMPORTANT! Please check your Invoice prior to posting. Posting
                invoices/credits is irreversible, and you will no longer be able
                to void and regenerate them. Any changes will require a manual
                invoice/credit.
              </label>
            </div>
          </div>
        )}
        {subTitle == "Post All" && (
          <div className="mb-5 flex flex-col gap-3">
            <div>
              <label className="font-semibold text-red">
                This action is irreversible!
              </label>
            </div>
            <div className="">
              <label>
                IMPORTANT! Please check your invoices and credits prior to
                posting. Posting invoices/credits is irreversible, and you will
                no longer be able to void and regenerate them. Any changes will
                require a manual invoice/credit.
              </label>
            </div>
          </div>
        )}
        <label
          className={`flex ${
            (title === "Delete Invoice Batch" || title === "Post All") &&
            "flex-col"
          }`}
        >
          {description} <span className="ml-1 font-semibold">{code}</span>{" "}
          {subTitle == "Post invoice" && <label>?</label>}
        </label>
      </Dialog>
    </div>
  );
};

export default InvoiceBatchModel;
