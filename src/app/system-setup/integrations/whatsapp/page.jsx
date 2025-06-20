import DefaultLayout from "@/components/Layouts/DefaultLaout";
import WhatsAppConfig from "@/components/system-setup/integrations/WhatsAppConfig";
import React from "react";

const WhatsAppIntegrationPage = () => {
  return (
    <DefaultLayout>
      <WhatsAppConfig />
    </DefaultLayout>
  );
};

export default WhatsAppIntegrationPage;