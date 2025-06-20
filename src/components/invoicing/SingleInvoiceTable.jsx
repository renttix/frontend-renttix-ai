import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { formatCurrency } from "../../../utils/helper";
import { useSelector } from "react-redux";

export default function SingleInvoiceTable({ columnData }) {
  const currency = useSelector((state) => state?.authReducer?.user?.currencyKey);


  return (
    <div className="card">
      <label htmlFor="" className="font-bold">
        Product List
      </label>
      <DataTable value={columnData?.product || []} tableStyle={{ minWidth: "50rem" }}>
        <Column field="productName" header="Product Name"></Column>
        <Column field="quantity" header="Quantity"></Column>
        <Column
          field="type"
          header="Status"
          body={(item) => (
            <>
              <label className=" capitalize" htmlFor="">
                {item.type}
              </label>
            </>
          )}
        ></Column>
        <Column
          field="days"
          header="Weeks/Days"
          body={(item) => (
            <>
              <label className=" capitalize" htmlFor="">
                {item.weeks + "/" + item.days}
              </label>
            </>
          )}
        ></Column>
        <Column
          field="quantity"
          header="Price"
          body={(item) => <label>{formatCurrency(item.price,currency)}</label>}
        ></Column>
        <Column
          field="vat"
          header="Tax"
          body={(item) => <label>{item.vat}%</label>}
        ></Column>
             <Column
          field="suspensionAmount"
          header="Suspension"
          body={(item) => <label className="text-red">{formatCurrency(item.suspensionAmount,currency)}</label>}
        ></Column>
        <Column
          field="total"
          header="Total"
          body={(item) => <label>{formatCurrency(item.total,currency)}</label>}
        ></Column>
      </DataTable>
    </div>
  );
}
