import DefaultLayout from "@/components/Layouts/DefaultLaout";
import RateDefinitionElite from "@/components/system-setup/rate-defination/RateDefinitionElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <RateDefinitionElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
