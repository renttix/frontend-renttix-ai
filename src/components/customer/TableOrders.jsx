"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from "moment";
import Link from "next/link";
import { BaseURL } from "../../../utils/baseUrl";
import apiServices from "../../../services/apiService";
import { Dialog } from "primereact/dialog";
import CanceButton from "../Buttons/CanceButton";

const TableOrders = ({ thData, trData, orderId, orderCompleteId }) => {
  const toast = React.useRef(null);
  const params = useParams();
  const [filterData, setFilterData] = useState(trData);
  const { user } = useSelector((state) => state?.authReducer);
  const { token } = useSelector((state) => state?.authReducer);
  const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
  const [orderData, setorderData] = useState("");

  const handleDelete = async (orderId, customerId) => {
    try {
      const updatedData = {
        orderId: orderId,
        customerId: customerId,
      };
      const response = await apiServices.update(`/order/customer`, updatedData);
      if (response.data.success) {
        setFilterData(filterData.filter((item) => item._id !== orderId));
        setDeleteOrderDialog(false);

        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: response.data.message,
          life: 3000,
        });
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Product not deleted",
        life: 3000,
      });
    }
  };

  const hideDeleteOrderDialog = () => {
    setDeleteOrderDialog(false);
  };

  const showModalOrder = (item) => {
    setorderData(item);
    setDeleteOrderDialog(true);
  };

  const renderActionTemplate = (rowData) => {
    return (
      <i
        className="pi pi-trash ml-2 text-red cursor-pointer"
        onClick={() => showModalOrder(rowData)}
      />
    );
  };

  useEffect(() => {
    setFilterData(trData);
  }, [trData]);

  const deleteOrderDialogFooter = (
    <React.Fragment>
      <div className="flex justify-end gap-2">
        <CanceButton onClick={hideDeleteOrderDialog} />

        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          onClick={() => handleDelete(orderData._id, orderData.customerId)}
        />
      </div>
    </React.Fragment>
  );

  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        visible={deleteOrderDialog}
        onHide={() => {
          if (!deleteOrderDialog) return;
          setDeleteOrderDialog(false);
        }}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteOrderDialogFooter}
        // onHide={hideDeleteOrderDialog}
      >
        <div className="confirmation-content flex items-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />

          <span>
            Are you sure you want to delete <b>{orderData.orderId}</b> order?
          </span>
        </div>
      </Dialog>
      <DataTable
        value={filterData || []}
        paginator
        rows={4}
        responsiveLayout="scroll"
      >
        <Column
          field="billingPlaceName"
          header="Order ID"
          body={(rowData) => (
            <Link
              href={`/order/${rowData._id}`}
              className="text-blue-500"
            >
              {`${rowData.orderId}`}
            </Link>
          )}
        />
        <Column field="status" header="Status" />
        <Column
          header="Delivery Date"
          body={(rowData) => moment(rowData.deliveryDate).format("llll")}
        />
        <Column field="depot" header="Depot" body={(item)=>(
          <>
          <label htmlFor="">{item?.depot?.city}</label>
          </>
        )} />
        {/* <Column body={renderActionTemplate} header="Actions" /> */}
      </DataTable>
    </div>
  );
};

export default TableOrders;
