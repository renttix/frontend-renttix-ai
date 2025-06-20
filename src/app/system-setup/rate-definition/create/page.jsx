import DefaultLayout from "@/components/Layouts/DefaultLaout";
import CreateRateDefinitionElite from "@/components/system-setup/rate-defination/CreateRateDefinitionElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <CreateRateDefinitionElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
