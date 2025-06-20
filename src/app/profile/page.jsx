import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import UserPreferencesElite from "@/components/ProfileBox/UserPreferencesElite";

export const metadata = {
  title: "User Profile & Preferences | Renttix",
  description: "Manage your personal information and preferences",
};

const Profile = () => {
  return (
    <DefaultLayout>
      <div className="">
        <UserPreferencesElite />
      </div>
    </DefaultLayout>
  );
};

export default Profile;
