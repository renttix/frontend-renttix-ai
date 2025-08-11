"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import moment from "moment";
import Link from "next/link";
import { FaCodepen, FaEdit } from "react-icons/fa";
import { BaseURL } from "../../../utils/baseUrl";

import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import InvoiceBatchTable from "./InvoiceBatchTable";
import Loader from "../common/Loader";
import InvoiceBatchModel from "./InvoiceBatchModel";
import { MdDelete } from "react-icons/md";
import { PiPrinterFill } from "react-icons/pi";
import EditInvoiceModal from "./EditInvoiceModal";
import { Button } from "primereact/button";

import {
  IoIosCheckmarkCircle,
  IoIosCheckmarkCircleOutline,
} from "react-icons/io";
import SingleInvoiceTable from "./SingleInvoiceTable";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { formatCurrency } from "../../../utils/helper";
import RefundModal from "./RefundModal";

const ViewBatchInvoice = () => {
  const [data, setdata] = useState({});
  const [loading, setloading] = useState(false);
  const { token, user } = useSelector((state) => state?.authReducer);
  const [loader, setloader] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  const invoice = {
    invoiceNumber: "INV-2025-0123",
    preTaxSubtotal: 4950.0,
    taxRate: 9.5,
  };
  const params = useParams();
  console.log(params);

  useEffect(() => {
    const fetchData = async () => {
      let payload = {
        id: params.id,
        invoiceId: params.invoiceId,
      };
      setloading(true);
      const response = await axios.post(
        `${BaseURL}/invoice/invoice-view`,
        payload,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        setloading(false);
        setdata(response.data.data);
      } else {
        console.log(response?.data?.message);
      }
    };
    fetchData();
  }, [refreshFlag]);
  const handleRefresh = () => {
    setRefreshFlag((prevFlag) => !prevFlag);
  };

  const allocationData = {
    id: params.id,
    invoiceId: params.invoiceId,
  };

  const handleDownloadInvoice = async () => {
    setloader(true);
    try {
      // Make API call to generate the invoice PDF
      const response = await axios.post(
        `${BaseURL}/invoice/invoice-print/`,
        allocationData,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.url) {
        setloader(false);
        // Open the URL in a new tab to trigger the download
        window.open(response.data.url, "_blank");
      } else {
        console.error("Failed to generate invoice.");
        setloader(false);
      }
    } catch (error) {
      setloader(false);
      console.error("Error generating invoice:", error);
    } finally {
    }
  };

  //   if (loading) {
  //     return (
  //       <Center height="100vh">
  //         <Spinner size="xl" />
  //       </Center>
  //     );
  //   }

  return (
    <>
      <div className="flex gap-3">
        <GoPrevious route={`/invoicing/invoice-batch/${params.id}`} />
        <EditInvoiceModal
          visible={editVisible}
          setVisible={setEditVisible}
          invoice={data}
          batchId={params.id}
          invoiceId={params.invoiceId}
          token={token}
          onSuccess={handleRefresh}
        />

        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Detail Invoice
        </h2>
      </div>
      {loading ? (
        <div className="my-auto flex min-h-[50vh] items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div>
          {/* <div className="grid grid-cols-3"> */}
          <div class="mt-5 grid grid-cols-8 gap-4">
            <div className="col-span-2  p-4">
              <div className="flex flex-col items-center justify-center ">
                <FaCodepen className="p-4 text-[150px] text-[#555]" />

                <label
                  htmlFor=""
                  className="min-w-[100px] text-center text-[14px] text-[20px] font-semibold text-dark-2 dark:text-white"
                >
                  Invoice : {data?.invocie}
                </label>
              </div>
            </div>
            <div className="col-span-3  p-4 ">
              <label
                className="min-w-[100px] text-[14px] text-[20px] font-semibold text-dark-2 dark:text-white "
                htmlFor="Action"
              >
                Customer Information
              </label>
              <div className="flex flex-col ">
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Name
                  </label>
                  <div className="text-start">
                    <label className="text-[14px] font-light">
                      {data.customerName}
                    </label>
                  </div>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Address
                  </label>
                  <div className="text-start">
                    <label className="text-[14px] font-light">
                      {" "}
                      {` ${data.customerAddress} ${data.customerCity} ${data.customerCountry}`}
                    </label>
                  </div>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Email
                  </label>
                  <label className="text-[14px] font-light">
                    {data.customerEmail}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Delivery Address
                  </label>
                  <label className="text-[14px] font-light">
                    {` ${data.deliveryAddress} ${data.deliveryPlaceName}`}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Order Number
                  </label>
                  <label className="text-[14px] font-light">
                    {" "}
                    {data.orderId}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Invoice Date
                  </label>
                  <label className="text-[14px] font-light">
                    {" "}
                    {moment(data.invoiceDate).format("lll")}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Invoice up to Date
                  </label>
                  <label className="text-[14px] font-light">
                    {" "}
                    {moment(data.invoiceUptoDate).format("lll")}
                  </label>
                </div>
              </div>
              <div className="mt-5 flex  gap-4">
                <div className="">
                  <label
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                    htmlFor="Action"
                  >
                    Action
                  </label>
                  <div className="flex flex-col">
                    {data?.status === "Draft" && (
                      <div className="flex items-center gap-2">
                        <IoIosCheckmarkCircleOutline />

                        <InvoiceBatchModel
                          title="Confirm Invoice"
                          subTitle={"Confirm Invoice"}
                          fetchOldData={handleRefresh}
                          invoiceId={params.invoiceId}
                          batchId={params.id}
                          description={`Are you sure you want to confirm the Invoice?`}
                        />
                      </div>
                    )}
                    {/* {isDraft && (
                  <>
                    {data?.status === "Draft" && (
                      <div className="flex items-center gap-2">
                        <IoIosCheckmarkCircleOutline />

                        <InvoiceBatchModel
                          title="Confirm Batch"
                          subTitle={"Confirm Batch"}
                          fetchOldData={handleRefresh}
                          batchId={data._id}
                          description={`Are you sure you want to confirm all the draft invoices in the invoice batch`}
                          code={`${data.batchNumber}?`}
                        />
                      </div>
                    )}
                  </>
                )} */}
                    {(data?.status === "Confirmed" ||
                      data?.status === "Draft") && (
                      <div className="flex items-center gap-2">
                        <IoIosCheckmarkCircle />
                        <InvoiceBatchModel
                          fetchOldData={handleRefresh}
                          title="Post invoice"
                          subTitle={"Post invoice"}
                          batchId={params.id}
                          invoiceId={params.invoiceId}
                          data={data}
                          code={data.invocie}
                          description={`Are you sure you want to Post the Invoice`}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MdDelete />

                      <InvoiceBatchModel
                        subTitle={"Confirm Delete"}
                        code={data?.name}
                        batchId={data?._id}
                        description={
                          "Are you sure you want to delete the invoice batch Invoice Run"
                        }
                        title="Delete Invoice Batch"
                      />
                    </div>
                  </div>
                </div>
                <div className="">
                  <label
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                    htmlFor="Action"
                  >
                    Document
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <PiPrinterFill />
                      <button
                        onClick={handleDownloadInvoice}
                        className="cursor-pointer text-[14px] text-[#3182ce]"
                      >
                        Invoice
                      </button>
                    </div>
                    {data?.status === "Draft" && (
                      <div className="flex items-center gap-2">
                        <FaEdit />
                        <button
                          label="Edit Invoice"
                          icon="pi pi-pencil"
                          className="cursor-pointer text-[14px] text-[#3182ce]"
                          onClick={() => setEditVisible(true)}
                        >
                          Edit Invoice
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3  p-4">
              <label
                className="min-w-[100px] text-[14px] text-[20px] font-semibold text-dark-2 dark:text-white "
                htmlFor="Action"
              >
                Total Items
              </label>
              <div className="flex flex-col ">
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Excluding Tax
                  </label>
                  <label className="text-[14px] font-light">
                    {formatCurrency(data?.goods, user?.currencyKey)}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Tax
                  </label>
                  <label className="text-[14px] font-light">
                    {formatCurrency(data?.tax, user?.currencyKey)}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Suspension
                  </label>
                  <label className="text-[14px] font-light text-red">
                    {formatCurrency(data?.suspensionAmount, user?.currencyKey)}
                  </label>
                </div>
                <div className="flex  ">
                  <label
                    htmlFor=""
                    className="min-w-[100px] text-[14px] font-semibold text-dark-2 dark:text-white "
                  >
                    Including Tax
                  </label>
                  <label className="text-[14px] font-light">
                    {" "}
                    {formatCurrency(data?.total, user?.currencyKey)}
                  </label>
                </div>
                <div className="flex">
 <Button label="Refund" className="bg-red-500 border-none" onClick={() => setShowRefund(true)} />
      <RefundModal visible={showRefund} onHide={() => setShowRefund(false)} invoice={data} />                </div>
              </div>
            </div>
          </div>

          <SingleInvoiceTable columnData={data} />
        </div>
      )}
    </>
  );
};

export default ViewBatchInvoice;
