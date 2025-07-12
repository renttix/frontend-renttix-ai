import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { formatCurrency } from "../../../utils/helper";
import { useSelector } from "react-redux";

export default function SingleInvoiceTable({ columnData }) {
  const currency = useSelector((state) => state?.authReducer?.user?.currencyKey);
  const [expandedRows, setExpandedRows] = useState(null);

  // Template to render expanded row content
  const rowExpansionTemplate = (data) => {
    return (
      <div className="p-3">
        <h5 className="font-semibold mb-2">Asset Details</h5>
        <DataTable value={data.assetNumbers} responsiveLayout="scroll">
          <Column field="assetNumber" header="Asset Number" />
          <Column field="chargedDays" header="Charged Days" />
          <Column
            field="amount"
            header="Amount"
            body={(item) => formatCurrency(item.amount, currency)}
          />
          <Column
            field="tax"
            header="Tax"
            body={(item) => formatCurrency(item.tax, currency)}
          />
          <Column
            field="total"
            header="Total"
            body={(item) => formatCurrency(item.total, currency)}
          />
        </DataTable>
      </div>
    );
  };

  return (
    <div className="card">
      <label className="font-bold">Product List</label>
      <DataTable
        value={columnData?.product || []}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="_id"
        responsiveLayout="scroll"
      >
        <Column expander style={{ width: '3rem' }} />
        <Column field="productName" header="Product Name" />
        <Column field="quantity" header="Quantity" />
        <Column
          field="type"
          header="Status"
          body={(item) => <span className="capitalize">{item.type}</span>}
        />
        <Column
          header="Weeks/Days"
          body={(item) => <span>{item.weeks}/{item.days}</span>}
        />
        <Column
          field="price"
          header="Price"
          body={(item) => <span>{formatCurrency(item.price, currency)}</span>}
        />
        <Column
          field="vat"
          header="Tax"
          body={(item) => <span>{item.vat}%</span>}
        />
        <Column
          field="suspensionAmount"
          header="Suspension"
          body={(item) => (
            <span className="text-red-500">
              {formatCurrency(item.suspensionAmount, currency)}
            </span>
          )}
        />
        <Column
          field="total"
          header="Total"
          body={(item) => <span>{formatCurrency(item.total, currency)}</span>}
        />
      </DataTable>
    </div>
  );
}
