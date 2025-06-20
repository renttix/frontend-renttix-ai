import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <div className="bg-gray-50 text-dark-2 py-5">
        <div class=" mx-auto max-w-6xl px-3">
          <p class="mb-5 mt-5 text-lg font-semibold">Careers at Renttix</p>
          <p class="mb-5 mt-5">
            Are you ready to be part of a team that&apos;s transforming the rental
            industry? At Renttix, we&apos;re on a mission to streamline hire and
            sales operations worldwide, and we&apos;re looking for passionate,
            innovative individuals to help us make it happen. Whether you&apos;re an
            experienced professional or just starting your career, we offer a
            collaborative environment where your ideas can truly make an impact.
          </p>
          <p class="mb-5 mt-5">
            When you join Renttix, you&apos;re not just filling a role you&apos;re joining
            a community that values growth, creativity, and the drive to make a
            difference. With opportunities to work on cutting-edge technology,
            develop meaningful solutions, and connect with a global network,
            Renttix is a place where your career can thrive.
          </p>
          <p class="mb-5 mt-5">
            Explore our open positions and discover how you can grow with us!
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
