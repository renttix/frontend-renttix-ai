import React from "react";
import { motion } from "framer-motion";
import { FileText, TrendingUp, Users, Building2, Zap, Shield, Globe } from "lucide-react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

const PaymentTermsTemplates = ({ onApplyTemplate }) => {
  const templates = [
    {
      id: 1,
      name: "Net 30",
      category: "Standard",
      icon: <FileText size={24} />,
      description: "Payment due 30 days after invoice date",
      popularity: 85,
      config: {
        name: "Net 30",
        periodType: "Days",
        days: 30,
        description: "Standard payment terms - payment due within 30 days"
      }
    },
    {
      id: 2,
      name: "2/10 Net 30",
      category: "Discount",
      icon: <TrendingUp size={24} />,
      description: "2% discount if paid within 10 days, otherwise due in 30",
      popularity: 72,
      config: {
        name: "2/10 Net 30",
        periodType: "Days",
        days: 30,
        earlyPaymentDiscount: 2,
        description: "2% discount for payment within 10 days"
      }
    },
    {
      id: 3,
      name: "Due on Receipt",
      category: "Immediate",
      icon: <Zap size={24} />,
      description: "Payment due immediately upon receipt",
      popularity: 65,
      config: {
        name: "Due on Receipt",
        periodType: "Days",
        days: 0,
        description: "Payment due immediately"
      }
    },
    {
      id: 4,
      name: "Net 60",
      category: "Extended",
      icon: <Users size={24} />,
      description: "Extended terms for established customers",
      popularity: 58,
      config: {
        name: "Net 60",
        periodType: "Days",
        days: 60,
        description: "Extended payment terms for qualified customers"
      }
    },
    {
      id: 5,
      name: "EOM",
      category: "Monthly",
      icon: <Building2 size={24} />,
      description: "Payment due at end of month",
      popularity: 45,
      config: {
        name: "End of Month",
        periodType: "EOM",
        days: 0,
        description: "Payment due at the end of the month"
      }
    },
    {
      id: 6,
      name: "Net 90",
      category: "Enterprise",
      icon: <Shield size={24} />,
      description: "Enterprise-level extended terms",
      popularity: 32,
      config: {
        name: "Net 90",
        periodType: "Days",
        days: 90,
        description: "Extended terms for enterprise customers"
      }
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      "Standard": "info",
      "Discount": "success",
      "Immediate": "warning",
      "Extended": "primary",
      "Monthly": "secondary",
      "Enterprise": "danger"
    };
    return colors[category] || "info";
  };

  return (
    <div className="elite-templates-container">
      <div className="elite-templates-header">
        <div>
          <h2 className="elite-templates-title">Payment Term Templates</h2>
          <p className="elite-templates-subtitle">
            Choose from industry-standard templates or create your own
          </p>
        </div>
        <Button
          label="Create Custom"
          icon={<Globe size={16} />}
          className="elite-custom-template-btn"
        />
      </div>

      <div className="elite-templates-grid">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            className="elite-template-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="elite-template-header">
              <div className="elite-template-icon-wrapper">
                {template.icon}
              </div>
              <Tag 
                value={template.category} 
                severity={getCategoryColor(template.category)}
                className="elite-template-category"
              />
            </div>

            <h3 className="elite-template-name">{template.name}</h3>
            <p className="elite-template-description">{template.description}</p>

            <div className="elite-template-popularity">
              <div className="elite-popularity-bar">
                <motion.div 
                  className="elite-popularity-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${template.popularity}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                />
              </div>
              <span className="elite-popularity-text">
                {template.popularity}% of businesses use this
              </span>
            </div>

            <Button
              label="Use Template"
              className="elite-use-template-btn"
              onClick={() => onApplyTemplate(template.config)}
              fullWidth
            />
          </motion.div>
        ))}
      </div>

      <div className="elite-templates-footer">
        <div className="elite-template-tip">
          <Zap size={20} className="elite-tip-icon" />
          <p>
            <strong>Pro Tip:</strong> The most successful businesses offer early 
            payment discounts to improve cash flow by up to 20%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentTermsTemplates;