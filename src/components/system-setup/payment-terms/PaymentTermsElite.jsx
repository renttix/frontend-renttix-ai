"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calendar,
  Plus,
  FileText,
  Download,
  Filter,
  Grid3X3,
  List,
  Search,
  Settings,
  ChevronRight,
  Sparkles,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { useSelector } from "react-redux";
import PaymentTermsOverview from "./components/PaymentTermsOverview";
import PaymentTermsGrid from "./components/PaymentTermsGrid";
import PaymentTermsWizard from "./components/PaymentTermsWizard";
import PaymentTermsTemplates from "./components/PaymentTermsTemplates";
import PaymentTermsAnalytics from "./components/PaymentTermsAnalytics";
import PaymentTermsQuickActions from "./components/PaymentTermsQuickActions";
import usePaymentTermsData from "./hooks/usePaymentTermsData";
import "./styles/PaymentTermsElite.css";

const PaymentTermsElite = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showWizard, setShowWizard] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerms, setSelectedTerms] = useState([]);
  
  const toast = useRef(null);
  const { user } = useSelector((state) => state?.authReducer);
  
  // Show loading state if no user
  if (!user) {
    return (
      <div className="payment-terms-elite">
        <div className="elite-loading-container">
          <div className="elite-loading-spinner"></div>
          <p>Loading payment terms...</p>
        </div>
      </div>
    );
  }
  
  const {
    paymentTerms,
    loading,
    totalRecords,
    analytics,
    fetchPaymentTerms,
    deletePaymentTerm,
    updatePaymentTerm,
    createPaymentTerm
  } = usePaymentTermsData();

  // Navigation items
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Grid3X3, badge: null },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: "New" },
    { id: "templates", label: "Templates", icon: FileText, badge: "12" },
    { id: "settings", label: "Settings", icon: Settings, badge: null }
  ];

  // Quick stats for header
  const quickStats = [
    {
      label: "Total Terms",
      value: totalRecords || 0,
      icon: CreditCard,
      trend: "+12%",
      color: "primary"
    },
    {
      label: "Active Customers",
      value: analytics?.activeCustomers || 0,
      icon: Users,
      trend: "+8%",
      color: "success"
    },
    {
      label: "Avg. Payment Days",
      value: analytics?.avgPaymentDays || 30,
      icon: Calendar,
      trend: "-2 days",
      color: "info"
    },
    {
      label: "Collection Rate",
      value: `${analytics?.collectionRate || 95}%`,
      icon: TrendingUp,
      trend: "+3%",
      color: "warning"
    }
  ];

  const handleCreateTerm = async (data) => {
    try {
      await createPaymentTerm(data);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Payment term created successfully",
        life: 3000
      });
      setShowWizard(false);
      fetchPaymentTerms();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create payment term",
        life: 3000
      });
    }
  };

  const handleDeleteTerms = async (ids) => {
    try {
      await Promise.all(ids.map(id => deletePaymentTerm(id)));
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `${ids.length} payment term(s) deleted successfully`,
        life: 3000
      });
      setSelectedTerms([]);
      fetchPaymentTerms();
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete payment terms",
        life: 3000
      });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "analytics":
        return <PaymentTermsAnalytics analytics={analytics} paymentTerms={paymentTerms} />;
      case "templates":
        return <PaymentTermsTemplates onApplyTemplate={handleCreateTerm} />;
      case "settings":
        return <div className="elite-settings-placeholder">Settings coming soon...</div>;
      default:
        return (
          <>
            <PaymentTermsOverview 
              stats={quickStats} 
              analytics={analytics}
              onViewAnalytics={() => setActiveView("analytics")}
            />
            <PaymentTermsGrid
              data={paymentTerms}
              loading={loading}
              viewMode={viewMode}
              selectedItems={selectedTerms}
              onSelectionChange={setSelectedTerms}
              onUpdate={updatePaymentTerm}
              onDelete={handleDeleteTerms}
              searchQuery={searchQuery}
            />
          </>
        );
    }
  };

  return (
    <div className="payment-terms-elite">
      <Toast ref={toast} />
      
      {/* Header Section */}
      <motion.div 
        className="elite-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="elite-header-content">
          <div className="elite-header-left">
            <h1 className="elite-title">
              <CreditCard className="elite-title-icon" />
              Payment Terms
              <Badge 
                value={totalRecords} 
                severity="warning" 
                className="elite-badge"
              />
            </h1>
            <p className="elite-subtitle">
              Manage payment terms and optimize cash flow with AI-powered insights
            </p>
          </div>
          
          <div className="elite-header-right">
            <div className="elite-search-container">
              <Search className="elite-search-icon" />
              <InputText
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payment terms..."
                className="elite-search-input"
              />
            </div>
            
            <div className="elite-view-toggle">
              <Button
                icon={<Grid3X3 size={18} />}
                className={`elite-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                tooltip="Grid View"
              />
              <Button
                icon={<List size={18} />}
                className={`elite-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                tooltip="List View"
              />
            </div>
            
            <Button
              label="Create Term"
              icon={<Plus size={18} />}
              className="elite-create-btn"
              onClick={() => setShowWizard(true)}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="elite-navigation">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              className={`elite-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <Badge 
                  value={item.badge} 
                  severity={item.id === 'analytics' ? 'success' : 'info'}
                  className="elite-nav-badge"
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions Bar */}
      {selectedTerms.length > 0 && (
        <PaymentTermsQuickActions
          selectedCount={selectedTerms.length}
          onDelete={() => handleDeleteTerms(selectedTerms)}
          onExport={() => console.log("Export selected")}
          onBulkEdit={() => console.log("Bulk edit")}
          onClearSelection={() => setSelectedTerms([])}
        />
      )}

      {/* Main Content */}
      <motion.div 
        className="elite-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {renderContent()}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showWizard && (
          <PaymentTermsWizard
            visible={showWizard}
            onHide={() => setShowWizard(false)}
            onSave={handleCreateTerm}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      <motion.div 
        className="elite-fab"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          icon={<Plus size={24} />}
          className="elite-fab-btn"
          onClick={() => setShowWizard(true)}
          tooltip="Create Payment Term"
          tooltipOptions={{ position: 'left' }}
        />
      </motion.div>
    </div>
  );
};

export default PaymentTermsElite;