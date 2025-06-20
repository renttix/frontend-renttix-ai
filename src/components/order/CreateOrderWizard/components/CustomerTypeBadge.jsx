import React from 'react';
import { Tag } from 'primereact/tag';
import PropTypes from 'prop-types';

const CustomerTypeBadge = ({ type }) => {
  const getTypeConfig = () => {
    switch (type?.toLowerCase()) {
      case 'account':
        return {
          label: 'Account',
          severity: 'success',
          icon: 'pi pi-building',
          tooltip: 'Account customer with credit terms'
        };
      case 'prepay':
        return {
          label: 'Prepay',
          severity: 'warning',
          icon: 'pi pi-credit-card',
          tooltip: 'Prepayment required'
        };
      case 'walk-in':
      case 'walkin':
        return {
          label: 'Walk-in',
          severity: 'info',
          icon: 'pi pi-user',
          tooltip: 'Walk-in customer'
        };
      default:
        return {
          label: 'Unknown',
          severity: 'secondary',
          icon: 'pi pi-question',
          tooltip: 'Customer type not specified'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Tag
      value={config.label}
      severity={config.severity}
      icon={config.icon}
      className="customer-type-badge"
      data-pr-tooltip={config.tooltip}
      data-pr-position="top"
    />
  );
};

CustomerTypeBadge.propTypes = {
  type: PropTypes.string
};

export default React.memo(CustomerTypeBadge);