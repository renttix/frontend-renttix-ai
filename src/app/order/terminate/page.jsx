import DefaultLayout from "@/components/Layouts/DefaultLaout";
import TerminateRentalDashboard from "@/components/TerminateRental";
import React from "react";

export const metadata = {
  title: "Terminate Rental | Renttix - Equipment Rental Management",
  description: "Manage rental terminations and off-hire processes",
};

const TerminateRentalPage = () => {
  return (
    <DefaultLayout>
      <TerminateRentalDashboard />
    </DefaultLayout>
  );
};

export default TerminateRentalPage;