import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddTaxClass from "@/components/system-setup/tax-classes/AddTaxClass";
import UpdateTaxClass from "@/components/system-setup/tax-classes/UpdateTaxClass";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <UpdateTaxClass />
      </DefaultLayout>
    </div>
  );
};

export default page;
