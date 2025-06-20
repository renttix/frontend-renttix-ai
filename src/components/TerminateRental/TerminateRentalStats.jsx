import React from "react";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";

const TerminateRentalStats = ({ loading, totalActive, totalOverdue, dueToday, dueThisWeek }) => {
  const stats = [
    {
      title: "Active Rentals",
      value: totalActive || 0,
      icon: "pi pi-shopping-cart",
      color: "bg-blue-500",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Overdue Returns",
      value: totalOverdue || 0,
      icon: "pi pi-exclamation-triangle",
      color: "bg-red-500",
      trend: totalOverdue > 0 ? `${totalOverdue} need attention` : "All on track",
      trendUp: false
    },
    {
      title: "Due Today",
      value: dueToday || 0,
      icon: "pi pi-calendar",
      color: "bg-yellow-500",
      trend: dueToday > 0 ? "Action required" : "None today",
      trendUp: null
    },
    {
      title: "Due This Week",
      value: dueThisWeek || 0,
      icon: "pi pi-clock",
      color: "bg-green-500",
      trend: `${dueThisWeek} upcoming`,
      trendUp: true
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton height="100px" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${
                  stat.trendUp === true ? "text-green-600" : 
                  stat.trendUp === false ? "text-red-600" : "text-gray-600"
                }`}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className={`${stat.color} text-white p-3 rounded-lg`}>
              <i className={`${stat.icon} text-2xl`}></i>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TerminateRentalStats;