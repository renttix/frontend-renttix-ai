import { useDispatch, useSelector } from "react-redux";
import {
  toggleColumnVisibility,
  setDefaultColumns,
} from "@/store/columnVisibilitySlice";
import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { LuFilter } from "react-icons/lu";
import { Skeleton } from "primereact/skeleton";

export default function TableComponent({
  tableName,        // (string) - The name of the table, used for display or identification
  columns,          // (object) - Column definitions, where keys are field names and values are headers
  data,             // (array) - The data to be displayed in the table
  renderColumnBody, // (function) - A function to customize the rendering of each cell
  loading,          // (boolean) - Controls the loading state, typically shows a loader when true
  selection,        // (array) - Holds selected row(s), used when row selection is enabled
  onSelectionChange,// (function) - Callback function triggered when row selection changes
  isSelection,      // (boolean) - Determines if row selection should be enabled in the table
  virtualScrollerOptions // (object) - Options for virtual scrolling
}) {
  const [visible, setVisible] = useState(false);

  const dispatch = useDispatch();
  const visibleColumns =
    useSelector((state) => state.columnVisibility.tables[tableName]) || {};

  useEffect(() => {
    dispatch(setDefaultColumns({ tableName, columns }));
  }, [dispatch, tableName, columns]);

  return (
    <div>
      <div
        className="flex items-center justify-start"
        role="toolbar"
        aria-label="Table column controls"
      >
        <button
          onClick={() => setVisible(true)}
          className="flex items-center gap-2 cursor-pointer py-1 font-bold hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
          aria-label="Show or hide table columns"
        >
          <span>Show/Hide Columns</span>
          <LuFilter className="text-lg" />
        </button>
      </div>

      <Dialog
        header="Manage Columns"
        visible={visible}
        onHide={() => setVisible(false)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Object.keys(columns).map((col) => (
            <div key={col} className="">
              <div className="flex gap-1">
                <Checkbox
                  checked={visibleColumns[col] ?? true}
                  onChange={() =>
                    dispatch(toggleColumnVisibility({ tableName, column: col }))
                  }
                />
                <label className="ml-2">{columns[col]}</label>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
      {loading ? (
        <>
          <DataTable
            value={Array.from({ length: 7})}
            className="border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
            role="table"
            aria-label={`${tableName} loading`}
          >
            {Object.entries(columns).map(([field, header]) =>
              visibleColumns[field] !== false ? (
                <Column
                  key={field}
                  sortable
                  field={field}
                  body={<Skeleton/>}
                  header={header}
                />
              ) : null,
            )}
          </DataTable>
        </>
      ) : (
        <DataTable
          className="border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card"
          rowsPerPageOptions={[5, 10, 25]}
          value={data || []}
          {...(isSelection && {
            selectionMode: "multiple",
            selection: selection,
            onSelectionChange: (e) => onSelectionChange(e.value),
          })}
          dataKey="_id"
          {...(virtualScrollerOptions && {
            virtualScrollerOptions: {
              ...virtualScrollerOptions,
              itemSize: virtualScrollerOptions.itemSize || 46,
              scrollHeight: virtualScrollerOptions.scrollHeight || '400px'
            }
          })}
          role="table"
          aria-label={tableName}
          onRowClick={(e) => {
            // Enable keyboard navigation
            if (e.originalEvent.type === 'keydown' && e.originalEvent.key === 'Enter') {
              // Handle row selection with Enter key
              if (isSelection && onSelectionChange) {
                const newSelection = selection?.includes(e.data)
                  ? selection.filter(item => item !== e.data)
                  : [...(selection || []), e.data];
                onSelectionChange(newSelection);
              }
            }
          }}
          rowClassName={(data) => {
            return {
              'focus:outline-none focus:ring-2 focus:ring-primary': true
            };
          }}
        >
          {isSelection && (
            <Column
              selectionMode="multiple"
              exportable={false}
              headerAriaLabel="Select all rows"
            />
          )}
          {Object.entries(columns).map(([field, header]) =>
            visibleColumns[field] !== false ? (
              <Column
                sortable
                key={field}
                body={(item) => renderColumnBody(field, item)}
                field={field}
                header={header}
                headerAriaLabel={`Sort by ${header}`}
              />
            ) : null,
          )}
        </DataTable>
      )}
    </div>
  );
}
