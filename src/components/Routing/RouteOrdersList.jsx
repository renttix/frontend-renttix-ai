import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import apiServices from '../../../services/apiService';

const RouteOrdersList = ({ routeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRouteOrders();
  }, [routeId]);

  const fetchRouteOrders = async () => {
    try {
      setLoading(true);
      const response = await apiServices.get(`/routes/${routeId}/orders`);
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching route orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusBodyTemplate = (rowData) => {
    const severity = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return <Tag value={rowData.status} severity={severity[rowData.status]} />;
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <Button 
        icon="pi pi-eye" 
        className="p-button-rounded p-button-text"
        onClick={() => window.open(`/orders/${rowData._id}`, '_blank')}
      />
    );
  };

  return (
    <div className="route-orders-list">
      <DataTable
        value={orders || []}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="No orders assigned to this route"
      >
        <Column field="orderNumber" header="Order #" sortable />
        <Column field="customer.name" header="Customer" sortable />
        <Column field="deliveryAddress" header="Address" />
        <Column field="scheduledDate" header="Scheduled Date" sortable 
          body={(rowData) => new Date(rowData.scheduledDate).toLocaleDateString()} />
        <Column field="status" header="Status" body={statusBodyTemplate} />
        <Column field="maintenanceType" header="Maintenance" />
        <Column body={actionBodyTemplate} header="Actions" />
      </DataTable>
    </div>
  );
};

export default RouteOrdersList;