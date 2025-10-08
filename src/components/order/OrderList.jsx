"use client";
import React, { useState, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import moment from "moment";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import CanceButton from "../Buttons/CanceButton";
import Loader from "../common/Loader";
import Link from "next/link";
import TableComponent from "../common/table/TableComponent";
import useDebounce from "@/hooks/useDebounce";
import { Paginator } from "primereact/paginator";
import apiServices from "../../../services/apiService";
import ExportData from "../common/imports/ExportData";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import { Calendar } from "primereact/calendar";
import { Tooltip } from "primereact/tooltip";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";
import { useDispatch, useSelector } from "react-redux";
import { RiStickyNoteAddLine } from "react-icons/ri";
import OderNotes from "./OderNotes";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import Cookies from "js-cookie";

export default function OrderList() {
  let emptyorder = {
    id: null,
    name: "",
    image: null,
    description: "",
    category: null,
    price: 0,
    quantity: 0,
    rating: 0,
    inventoryStatus: "INSTOCK",
  };

  const [orders, setorders] = useState([]);
  const [deleteorderDialog, setDeleteorderDialog] = useState(false);
  const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
  const [order, setorder] = useState(emptyorder);
  const [selectedorders, setSelectedorders] = useState(null);
  const [loading, setloading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 1000); // Add debounce with a 500ms delay

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [reference, setReference] = useState("");
  const [bookInDate, setBookInDate] = useState(null);
  const [collectionCharging, setCollectionCharging] = useState("");
  const [visibleRowId, setVisibleRowId] = useState(null);
  const [modelLoading, setmodelLoading] = useState(false);
  const [bookInProduct, setbookInProduct] = useState([]);
  const [generateRef, setgenerateRef] = useState("");
  const [refLoader, setrefLoader] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
   const [selectedFile, setSelectedFile] = useState(null);
   const [importLoading, setImportLoading] = useState(false);
   const [importResults, setImportResults] = useState(null);

   // Invoice settings state
   const [paymentTerms, setPaymentTerms] = useState([]);
   const [invoiceRunCodes, setInvoiceRunCodes] = useState([]);
   const [selectedPaymentTerm, setSelectedPaymentTerm] = useState("");
   const [selectedInvoiceRunCode, setSelectedInvoiceRunCode] = useState("");

   const router = useRouter();

   const toast = useRef(null);
 const dispatch = useDispatch();
 const { token, user } = useSelector((state) => state?.authReducer);
  const Columns = {
    orderId: "Order No",
    order: "Type",
    status: "Status",
    schedulingStatus: "Scheduling",
    deliveryDate: "Delivery Date",
    deliveryAddress1: "Delivery Address",
    depot: "Depot",
    customerReference: "Reference",
    action: "Action",
  };

  useEffect(() => {
    dispatch(setDefaultColumns({ tableName: "Orders", columns: Object.keys(Columns) }));
  }, [dispatch]);

  // Fetch invoice settings
  const fetchInvoiceSettings = async () => {
    if (!token) {
      console.log("No token available for invoice settings");
      return;
    }
    try {
      console.log("Fetching invoice settings...");
      // Fetch payment terms
      const paymentTermsResponse = await axios.get(
        `${BaseURL}/payment-terms`,
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );
      if (paymentTermsResponse.data.success) {
        console.log("Payment terms loaded:", paymentTermsResponse.data.data);
        setPaymentTerms(paymentTermsResponse.data.data || []);
      }

      // Fetch invoice run codes
      const invoiceRunCodesResponse = await axios.get(
        `${BaseURL}/invoice-run-code`,
        {
          headers: { authorization: `Bearer ${token}` },
        },
      );
      if (invoiceRunCodesResponse.data.success) {
        console.log("Invoice run codes loaded:", invoiceRunCodesResponse.data.data);
        setInvoiceRunCodes(invoiceRunCodesResponse.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch invoice settings:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInvoiceSettings();
    }
  }, [token]);

  useEffect(() => {
    setloading(true);
    apiServices
      .get("/order/get-all-orders", {
        search: debouncedSearch,
        page,
        limit: rows,
      })
      .then((response) => {
        setTotalRecords(response.data.pagination.total);
        setorders(response.data.data);
      })
      .catch(() => {
        setloading(false);
      })
      .finally(() => {
        setloading(false);
      });
  }, [page, rows, debouncedSearch]);

  const hideDeleteorderDialog = () => {
    setDeleteorderDialog(false);
  };

  const hideDeleteOrdersDialog = () => {
    setDeleteOrdersDialog(false);
  };

  const deleteorder = () => {
    let _orders = orders.filter((val) => val._id !== order._id);

    setorders(_orders);
    setDeleteorderDialog(false);
    setorder(emptyorder);
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: "Order Deleted",
      life: 3000,
    });
  };

  const deleteSelectedorders = () => {
    let _orders = orders.filter((val) => !selectedorders.includes(val));

    setorders(_orders);
    setDeleteOrdersDialog(false);
    setSelectedorders(null);
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: "orders Deleted",
      life: 3000,
    });
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Bulk Import"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={() => setImportDialog(true)}
        />

        <ExportData route="/order/export" nameFile="order" />
      </div>
    );
  };

  const onSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const onPageChange = (event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  };

  const header = (
    <div className="align-items-center justify-content-between flex flex-wrap gap-2">
      <IconField iconPosition="right">
        {search == null || search == "" ? (
          <InputIcon className="pi pi-search" />
        ) : (
          <></>
        )}
        <InputText placeholder="Search" value={search} onChange={onSearch} />
      </IconField>
    </div>
  );

  const deleteorderDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteorderDialog} />

        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteorder}
        />
      </div>
    </React.Fragment>
  );
  const deleteOrdersDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteOrdersDialog} />

        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteSelectedorders}
        />
      </div>
    </React.Fragment>
  );

  const getFilteredProductIds = (orderData) => {
    if (!orderData?.products) return [];

    const filteredData = orderData?.products.filter(
      (item) => item.status === "onrent",
    );
    const finalOutput = filteredData.map((item) => item._id);
    setbookInProduct(finalOutput);
  };

  const handleSubmitBookIn = async (order) => {
    const allocationData = {
      orderId: order._id,
      productIds: bookInProduct,
      reference: reference,
      bookDate: bookInDate,
      charging: collectionCharging,
      invoiceRunCode: order?.invoiceRunCode?.code,
      paymentTerms: order?.paymentTerm?.days,
    };
    setmodelLoading(true);

    try {
      const response = await apiServices.post(`/order/bookin`, allocationData);
      setmodelLoading(true);

      if (response.data.success) {
        setmodelLoading(false);
        toast.current.show({
          severity: "success",
          summary: "Booked In",
          detail: response.data?.message,
          life: 3000,
        });

        setReference("");
        setBookInDate("");
        setCollectionCharging("");
        setVisibleRowId(null);
        router.push(
          `/order/note/${
            response?.data?.data?.noteId
          }-${encodeURIComponent(response?.data?.data.deliveryType)}`,
        );
      } else {
        toast.current.show({
          severity: "error",
          summary: "Booked In",
          detail: response.data?.message,
          life: 3000,
        });
        setmodelLoading(false);
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Booked In",
        detail: error.response.data?.message,
        life: 3000,
      });

      setmodelLoading(false);
      console.error("Error submitting order:", error);
    }
  };

  const fetchRandomWord = async (order) => {
    setrefLoader(true);
    try {
      const response = await fetch(
        "https://random-word-api.herokuapp.com/word?length=4",
      );
      const data = await response.json();

      if (data.length > 0) {
        const word = data[0];
        const date = new Date(order?.createdAt);
        const formattedDate = date.toLocaleDateString("en-GB").split("/").join(""); 
        setrefLoader(false);
        setgenerateRef(`${word}${formattedDate}`);
      }
    } catch (error) {
      setrefLoader(false);
      console.error("Error fetching word:", error);
    }
  };

  const generateRefrence = (item) => {
    setrefLoader(true);
    fetchRandomWord(item);
  };

  useEffect(() => {
    setReference(generateRef);
  }, [generateRef]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.current.show({
          severity: "error",
          summary: "Invalid File",
          detail: "Please select a valid Excel file (.xlsx or .xls)",
          life: 3000,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) {
      toast.current.show({
        severity: "error",
        summary: "No File Selected",
        detail: "Please select a file to import",
        life: 3000,
      });
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('xlsxFile', selectedFile);
      formData.append('paymentTerm', selectedPaymentTerm);
      formData.append('invoiceRunCode', selectedInvoiceRunCode);

      // Use axios directly to avoid default content-type header
      const token = Cookies.get("xpdx");
      const response = await axios.post(`${BaseURL}/order/bulk-import`, formData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          // Let browser set content-type automatically for FormData
        },
        timeout: 30000, // Longer timeout for file upload
      });

      if (response.data.success) {
        setImportResults(response.data.data);
        toast.current.show({
          severity: "success",
          summary: "Import Completed",
          detail: `Created ${response.data.data.created} orders, skipped ${response.data.data.skipped}`,
          life: 5000,
        });

        // Refresh the orders list
        setloading(true);
        const ordersResponse = await apiServices.get("/order/get-all-orders", {
          search: debouncedSearch,
          page,
          limit: rows,
        });
        setTotalRecords(ordersResponse.data.pagination.total);
        setorders(ordersResponse.data.data);
        setloading(false);
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      toast.current.show({
        severity: "error",
        summary: "Import Failed",
        detail: error.response?.data?.message || "An error occurred during import",
        life: 5000,
      });
    } finally {
      setImportLoading(false);
    }
  };

  const renderColumnsBody = (field, item) => {
    switch (field) {
      case "orderId":
        return (
          <Link
            className="text-[#0068d6]"
            href={`/order/${item._id}`}
          >{`${item.orderId.slice(4)}`}</Link>
        );

      case "order":
        return (
          <>
            <Tag severity={"info"} value={"Order"}></Tag>
          </>
        );
      case "type":
        return (
          <>
            <Tag severity={"warning"} value={"Open"}></Tag>
          </>
        );
      case "depot":
        return (
          <>
            {item?.depot?.name ? (
              <Tag severity={"warning"} value={item?.depot?.name}></Tag>
            ) : (
              ""
            )}
          </>
        );
      case "status":
        return (
          <>
            <Tag severity={"warning"} value={item.status || "Open"}></Tag>
          </>
        );
      case "schedulingStatus":
        return (
          <div className="flex items-center gap-2">
            {/* Delivery Status */}
            {item.deliveryDate && (
              <Tooltip target={`.delivery-status-${item._id}`} />
            )}
            {item.deliveryDate && (
              <i
                className={`delivery-status-${item._id} pi ${
                  item.deliveryNoteCreated
                    ? "pi-truck text-green-600"
                    : "pi-clock text-orange-500"
                } text-lg cursor-help`}
                data-pr-tooltip={
                  item.deliveryNoteCreated
                    ? "Delivery scheduled"
                    : "Delivery pending scheduling"
                }
                data-pr-position="top"
              />
            )}
            
            {/* Return Status */}
            {item.expectedReturnDate && (
              <Tooltip target={`.return-status-${item._id}`} />
            )}
            {item.expectedReturnDate && (
              <i
                className={`return-status-${item._id} pi ${
                  item.returnNoteCreated
                    ? "pi-replay text-green-600"
                    : "pi-clock text-orange-500"
                } text-lg cursor-help`}
                data-pr-tooltip={
                  item.returnNoteCreated
                    ? "Return scheduled"
                    : "Return pending scheduling"
                }
                data-pr-position="top"
              />
            )}
            
            {/* No scheduling needed */}
            {!item.deliveryDate && !item.expectedReturnDate && (
              <span className="text-gray-400 text-sm">N/A</span>
            )}
          </div>
        );
      case "deliveryDate":
        return (
          <>
            <span>
              {moment(item.deliveryDate).format("dddd, MMMM DD, YYYY")}
            </span>
          </>
        );

      case "action":
        return (
          <React.Fragment>
            <Tooltip target=".bookin" />
            <div className="flex gap-5">
              <i
                className="bookin pi pi-pen-to-square mr-2 cursor-pointer text-primary"
                data-pr-tooltip="Update"
                data-pr-position="left"
                onClick={() => router.push(`/order/update/${item._id}`)}
              />
              {item?.products?.filter((item) => item.status === "onrent")
                .length > 0 && (
                <i
                  className="bookin pi pi-arrow-circle-down mr-2 cursor-pointer text-primary"
                  data-pr-tooltip="Book In"
                  data-pr-position="left"
                  onClick={() => {
                    setVisibleRowId(item._id);
                    getFilteredProductIds(item);
                  }}
                />
              )}
               <div className="block">
              <OderNotes rowData={item}/>
            </div>
            </div>
            <Dialog
              header="BookIn Order"
              visible={visibleRowId === item._id}
              // style={{ width: "50vw" }}
              onHide={() => {
                setBookInDate(null);
                setReference("");
                setCollectionCharging("");
                setVisibleRowId(null);
              }}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label>Reference</label>
                  <div className="p-inputgroup flex-1">
                    <InputText
                      placeholder="Reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                    {reference == "" ? (
                      <Button
                        tooltip="Generate Refrence"
                        loading={refLoader}
                        onClick={()=>generateRefrence(item)}
                        tooltipOptions={{ showDelay: 100, hideDelay: 100 }}
                        icon="pi pi-sync"
                      />
                    ) : (
                      <Button
                        onClick={() => setReference("")}
                        icon="pi pi-times"
                        className="p-button-danger"
                      />
                    )}
                  </div>

                </div>
                <div className="flex flex-col gap-1">
                  <label>Book In Date</label>
                  <Calendar
                    minDate={new Date(item?.chargingStartDate)}
                    placeholder={`${moment().format("MM/DD/YYYY")}`}
                    showIcon
                    value={bookInDate}
                    onChange={(e) => setBookInDate(e.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>Collection Charging</label>
                  <InputText
                    type="number"
                    placeholder="0"
                    value={collectionCharging}
                    onChange={(e) => setCollectionCharging(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="flex gap-4">
                  <CanceButton
                    onClick={() => {
                      setBookInDate(null);
                      setReference("");
                      setCollectionCharging("");
                      setVisibleRowId(null);
                    }}
                  />

                  <Button
                    loading={modelLoading}
                    onClick={() => handleSubmitBookIn(item)}
                    size="small"
                    severity="warning"
                    className="font-bold"
                  >
                    Accept Book In
                  </Button>
                </div>
              </div>
            </Dialog>
           
          </React.Fragment>
        );
      default:
        return item[field];
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        <GoPrevious route={"/dashboard"} />
        <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white ">
          Orders
        </h2>
      </div>
      <Toast ref={toast} />

      <div className="card">
        <Toolbar
          className="mb-4"
          left={leftToolbarTemplate}
          // right={rightToolbarTemplate}
          right={header}
        ></Toolbar>

        <>
          <TableComponent
            loading={loading}
            tableName="Orders"
            columns={Columns}
            data={orders}
            renderColumnBody={renderColumnsBody}
          />

          <Paginator
            first={(page - 1) * rows}
            rows={rows}
            totalRecords={totalRecords}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={onPageChange}
            template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
          />
        </>
      </div>

      <Dialog
        visible={deleteorderDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteorderDialogFooter}
        onHide={hideDeleteorderDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {order && (
            <span>
              Are you sure you want to delete <b>{order.name}</b>?
            </span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={deleteOrdersDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteOrdersDialogFooter}
        onHide={hideDeleteOrdersDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {order && (
            <span>Are you sure you want to delete the selected Orders?</span>
          )}
        </div>
      </Dialog>

      <Dialog
        visible={importDialog}
        style={{ width: "50rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Bulk Import Orders"
        modal
        onHide={() => {
          setImportDialog(false);
          setSelectedFile(null);
          setImportResults(null);
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select an Excel file (.xlsx or .xls) to import orders. The file should contain columns:
              <strong> name ID, product, address, Date out, Date In, Ref Code, Quantity/Qty</strong>
            </p>

            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {importResults && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Import Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">Created:</span> {importResults.created} orders
                </div>
                <div>
                  <span className="text-orange-600 font-medium">Skipped:</span> {importResults.skipped} groups
                </div>
              </div>

              {importResults.problems && importResults.problems.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-red-600 mb-2">Problems:</h5>
                  <div className="max-h-40 overflow-y-auto">
                    {importResults.problems.map((problem, index) => (
                      <div key={index} className="text-xs bg-red-50 p-2 rounded mb-1">
                        {problem.groupKey ? `${problem.groupKey}: ` : ''}{problem.issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={selectedPaymentTerm}
                  onChange={(e) => setSelectedPaymentTerm(e.value)}
                  options={paymentTerms}
                  optionLabel="name"
                  optionValue="_id"
                  placeholder="Select payment terms"
                  className="w-full"
                  showClear
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Invoice Run Code <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={selectedInvoiceRunCode}
                  onChange={(e) => setSelectedInvoiceRunCode(e.value)}
                  options={invoiceRunCodes}
                  optionLabel="name"
                  optionValue="_id"
                  placeholder="Select invoice run code"
                  className="w-full"
                  showClear
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
             <CanceButton
               onClick={() => {
                 setImportDialog(false);
                 setSelectedFile(null);
                 setImportResults(null);
                 setSelectedPaymentTerm("");
                 setSelectedInvoiceRunCode("");
               }}
             />
             <Button
               label="Import Orders"
               icon="pi pi-upload"
               loading={importLoading}
               onClick={handleBulkImport}
               disabled={!selectedFile || !selectedPaymentTerm || !selectedInvoiceRunCode}
               className="p-button-success"
             />
           </div>
        </div>
      </Dialog>
    </div>
  );
}
