import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <div className="bg-gray-50 text-dark-2">
        <div class=" mx-auto max-w-6xl px-3 py-[120px]">
          <h1 class=" pb-5 text-xl font-semibold">
            About Renttix: Revolutionizing Rental Management for Businesses
            Worldwide
          </h1>
          <p>
            At Renttix, we’re all about simplifying the rental process and
            empowering businesses, big and small, to operate seamlessly. Our
            platform is a complete rental solution designed to streamline
            everything from hire and sales order processing to invoicing and
            e-commerce operations. With seamless integration into leading
            accounting systems and CRM capabilities, Renttix adapts to the
            unique needs of each business, helping them work smarter, boost
            profitability, and enhance customer satisfaction. Whether you’re
            managing a large rental fleet or just starting, Renttix is here to
            support your journey every step of the way.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
