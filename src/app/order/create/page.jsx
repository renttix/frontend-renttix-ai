"use client";
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import CreateOrderWizard from "@/components/order/CreateOrderWizard";
import EnhancedCreateOrderWizard from "@/components/order/CreateOrderWizard/EnhancedCreateOrderWizard";
import React from "react";
import { Skeleton } from 'primereact/skeleton';

const OrderCreateContent = () => {
  const searchParams = useSearchParams();
  const [useEnhanced, setUseEnhanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for query parameter
    const enhanced = searchParams.get('enhanced') === 'true';
    
    // Check for feature flag in localStorage (only on client side)
    if (typeof window !== 'undefined') {
      const featureFlag = localStorage.getItem('useEnhancedOrderWizard') === 'true';
      // Use enhanced if either query param or feature flag is true
      setUseEnhanced(enhanced || featureFlag);
    } else {
      // SSR: only use query param
      setUseEnhanced(enhanced);
    }
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-4" height="3rem" />
        <Skeleton className="mb-4" height="2rem" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton height="20rem" />
          <Skeleton height="20rem" />
        </div>
      </div>
    );
  }

  return useEnhanced ? (
    <EnhancedCreateOrderWizard />
  ) : (
    <CreateOrderWizard />
  );
};

const page = () => {
  return (
    <DefaultLayout>
      <Suspense fallback={
        <div className="p-6">
          <Skeleton className="mb-4" height="3rem" />
          <Skeleton className="mb-4" height="2rem" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton height="20rem" />
            <Skeleton height="20rem" />
          </div>
        </div>
      }>
        <OrderCreateContent />
      </Suspense>
    </DefaultLayout>
  );
};

export default page;
