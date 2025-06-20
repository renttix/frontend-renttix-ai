import DefaultLayout from "@/components/Layouts/DefaultLaout";
import TaxClasses from "@/components/system-setup/tax-classes/TaxClasses";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <TaxClasses />
      </DefaultLayout>
    </div>
  );
};

export default page;
