import DefaultLayout from "@/components/Layouts/DefaultLaout";
import SMTPConfig from "@/components/system-setup/integrations/SMTPConfig";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const page = () => {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName={"SMTP Configuration"} />
        <SMTPConfig />
      </DefaultLayout>
    </>
  );
};

export default page;