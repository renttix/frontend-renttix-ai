import DefaultLayout from "@/components/Layouts/DefaultLaout";
import CreateInvoiceRunCodeElite from "@/components/system-setup/invoice-run-code/CreateInvoiceRunCodeElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <CreateInvoiceRunCodeElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
