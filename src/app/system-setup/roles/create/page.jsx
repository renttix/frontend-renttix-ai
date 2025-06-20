import DefaultLayout from "@/components/Layouts/DefaultLaout";
import CreateRoleElite from "@/components/system-setup/roles/CreateRoleElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <CreateRoleElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
