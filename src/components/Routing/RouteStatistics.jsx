import React from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';

const RouteStatistics = ({ route }) => {
  const stats = route.statistics || {
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    utilizationRate: 0
  };

  return (
    <div className="route-statistics">
      <h4>Route Statistics</h4>
      
      <Card className="mb-3">
        <div className="text-center">
          <h2 className="m-0 text-primary">{stats.totalOrders}</h2>
          <p className="text-500">Total Orders</p>
        </div>
      </Card>

      <Card className="mb-3">
        <div className="mb-2">
          <span>Utilization Rate</span>
          <span className="float-right">{stats.utilizationRate}%</span>
        </div>
        <ProgressBar value={stats.utilizationRate} showValue={false} />
      </Card>

      <Card>
        <div className="grid">
          <div className="col-6 text-center">
            <h3 className="m-0 text-green-500">{stats.completedOrders}</h3>
            <p className="text-500 text-sm">Completed</p>
          </div>
          <div className="col-6 text-center">
            <h3 className="m-0 text-blue-500">{stats.activeOrders}</h3>
            <p className="text-500 text-sm">Active</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RouteStatistics;