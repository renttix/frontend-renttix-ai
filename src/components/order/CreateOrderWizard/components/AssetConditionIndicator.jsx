import React from 'react';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import PropTypes from 'prop-types';

const AssetConditionIndicator = ({ condition, showLabel = false, size = 'normal' }) => {
  const getConditionConfig = () => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return {
          label: 'Excellent',
          severity: 'success',
          icon: 'pi pi-star-fill',
          color: '#22c55e',
          bgColor: '#dcfce7',
          tooltip: 'Asset in excellent condition'
        };
      case 'good':
        return {
          label: 'Good',
          severity: 'info',
          icon: 'pi pi-star',
          color: '#3b82f6',
          bgColor: '#dbeafe',
          tooltip: 'Asset in good condition'
        };
      case 'fair':
        return {
          label: 'Fair',
          severity: 'warning',
          icon: 'pi pi-star-half-fill',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          tooltip: 'Asset in fair condition'
        };
      case 'poor':
        return {
          label: 'Poor',
          severity: 'danger',
          icon: 'pi pi-exclamation-triangle',
          color: '#ef4444',
          bgColor: '#fee2e2',
          tooltip: 'Asset in poor condition - may need maintenance'
        };
      case 'maintenance':
        return {
          label: 'In Maintenance',
          severity: 'secondary',
          icon: 'pi pi-wrench',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          tooltip: 'Asset currently in maintenance'
        };
      case 'retired':
        return {
          label: 'Retired',
          severity: 'secondary',
          icon: 'pi pi-times-circle',
          color: '#374151',
          bgColor: '#e5e7eb',
          tooltip: 'Asset has been retired'
        };
      default:
        return {
          label: 'Unknown',
          severity: 'secondary',
          icon: 'pi pi-question',
          color: '#9ca3af',
          bgColor: '#f9fafb',
          tooltip: 'Condition not specified'
        };
    }
  };

  const config = getConditionConfig();
  const sizeClass = size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : '';

  if (showLabel) {
    return (
      <Tag
        value={config.label}
        severity={config.severity}
        icon={config.icon}
        className={`asset-condition-tag ${sizeClass}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.color}20`
        }}
        data-pr-tooltip={config.tooltip}
        data-pr-position="top"
      />
    );
  }

  // Icon-only version
  return (
    <div
      className="asset-condition-indicator inline-flex align-items-center justify-content-center"
      style={{
        width: size === 'small' ? '1.5rem' : size === 'large' ? '2.5rem' : '2rem',
        height: size === 'small' ? '1.5rem' : size === 'large' ? '2.5rem' : '2rem',
        borderRadius: '50%',
        backgroundColor: config.bgColor,
        color: config.color,
        border: `2px solid ${config.color}30`
      }}
      data-pr-tooltip={`${config.label}: ${config.tooltip}`}
      data-pr-position="top"
    >
      <i className={`${config.icon} ${sizeClass}`}></i>
    </div>
  );
};

AssetConditionIndicator.propTypes = {
  condition: PropTypes.string,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'normal', 'large'])
};

AssetConditionIndicator.defaultProps = {
  showLabel: false,
  size: 'normal'
};

export default React.memo(AssetConditionIndicator);