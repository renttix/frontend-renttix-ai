"use client";
import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import axios from "axios";
import { BaseURL } from "../../../../../utils/baseUrl";
import { 
  FiPackage, FiBarChart2, FiTrendingUp, 
  FiRefreshCw, FiCheckCircle, FiXCircle 
} from "react-icons/fi";
import { MdQrCode2, MdBarChart } from "react-icons/md";

const BarcodeStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    fetchStatistics();
    setupChart();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BaseURL}/barcode/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data);
        updateChartData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupChart = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    setChartOptions({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    });
  };

  const updateChartData = (data) => {
    const documentStyle = getComputedStyle(document.documentElement);
    
    setChartData({
      labels: ['With Barcode', 'Without Barcode'],
      datasets: [
        {
          data: [data.productsWithBarcode, data.productsWithoutBarcode],
          backgroundColor: [
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--gray-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--gray-400')
          ]
        }
      ]
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton height="2rem" className="mb-2" />
              <Skeleton height="3rem" />
            </Card>
          ))}
        </div>
        <Card>
          <Skeleton height="300px" />
        </Card>
      </div>
    );
  }

  const coverageColor = () => {
    if (stats.coveragePercentage >= 80) return 'text-green-600';
    if (stats.coveragePercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MdBarChart className="text-purple-600" />
          Barcode Statistics
        </h3>
        <Button
          icon={<FiRefreshCw className={refreshing ? 'animate-spin' : ''} />}
          label="Refresh"
          className="p-button-text"
          onClick={handleRefresh}
          disabled={refreshing}
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Products
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.totalProducts.toLocaleString()}
              </p>
            </div>
            <FiPackage className="text-3xl text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                With Barcode
              </p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.productsWithBarcode.toLocaleString()}
              </p>
            </div>
            <FiCheckCircle className="text-3xl text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Without Barcode
              </p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                {stats.productsWithoutBarcode.toLocaleString()}
              </p>
            </div>
            <FiXCircle className="text-3xl text-gray-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Coverage
              </p>
              <p className={`text-2xl font-bold ${coverageColor()}`}>
                {stats.coveragePercentage.toFixed(1)}%
              </p>
            </div>
            <FiTrendingUp className="text-3xl text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Coverage Progress Bar */}
      <Card>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <MdQrCode2 className="text-purple-600" />
          Barcode Coverage Progress
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Products with barcodes</span>
            <span className="font-semibold">{stats.coveragePercentage.toFixed(1)}%</span>
          </div>
          <ProgressBar 
            value={stats.coveragePercentage} 
            showValue={false}
            style={{ height: '10px' }}
            color={
              stats.coveragePercentage >= 80 ? '#10b981' :
              stats.coveragePercentage >= 50 ? '#f59e0b' : '#ef4444'
            }
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </Card>

      {/* Distribution Chart */}
      <Card>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <FiBarChart2 className="text-purple-600" />
          Barcode Distribution
        </h4>
        <div className="h-64">
          {chartData && (
            <Chart 
              type="doughnut" 
              data={chartData} 
              options={chartOptions} 
              className="w-full h-full"
            />
          )}
        </div>
      </Card>

      {/* Recommendations */}
      {stats.coveragePercentage < 100 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <FiTrendingUp className="text-blue-600 text-xl mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
                Recommendations
              </h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                {stats.coveragePercentage < 50 && (
                  <li>• Consider using bulk import to quickly add barcodes to existing products</li>
                )}
                {stats.productsWithoutBarcode > 100 && (
                  <li>• You have {stats.productsWithoutBarcode} products without barcodes</li>
                )}
                <li>• Enable auto-generation for new products to maintain coverage</li>
                <li>• Use the export feature to identify products missing barcodes</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {stats.coveragePercentage === 100 && (
        <Card className="bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-green-600 text-2xl" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-400">
                Excellent Coverage!
              </h4>
              <p className="text-sm text-green-800 dark:text-green-300">
                All your products have barcodes assigned. Great job maintaining your inventory!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BarcodeStatistics;