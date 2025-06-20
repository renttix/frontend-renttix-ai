import CreateCustomerWizard from "@/components/customer/CreateCustomerWizard";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <CreateCustomerWizard />
      </DefaultLayout>
    </div>
  );
};

export default page;
