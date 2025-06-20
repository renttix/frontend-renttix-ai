import DefaultLayout from "@/components/Layouts/DefaultLaout";
import InvoiceRunCodeElite from "@/components/system-setup/invoice-run-code/InvoiceRunCodeElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <InvoiceRunCodeElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
