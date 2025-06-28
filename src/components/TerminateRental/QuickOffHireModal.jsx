import React from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const QuickOffHireModal = ({
  visible,
  rental,
  onHide,
  onConfirm,
  offHireDate,
  setOffHireDate,
  collectionDate,
  setCollectionDate,
  sameAsOffHire,
  setSameAsOffHire,
  notes,
  setNotes,
  selectedAssets,
  setSelectedAssets,
}) => {
  const [expandedRows, setExpandedRows] = React.useState(null);
  const [requestType, setRequestType] = React.useState("Standard Return");
  const [collectionMethod, setCollectionMethod] =
    React.useState("Scheduled Pickup");

  const requestTypeOptions = [
    { label: "Standard Return", value: "Standard Return" },
    { label: "Urgent Return", value: "Urgent Return" },
    { label: "Customer Cancelled", value: "Customer Cancelled" },
  ];

  const collectionMethodOptions = [
    { label: "Scheduled Pickup", value: "Scheduled Pickup" },
    { label: "Customer Drop-off", value: "Customer Drop-off" },
    { label: "Third-party Courier", value: "Third-party Courier" },
  ];

  const assetExpansionTemplate = (product) => {
    const assets = product.selectedAssets || [];

    return (
      <div className="p-3">
        <h6 className="mb-2">Assets</h6>
        <DataTable
          value={assets}
          responsiveLayout="scroll"
          stripedRows
          size="small"
        >
          <Column field="assetNumber" header="Asset Number" />
          <Column field="product" header="Product" body={(()=>(
            <>
            {product.productName}
            </>
          ))} />
          {/* <Column field="notes" header="Notes" /> */}
        </DataTable>
      </div>
    );
  };

  console.log({ rental });
  return (
    <Dialog
      header="New Off-Hire Request"
      visible={visible}
      onHide={onHide}
           style={{ width: "50vw", maxWidth: "600px" }}
      modal
      className="p-fluid"
    >
      <div className="formgrid p-fluid grid">
        <div className="col-12 md:col-6">
          <label>Customer</label>
          <InputText value={rental?.customer?.name || ""} disabled />
        </div>
        <div className="col-6 md:col-3">
          <label>Off-Hire Date</label>
          <Calendar
            value={offHireDate}
            onChange={(e) => setOffHireDate(e.value)}
            showIcon
          />
        </div>
        <div className="col-6 md:col-3">
          <label>Collection Date</label>
          <Calendar
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.value)}
            showIcon
            disabled={sameAsOffHire}
          />
          <div className="mt-2">
            <Checkbox
              inputId="sameDate"
              checked={sameAsOffHire}
              onChange={(e) => {
                setSameAsOffHire(e.checked);
                if (e.checked) setCollectionDate(offHireDate);
              }}
            />
            <label htmlFor="sameDate" className="ml-2">
              Same as off-hire date
            </label>
          </div>
        </div>

        <div className="col-12 md:col-4">
          <label>Contract Number</label>
          <Dropdown
            value={rental?.orderId}
            options={[{ label: rental?.orderId, value: rental?.orderId }]}
            disabled
          />
        </div>
        <div className="col-6 md:col-4">
          <label>Request Type</label>
          <Dropdown
            value={requestType}
            options={requestTypeOptions}
            onChange={(e) => setRequestType(e.value)}
            placeholder="Select request type"
          />
        </div>
        <div className="col-6 md:col-4">
          <label>Collection Method</label>
          <Dropdown
            value={collectionMethod}
            options={collectionMethodOptions}
            onChange={(e) => setCollectionMethod(e.value)}
            placeholder="Select collection method"
          />
        </div>
      </div>

      <div className="mt-4">
        <h5 className="mb-2">Assets to Return</h5>
        <DataTable
          value={rental?.products || []}
          selection={selectedAssets}
          onSelectionChange={(e) => setSelectedAssets(e.value)}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={assetExpansionTemplate}
          dataKey="productId"
        >
          <Column expander style={{ width: "3em" }} />
          <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
          <Column field="productName" header="Product Name" />
          <Column
            header="On Rent"
            body={(rowData) => rowData.quantity || 1}
            
          />
        </DataTable>
      </div>

      <div className="mt-4">
        <label htmlFor="notes">Notes</label>
        <InputTextarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add any relevant notes..."
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <div className="">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
        </div>{" "}
        <div className="">
          <Button
            label="Off Rent"
            icon="pi pi-check"
            severity="danger"
            onClick={onConfirm}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default QuickOffHireModal;
