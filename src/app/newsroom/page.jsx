import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <div className="bg-gray-50 text-dark-2">
        <div class=" mx-auto max-w-6xl p py-5">
          <p class="mb-5 mt-10 text-lg font-semibold">
            Welcome to the Renttix Newsroom!
          </p>
          <p class="mb-5 mt-5">
            Stay up-to-date with the latest news, insights, and updates from
            Renttix. Here, you&apos;ll find everything from product announcements and
            industry trends to company highlights and customer success stories.
            Whether you&apos;re interested in learning about our newest features,
            seeing how rental companies are boosting efficiency with Renttix, or
            staying informed on fleet management innovations, we&apos;ve got you
            covered.
          </p>
          <p class="mb-5 mt-5">
            Explore our latest articles and see how Renttix is helping rental
            businesses worldwide work smarter, not harder.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
