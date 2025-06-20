import DefaultLayout from "@/components/Layouts/DefaultLaout";
import SendGridConfig from "@/components/system-setup/integrations/SendGridConfig";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const page = () => {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName={"SendGrid Configuration"} />
        <SendGridConfig />
      </DefaultLayout>
    </>
  );
};

export default page;