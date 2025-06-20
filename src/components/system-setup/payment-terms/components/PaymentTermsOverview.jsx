import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  Info
} from "lucide-react";
import { Tooltip } from "primereact/tooltip";
import { ProgressBar } from "primereact/progressbar";
import { Skeleton } from "primereact/skeleton";

const PaymentTermsOverview = ({ stats, analytics, onViewAnalytics }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      primary: "elite-card-primary",
      success: "elite-card-success",
      info: "elite-card-info",
      warning: "elite-card-warning"
    };
    return colorMap[color] || "elite-card-primary";
  };

  const getTrendIcon = (trend) => {
    if (!trend) return null;
    const isPositive = trend.startsWith("+");
    return isPositive ? (
      <TrendingUp size={16} className="elite-trend-positive" />
    ) : (
      <TrendingDown size={16} className="elite-trend-negative" />
    );
  };

  // Quick insights based on analytics
  const insights = [
    {
      title: "Payment Performance",
      value: `${analytics?.onTimePaymentRate || 85}%`,
      subtitle: "On-time payments",
      progress: analytics?.onTimePaymentRate || 85,
      color: "success"
    },
    {
      title: "Risk Assessment",
      value: analytics?.riskScore || "Low",
      subtitle: "Overall risk level",
      progress: 25,
      color: "info"
    },
    {
      title: "Optimization Score",
      value: `${analytics?.optimizationScore || 78}%`,
      subtitle: "Terms effectiveness",
      progress: analytics?.optimizationScore || 78,
      color: "warning"
    }
  ];

  return (
    <div className="elite-overview-container">
      {/* Stats Cards */}
      <motion.div 
        className="elite-stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`elite-stat-card ${getColorClass(stat.color)}`}
            variants={cardVariants}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="elite-stat-header">
              <div className="elite-stat-icon-wrapper">
                <stat.icon size={24} className="elite-stat-icon" />
              </div>
              <Tooltip target={`.stat-info-${index}`} content={`Click for detailed ${stat.label.toLowerCase()} analytics`} />
              <Info 
                size={16} 
                className={`elite-stat-info stat-info-${index}`}
                onClick={onViewAnalytics}
              />
            </div>
            
            <div className="elite-stat-content">
              <h3 className="elite-stat-value">
                {stat.value}
                {stat.trend && (
                  <span className="elite-stat-trend">
                    {getTrendIcon(stat.trend)}
                    <span>{stat.trend}</span>
                  </span>
                )}
              </h3>
              <p className="elite-stat-label">{stat.label}</p>
            </div>

            <div className="elite-stat-sparkline">
              {/* Placeholder for mini chart */}
              <svg viewBox="0 0 100 40" className="elite-mini-chart">
                <path
                  d="M0,30 L20,25 L40,27 L60,20 L80,15 L100,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.3"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Insights Section */}
      <motion.div 
        className="elite-insights-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="elite-insights-header">
          <h3 className="elite-insights-title">
            <Sparkles size={20} className="elite-insights-icon" />
            AI-Powered Insights
          </h3>
          <button 
            className="elite-insights-action"
            onClick={onViewAnalytics}
          >
            View Details
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="elite-insights-grid">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              className="elite-insight-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="elite-insight-header">
                <h4 className="elite-insight-title">{insight.title}</h4>
                <span className={`elite-insight-value elite-text-${insight.color}`}>
                  {insight.value}
                </span>
              </div>
              <p className="elite-insight-subtitle">{insight.subtitle}</p>
              <ProgressBar 
                value={insight.progress} 
                showValue={false}
                className={`elite-progress elite-progress-${insight.color}`}
              />
            </motion.div>
          ))}
        </div>

        {/* AI Recommendation */}
        <motion.div 
          className="elite-ai-recommendation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="elite-ai-header">
            <Sparkles size={16} className="elite-ai-icon" />
            <span className="elite-ai-label">AI Recommendation</span>
          </div>
          <p className="elite-ai-text">
            Consider offering 2% early payment discount for NET 30 terms to improve cash flow by 15%
          </p>
          <button className="elite-ai-action">Apply Suggestion</button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentTermsOverview;