import DefaultLayout from "@/components/Layouts/DefaultLaout";
import TwilioConfig from "@/components/system-setup/integrations/TwilioConfig";
import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const page = () => {
  return (
    <>
      <DefaultLayout>
        <Breadcrumb pageName={"Twilio Configuration"} />
        <TwilioConfig />
      </DefaultLayout>
    </>
  );
};

export default page;