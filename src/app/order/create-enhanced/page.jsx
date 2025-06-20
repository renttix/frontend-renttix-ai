"use client";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import EnhancedCreateOrderWizard from "@/components/order/CreateOrderWizard/EnhancedCreateOrderWizard";
import React from "react";

const EnhancedOrderCreatePage = () => {
  return (
    <DefaultLayout>
      <EnhancedCreateOrderWizard />
    </DefaultLayout>
  );
};

export default EnhancedOrderCreatePage;