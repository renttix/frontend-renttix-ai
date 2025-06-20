"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import axios from "axios";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { useRouter } from "next/navigation";
import { BaseURL } from "../../../utils/baseUrl";
import Link from "next/link";
import { MultiSelect } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import Loader from "../common/Loader";
import CanceButton from "../Buttons/CanceButton";
import { Checkbox } from "primereact/checkbox";
import { LuFilter } from "react-icons/lu";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import TableComponent from "../common/table/TableComponent";
import { setDefaultColumns } from "@/store/columnVisibilitySlice";
import { FaEdit } from "react-icons/fa";
import { Paginator } from "primereact/paginator";
import useDebounce from "@/hooks/useDebounce";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CustomerListing Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-red-600">Something went wrong loading customers.</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function CustomerListingOptimized() {
  // Empty customer template
  const emptyCustomer = useMemo(() => ({
    id: null,
    name: "",
    image: null,
    description: "",
    category: null,
    price: 0,
    quantity: 0,
    rating: 0,
    inventoryStatus: "INSTOCK",
  }), []);

  // State management
  const [customers, setCustomers] = useState([]);
  const [customerDialog, setCustomerDialog] = useState(false);
  const [deleteCustomerDialog, setDeleteCustomerDialog] = useState(false);
  const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [selectedCustomers, setSelectedCustomers] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10); // Increased default rows
  const [globalFilter, setGlobalFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const toast = useRef(null);
  const dt = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Debounced search with longer delay
  const debouncedSearch = useDebounce(search, 1500);
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef(null);

  const [visibleColumns] = useState([
    { field: "name.name", header: "Customer", visible: true },
    { field: "type", header: "Type", visible: true },
    { field: "status", header: "Status", visible: true },
    { field: "city", header: "City", visible: true },
    { field: "action", header: "Action", visible: true },
  ]);

  const Columns = useMemo(() => ({
    title: "Customer",
    type: "Type",
    status: "Status",
    city: "City",
    action: "Action",
  }), []);

  const { token } = useSelector((state) => state?.authReducer);

  // Fetch customers with error handling and retry logic
  const fetchCustomers = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BaseURL}/customer/customer?search=${debouncedSearch}&page=${page}&limit=${rows}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          signal: abortControllerRef.current.signal,
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data?.data) {
        setCustomers(response.data.data);
        setTotalRecords(response.data.pagination?.total || 0);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
        return;
      }

      console.error('Error fetching customers:', error);
      setError(error.message);

      // Handle authentication errors
      if (error.response?.status === 401) {
        toast.current?.show({
          severity: "error",
          summary: "Authentication Error",
          detail: "Please login again",
          life: 3000,
        });
        // Optionally redirect to login
        // router.push('/login');
      } else if (retryCount < 3) {
        // Retry logic for other errors
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load customers. Please try again later.",
          life: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token, page, rows, debouncedSearch, retryCount]);

  // Effect for fetching customers
  useEffect(() => {
    if (token) {
      fetchCustomers();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCustomers, token]);

  // Memoized callbacks to prevent unnecessary re-renders
  const hideDialog = useCallback(() => {
    setSubmitted(false);
    setCustomerDialog(false);
  }, []);

  const hideDeleteCustomerDialog = useCallback(() => {
    setDeleteCustomerDialog(false);
  }, []);

  const hideDeleteOrdersDialog = useCallback(() => {
    setDeleteOrdersDialog(false);
  }, []);

  const confirmDeleteCustomer = useCallback((customer) => {
    setCustomer(customer);
    setDeleteCustomerDialog(true);
  }, []);

  const deleteCustomer = useCallback(async () => {
    setDeleteLoader(true);
    try {
      const res = await axios.delete(
        `${BaseURL}/customer/customer/${customer._id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );
      
      const updatedCustomers = customers.filter((val) => val._id !== customer._id);
      setCustomers(updatedCustomers);
      setDeleteCustomerDialog(false);
      setCustomer(emptyCustomer);
      
      toast.current?.show({
        severity: "success",
        summary: "Successful",
        detail: res.data.message,
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to delete customer",
        life: 3000,
      });
    } finally {
      setDeleteLoader(false);
    }
  }, [customer, customers, token, emptyCustomer]);

  const exportCSV = useCallback(() => {
    dt.current?.exportCSV();
  }, []);

  const confirmDeleteSelected = useCallback(() => {
    setDeleteOrdersDialog(true);
  }, []);

  const deleteSelectedCustomers = useCallback(() => {
    const updatedCustomers = customers.filter(
      (val) => !selectedCustomers.includes(val)
    );

    setCustomers(updatedCustomers);
    setDeleteOrdersDialog(false);
    setSelectedCustomers(null);
    
    toast.current?.show({
      severity: "success",
      summary: "Successful",
      detail: "Customers Deleted",
      life: 3000,
    });
  }, [customers, selectedCustomers]);

  const getSeverity = useCallback((item) => {
    switch (item.type) {
      case "Customer":
        return "success";
      case "Supplier":
        return "info";
      case "Reseller":
        return "";
      case "Sub-Contractor":
        return "info";
      default:
        return null;
    }
  }, []);

  const onSearch = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  }, []);

  const onPageChange = useCallback((event) => {
    setPage(event.page + 1);
    setRows(event.rows);
  }, []);

  // Memoized toolbar template
  const leftToolbarTemplate = useMemo(() => (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Export"
        icon="pi pi-upload"
        className="p-button-help"
        onClick={exportCSV}
      />
      <Button
        label="Delete"
        icon="pi pi-trash"
        style={{ background: "red" }}
        onClick={confirmDeleteSelected}
        disabled={!selectedCustomers || !selectedCustomers.length}
      />
    </div>
  ), [exportCSV, confirmDeleteSelected, selectedCustomers]);

  useEffect(() => {
    dispatch(
      setDefaultColumns({ tableName: "", columns: Object.keys(Columns) })
    );
  }, [dispatch, Columns]);

  const renderColumnsBody = useCallback((field, item) => {
    switch (field) {
      case "title":
        return (
          <Button
            size="small"
            label={item.title}
            link
            onClick={() => router.push(`/customer/${item._id}`)}
          />
        );
      case "type":
        return <Tag severity={getSeverity(item)} value={item.type} />;
      case "status":
        return (
          <Tag
            severity={item.status === "Active" ? "success" : "danger"}
            value={item.status}
          />
        );
      case "country":
        return <Tag severity={"success"} value={item.country} />;
      case "action":
        return (
          <div className="flex gap-4">
            <Link href={`/customer/update/${item._id}`}>
              <i className="pi pi-pen-to-square mr-2 text-primary" />
            </Link>
            <i
              className="pi pi-trash ml-2 text-red cursor-pointer"
              onClick={() => confirmDeleteCustomer(item)}
            />
          </div>
        );
      default:
        return item[field];
    }
  }, [router, getSeverity, confirmDeleteCustomer]);

  const header = useMemo(() => (
    <div className="align-items-center justify-content-between flex flex-wrap gap-2">
      <IconField iconPosition="right">
        {!search && <InputIcon className="pi pi-search" />}
        <InputText 
          placeholder="Search" 
          value={search} 
          onChange={onSearch}
          disabled={loading}
        />
      </IconField>
    </div>
  ), [search, onSearch, loading]);

  const deleteCustomerDialogFooter = useMemo(() => (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteCustomerDialog} />
        <Button
          label="Yes"
          icon={"pi pi-check"}
          loading={deleteLoader}
          severity="danger"
          onClick={deleteCustomer}
        />
      </div>
    </React.Fragment>
  ), [hideDeleteCustomerDialog, deleteLoader, deleteCustomer]);

  const deleteOrdersDialogFooter = useMemo(() => (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteOrdersDialog} />
        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={deleteSelectedCustomers}
        />
      </div>
    </React.Fragment>
  ), [hideDeleteOrdersDialog, deleteSelectedCustomers]);

  // Error state
  if (error && retryCount >= 3) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-red-600 mb-4">Failed to load customers</h2>
        <Button 
          label="Retry" 
          onClick={() => {
            setRetryCount(0);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="flex gap-3">
          <GoPrevious route={"/dashboard"} />
          <h2 className="text-[26px] font-bold leading-[30px] text-dark dark:text-white">
            Customer List
          </h2>
        </div>
        <Toast ref={toast} />
        <div className="card">
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={header}
          />

          <>
            <TableComponent
              loading={loading}
              tableName="Customer"
              columns={Columns}
              data={customers}
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
          visible={deleteCustomerDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="Confirm"
          modal
          footer={deleteCustomerDialogFooter}
          onHide={hideDeleteCustomerDialog}
        >
          <div className="confirmation-content flex items-center">
            <i
              className="pi pi-exclamation-triangle mr-3"
              style={{ fontSize: "2rem" }}
            />
            {customer && (
              <span>
                Are you sure you want to delete <b>{customer.name?.name}</b>?
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
            <span>Are you sure you want to delete the selected customers?</span>
          </div>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}