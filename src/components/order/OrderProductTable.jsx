"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { PiDotsThreeCircleVerticalFill } from "react-icons/pi";
import { Toast } from "primereact/toast";
import { Menu } from "primereact/menu";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BaseURL } from "../../../utils/baseUrl";
import { Tag } from "primereact/tag";
import AllocatedModel from "./allocated-model/AllocatedModel";
import { openModal } from "@/store/modalSlice";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { currentDateFormate, formatCurrency } from "../../../utils/helper";
import Link from "next/link";

const OrderProductTable = ({
  thData,
  trData,
  orderId,
  orderCompleteId,
  setorderData,
}) => {
  const [products, setProducts] = useState([]);
  const toast = React.useRef(null);
  const [filterData, setfilterData] = useState(trData);

  const { token,user } = useSelector((state) => state.authReducer);
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const { modelOpen, modalData } = useSelector((state) => state.modal);
  const [data, setdata] = useState({});

  const handleDelte = (id) => {
    const output = filterData.filter((item) => item?._id !== id);
    setfilterData(output);
  };
  // Update data when `trData` changes
  useEffect(() => {
    setfilterData(trData);
  }, [trData]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.put(
        `${BaseURL}/order/product`,
        {
          orderId: orderCompleteId,
          productId: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        handleDelte(response.data.data.productId);
      }
      toast.current.show({
        severity: "success",
        summary: "Deleted",
        detail: response.data.message,
        life: 3000,
      });

    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Product not deleted",
        life: 3000,
      });
    }
  };

  const colorButton = (status) => {
    if (status === "allocated") return "bg-green-500 text-white";
    if (status === "reserved") return "bg-gray-500 text-white";
    if (status === "onrent") return "bg-orange-500 text-white";
    if (status === "onrent") return "bg-orange-500 text-white";
    if (status === "offrent") return "bg-red-500 text-white";
    return "bg-gray-300";
  };

  const percentageCalculate = (taxRate, price) => {
    return ((taxRate / 100) * price + price).toFixed(2);
  };

  const onRowEditComplete = (e) => {
    let updatedProducts = [...products];
    updatedProducts[e.index] = e.newData;
    setProducts(updatedProducts);
  };

  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
        className="p-inputtext w-full"
      />
    );
  };

  const numberEditor = (options) => {
    return (
      <InputText
        type="number"
        value={options.value}
        onChange={(e) => options.editorCallback(Number(e.target.value))}
        className="p-inputtext w-full"
      />
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
    );
  };

    const assetNumbersBodyTemplate = (item) => {
// const item =  rowData.selectedAssets    
return (
      <div className="w-48 z-1">
            {item.selectedAssets && item.selectedAssets.length > 0 ? (
              <div className="relative group">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer">
                  {item.selectedAssets.length} Asset{item.selectedAssets.length > 1 ? 's' : ''}
                </button>
                <div className="absolute z-10 hidden group-hover:block bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto min-w-[200px]">
              {item.selectedAssets.map((asset, index) => {
  const assetObj = typeof asset === 'string'
    ? { number: asset, status: 'available' }
    : {
        number: asset?.assetNumber || asset?.number || 'unknown',
        status: asset?.status || 'available',
      };

  const assetNumber = assetObj.number;

  return (
    <Link
      key={index}
      href={`/asset/${encodeURIComponent(assetNumber)}`}
      className="block px-3 py-2 hover:bg-gray-100 text-sm whitespace-nowrap no-underline z-1"
    >
      <div className="flex justify-between items-center">
        <span className="text-[#0068d6] hover:underline">{assetNumber}</span>
        <span
          className={`ml-2 px-2 py-1 text-xs rounded ${
            assetObj.status === 'available'
              ? 'bg-green-100 text-green-800'
              : assetObj.status === 'rented'
              ? 'bg-yellow-100 text-yellow-800'
              : assetObj.status === 'maintenance'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {assetObj.status}
        </span>
      </div>
    </Link>
  );
})}

                </div>
              </div>
            ) : (
              <span className="text-gray-400">No assets</span>
            )}
          </div>
    );
  };

  const accept = () => {
    handleDelete(data._id);
  };

  const reject = () => {
    toast.current.show({
      severity: "warn",
      summary: "Canceled",
      detail: "You have canceled it!",
      life: 3000,
    });
  };
  const confirm = () => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      acceptLabel:"Confirm",
      rejectLabel:"Cancel",
      accept,
      reject,
    });
  };

  const menuLeft = useRef(null);
  const menuRight = useRef(null);
  const handleMenuToggle = (menuRef, item) => (event) => {
    setdata(item);
    if (menuRef && menuRef.current) {
      menuRef.current.toggle(event);
    }
  };
  const items = [
    {
      label: "Options",
      items: [
        ...(data.status !== "onrent" &&
        data.status !== "offrent" &&
        data.status !== "allocated"
          ? [
              {
                label: "Allocated",
                icon: "pi pi-bookmark",
                command: () => {
                  dispatch(
                    openModal({
                      productId: data.product._id,
                      productItemId: data?._id,
                      orderId: orderCompleteId,
                      quantityProduct: data.quantity,
                      productData: data.product,
                    }),
                  );
                },
              },
            ]
          : []),
        ...(data.status === "allocated"
          ? [
              {
                label: "Revert",
                icon: "pi pi-undo",
                command: () => {
                  dispatch(
                    openModal({
                      productId: data.product._id,
                      productItemId: data?._id,
                      orderId: orderCompleteId,
                      quantityProduct: data.quantity,
                      productData: data.product,
                      revert: true,
                    }),
                  );
                },
              },
            ]
          : []),
        {
          label: "Remove",
          icon: "pi pi-trash",
          command: () => {
            confirm();
          },
        },
      ],
    },
  ];
  
  const getSeverity = (status) => {
    switch (status) {
      case "offrent":
        return "danger";

      case "allocated":
        return "success";

      case "reserved":
        return "info";
 case "Sold":
        return "danger";
      case "onrent":
        return "warning";
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
<AllocatedModel
  onAllocate={async ({ productItemId, quantity, revert }) => {
    try {
      console.log("Sending data:", {
        orderId: orderCompleteId,
        productItemId,
        quantity,
        revert,
      });

      const res = await axios.put(
        `${BaseURL}/order/product/status`,
        {
          orderId: orderCompleteId,
          productItemId,
          quantity,
          revert,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setfilterData((fd) =>
          fd.map((item) =>
            item._id === productItemId
              ? { ...item, status: revert ? "reserved" : "allocated" }
              : item
          )
        );
      }

      return res;
    } catch (error) {
      console.error("Allocation error:", error?.response?.data || error.message);
      // Optional: show a toast or alert
      alert("Failed to allocate product. Please check your input.");
      return { data: { success: false } };
    }
  }}
/>


      {/* <Dialog header="Delete Confirmation" visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
                <p className="m-0">
               <i className="pi pi-info-circle"></i> Do you want to delete this record?
                </p>
            </Dialog> */}
      <ConfirmDialog />

      <DataTable
        value={filterData || []}
        editMode="cell"
        dataKey="_id"
        onRowEditComplete={onRowEditComplete}
        className="p-datatable-sm"
        responsiveLayout="scroll"
      >
        <Column
          field={"product.productName"}
          header={"Name"}
          editor={(options) =>
            header === "Price" || header === "Quantity"
              ? numberEditor(options)
              : textEditor(options)
          }
        />
        <Column field="assetNumbers" header="asset Numbers" body={assetNumbersBodyTemplate} />

        <Column field="status" header="Status" body={statusBodyTemplate} />
        <Column field="products" header="Type" body={(rowData)=>(
          <>
          {rowData.product?.status}
          </>
        )} />
        <Column field="quantity" header="QTY" />
        <Column field="price" header="Price" body={(item=>(
          <>
          
          <label htmlFor="">{formatCurrency(item?.price,user?.currencyKey)}</label></>
        ))} />
        <Column
          field="taxRate"
          body={(item) => {
            return <>{item?.taxRate}%</>;
          }}
          header="Tax Rate"
        />

        <Column
          field="total"
          header="Total Price"
          body={(item) =>
            ` ${formatCurrency(percentageCalculate(item?.taxRate, item?.price) * item?.quantity,user?.currencyKey)}`
          }
        />

        <Column
          header={"Action"}
          body={(item) => {
            return (
              <>
                <Menu model={items} popup ref={menuLeft} id="popup_menu_left" />
                <button onClick={handleMenuToggle(menuLeft, item)}>
                  <PiDotsThreeCircleVerticalFill className="text-2xl" />
                </button>
                {/* <Button
                  onClick={() => {
                    dispatch(
                      openModal({
                        productId: item?.product._id,
                        productItemId: item?._id,
                        orderId: orderCompleteId,
                        quantityProduct: item?.quantity,
                        productData: item?.product,
                      })
                    );
                  }}
                >
                  Done
                </Button> */}
              </>
            );
          }}
        />
      </DataTable>
    </div>
  );
};

export default OrderProductTable;
