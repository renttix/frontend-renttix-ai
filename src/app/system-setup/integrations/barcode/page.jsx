import DefaultLayout from "@/components/Layouts/DefaultLaout";
import BarcodeConfig from "@/components/system-setup/integrations/BarcodeConfig";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const BarcodeConfigPage = () => {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName={"Barcode Configuration"} />
        <BarcodeConfig />
      </DefaultLayout>
    </>
  );
};

export default BarcodeConfigPage;