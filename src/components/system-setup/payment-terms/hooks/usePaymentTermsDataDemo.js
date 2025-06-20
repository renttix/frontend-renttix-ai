import { useState, useEffect, useCallback } from "react";

const usePaymentTermsDataDemo = () => {
  const [paymentTerms, setPaymentTerms] = useState([
    {
      _id: "1",
      name: "Net 30",
      code: "PT-1001",
      description: "Payment due within 30 days of invoice date",
      periodType: "Days",
      days: 30
    },
    {
      _id: "2",
      name: "Net 60",
      code: "PT-1002",
      description: "Payment due within 60 days of invoice date",
      periodType: "Days",
      days: 60
    },
    {
      _id: "3",
      name: "2/10 Net 30",
      code: "PT-1003",
      description: "2% discount if paid within 10 days, otherwise due in 30",
      periodType: "Days",
      days: 30
    },
    {
      _id: "4",
      name: "Due on Receipt",
      code: "PT-1004",
      description: "Payment due immediately upon receipt",
      periodType: "Days",
      days: 0
    },
    {
      _id: "5",
      name: "End of Month",
      code: "PT-1005",
      description: "Payment due at the end of the month",
      periodType: "EOM",
      days: 0
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(5);
  const [analytics] = useState({
    activeCustomers: 342,
    avgPaymentDays: 28,
    collectionRate: 95,
    onTimePaymentRate: 87,
    riskScore: "Low",
    optimizationScore: 82
  });

  // Simulate fetch with delay
  const fetchPaymentTerms = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Simulate create
  const createPaymentTerm = async (data) => {
    const newTerm = {
      _id: Date.now().toString(),
      ...data
    };
    setPaymentTerms(prev => [...prev, newTerm]);
    setTotalRecords(prev => prev + 1);
    return newTerm;
  };

  // Simulate update
  const updatePaymentTerm = async (id, data) => {
    setPaymentTerms(prev => 
      prev.map(term => term._id === id ? { ...term, ...data } : term)
    );
    return data;
  };

  // Simulate delete
  const deletePaymentTerm = async (id) => {
    setPaymentTerms(prev => prev.filter(term => term._id !== id));
    setTotalRecords(prev => prev - 1);
    return { success: true };
  };

  // Export function
  const exportPaymentTerms = (format = 'csv') => {
    console.log(`Exporting payment terms as ${format}`);
  };

  useEffect(() => {
    fetchPaymentTerms();
  }, []);

  return {
    paymentTerms,
    loading,
    totalRecords,
    analytics,
    page: 1,
    rows: 10,
    search: "",
    setPage: () => {},
    setRows: () => {},
    setSearch: () => {},
    fetchPaymentTerms,
    createPaymentTerm,
    updatePaymentTerm,
    deletePaymentTerm,
    bulkUpdatePaymentTerms: () => {},
    bulkDeletePaymentTerms: () => {},
    exportPaymentTerms
  };
};

export default usePaymentTermsDataDemo;