'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import { BaseURL } from '../../../utils/baseUrl';


const REPORT_TYPES = [
  { label: 'Active Rentals (What’s our where?)', value: 'active-rentals' },
  { label: 'Utilization (by product)', value: 'utilization' },
  { label: 'Revenue Timeline', value: 'revenue' },
  { label: 'Maintenance Due', value: 'maintenance-due' },
  { label: 'Depot Stock & Status', value: 'depot-stock' },
  { label: 'Deliveries Schedule', value: 'deliveries-schedule' },
];

const BUCKETS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const REVENUE_BY = [
  { label: 'None', value: '' },
  { label: 'Product', value: 'product' },
  { label: 'Customer', value: 'customer' },
];

// ------------------------------
// Inline API helpers (Authorization + downloads)
// ------------------------------
async function apiGetJSON({ type, token, query = {} }) {
  const qs = new URLSearchParams(query).toString();
  const url = `${BaseURL}/reports/${encodeURIComponent(type)}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const msg = await safeReadError(res);
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res.json(); // { success, count, data }
}

async function apiDownload({ type, token, query = {}, format = 'csv' }) {
  const qs = new URLSearchParams({ ...query, format }).toString();
  const url = `${BaseURL}/reports/${encodeURIComponent(type)}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept:
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
    },
  });

  if (!res.ok) {
    const msg = await safeReadError(res);
    throw new Error(msg || `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const match = cd.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] || `${type}.${format}`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

async function safeReadError(res) {
  try {
    const t = await res.text();
    try {
      const j = JSON.parse(t);
      return j?.message || j?.error || t;
    } catch {
      return t;
    }
  } catch {
    return null;
  }
}

// ------------------------------
// Component
// ------------------------------
export default function ReportsDashboard() {
  const toastRef = useRef(null);

  // Pull token + vendor from Redux (adjust selectors if your store differs)
  const { token, user } = useSelector((state) => state?.authReducer);



  const [reportType, setReportType] = useState('active-rentals');
  const [dateRange, setDateRange] = useState(null); // [start, end]
  const [bucket, setBucket] = useState('month'); // for revenue
  const [groupBy, setGroupBy] = useState('product'); // for revenue
  const [routeId, setRouteId] = useState('');
  const [depotId, setDepotId] = useState('');
  const [overrideVendorId, setOverrideVendorId] = useState(''); // superadmin override

  const vendorId = user?._id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // infer columns from data
// infer columns from data (hide _id)
const columns = useMemo(() => {
  if (!rows?.length) return [];

  // collect keys across all rows (some reports return heterogeneous rows)
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  // hide _id (and __v just in case)
  const HIDE_KEYS = new Set(['_id','customerId', '__v','productId','orderId','orderDbId','routeId','longitude','latitude','timeWindowStart','timeWindowEnd']);

  return keys
    .filter((k) => !HIDE_KEYS.has(k))
    .map((k) => ({ field: k, header: k }));
}, [rows]);


  const isRevenue = reportType === 'revenue';

  function buildQuery() {
    const q = {};
    if (vendorId) q.vendorId = vendorId;

    if (dateRange && dateRange[0]) q.dateFrom = toISODate(dateRange[0]);
    if (dateRange && dateRange[1]) q.dateTo = toISODate(dateRange[1]);

    if (reportType === 'revenue') {
      q.bucket = bucket;
      if (groupBy) q.by = groupBy;
    }
    if (reportType === 'deliveries-schedule' && routeId) q.routeId = routeId;
    if (reportType === 'depot-stock' && depotId) q.depotId = depotId;
    return q;
  }
// Utilities (place near toISODate)
function formatCell(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === 'object') {
    // If it looks like a Mongo ObjectId in an object wrapper, show something readable
    if (value._id) return String(value._id);
    // Fallback: stringify composite objects like {_id:{productId,status}} or any nested data
    try { return JSON.stringify(value); } catch { return String(value); }
  }
  return String(value);
}

  async function onGenerate() {
    if (!token) {
      toastRef.current?.show({ severity: 'warn', summary: 'Auth', detail: 'Please login to view reports' });
      return;
    }
    setLoading(true);
    try {
      const query = buildQuery();
      const res = await apiGetJSON({ type: reportType, token, query: { ...query, format: 'json' } });
      setRows(res?.data || []);
      if (!res?.data?.length) {
        toastRef.current?.show({ severity: 'info', summary: 'No Data', detail: 'No rows for selected filters' });
      }
    } catch (err) {
      toastRef.current?.show({ severity: 'error', summary: 'Error', detail: err?.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  }

  async function onExport(format) {
    if (!token) return;
    try {
      const query = buildQuery();
      await apiDownload({ type: reportType, token, query, format });
    } catch (err) {
      toastRef.current?.show({ severity: 'error', summary: 'Export failed', detail: err?.message || 'Failed' });
    }
  }

  const chartData = useMemo(() => {
    if (!isRevenue || !rows?.length) return null;
    // Expected fields in rows: bucket, revenue, rentals, [productName|customerName] if grouped
    const labels = rows.map((r) => {
      if (!r.bucket) return '';
      const d = new Date(r.bucket);
      return isNaN(d.getTime()) ? String(r.bucket) : d.toISOString().slice(0, 10);
    });

    const datasets = [];

    if (groupBy) {
      const key = groupBy === 'product' ? 'productName' : 'customerName';
      const seriesMap = new Map();
      rows.forEach((r, i) => {
        const name = r[key] || r[`${groupBy}Id`] || 'Unknown';
        if (!seriesMap.has(name)) seriesMap.set(name, []);
        const arr = seriesMap.get(name);
        arr[i] = r.revenue || 0;
      });
      // normalize lengths
      for (const arr of seriesMap.values()) {
        for (let i = 0; i < rows.length; i++) if (arr[i] == null) arr[i] = 0;
      }
      for (const [name, data] of seriesMap.entries()) {
        datasets.push({ label: name, data, fill: false });
      }
    } else {
      datasets.push({ label: 'Revenue', data: rows.map((r) => r.revenue || 0), fill: false });
    }

    return { labels, datasets };
  }, [rows, isRevenue, groupBy]);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <Toast ref={toastRef} />

      <div className="rounded-2xl shadow-md border border-gray-200 bg-white p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <span className="p-float-label">
            <Dropdown
              id="reportType"
              value={reportType}
              options={REPORT_TYPES}
              onChange={(e) => setReportType(e.value)}
              className="w-full"
              placeholder="Select report"
            />
            <label htmlFor="reportType">Report Type</label>
          </span>

          <span className="p-float-label">
            <Calendar
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.value)}
              selectionMode="range"
              readOnlyInput
              showIcon
              className="w-full"
            />
            <label htmlFor="dateRange">Date Range</label>
          </span>

          {reportType === 'revenue' && (
            <span className="p-float-label">
              <Dropdown id="bucket" value={bucket} options={BUCKETS} onChange={(e) => setBucket(e.value)} className="w-full" />
              <label htmlFor="bucket">Bucket</label>
            </span>
          )}

          {reportType === 'revenue' && (
            <span className="p-float-label">
              <Dropdown id="groupBy" value={groupBy} options={REVENUE_BY} onChange={(e) => setGroupBy(e.value)} className="w-full" />
              <label htmlFor="groupBy">Group By</label>
            </span>
          )}

          {reportType === 'deliveries-schedule' && (
            <span className="p-float-label">
              <InputText id="routeId" value={routeId} onChange={(e) => setRouteId(e.target.value)} className="w-full" />
              <label htmlFor="routeId">Route ID (optional)</label>
            </span>
          )}

          {reportType === 'depot-stock' && (
            <span className="p-float-label">
              <InputText id="depotId" value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full" />
              <label htmlFor="depotId">Depot ID (optional)</label>
            </span>
          )}

  
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button label="Generate" icon="pi pi-play" onClick={onGenerate} />
          <Button label="Export CSV" icon="pi pi-download" severity="secondary" outlined onClick={() => onExport('csv')} />
          <Button label="Export XLSX" icon="pi pi-file-excel" severity="success" outlined onClick={() => onExport('xlsx')} />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <ProgressSpinner />
        </div>
      )}

      {!loading && isRevenue && chartData && (
        <div className="mt-6 rounded-2xl shadow-md border border-gray-200 bg-white p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue</h3>
          <Chart type="line" data={chartData} />
        </div>
      )}

      {!loading && (
        <div className="mt-6 rounded-2xl shadow-md border border-gray-200 bg-white p-0 overflow-hidden">
          <DataTable
  value={rows}
  paginator
  rows={25}
  rowsPerPageOptions={[25, 50, 100]}
  stripedRows
  scrollable
  scrollHeight="60vh"
  emptyMessage="No data"
>
  {columns.map((c) => (
    <Column
      key={c.field}
      field={c.field}
      header={c.header}
      sortable
      body={(row) => formatCell(row[c.field])}   
    />
  ))}
</DataTable>

        </div>
      )}
    </div>
  );
}

// ------------------------------
// Utilities
// ------------------------------
function toISODate(d) {
  if (!d) return '';
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}
