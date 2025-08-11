"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import apiServices from "../../../services/apiService";
import axios from "axios";
import { BaseURL } from "../../../utils/baseUrl";
import { formatCurrency } from "../../../utils/helper";
import { useSelector } from "react-redux";
import { Toast } from "primereact/toast";
import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Timeline } from "primereact/timeline";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import moment from "moment";
import Link from "next/link";
import {
  FiPhone, FiMail, FiMapPin, FiDollarSign, FiPackage,
  FiFileText, FiMessageSquare, FiClock, FiTrendingUp,
  FiAlertCircle, FiCheckCircle, FiXCircle, FiEdit,
  FiSend, FiCalendar, FiUser, FiHome, FiCreditCard,
  FiActivity, FiDatabase, FiLink
} from "react-icons/fi";
import { SiWhatsapp, SiQuickbooks, SiXero } from "react-icons/si";
import "./styles/Customer360View.css";
import "./styles/WhatsAppMessaging.css";
import Loader from "../common/Loader";
import GoPrevious from "../common/GoPrevious/GoPrevious";
import WhatsAppMessaging from "./WhatsAppMessaging";
import useIntegrationStatus from "@/hooks/useIntegrationStatus";

const Customer360View = () => {
  const toast = useRef(null);
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state?.authReducer);
  const { getChannelStatus } = useIntegrationStatus();
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notes, setNotes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [accountingData, setAccountingData] = useState(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [stats, setStats] = useState({
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
  });
  const [chartData, setChartData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);



  const checkWhatsAppStatus = async () => {
    const isActive = await getChannelStatus('whatsapp');
    setWhatsappEnabled(isActive);
  };
  useEffect(() => {
    fetchCustomerData();
    checkWhatsAppStatus();
  }, [params.id]);
  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Fetch customer details
      const customerResponse = await apiServices.get(`/customer/customer/${params.id}`);
      if (customerResponse.data.success) {
        const customerData = customerResponse.data.data.customer;
        const invoiceData = customerResponse.data.data.invoice;
        
        setCustomer(customerData);
        setOrders(customerData.orders || []);
        setInvoices(invoiceData || []);
        
        // Calculate stats
        calculateStats(customerData, invoiceData);
        
        // Generate chart data
        generateChartData(customerData.orders || []);
      }

      // Fetch notes
      const notesResponse = await apiServices.get(`/order/customer-order-notes/?customerId=${params.id}`);
      if (notesResponse.data.success) {
        setNotes(notesResponse.data.data || []);
      }

      // Fetch payment history
      fetchPaymentHistory();
      
      // Fetch accounting data
      fetchAccountingData();
      
      // Generate recent activity
      generateRecentActivity();
      
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load customer data",
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    setLoadingPayments(true);
    try {
      const response = await axios.get(
        `${BaseURL}/stripes/get-payments?customerId=${params.id}`,
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
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchAccountingData = async () => {
    try {
      // Check if customer has QuickBooks or Xero ID
      if (customer?.quickbooksId || customer?.xeroId) {
        // This would fetch real accounting data
        setAccountingData({
          system: customer?.quickbooksId ? 'QuickBooks' : 'Xero',
          syncStatus: 'synced',
          lastSync: new Date(),
          balance: customer?.totalPrice || 0
        });
      }
    } catch (error) {
      console.error("Error fetching accounting data:", error);
    }
  };

  const calculateStats = (customerData, invoiceData) => {
    const totalOrders = customerData.orders?.length || 0;
    const activeOrders = customerData.orders?.filter(order => 
      ["pending", "processing", "delivered"].includes(order.status?.toLowerCase())
    ).length || 0;
    
    const totalRevenue =  invoiceData
  .filter(invoice => invoice.paymentStatus === "paid") || 0;
    const outstandingBalance =  invoiceData
  .filter(invoice => invoice.paymentStatus === "unpaid")
  .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const lastOrder = customerData.orders?.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Determine payment status based on outstanding balance
    let paymentStatus = 'good';
    if (outstandingBalance > 0) {
      const daysOutstanding = customerData.daysOutstanding || 0;
      if (daysOutstanding > 60) paymentStatus = 'critical';
      else if (daysOutstanding > 30) paymentStatus = 'warning';
    }
    
    setStats({
      totalOrders,
      activeOrders,
      totalRevenue,
      outstandingBalance,
      lastOrderDate: lastOrder?.createdAt,
      customerSince: customerData.createdAt,
      averageOrderValue,
      paymentStatus,
      creditLimit: customerData.creditLimit || 0,
      creditUsed: customerData.creditUsed || 0
    });
  };

  const generateChartData = (orders) => {
    // Group orders by month for the last 6 months
    const monthlyData = {};
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = moment().subtract(i, 'months').format('MMM YYYY');
      last6Months.push(month);
      monthlyData[month] = 0;
    }
    
    orders?.forEach(order => {
      const orderMonth = moment(order.createdAt).format('MMM YYYY');
      if (monthlyData.hasOwnProperty(orderMonth)) {
        monthlyData[orderMonth] += order.totalPrice || 0;
      }
    });
    
    setChartData({
      labels: last6Months,
      datasets: [{
        label: 'Monthly Revenue',
        data: last6Months.map(month => monthlyData[month]),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4
      }]
    });
  };

  const generateRecentActivity = () => {
    const activities = [];
    
    // Add order activities
    orders.slice(0, 3).forEach(order => {
      activities.push({
        type: 'order',
        action: `Order #${order.orderId?.slice(-8)} placed`,
        date: new Date(order.createdAt),
        icon: FiPackage,
        color: 'blue'
      });
    });
    
    // Add payment activities
    paymentHistory.slice(0, 2).forEach(payment => {
      activities.push({
        type: 'payment',
        action: `Payment of ${formatCurrency(payment.amount / 100, user?.currencyKey)} received`,
        date: new Date(payment.created * 1000),
        icon: FiDollarSign,
        color: payment.status === 'succeeded' ? 'green' : 'red'
      });
    });
    
    // Add note activities
    notes.slice(0, 2).forEach(note => {
      activities.push({
        type: 'note',
        action: `Note: ${note.name}`,
        date: new Date(note.createdAt),
        icon: FiFileText,
        color: 'gray'
      });
    });
    
    // Sort by date
    activities.sort((a, b) => b.date - a.date);
    setRecentActivity(activities.slice(0, 10));
  };

  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      pending: 'warning',
      completed: 'info',
      cancelled: 'danger',
      paid: 'success',
      unpaid: 'danger',
      partial: 'warning'
    };
    return statusMap[status?.toLowerCase()] || 'info';
  };

  const handleSendWhatsApp = () => {
    // Switch to Messages tab
    setActiveIndex(4); // Messages tab index
  };

  const handleMessageSent = (newMessage) => {
    // Update activity timeline with new message
    const newActivity = {
      type: 'message',
      action: `WhatsApp message sent`,
      date: new Date(),
      icon: SiWhatsapp,
      color: 'green'
    };
    
    setRecentActivity([newActivity, ...recentActivity.slice(0, 9)]);
    setMessageCount(messageCount + 1);
  };

  const handleEditCustomer = () => {
    router.push(`/customer/update/${params.id}`);
  };

  const chartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return formatCurrency(value, user?.currencyKey);
          }
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="customer-360-container">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="customer-360-header">
        <div className="flex items-center gap-4">
          <GoPrevious route="/customer/listing" />
          <h1 className="text-3xl font-bold text-white">Customer 360° View</h1>
        </div>
        <div className="flex gap-3">
          <Button
            label="Edit Customer"
            icon={<FiEdit />}
            className="p-button-secondary glass-button"
            onClick={handleEditCustomer}
          />
          {whatsappEnabled && (
            <Button
              label="Send WhatsApp"
              icon={<SiWhatsapp />}
              className="p-button-success glass-button"
              onClick={handleSendWhatsApp}
            />
          )}
        </div>
      </div>

      {/* Customer Profile Card */}
      <div className="glass-card customer-profile-card">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <Avatar 
              label={customer?.name?.charAt(0).toUpperCase()} 
              size="xlarge" 
              shape="circle"
              className="customer-avatar"
            />
            <div>
              <h2 className="text-2xl font-bold mb-2">{customer?.name}</h2>
              <div className="customer-info-grid">
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <span>{customer?.mobile || 'No phone'}</span>
                </div>
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <span>{customer?.email || 'No email'}</span>
                </div>
                <div className="info-item">
                  <FiMapPin className="info-icon" />
                  <span>
                    {customer?.addressLine1 && customer?.city ? 
                      `${customer.addressLine1}, ${customer.city}, ${customer.postCode}` : 
                      'No address'
                    }
                  </span>
                </div>
                <div className="info-item">
                  <FiUser className="info-icon" />
                  <span>Customer ID: {customer?.number}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="customer-status">
            <Tag value="Active" severity="success" className="status-tag" />
            <div className="text-sm text-gray-500 mt-2">
              Customer since {moment(customer?.createdAt).format('MMM YYYY')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
         <div className="glass-card stat-card">
          <div className="stat-icon-wrapper blue">
            <FiPackage className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(Number(customer.creditBalance), user?.currencyKey)}</h3>
            <p className="stat-label ">Credit Balance</p>
            <div className="stat-trend">
              {/* <span className="trend-value positive">{customer.creditBalance} active</span> */}
            </div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper blue">
            <FiPackage className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalOrders}</h3>
            <p className="stat-label">Total Orders</p>
            <div className="stat-trend">
              <span className="trend-value positive">{stats.activeOrders} active</span>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper green">
            <FiDollarSign className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(stats.totalRevenue, user?.currencyKey)}</h3>
            <p className="stat-label">Total Revenue</p>
            <div className="stat-trend">
              <FiTrendingUp className="trend-icon positive" />
              <span className="trend-value positive">+12%</span>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper orange">
            <FiCreditCard className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(stats.outstandingBalance, user?.currencyKey)}</h3>
            <p className="stat-label">Outstanding Balance</p>
            <div className="stat-trend">
              {stats.outstandingBalance > 0 && (
                <span className="trend-value negative">Pending payment</span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper purple">
            <FiCalendar className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">
              {stats.lastOrderDate ? moment(stats.lastOrderDate).fromNow() : 'Never'}
            </h3>
            <p className="stat-label">Last Order</p>
            <div className="stat-trend">
              <span className="trend-value">
                {stats.lastOrderDate ? moment(stats.lastOrderDate).format('DD MMM YYYY') : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper red">
            <FiActivity className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(stats.averageOrderValue, user?.currencyKey)}</h3>
            <p className="stat-label">Average Order Value</p>
            <div className="stat-trend">
              {stats.creditLimit > 0 && (
                <ProgressBar
                  value={(stats.creditUsed / stats.creditLimit) * 100}
                  className="credit-progress"
                  showValue={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Integration Status */}
      {accountingData && (
        <div className="glass-card accounting-status">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {accountingData.system === 'QuickBooks' ? (
                <SiQuickbooks className="accounting-icon quickbooks" />
              ) : (
                <SiXero className="accounting-icon xero" />
              )}
              <div>
                <h4 className="font-semibold text-white">
                  {accountingData.system} Integration
                </h4>
                <p className="text-sm text-gray-300">
                  Last synced: {moment(accountingData.lastSync).fromNow()}
                </p>
              </div>
            </div>
            <Tag
              value={accountingData.syncStatus}
              severity="success"
              icon="pi pi-check"
            />
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Left Column - Activity & Chart */}
        <div className="left-column">
          {/* Recent Activity */}
          <div className="glass-card">
            <h3 className="card-title">
              <FiClock className="title-icon" />
              Recent Activity
            </h3>
            <div className="activity-timeline">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${activity.color}`}>
                      <Icon />
                    </div>
                    <div className="activity-content">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-date">{moment(activity.date).fromNow()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          {chartData && (
            <div className="glass-card">
              <h3 className="card-title">
                <FiTrendingUp className="title-icon" />
                Revenue Trend
              </h3>
              <div className="chart-container">
                <Chart type="line" data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Tabs */}
        <div className="right-column">
          <div className="glass-card tabs-card">
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
              <TabPanel header="Orders" leftIcon="pi pi-shopping-cart">
                <div className="tab-content">
                  {orders.length > 0 ? (
                    <div className="orders-list">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order._id} className="order-item">
                          <div className="order-header">
                            <Link href={`/order/${order._id}`} className="order-id">
                              #{order.orderId?.slice(-8)}
                            </Link>
                            <Tag 
                              value={order.status} 
                              severity={getStatusColor(order.status)}
                              className="order-status"
                            />
                          </div>
                          {/* <div className="order-details">
                            <span className="order-date">
                              {moment(order.createdAt).format('DD MMM YYYY')}
                            </span>
                            <span className="order-amount">
                              {formatCurrency(order.totalPrice || 0, user?.currencyKey)}
                            </span>
                          </div> */}
                        </div>
                      ))}
                      {orders.length > 5 && (
                        <Link href={`/customer/${params.id}/orders`} className="view-all-link">
                          View all {orders.length} orders →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiPackage className="empty-icon" />
                      <p>No orders found</p>
                    </div>
                  )}
                </div>
              </TabPanel>

              <TabPanel header="Invoices" leftIcon="pi pi-file">
                <div className="tab-content">
                  {invoices.length > 0 ? (
                    <div className="invoices-list">
                      {invoices.slice(0, 5).map((invoice) => (
                        <div key={invoice._id} className="invoice-item">
                          <div className="invoice-header">
                            <Link href={`/order/quick-off-hire/${invoice._id}`} className="invoice-id">
                              #{invoice.invoiceNumber}
                            </Link>
                            <Tag 
                              value={invoice.paymentStatus || 'Pending'} 
                              severity={getStatusColor(invoice.status)}
                              className="invoice-status"
                            />
                          </div>
                          <div className="invoice-details">
                            <span className="invoice-date">
                              {moment(invoice.createdAt).format('DD MMM YYYY')}
                            </span>
                            <span className="invoice-amount">
                              {formatCurrency(invoice.total || 0, user?.currencyKey)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {invoices.length > 5 && (
                        <Link href={`/customer/${params.id}/invoices`} className="view-all-link">
                          View all {invoices.length} invoices →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiFileText className="empty-icon" />
                      <p>No invoices found</p>
                    </div>
                  )}
                </div>
              </TabPanel>

              <TabPanel header="Notes" leftIcon="pi pi-comment">
                <div className="tab-content">
                  {notes.length > 0 ? (
                    <div className="notes-list">
                      {notes.slice(0, 5).map((note) => (
                        <div key={note._id} className="note-item">
                          <div className="note-header">
                            <h4 className="note-title">{note.name}</h4>
                            <span className="note-date">
                              {moment(note.createdAt).format('DD MMM')}
                            </span>
                          </div>
                          <p className="note-description">{note.description}</p>
                          <div className="note-author">
                            <FiUser className="author-icon" />
                            <span>{note.author?.legalName || 'Unknown'}</span>
                          </div>
                        </div>
                      ))}
                      {notes.length > 5 && (
                        <Link href={`/customer/${params.id}/notes`} className="view-all-link">
                          View all {notes.length} notes →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiMessageSquare className="empty-icon" />
                      <p>No notes found</p>
                    </div>
                  )}
                </div>
              </TabPanel>

              <TabPanel header="Payments" leftIcon="pi pi-wallet">
                <div className="tab-content">
                  {loadingPayments ? (
                    <div className="payment-skeleton">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton-item">
                          <Skeleton width="100%" height="60px" />
                        </div>
                      ))}
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    <div className="payments-list">
                      {paymentHistory.slice(0, 5).map((payment, index) => (
                        <div key={index} className="payment-item">
                          <div className="payment-header">
                            <div className="payment-amount">
                              {formatCurrency(payment.amount / 100, user?.currencyKey)}
                            </div>
                            <Tag
                              value={payment.status}
                              severity={payment.status === 'succeeded' ? 'success' : 'danger'}
                              className="payment-status"
                            />
                          </div>
                          <div className="payment-details">
                            <span className="payment-method">
                              <FiCreditCard className="method-icon" />
                              {payment.payment_method_types.join(', ')}
                            </span>
                            <span className="payment-date">
                              {moment(payment.created * 1000).format('DD MMM YYYY')}
                            </span>
                          </div>
                        </div>
                      ))}
                      {paymentHistory.length > 5 && (
                        <Link href={`/customer/${params.id}/payments`} className="view-all-link">
                          View all {paymentHistory.length} payments →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiCreditCard className="empty-icon" />
                      <p>No payment history found</p>
                    </div>
                  )}
                </div>
              </TabPanel>

              {whatsappEnabled && (
                <TabPanel header="Messages" leftIcon="pi pi-envelope">
                  <div className="tab-content">
                    {showWhatsApp ? (
                      <WhatsAppMessaging
                        customerId={params.id}
                        customerPhone={customer?.phone}
                        customerName={customer?.name}
                        onMessageSent={() => setMessageCount(prev => prev + 1)}
                      />
                    ) : (
                      <div className="messages-placeholder">
                        <SiWhatsapp className="whatsapp-icon" />
                        <p>Send WhatsApp messages to {customer?.name}</p>
                        <Button
                          label="Open WhatsApp Chat"
                          icon={<FiSend />}
                          className="p-button-success mt-3"
                          onClick={handleSendWhatsApp}
                        />
                      </div>
                    )}
                  </div>
                </TabPanel>
              )}
            </TabView>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer360View;