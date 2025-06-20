import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { FiSearch, FiDownload, FiUpload, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import apiServices from '../../../services/apiService';

const RouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const router = useRouter();
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await apiServices.get('/routes');
      if (response.data.success) {
        setRoutes(response.data.data || []);
        setFilteredRoutes(response.data.data || []);
      }
    } catch (error) {
      setError('Failed to fetch routes');
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (routeId) => {
    router.push(`/system-setup/routing/edit/${routeId}`);
  };

  const handleSettings = (routeId) => {
    router.push(`/system-setup/routing/settings/${routeId}`);
  };

  const handleView = (routeId) => {
    router.push(`/system-setup/routing/view/${routeId}`);
  };

  const handleDelete = (route) => {
    // Use confirmDialog if available, otherwise fallback to window.confirm
    const confirmDelete = () => {
      return new Promise((resolve) => {
        if (typeof confirmDialog === 'function') {
          confirmDialog({
            message: `Are you sure you want to delete route "${route.name}"?`,
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => resolve(true),
            reject: () => resolve(false)
          });
        } else {
          resolve(window.confirm(`Are you sure you want to delete route "${route.name}"?`));
        }
      });
    };

    confirmDelete().then(async (confirmed) => {
      if (confirmed) {
        try {
          const response = await apiServices.delete(`/routes/${route._id}`);
          if (response.data.success) {
            if (toast.current) {
              toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Route deleted successfully'
              });
            } else {
              alert('Route deleted successfully');
            }
            fetchRoutes(); // Refresh the list
          }
        } catch (error) {
          console.error('Error deleting route:', error);
          if (toast.current) {
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete route'
            });
          } else {
            alert('Failed to delete route');
          }
        }
      }
    });
  };

  const handleToggleActive = async (route) => {
    try {
      const response = await apiServices.put(`/routes/${route._id}`, {
        isActive: !route.isActive
      });
      if (response.data.success) {
        if (toast.current) {
          toast.current.show({
            severity: 'success',
            summary: 'Success',
            detail: `Route ${!route.isActive ? 'activated' : 'deactivated'} successfully`
          });
        } else {
          // Silent update, just refresh the list
        }
        fetchRoutes(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating route:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update route status'
        });
      } else {
        alert('Failed to update route status');
      }
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = routes.filter(route => {
      const searchLower = searchTerm.toLowerCase();
      return (
        route.name?.toLowerCase().includes(searchLower) ||
        route.depot?.name?.toLowerCase().includes(searchLower) ||
        route.schedule?.pattern?.toLowerCase().includes(searchLower) ||
        (route.schedule?.dayOfWeek !== undefined &&
         ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][route.schedule.dayOfWeek].toLowerCase().includes(searchLower))
      );
    });
    setFilteredRoutes(filtered);
  }, [searchTerm, routes]);

  // Sort functionality
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    const sorted = [...filteredRoutes].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested properties
      if (sortField === 'depot') {
        aValue = a.depot?.name || '';
        bValue = b.depot?.name || '';
      } else if (sortField === 'schedule') {
        aValue = a.schedule?.dayOfWeek || 7;
        bValue = b.schedule?.dayOfWeek || 7;
      }

      // Handle date sorting
      if (sortField === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredRoutes(sorted);
  }, [sortField, sortOrder]);

  // Download template
  const downloadTemplate = () => {
    const template = [
      ['Route Name', 'Depot Name', 'Service Day (0-6)', 'Start Time (HH:MM)', 'End Time (HH:MM)', 'Service Duration (minutes)', 'Max Orders', 'Max Distance (km)', 'Max Duration (minutes)'],
      ['North Birmingham Route', 'Birmingham', '1', '08:00', '17:00', '15', '50', '100', '480'],
      ['South Birmingham Route', 'Birmingham', '2', '09:00', '18:00', '20', '40', '80', '420']
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'route_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        
        // Skip header row and process data
        const routesToImport = [];
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim());
          if (values.length >= 9) {
            routesToImport.push({
              name: values[0],
              depotName: values[1],
              dayOfWeek: parseInt(values[2]),
              startTime: values[3],
              endTime: values[4],
              duration: parseInt(values[5]),
              maxOrders: parseInt(values[6]),
              maxDistance: parseInt(values[7]),
              maxDuration: parseInt(values[8])
            });
          }
        }

        // TODO: Send to backend for processing
        toast.current.show({
          severity: 'info',
          summary: 'Import Started',
          detail: `Processing ${routesToImport.length} routes...`,
          life: 3000
        });

        // Clear the file upload
        fileUploadRef.current.clear();
        
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Import Failed',
          detail: 'Error processing file. Please check the format.',
          life: 3000
        });
      }
    };
    reader.readAsText(file);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return sortOrder === 'asc' ?
      <FiChevronUp className="inline ml-1" /> :
      <FiChevronDown className="inline ml-1" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No maintenance routes found. Create your first route to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast ref={toast} />}
      {typeof ConfirmDialog !== 'undefined' && <ConfirmDialog />}
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold dark:text-white">Manage Maintenance Routes</h2>
          
          <div className="flex gap-3">
            <Button
              label="Download Template"
              icon="pi pi-download"
              className="p-button-outlined p-button-secondary"
              onClick={downloadTemplate}
            />
            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              accept=".csv,.xlsx"
              maxFileSize={1000000}
              customUpload
              uploadHandler={handleFileUpload}
              chooseLabel="Import Routes"
              className="p-button-success"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <span className="p-input-icon-left w-full md:w-96">
            <i className="pi pi-search" />
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search routes, depots, or days..."
              className="w-full"
            />
          </span>
        </div>
        
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                Maintenance Route <SortIcon field="name" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('depot')}
              >
                Depot <SortIcon field="depot" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('schedule')}
              >
                Schedule <SortIcon field="schedule" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('isActive')}
              >
                Status <SortIcon field="isActive" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                Created <SortIcon field="createdAt" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRoutes.map((route) => (
              <tr key={route._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {route.name}
                  </div>
                  {route.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {route.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {route.depot?.name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {route.schedule?.pattern || 'N/A'}
                    {route.schedule?.dayOfWeek !== undefined && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {' '}({['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][route.schedule.dayOfWeek]})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(route)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                      route.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {route.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(route.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleView(route._id)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(route._id)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSettings(route._id)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 mr-3"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => handleDelete(route)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredRoutes.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No routes found matching "{searchTerm}"
        </div>
      )}
    </div>
    </>
  );
};

export default RouteManager;