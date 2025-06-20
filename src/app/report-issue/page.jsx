import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
        <NavigationBar/>
      <div className="bg-gray-50">
        <div class=" mx-auto max-w-6xl px-3 py-[114px] text-dark-2">
          <p class="margin-top:0pt; margin-bottom:8pt; mb-5 text-lg">
            <strong>
              Report a issue “Let Us Help You Out: Report an Issue with Renttix”
            </strong>
          </p>
          <p class="margin-top:0pt; margin-bottom:8pt;">
          &quot;Welcome to the Renttix Help Center – Here to Make Your Rental
            Experience Easier!&quot;
          </p>
     <br />
          <p class="text-dark-2">
            Looking for quick answers, helpful guides, or personalized support?
            You&apos;ve come to the right place. Our Help Center is designed to
            assist you in getting the most out of Renttix, whether you’re new to
            our platform or a seasoned pro. Let’s make things simple, together!
          </p>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default page;
