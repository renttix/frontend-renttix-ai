import React from "react";
import { motion } from "framer-motion";
// import { 
//   BarChart3, 
//   PieChart, 
//   TrendingUp, 
//   DollarSign,
//   Calendar,
//   Users,
//   AlertCircle,
//   ArrowUpRight,
//   ArrowDownRight
// } from "lucide-react";
import {
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaCalendarAlt,
  FaUsers,
  FaExclamationCircle,
  FaArrowCircleUp,
  FaArrowCircleDown
} from "react-icons/fa";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

const PaymentTermsAnalytics = ({ analytics, paymentTerms }) => {
  // Mock data for charts (in real app, this would come from backend)
  const paymentPerformanceData = [
    { month: "Jan", onTime: 85, late: 15 },
    { month: "Feb", onTime: 88, late: 12 },
    { month: "Mar", onTime: 82, late: 18 },
    { month: "Apr", onTime: 90, late: 10 },
    { month: "May", onTime: 87, late: 13 },
    { month: "Jun", onTime: 92, late: 8 }
  ];

  const termUsageData = paymentTerms.map(term => ({
    name: term.name,
    value: Math.floor(Math.random() * 100) + 20,
    percentage: Math.floor(Math.random() * 30) + 10
  }));

  const kpiCards = [
    {
      title: "Average Collection Time",
      value: "28.5 days",
      change: "-2.3 days",
      trend: "positive",
      icon: <FaCalendarAlt size={24} />,
      color: "success"
    },
    {
      title: "Outstanding Revenue",
      value: "$124,500",
      change: "+$12,300",
      trend: "negative",
      icon: <FaDollarSign size={24} />,
      color: "warning"
    },
    {
      title: "On-Time Payment Rate",
      value: "87%",
      change: "+5%",
      trend: "positive",
      icon: <FaArrowUp size={24} />,
      color: "info"
    },
    {
      title: "Active Customers",
      value: "342",
      change: "+28",
      trend: "positive",
      icon: <FaUsers size={24} />,
      color: "primary"
    }
  ];

  return (
    <div className="elite-analytics-container">
      {/* KPI Cards */}
      <div className="elite-kpi-grid">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`elite-kpi-card elite-kpi-${kpi.color}`}
          >
            <div className="elite-kpi-header">
              <div className="elite-kpi-icon">{kpi.icon}</div>
              <div className={`elite-kpi-trend ${kpi.trend}`}>
                {kpi.trend === "positive" ? (
                  <FaArrowCircleUp size={20} />
                ) : (
                  <FaArrowCircleDown size={20} />
                )}
                <span>{kpi.change}</span>
              </div>
            </div>
            <h3 className="elite-kpi-value">{kpi.value}</h3>
            <p className="elite-kpi-title">{kpi.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="elite-charts-grid">
        {/* Payment Performance Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="elite-chart-card"
        >
          <div className="elite-chart-header">
            <h3 className="elite-chart-title">
              <FaChartBar size={20} />
              Payment Performance Trend
            </h3>
            <Button
              label="Export"
              icon={<FaArrowCircleUp size={16} />}
              className="elite-chart-action"
              text
            />
          </div>
          
          <div className="elite-chart-placeholder">
            {/* Placeholder for actual chart */}
            <div className="elite-bar-chart">
              {paymentPerformanceData.map((data, index) => (
                <div key={data.month} className="elite-bar-group">
                  <div className="elite-bar-container">
                    <motion.div
                      className="elite-bar elite-bar-success"
                      initial={{ height: 0 }}
                      animate={{ height: `${data.onTime}%` }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    />
                    <motion.div
                      className="elite-bar elite-bar-warning"
                      initial={{ height: 0 }}
                      animate={{ height: `${data.late}%` }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    />
                  </div>
                  <span className="elite-bar-label">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="elite-chart-legend">
              <div className="elite-legend-item">
                <span className="elite-legend-color elite-success"></span>
                <span>On-Time Payments</span>
              </div>
              <div className="elite-legend-item">
                <span className="elite-legend-color elite-warning"></span>
                <span>Late Payments</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Term Usage Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="elite-chart-card"
        >
          <div className="elite-chart-header">
            <h3 className="elite-chart-title">
              <FaChartPie size={20} />
              Term Usage Distribution
            </h3>
          </div>
          
          <div className="elite-usage-list">
            {termUsageData.slice(0, 5).map((term, index) => (
              <motion.div
                key={term.name}
                className="elite-usage-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="elite-usage-info">
                  <span className="elite-usage-name">{term.name}</span>
                  <span className="elite-usage-count">{term.value} customers</span>
                </div>
                <div className="elite-usage-bar-container">
                  <motion.div
                    className="elite-usage-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${term.percentage}%` }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  />
                </div>
                <span className="elite-usage-percentage">{term.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights and Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="elite-insights-card"
      >
        <div className="elite-insights-header">
          <h3 className="elite-insights-title">
            <FaExclamationCircle size={20} />
            Key Insights & Recommendations
          </h3>
        </div>
        
        <div className="elite-insights-list">
          <div className="elite-insight-item">
            <div className="elite-insight-icon elite-success">
              <FaArrowUp size={16} />
            </div>
            <div className="elite-insight-content">
              <h4>Payment performance is improving</h4>
              <p>On-time payments have increased by 5% over the last quarter</p>
            </div>
          </div>
          
          <div className="elite-insight-item">
            <div className="elite-insight-icon elite-warning">
              <FaExclamationCircle size={16} />
            </div>
            <div className="elite-insight-content">
              <h4>Consider early payment incentives</h4>
              <p>18% of customers pay late. Offering 2% discount could improve cash flow</p>
            </div>
          </div>
          
          <div className="elite-insight-item">
            <div className="elite-insight-icon elite-info">
              <FaUsers size={16} />
            </div>
            <div className="elite-insight-content">
              <h4>Optimize term distribution</h4>
              <p>65% of customers use Net 30. Consider creating segment-specific terms</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentTermsAnalytics;