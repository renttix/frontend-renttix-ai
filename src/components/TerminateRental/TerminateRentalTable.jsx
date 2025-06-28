import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { Menu } from "primereact/menu";
import { format, differenceInDays } from "date-fns";
import { Dialog } from "primereact/dialog";
import QuickOffHireModal from "./QuickOffHireModal";

const TerminateRentalTable = ({
  rentals,
  loading,
  error,
  totalRecords,
  filters,
  onPageChange,
  onSort,
  onTerminate,
}) => {
  const [selectedRentals, setSelectedRentals] = useState([]);
  const menuRef = React.useRef(null);
  const [menuRental, setMenuRental] = useState(null);
  const [showQuickOffHireModal, setShowQuickOffHireModal] = useState(false);
  const [selectedQuickOffHireRental, setSelectedQuickOffHireRental] =
    useState(null);
  const [offHireDate, setOffHireDate] = useState(null);
  const [collectionDate, setCollectionDate] = useState(null);
  const [sameAsOffHire, setSameAsOffHire] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);

  const menuItems = [
    {
      label: "View Details",
      icon: "pi pi-eye",
      command: () => console.log("View", menuRental),
    },
    {
      label: "Terminate Rental",
      icon: "pi pi-times-circle",
      command: () => onTerminate(menuRental),
    },
    {
      label: "Send Reminder",
      icon: "pi pi-envelope",
      command: () => console.log("Send reminder", menuRental),
    },
    {
      separator: true,
    },
    {
      label: "Print Contract",
      icon: "pi pi-print",
      command: () => console.log("Print", menuRental),
    },
  ];

  const contractTemplate = (rowData) => {
    console.log({ rowData });
    return (
      <div>
        <span className="font-semibold">{rowData.orderId}</span>
        <br />
        <span className="text-sm text-gray-600">
          {rowData.orderDate
            ? format(new Date(rowData.orderDate), "dd/MM/yyyy")
            : "N/A"}
        </span>
      </div>
    );
  };

  const customerTemplate = (rowData) => {
    return (
      <div>
        <span className="font-medium">{rowData.customer?.name || "N/A"}</span>
        <br />
        <span className="text-sm text-gray-600">
          {rowData.customer?.email || ""}
        </span>
      </div>
    );
  };

  const productsTemplate = (rowData) => {
    console.log({ rowData });
    return (
      <div className="space-y-1">
        {rowData.products?.slice(0, 2).map((product, index) => (
          <Tag
            key={index}
            value={`${product.quantity}x ${product.productName}`}
            severity="info"
            className="mr-1"
          />
        ))}
        {rowData.products?.length > 2 && (
          <Tag value={`+${rowData.products.length - 2} more`} />
        )}
      </div>
    );
  };

  const datesTemplate = (rowData) => {
    const daysRemaining = rowData.expectedReturnDate
      ? differenceInDays(new Date(rowData.expectedReturnDate), new Date())
      : null;

    return (
      <div>
        <div className="text-sm">
          <span className="font-medium">Start:</span>{" "}
          {rowData.deliveryDate
            ? format(new Date(rowData.deliveryDate), "dd/MM/yyyy")
            : "N/A"}
        </div>
        <div className="text-sm">
          <span className="font-medium">Due:</span>{" "}
          {rowData.expectedReturnDate
            ? format(new Date(rowData.expectedReturnDate), "dd/MM/yyyy")
            : "N/A"}
        </div>
        {daysRemaining !== null && (
          <>
            {daysRemaining < 0 && (
              <Tag
                severity="danger"
                value={`${Math.abs(daysRemaining)} days overdue`}
              />
            )}
            {daysRemaining === 0 && (
              <Tag severity="warning" value="Due today" />
            )}
            {daysRemaining > 0 && daysRemaining <= 3 && (
              <Tag severity="warning" value={`Due in ${daysRemaining} days`} />
            )}
          </>
        )}
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    const getStatusSeverity = (status) => {
      switch (status) {
        case "active":
          return "success";
        case "overdue":
          return "danger";
        case "due_soon":
          return "warning";
        default:
          return "info";
      }
    };

    return (
      <Tag
        value={rowData.status}
        severity={getStatusSeverity(rowData.status)}
      />
    );
  };

  const valueTemplate = (rowData) => {
    const dailyRate =
      rowData.products?.reduce((sum, p) => sum + p.price * p.quantity, 0) || 0;

    const days = rowData.deliveryDate
      ? differenceInDays(new Date(), new Date(rowData.deliveryDate))
      : 0;

    const currentValue = dailyRate * Math.max(1, days);

    return (
      <div className="text-right">
        <div className="font-semibold">£{currentValue.toFixed(2)}</div>
        <div className="text-sm text-gray-600">£{dailyRate.toFixed(2)}/day</div>
      </div>
    );
  };

  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
                 <Button
          icon="pi pi-stop-circle
"
          severity="danger"
          size="small"
          rounded
          text
          tooltip="Quick Off Hire"
          tooltipOptions={{ position: "bottom" }}
         onClick={() => {
           setSelectedQuickOffHireRental(rowData);
           setShowQuickOffHireModal(true);
         }}/>
        <Button
          icon="pi pi-times-circle"
          severity="danger"
          size="small"
          rounded
          text
          tooltip="Terminate Rental"
          tooltipOptions={{ position: "bottom" }}
          onClick={() => onTerminate(rowData)}
        />
        <Button
          icon="pi pi-ellipsis-v"
          severity="secondary"
          size="small"
          rounded
          text
          onClick={(e) => {
            setMenuRental(rowData);
            menuRef.current.toggle(e);
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Active Rentals</h3>
      <div className="flex gap-2">
        {selectedRentals.length > 0 && (
          <Button
            label={`Terminate ${selectedRentals.length} Selected`}
            icon="pi pi-times-circle"
            severity="danger"
            size="small"
          />
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <i className="pi pi-exclamation-triangle mb-4 text-4xl text-red-500"></i>
        <p className="text-lg">Error loading rentals</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <QuickOffHireModal
        visible={showQuickOffHireModal}
        rental={selectedQuickOffHireRental}
        onHide={() => setShowQuickOffHireModal(false)}
        onConfirm={() => {
          console.log("Quick off-hire confirmed", {
            rental: selectedQuickOffHireRental,
            offHireDate,
            collectionDate: sameAsOffHire ? offHireDate : collectionDate,
            notes,
            selectedAssets,
          });
          setShowQuickOffHireModal(false);
        }}
        offHireDate={offHireDate}
        setOffHireDate={setOffHireDate}
        collectionDate={collectionDate}
        setCollectionDate={setCollectionDate}
        sameAsOffHire={sameAsOffHire}
        setSameAsOffHire={setSameAsOffHire}
        notes={notes}
        setNotes={setNotes}
        selectedAssets={selectedAssets}
        setSelectedAssets={setSelectedAssets}
      />

      <DataTable
        value={rentals || []}
        paginator
        rows={filters.limit}
        totalRecords={totalRecords}
        lazy
        first={(filters.page - 1) * filters.limit}
        onPage={onPageChange}
        onSort={onSort}
        sortField={filters.sortBy}
        sortOrder={filters.sortOrder === "asc" ? 1 : -1}
        selection={selectedRentals}
        onSelectionChange={(e) => setSelectedRentals(e.value)}
        dataKey="_id"
        header={header}
        emptyMessage="No active rentals found"
        className="mt-4"
        scrollable
        scrollHeight="600px"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column
          field="orderId"
          header="Contract"
          body={contractTemplate}
          sortable
          style={{ minWidth: "150px" }}
        />

        <Column
          field="customer.name"
          header="Customer"
          body={customerTemplate}
          sortable
          style={{ minWidth: "200px" }}
        />

        <Column
          field="products"
          header="Products"
          body={productsTemplate}
          style={{ minWidth: "250px" }}
        />

        <Column
          field="deliveryDate"
          header="Rental Period"
          body={datesTemplate}
          sortable
          style={{ minWidth: "180px" }}
        />

        <Column
          field="deliveryAddress1"
          header="Site Address"
          style={{ minWidth: "200px" }}
        />

        <Column
          field="depot.name"
          header="Depot"
          sortable
          style={{ minWidth: "120px" }}
        />

        <Column
          field="status"
          header="Status"
          body={statusTemplate}
          sortable
          style={{ minWidth: "100px" }}
        />

        <Column
          header="Current Value"
          body={valueTemplate}
          style={{ minWidth: "120px" }}
        />
        

        <Column
          header="Actions"
          body={actionTemplate}
          style={{ minWidth: "100px" }}
          frozen
          alignFrozen="right"
        />
      </DataTable>

      <Menu model={menuItems} popup ref={menuRef} />
    </>
  );
};

export default TerminateRentalTable;
