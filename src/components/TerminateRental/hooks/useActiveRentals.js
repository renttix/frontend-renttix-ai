import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BaseURL } from "../../../../utils/baseUrl";

const useActiveRentals = (filters, token) => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.customerId?._id) params.append("customerId", filters.customerId._id);
      if (filters.productId?._id) params.append("productId", filters.productId._id);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());
      if (filters.status.length > 0) params.append("status", filters.status.join(","));
      if (filters.depot) params.append("depot", filters.depot);
      params.append("page", filters.page);
      params.append("limit", filters.limit);
      params.append("sortBy", filters.sortBy);
      params.append("sortOrder", filters.sortOrder);

      const response = await axios.get(
        `${BaseURL}/termination/active-rentals?${params.toString()}`,
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const rentalData = response.data.data || [];
        console.log({rentalData})
        setRentals(rentalData.rentals);
        setTotalRecords(rentalData.totalRecords || 0);
      } else {
        throw new Error(response.data.message || "Failed to fetch rentals");
      }
    } catch (err) {
      console.error("Error fetching active rentals:", err);
      setError(err.message || "An error occurred while fetching rentals");
      
      // For development, use mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        const mockData = getMockRentals();
        setRentals(mockData);
        setTotalRecords(mockData.length);
      } else {
        setRentals([]);
        setTotalRecords(0);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const refetch = () => {
    fetchRentals();
  };

  return {
    rentals,
    loading,
    error,
    totalRecords,
    refetch
  };
};

// Mock data for development
const getMockRentals = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    _id: `order-${i + 1}`,
    orderId: `ORD-2025-${String(i + 1).padStart(4, "0")}`,
    orderDate: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
    customer: {
      _id: `cust-${i + 1}`,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`
    },
    products: [
      {
        productId: `prod-${i + 1}`,
        productName: "Excavator CAT 320",
        quantity: 1,
        price: 250
      },
      {
        productId: `prod-${i + 2}`,
        productName: "Safety Equipment",
        quantity: 5,
        price: 10
      }
    ],
    deliveryDate: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
    expectedReturnDate: new Date(Date.now() + (i - 5) * 24 * 60 * 60 * 1000),
    deliveryAddress1: `${i + 1} Construction Site`,
    deliveryCity: "London",
    depot: {
      _id: `depot-${(i % 3) + 1}`,
      name: `Depot ${(i % 3) + 1}`
    },
    status: i < 3 ? "overdue" : (i < 6 ? "due_soon" : "active"),
    daysOverdue: i < 3 ? Math.abs(i - 5) : 0,
    totalAmount: 300 * (30 - i)
  }));
};

export default useActiveRentals;