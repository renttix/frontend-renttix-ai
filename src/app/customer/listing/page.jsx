import CustomerListingElite from "@/components/customer/CustomerListingElite";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <CustomerListingElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
