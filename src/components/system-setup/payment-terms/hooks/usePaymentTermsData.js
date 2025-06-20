import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";

const usePaymentTermsData = () => {
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [search, setSearch] = useState("");
  const [analytics, setAnalytics] = useState({
    activeCustomers: 0,
    avgPaymentDays: 30,
    collectionRate: 95,
    onTimePaymentRate: 85,
    riskScore: "Low",
    optimizationScore: 78
  });

  const { token } = useSelector((state) => state?.authReducer);

  // Fetch payment terms
  const fetchPaymentTerms = useCallback(async (searchQuery = search, pageNum = page, pageSize = rows) => {
    if (!token) {
      console.log("No token available, skipping fetch");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${BaseURL}/payment-terms?search=${searchQuery}&page=${pageNum}&limit=${pageSize}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setPaymentTerms(response.data.data || []);
        setTotalRecords(response.data.pagination?.total || response.data.data?.length || 0);
        
        // Calculate analytics from data
        calculateAnalytics(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payment terms:", error);
      // Set empty data on error
      setPaymentTerms([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [token, search, page, rows]);

  // Calculate analytics from payment terms data
  const calculateAnalytics = (data) => {
    if (!data || data.length === 0) return;

    // Calculate average payment days
    const avgDays = data.reduce((sum, term) => sum + (term.days || 0), 0) / data.length;
    
    // Simulate other analytics (in real app, these would come from backend)
    const activeCustomers = Math.floor(Math.random() * 500) + 100;
    const collectionRate = Math.floor(Math.random() * 10) + 90;
    const onTimeRate = Math.floor(Math.random() * 15) + 80;
    const optimizationScore = Math.floor(Math.random() * 20) + 70;
    
    setAnalytics({
      activeCustomers,
      avgPaymentDays: Math.round(avgDays),
      collectionRate,
      onTimePaymentRate: onTimeRate,
      riskScore: collectionRate > 95 ? "Low" : collectionRate > 85 ? "Medium" : "High",
      optimizationScore
    });
  };

  // Create payment term
  const createPaymentTerm = async (data) => {
    try {
      const response = await axios.post(
        `${BaseURL}/payment-terms`,
        data,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data) {
        await fetchPaymentTerms();
        return response.data;
      }
    } catch (error) {
      console.error("Error creating payment term:", error);
      throw error;
    }
  };

  // Update payment term
  const updatePaymentTerm = async (id, data) => {
    try {
      const response = await axios.put(
        `${BaseURL}/payment-terms/${id}`,
        data,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data) {
        await fetchPaymentTerms();
        return response.data;
      }
    } catch (error) {
      console.error("Error updating payment term:", error);
      throw error;
    }
  };

  // Delete payment term
  const deletePaymentTerm = async (id) => {
    try {
      const response = await axios.delete(
        `${BaseURL}/payment-terms/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      console.error("Error deleting payment term:", error);
      throw error;
    }
  };

  // Bulk operations
  const bulkUpdatePaymentTerms = async (ids, updates) => {
    try {
      const promises = ids.map(id => updatePaymentTerm(id, updates));
      await Promise.all(promises);
      await fetchPaymentTerms();
    } catch (error) {
      console.error("Error in bulk update:", error);
      throw error;
    }
  };

  const bulkDeletePaymentTerms = async (ids) => {
    try {
      const promises = ids.map(id => deletePaymentTerm(id));
      await Promise.all(promises);
      await fetchPaymentTerms();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      throw error;
    }
  };

  // Export data
  const exportPaymentTerms = (format = 'csv') => {
    // Implementation for export functionality
    const data = paymentTerms.map(term => ({
      Name: term.name,
      Code: term.code,
      Description: term.description,
      'Period Type': term.periodType,
      Days: term.days
    }));

    if (format === 'csv') {
      const csv = convertToCSV(data);
      downloadFile(csv, 'payment-terms.csv', 'text/csv');
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      downloadFile(json, 'payment-terms.json', 'application/json');
    }
  };

  // Helper functions
  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchPaymentTerms();
    }
  }, [token]);

  return {
    paymentTerms,
    loading,
    totalRecords,
    analytics,
    page,
    rows,
    search,
    setPage,
    setRows,
    setSearch,
    fetchPaymentTerms,
    createPaymentTerm,
    updatePaymentTerm,
    deletePaymentTerm,
    bulkUpdatePaymentTerms,
    bulkDeletePaymentTerms,
    exportPaymentTerms
  };
};

export default usePaymentTermsData;