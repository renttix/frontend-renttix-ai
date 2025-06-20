import React from 'react';
import { Skeleton } from 'primereact/skeleton';
import { motion } from 'framer-motion';

export function ProductSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Bundle Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton width="60px" height="60px" className="mx-auto mb-3" />
            <Skeleton width="80%" height="20px" className="mx-auto mb-2" />
            <Skeleton width="100%" height="15px" className="mb-1" />
            <Skeleton width="100%" height="15px" className="mb-3" />
            <Skeleton width="60%" height="30px" className="mx-auto" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
        <Skeleton width="80px" height="20px" />
        <Skeleton width="150px" height="20px" />
        <Skeleton width="100px" height="20px" />
        <Skeleton width="80px" height="20px" />
        <Skeleton width="120px" height="20px" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border-b">
          <Skeleton width="60px" height="60px" shape="square" />
          <div className="flex-1">
            <Skeleton width="60%" height="18px" className="mb-1" />
            <Skeleton width="40%" height="14px" />
          </div>
          <Skeleton width="80px" height="16px" />
          <Skeleton width="60px" height="16px" />
          <Skeleton width="100px" height="32px" />
        </div>
      ))}
    </motion.div>
  );
}

export function FormSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <Skeleton width="200px" height="28px" className="mb-2" />
        <Skeleton width="300px" height="20px" />
      </div>
      
      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Skeleton width="100px" height="16px" className="mb-2" />
          <Skeleton width="100%" height="40px" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton width="80px" height="16px" className="mb-2" />
            <Skeleton width="100%" height="40px" />
          </div>
          <div>
            <Skeleton width="80px" height="16px" className="mb-2" />
            <Skeleton width="100%" height="40px" />
          </div>
        </div>
        
        <div>
          <Skeleton width="120px" height="16px" className="mb-2" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="80px" height="36px" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MapSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative h-96 bg-gray-100 rounded-lg overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Skeleton width="60px" height="60px" shape="circle" className="mx-auto mb-3" />
          <Skeleton width="150px" height="20px" className="mx-auto mb-2" />
          <Skeleton width="200px" height="16px" className="mx-auto" />
        </div>
      </div>
      
      {/* Map controls skeleton */}
      <div className="absolute top-4 right-4 space-y-2">
        <Skeleton width="32px" height="32px" />
        <Skeleton width="32px" height="32px" />
      </div>
    </motion.div>
  );
}

// Shimmer effect for enhanced loading experience
export function ShimmerCard() {
  return (
    <div className="relative overflow-hidden rounded-lg border p-4">
      <div className="animate-pulse space-y-3">
        <Skeleton width="60%" height="20px" />
        <Skeleton width="100%" height="16px" />
        <Skeleton width="80%" height="16px" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton width="80px" height="24px" />
          <Skeleton width="100px" height="36px" />
        </div>
      </div>
      
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

// Add shimmer animation to your CSS
const shimmerStyles = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;