"use client";
import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import { Tag } from "primereact/tag";
import useDebounce from "@/hooks/useDebounce";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AutoComplete } from "primereact/autocomplete"; // ⬅️ Add this import
import { InputText } from "primereact/inputtext";

const QuickOffHire = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [offHireDate, setOffHireDate] = useState(null);
  const [collectionDate, setCollectionDate] = useState(null);
  const [sameAsOffHire, setSameAsOffHire] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef(null);
const router =  useRouter()
  const { token, user } = useSelector((state) => state?.authReducer);
  const [orderSearch, setOrderSearch] = useState("");
  const debouncedSearch = useDebounce(orderSearch, 1000); // Add debounce with a 500ms delay
const [orderSuggestions, setOrderSuggestions] = useState([]);

const searchOrders = async (eventOrQuery = "") => {
  const query = typeof eventOrQuery === "string" ? eventOrQuery : eventOrQuery?.query || "";

  try {
    const params = new URLSearchParams();
    if (selectedCustomer?._id) {
      params.append("customerId", selectedCustomer._id);
    }
    if (query) {
      params.append("search", query);
    }

    const res = await axios.get(`${BaseURL}/termination/active-rentals?${params.toString()}`, {
      headers: { authorization: `Bearer ${token}` },
    });

    const rentals = res.data?.data?.rentals || [];
    setOrders(rentals);
    setOrderSuggestions(rentals);
  } catch (err) {
    console.error("Search failed:", err);
    setOrderSuggestions([]);
  }
};



  useEffect(() => {
    const fetchCustomers = async () => {
      const res = await axios.get(`${BaseURL}/customer`, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setCustomers(res.data);
      } else if (Array.isArray(res.data.data)) {
        setCustomers(res.data.data);
      } else {
        console.error("Unexpected customer API response:", res.data);
        setCustomers([]);
      }
    };

    fetchCustomers();
  }, []);
