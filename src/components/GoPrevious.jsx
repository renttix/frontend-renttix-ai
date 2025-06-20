'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

const GoPrevious = ({ label = 'Go Back', className = '' }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Button
      label={label}
      icon="pi pi-arrow-left"
      className={`p-button-secondary ${className}`}
      onClick={handleGoBack}
    />
  );
};

export default GoPrevious;