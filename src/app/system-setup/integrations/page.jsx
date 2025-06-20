import DefaultLayout from "@/components/Layouts/DefaultLaout";
import IntegrationsEnhanced from "@/components/system-setup/integrations/IntegrationsEnhanced";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const page = () => {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName={"Integrations"} />
        <IntegrationsEnhanced />
      </DefaultLayout>
    </>
  );
};

export default page;
