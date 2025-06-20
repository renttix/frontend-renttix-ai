import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RentalBaseSchedule from "@/components/FullCalendarComponent/RentalBaseSchedule";

export const metadata = {
  title: "Rental Base Schedule | RentTix",
  description: "Rental Base Schedule with Resource-Timeline Views",
};

const BaseSchedulePage = () => {
  return (
    <DefaultLayout>
      <div className="">
        {/* <Breadcrumb pageName="Rental Base Schedule" /> */}
        <RentalBaseSchedule />
      </div>
    </DefaultLayout>
  );
};

export default BaseSchedulePage;
