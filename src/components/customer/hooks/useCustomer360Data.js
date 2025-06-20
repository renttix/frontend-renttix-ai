import { useState, useEffect, useCallback, useMemo } from 'react';
import apiServices from '../../../../services/apiService';
import axios from 'axios';
import { BaseURL } from '../../../../utils/baseUrl';
import moment from 'moment';

const useCustomer360Data = (customerId) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notes, setNotes] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [accountingData, setAccountingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (!customer || !invoices) {
      return {
        totalOrders: 0,
        activeOrders: 0,
        totalRevenue: 0,
        outstandingBalance: 0,
        lastOrderDate: null,
        customerSince: null,
        averageOrderValue: 0,
        paymentStatus: 'good',
        creditLimit: 0,
        creditUsed: 0
      };
    }

    const totalOrders = orders.length;
    const activeOrders = orders.filter(order => 
      ["pending", "processing", "delivered"].includes(order.status?.toLowerCase())
    ).length;
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0);
    const outstandingBalance = customer.totalPrice || 0;
    
    const lastOrder = orders.length > 0 
      ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
      : null;
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Determine payment status
    let paymentStatus = 'good';
    if (outstandingBalance > 0) {
      const daysOutstanding = customer.daysOutstanding || 0;
      if (daysOutstanding > 60) paymentStatus = 'critical';
      else if (daysOutstanding > 30) paymentStatus = 'warning';
    }
    
    return {
      totalOrders,
      activeOrders,
      totalRevenue,
      outstandingBalance,
      lastOrderDate: lastOrder?.createdAt,
      customerSince: customer.createdAt,
      averageOrderValue,
      paymentStatus,
      creditLimit: customer.creditLimit || 0,
      creditUsed: customer.creditUsed || 0
    };
  }, [customer, orders, invoices]);

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const monthlyData = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months').format('MMM YYYY');
      last6Months.push(month);
      monthlyData[month] = 0;
    }
    
    orders.forEach(order => {
      const orderMonth = moment(order.createdAt).format('MMM YYYY');
      if (monthlyData.hasOwnProperty(orderMonth)) {
        monthlyData[orderMonth] += order.totalPrice || 0;
      }
    });
    
    return {
      labels: last6Months,
      datasets: [{
        label: 'Monthly Revenue',
        data: last6Months.map(month => monthlyData[month]),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4
      }]
    };
  }, [orders]);

  // Memoized recent activity
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Add order activities
    orders.slice(0, 3).forEach(order => {
      activities.push({
        type: 'order',
        action: `Order #${order.orderId?.slice(-8)} placed`,
        date: new Date(order.createdAt),
        icon: 'FiPackage',
        color: 'blue'
      });
    });
    
    // Add payment activities
    paymentHistory.slice(0, 2).forEach(payment => {
      activities.push({
        type: 'payment',
        action: `Payment of ${payment.amount / 100} received`,
        date: new Date(payment.created * 1000),
        icon: 'FiDollarSign',
        color: payment.status === 'succeeded' ? 'green' : 'red'
      });
    });
    
    // Add note activities
    notes.slice(0, 2).forEach(note => {
      activities.push({
        type: 'note',
        action: `Note: ${note.name}`,
        date: new Date(note.createdAt),
        icon: 'FiFileText',
        color: 'gray'
      });
    });
    
    // Sort by date
    return activities.sort((a, b) => b.date - a.date).slice(0, 10);
  }, [orders, paymentHistory, notes]);

  // Fetch customer data
  const fetchCustomerData = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Parallel API calls for better performance
      const [customerResponse, notesResponse] = await Promise.all([
        apiServices.get(`/customer/customer/${customerId}`),
        apiServices.get(`/order/customer-order-notes/?customerId=${customerId}`)
      ]);

      if (customerResponse.data.success) {
        const customerData = customerResponse.data.data.customer;
        const invoiceData = customerResponse.data.data.invoice;
        
        setCustomer(customerData);
        setOrders(customerData.orders || []);
        setInvoices(invoiceData || []);
      }

      if (notesResponse.data.success) {
        setNotes(notesResponse.data.data || []);
      }

      // Fetch payment history separately (non-blocking)
      fetchPaymentHistory();
      
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError(err.message || "Failed to load customer data");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async () => {
    if (!customerId) return;
    
    try {
      const response = await axios.get(
        `${BaseURL}/stripes/get-payments?customerId=${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setPaymentHistory(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  }, [customerId]);

  // Check accounting integration
  const checkAccountingIntegration = useCallback(() => {
    if (customer?.quickbooksId || customer?.xeroId) {
      setAccountingData({
        system: customer?.quickbooksId ? 'QuickBooks' : 'Xero',
        syncStatus: 'synced',
        lastSync: new Date(),
        balance: customer?.totalPrice || 0
      });
    }
  }, [customer]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await fetchCustomerData();
    setRefreshing(false);
  }, [fetchCustomerData]);

  // Initial data fetch
  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  // Check accounting integration when customer data changes
  useEffect(() => {
    checkAccountingIntegration();
  }, [checkAccountingIntegration]);

  return {
    customer,
    orders,
    invoices,
    notes,
    paymentHistory,
    accountingData,
    stats,
    chartData,
    recentActivity,
    loading,
    error,
    refreshing,
    refreshData
  };
};

export default useCustomer360Data;