import DefaultLayout from "@/components/Layouts/DefaultLaout";
import AddProductElite from "@/components/product/AddProductElite";
import React from "react";

const page = () => {
  return (
    <div>
      <DefaultLayout>
        <AddProductElite />
      </DefaultLayout>
    </div>
  );
};

export default page;
