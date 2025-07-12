"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import moment from "moment";
import Link from "next/link";
import { FaCodepen } from "react-icons/fa";
import { BaseURL } from "../../../utils/baseUrl";

import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import InvoiceBatchTable from "./InvoiceBatchTable";
import Loader from "../common/Loader";
import InvoiceBatchModel from "./InvoiceBatchModel";
import { MdDelete } from "react-icons/md";
import { PiPrinterFill } from "react-icons/pi";

import {
  IoIosCheckmarkCircle,
  IoIosCheckmarkCircleOutline,
} from "react-icons/io";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { formatCurrency } from "../../../utils/helper";
import BulkInvoiceStatusModal from "./BulkInvoiceStatusModal";
import { Button } from "primereact/button";

const InvoiceBatch = () => {
  const [data, setdata] = useState({});
  const [loading, setloading] = useState(false);
  const { token,user } = useSelector((state) => state?.authReducer);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [pdfUrl, setpdfUrl] = useState("");
const [selectedInvoices, setSelectedInvoices] = useState([]);
const [confirmModalVisible, setConfirmModalVisible] = useState(false);
const [postModalVisible, setPostModalVisible] = useState(false);


// Filtered arrays:
const draftInvoices = selectedInvoices.filter((inv) => inv.status === "Draft");
const confirmedInvoices = selectedInvoices.filter((inv) => inv.status === "Confirmed");
  const [products, setProducts] = useState([
    {
      id: "1000",
      code: "f230fh0g3",
      name: "Bamboo Watch",
      description: "Product Description",
      image: "bamboo-watch.jpg",
      price: 65,
      category: "Accessories",
      quantity: 24,
      inventoryStatus: "INSTOCK",
      rating: 5,
    },
  ]);

  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setloading(true);
      const response = await axios.get(
        `${BaseURL}/invoice/invoice-batches/${params.id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data?.success) {
        setloading(false);
        setdata(response.data?.data);
      } else {
        console.log(response?.data?.message);
      }
    };
    fetchData();
  }, [refreshFlag]);
  const handleRefresh = () => {
    setRefreshFlag((prevFlag) => !prevFlag);
    // setSelectedInvoices([])
  };

  function areAllStatusesPosted(data, value) {
    return data?.invoices?.every((item) => item.status === value);
  }

  const isDraft = data?.invoices?.some((item) => item.status === "Draft");
  const isConfirmed = data?.invoices?.some(
    (item) => item.status === "Draft" || item.status === "Confirmed",
  );
  return (
    <>
      {/* <Breadcrumb pageName="Detail Invoice Batch" /> */}
    <div className="flex gap-3">
    <GoPrevious route={'/invoicing/invoice-batch'}/>
       <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
       Invoice Batch Detail
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
            <div className="col-span-2  p-4 ">
              <FaCodepen className="p-4 text-[250px] text-[#555]" />
            </div>
            <div className="col-span-3  p-4 ">
              <label
                className="text-[20px] font-semibold text-dark-2 dark:text-white "
                htmlFor="Action"
              >
                Details
              </label>
              <div className="flex flex-col ">
                <div className="flex  justify-between">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Invoice Run
                  </label>
                  <div className="text-start">
                    <label className="font-light">{data?.name}</label>
                  </div>
                </div>
                <div className="flex  justify-between">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Document Number
                  </label>
                  <div className="text-start">
                    <label className="font-light">{data?.batchNumber}</label>
                  </div>
                </div>
                <div className="flex  justify-between">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Batch Date
                  </label>
                  <label className="font-light">
                    {moment(data?.invoiceStartDate).format("lll")}
                  </label>
                </div>
                <div className="flex justify-between ">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Invoice up to Date
                  </label>
                  <label className="font-light">
                    {" "}
                    {moment(data?.invoiceUptoDate).format("lll")}
                  </label>
                </div>
              </div>
              <div className="mt-5 flex justify-between gap-4">
                <div className="">
                  <label
                    className="font-semibold text-dark-2 dark:text-white "
                    htmlFor="Action"
                  >
                    Action
                  </label>
                  <div className="flex flex-col">
                    {isDraft && (
                      <>
                        {data?.status === "Draft" && (
                          <div className="flex items-center gap-2">
                            <IoIosCheckmarkCircleOutline />

                            <InvoiceBatchModel
                              title="Confirm All"
                              subTitle={"Confirm Batch"}
                              fetchOldData={handleRefresh}
                              batchId={data?._id}
                              description={`Are you sure you want to confirm all the draft invoices in the invoice batch`}
                              code={`${data?.batchNumber}?`}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {/* {isConfirmed && (
                      <>
                        {data?.status != "Posted" && ( */}
                          <div className="flex items-center gap-2">
                            <IoIosCheckmarkCircle />
                            <InvoiceBatchModel
                              fetchOldData={handleRefresh}
                              title="Post All"
                              subTitle={"Post Batch"}
                              data={data}
                              code={data?.batchNumber}
                              description={`Are you sure you want to post all the unposted invoices in the invoice batch`}
                            />
                          </div>
                        {/* )}
                      </>
                    )} */}
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
                    className="font-semibold text-dark-2 dark:text-white "
                    htmlFor="Action"
                  >
                    Document
                  </label>
                  <div className="flex">
                    <div className="flex items-center gap-2">
                      <PiPrinterFill />
                      <Link
                        className="cursor-pointer text-[18px] text-[#3182ce]"
                        href={`/invoicing/invoice-batch/pdf/${params.id}`}
                      >
                        Invoice Batch
                      </Link>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

            <div className="col-span-3  p-4">
              <label
                className="text-[20px] font-semibold text-dark-2 dark:text-white "
                htmlFor="Action"
              >
                Total Items
              </label>
              <div className="flex flex-col ">
                <div className="flex justify-between ">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Excluding Tax
                  </label>
                  <label className="font-light">{formatCurrency(data?.excludingTax,user?.currencyKey)}</label>
                </div>
                <div className="flex justify-between ">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Tax
                  </label>
                  <label className="font-light">{formatCurrency(data?.tax,user?.currencyKey)}</label>
                </div>
                <div className="flex justify-between ">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Suspension Amount
                  </label>
                  <label className="font-light text-red-600">
                    {" "}
                    {formatCurrency(Number(data?.suspensionAmount).toFixed(2),user?.currencyKey)}
                  </label>
                </div>
                <div className="flex justify-between ">
                  <label
                    htmlFor=""
                    className="font-semibold text-dark-2 dark:text-white "
                  >
                    Including Tax
                  </label>
                  <label className="font-light">
                    {" "}
                    {formatCurrency(Number(data?.totalPrice).toFixed(2),user?.currencyKey)}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <label className="font-semibold">
              Total Invoice: {data?.totalInvoice}
            </label>
          </div>
{selectedInvoices.length > 0 && (
  <div className="mt-6">
    <label className="font-semibold text-dark-2 dark:text-white block mb-2">
      Bulk Actions for Selected Invoices
    </label>
    <div className="flex gap-4 mb-4">
      {/* ✅ Confirm Draft Invoices */}
      {draftInvoices.length > 0 && (
        <>
          <Button
            label={`Confirm ${draftInvoices.length} Selected`}
            icon="pi pi-check"
            className="p-button-warning"
            size="small"
            onClick={() => setConfirmModalVisible(true)}
          />

          <BulkInvoiceStatusModal
            visible={confirmModalVisible}
            setVisible={setConfirmModalVisible}
            title={`Confirm ${draftInvoices.length} Selected`}
            description="Are you sure you want to confirm the selected draft invoices?"
            selectedInvoiceIds={draftInvoices.map((inv) => inv._id)}
            status="Confirmed"
            fetchOldData={handleRefresh}
          />
        </>
      )}

      {/* ✅ Post Confirmed Invoices */}
      {confirmedInvoices.length > 0 && (
        <>
          <Button
            label={`Post ${confirmedInvoices.length} Selected`}
            icon="pi pi-send"
            className="p-button-success"
            size="small"
            onClick={() => setPostModalVisible(true)}
          />

          <BulkInvoiceStatusModal
            visible={postModalVisible}
            setVisible={setPostModalVisible}
            title={`Post ${confirmedInvoices.length} Selected`}
            description="Are you sure you want to post the selected confirmed invoices?"
            selectedInvoiceIds={confirmedInvoices.map((inv) => inv._id)}
            status="Posted"
            fetchOldData={handleRefresh}
          />
        </>
      )}
    </div>
  </div>
)}


         <InvoiceBatchTable
  columnData={data}
  onSelectionChange={setSelectedInvoices}
/>
        </div>
      )}
    </>
  );
};

export default InvoiceBatch;
