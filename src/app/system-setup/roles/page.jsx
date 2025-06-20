import DefaultLayout from "@/components/Layouts/DefaultLaout";
import RolesListingElite from "@/components/system-setup/roles/RolesListingElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <RolesListingElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
