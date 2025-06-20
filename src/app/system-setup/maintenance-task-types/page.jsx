'use client';

import React from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLaout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MaintenanceTaskTypes from '@/components/system-setup/MaintenanceTaskTypes';

export default function MaintenanceTaskTypesPage() {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Maintenance Task Types" />
      <MaintenanceTaskTypes />
    </DefaultLayout>
  );
}