useEffect(() => {
  searchOrders(orderSearch);
}, [selectedCustomer]);



  const handleOrderChange = (order) => {
    setSelectedOrder(order);
    const assetRows = order.products.flatMap((product) =>
      product.selectedAssets.map((asset) => ({
        ...asset,
        description: product.productName,
        product: product.product, // <-- add this line
      })),
    );
    setAssets(assetRows);
  };

  const handleOffHireSubmit = async () => {
    if (!selectedOrder || !offHireDate || selectedAssets.length === 0) {
      toast.current.show({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please select order, date, and at least one asset.",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      orderId: selectedOrder._id,
      actualOffHireDate: offHireDate,
      collectionDate: sameAsOffHire ? offHireDate : collectionDate,
      sameAsOffHire,
      notes,
      products: selectedOrder.products.map((product) => {
        const matchingAssets = selectedAssets.filter(
          (asset) => asset.productId === product.productId,
        );

        return {
          productId: product.productId,
          totalQuantity: matchingAssets.length,
          selectedAssets: matchingAssets.map((asset) => ({
            assetNumber: asset.assetNumber,
            status: asset.status,
          })),
        };
      }),
    };

    try {
      const res = await axios.post(`${BaseURL}/order/off-hire`, payload, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Rental successfully off-hired!",
        });

        // Reset form
        setSelectedOrder(null);
        setAssets([]);
        setSelectedAssets([]);
        setOffHireDate(null);
        setCollectionDate(null);
        setSameAsOffHire(false);
        setNotes("");
        router.push(
              `/order/quick-off-hire/${res.data.invoiceId}`
            );
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to off-hire rental.",
        });
      }
    } catch (err) {
      console.error("Off-hire error:", err);
      toast.current.show({
        severity: "error",
        summary: "Server Error",
        detail: "An error occurred during off-hire.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <h2 className="mb-4 text-lg font-semibold">New Off-Hire Request</h2>

      <div className="mb-4 grid grid-cols-3 gap-4">
    <div className="">
<div className="">
<div className="relative w-full">
  <InputText
    type="text"
    value={orderSearch}
    onChange={(e) => {
      setOrderSearch(e.target.value);
      searchOrders(e.target.value); // manual trigger
    }}
    placeholder="Search Order"
    className="w-full "
  />

  {orderSuggestions.length > 0 && (
    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto">
      {orderSuggestions.map((item, index) => (
        <div
          key={index}
          onClick={() => {
            setSelectedOrder(item);
            setOrderSearch(`${item.orderId}`);
            setOrderSuggestions([]); // clear dropdown
            handleOrderChange(item);
          }}
          className="p-3 border-b cursor-pointer hover:bg-gray-100"
        >
          <div className="text-blue-700 font-semibold">{item.orderId}</div>
          <div className="text-sm text-gray-700">{item.customer?.name || "No Name"}</div>
          <div className="text-xs text-gray-500 truncate">{item.deliveryAddress1 || "No Address"}</div>
          <div className="text-xs text-gray-500">{item.customer?.email || "No Email"}</div>
        </div>
      ))}
    </div>
  )}
</div>

</div>
</div>
        <div className="">
          <div className="p-inputgroup">
            <Dropdown
              clearIcon
              showClear
              value={selectedCustomer?._id || null}
              options={customers}
              onChange={(e) => {
                const customer = customers.find((c) => c._id === e.value);
                setSelectedCustomer(customer);
              }}
              optionLabel="name"
              optionValue="_id"
              placeholder="Select a Customer"
              className="w-full"
            />
            {selectedCustomer?._id && (
              <Button
                className="p-button-sm pi pi-times "
                onClick={() => {
                  setSelectedCustomer(null);
                  setOrders([]);
                  setSelectedOrder(null);
                }}
              />
            )}
          </div>
        </div>

        <div className="">
          <Dropdown
            value={selectedOrder?._id || null}
            options={orders}
            onChange={(e) => {
              const order = orders.find((o) => o._id === e.value);
              handleOrderChange(order);
            }}
            optionLabel="orderId"
            optionValue="_id"
            className="w-full"
            placeholder="Select an Order"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="">
          <Calendar
            value={offHireDate}
            className="w-full"
            onChange={(e) => setOffHireDate(e.value)}
            placeholder="Off-Hire Date"
            showIcon
          />
        </div>

        <div>
          <Calendar
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.value)}
            placeholder="Collection Date"
            showIcon
            className="w-full"
            disabled={sameAsOffHire}
          />
          <div className="mt-2">
            <Checkbox
              checked={sameAsOffHire}
              onChange={(e) => {
                setSameAsOffHire(e.checked);
                if (e.checked) setCollectionDate(offHireDate);
              }}
            />{" "}
            <label>Collection date is same as off-hire date</label>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <DataTable
          value={assets}
          selection={selectedAssets}
          onSelectionChange={(e) => setSelectedAssets(e.value)}
          dataKey="assetNumber"
          responsiveLayout="scroll"
  scrollable
  scrollHeight="300px" // 👈 scrolls after 5 rows approx
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3em" }}
          ></Column>
          <Column field="assetNumber" header="Asset Number" sortable></Column>
          <Column
            field="description"
            className=" capitalize"
            header="Description"
            sortable
          ></Column>
          <Column
            field="status"
            header="Status"
            body={(rowData) => (
              <Tag
                className=" capitalize"
                severity={rowData.status == "rented" ? "warning" : "danger"}
                value={rowData.status}
              />
            )}
            sortable
          ></Column>
        </DataTable>
      </div>

      <div className="mb-4">
        <InputTextarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any relevant notes..."
          rows={3}
          className="w-full"
        />
      </div>

      <div className="flex justify-end">
        {isSubmitting ? (
          <Button
            label={
              <div className="flex items-center gap-2">
                <ProgressSpinner
                  style={{ width: "20px", height: "20px" }}
                  strokeWidth="4"
                />
                Processing...
              </div>
            }
            disabled
            className="p-button-danger"
          />
        ) : (
          <Button
            onClick={handleOffHireSubmit}
            label="Off Rent"
            className="p-button-danger"
          />
        )}
      </div>
    </div>
  );
};

export default QuickOffHire;
