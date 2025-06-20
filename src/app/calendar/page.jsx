import DefaultLayout from "@/components/Layouts/DefaultLaout";
import RentalCalendar from "@/components/RentalCalendar";
import React from "react";

export const metadata = {
  title: "Rental Calendar | Renttix - Equipment Rental Management",
  description: "Manage deliveries and collections with the Renttix rental calendar",
};

const CalendarPage = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-full">
        <RentalCalendar />
      </div>
    </DefaultLayout>
  );
};

export default CalendarPage;
