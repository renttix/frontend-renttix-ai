import { Tag } from "primereact/tag";
import React, { useEffect, useRef } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuLayoutTemplate } from "react-icons/lu";
import { IoSyncCircleOutline } from "react-icons/io5";
import { LuInbox } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingSection = () => {
  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const checklistRef = useRef([]);

  useEffect(() => {
    // Header animation
    gsap.from(headerRef.current, {
      opacity: 0,
      y: -50,
      duration: 1,
      ease: "power3.out",
    });

    // Image animation
    gsap.from(imageRef.current, {
      opacity: 0,
      scale: 0.8,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: imageRef.current,
        start: "top 80%",
      },
    });

    // Checklist animations
    checklistRef.current.forEach((item, index) => {
      gsap.from(item, {
        opacity: 0,
        x: -30,
        duration: 0.6,
        delay: index * 0.2,
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
        },
      });
    });
  }, []);

  return (
    <div className="bg-white">
      <section className="mx-auto  max-w-screen-2xl p-4 pt-40 ">
        <div className="grid grid-cols-1 gap-20 py-4  sm:grid-cols-1 md:grid-cols-2 md:gap-40">
          <div className="transition-transform duration-300 hover:scale-110">
            <img src="/images/sections/image.png" className="p-8" alt="" />
          </div>
          <div className="flex flex-col gap-8">
            <div className="">
              <Tag severity={"warning"} value="BOOST EFFICIENCY"></Tag>
            </div>
            <label
              htmlFor=""
              className="text-[25px] font-semibold leading-8 text-dark-2"
            >
              Streamline Your Rental Operations with Intuitive Tools
            </label>
            <div className="mt-5">
              <label htmlFor="">
                Transform how you manage your rental business with Renttix&apos;s
                cutting-edge dashboard. Gain actionable insights, optimize
                workflows, and save time by automating essential processes.
              </label>
            </div>

            {[
              "Simplify contract management and reduce turnaround time with our easy-to-use, single-page workflow.",
              "Enjoy one-click calls, automated scripts, and voicemail management, saving you hours each week.",
              " Keep your sales process on target by tracking stages and milestones of your deals.",
            ].map((item, index) => (
              <>
                <div
                  key={index}
                  ref={(el) => (checklistRef.current[index] = el)}
                  className="flex items-center justify-start gap-4"
                >
                  <div className="">
                    <IoIosCheckmarkCircleOutline className="text-[20px] text-orange-500" />
                  </div>
                  <div className="">
                    <label htmlFor="" className="text-[18px] ">
                      {item}
                    </label>
                  </div>
                </div>
              </>
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <div className="">
              <Tag severity={"warning"} value="IN-DEPTH DATA INSIGHTS"></Tag>
            </div>
            <label
              htmlFor=""
              className="text-[25px] font-semibold leading-8 text-dark-2"
            >
              Unlock Actionable Intelligence for Your Rental Business
            </label>
            <div className="">
              <label htmlFor="">
                Empower your operations with real-time data and analytics that
                drive smarter decisions. Renttix&apos;s dynamic reporting tools
                provide an unparalleled view of your fleet efficiency, delivery
                status, and operational trends—helping you stay ahead of the
                competition.
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                className="flex flex-col gap-2"
                ref={(el) => (checklistRef.current[0] = el)}
              >
                <div className="flex   h-13 w-13 items-center justify-center rounded-full bg-orange-500">
                  <LuLayoutTemplate className="text-[30px] text-white" />
                </div>
                <label className="text-[26px]" htmlFor="">
                  Dynamic Dashboard
                </label>
                <label htmlFor="" className="text-[18px">
                  Bring clarity to your operations with a visually stunning
                  dashboard that combines multiple reports into one seamless
                  interface.
                </label>
              </div>
              <div
                className="flex flex-col gap-2"
                ref={(el) => (checklistRef.current[1] = el)}
              >
                <div className="flex  h-13 w-13 items-center justify-center rounded-full bg-orange-500">
                  <IoSyncCircleOutline className="text-[30px] text-white" />
                </div>
                <label className="text-[26px]" htmlFor="">
                  Continuous Data Sync
                </label>
                <label htmlFor="" className="text-[18px">
                  Say goodbye to data silos with Renttix. Our platform ensures
                  real-time synchronization, delivering accurate, up-to-date
                  insights to keep your business in harmony.
                </label>
              </div>
            </div>
          </div>
          <div className="transition-transform duration-300 hover:scale-110">
            <img src="/images/sections/image2.png" alt="" />
          </div>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="flex">
            <a
              href="#"
              className="group relative overflow-hidden rounded-full border  border-orange-500 px-12 py-3 font-medium text-[#131314] transition-transform duration-300 ease-in-out hover:text-white"
            >
              <span className="relative z-10">Start free trial</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-500 ease-out group-hover:translate-x-0"></span>
            </a>
          </div>
        </div>
      </section>
      <section className="mx-auto mb-10 max-w-screen-2xl p-4 md:mb-40 ">
        <div className="flex flex-col items-center justify-center gap-6">
          <label
            ref={(el) => (checklistRef.current[0] = el)}
            htmlFor=""
            className="text-2xl font-bold text-dark-2 md:text-3xl lg:text-6xl"
          >
            Streamline Your Business with Renttix
          </label>
          <label htmlFor="" className="text-center">
            Simplify Operations, Boost Productivity, and Drive Growth.
          </label>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div
              className="flex  justify-start gap-5"
              ref={(el) => (checklistRef.current[1] = el)}
            >
              <div className="">
                <LuInbox className="text-[30px] text-orange-500" />
              </div>
              <label className="">
                <span htmlFor="" className="text-[18px] font-semibold">
                  Easily create, manage and fulfill orders. <br />
                </span>
                Easily create, manage and fulfill orders. Whether you serve
                walk-ins or accept online bookings, Renttix makes it effortless
                to create and track orders.
              </label>
            </div>
            <div
              className="flex  justify-start gap-5"
              ref={(el) => (checklistRef.current[2] = el)}
            >
              <div className="">
                <IoSettingsOutline className="text-[30px] text-orange-500" />
              </div>
              <label className="">
                <span htmlFor="" className="text-[18px] font-semibold">
                  Automate your inventory management. <br />
                </span>
                Say goodbye to double bookings and shortages.
              </label>
            </div>
            <div
              className="flex  justify-start gap-5"
              ref={(el) => (checklistRef.current[3] = el)}
            >
              <div className="">
                <HiOutlineDocumentPlus className="text-[30px] text-orange-500" />
              </div>
              <label className="">
                <span htmlFor="" className="text-[18px] font-semibold">
                  Create quotes, contracts, and invoices, <br />
                </span>
                Generate professional quotes, manage contracts, and send
                invoices—all from one dashboard.
              </label>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="transition-transform duration-300 hover:scale-110 ">
              <img src="/images/sections/dashobard.png" alt="" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto my-5  max-w-screen-2xl p-4 md:my-20 ">
        <div className="flex flex-col items-center justify-center gap-6">
          <label
            ref={(el) => (checklistRef.current[0] = el)}
            htmlFor=""
            className="text-[25px]  font-bold leading-5 text-dark-2 md:text-[40px] md:leading-[70px] lg:text-[56px]"
          >
            Get paid in advance and reduce no-shows
          </label>
          <label htmlFor="" className="text-center">
            Secure Payments, Better Commitment, and Reliable Bookings.
          </label>
          <div className="grid grid-cols-1 rounded-3xl bg-[#F0F0F0] px-8 md:grid-cols-2">
            <div className="flex flex-col justify-center gap-5">
              <div className="py-3">
                <label
                  htmlFor=""
                  className="rounded-full bg-white px-3 text-[18px] text-orange-500"
                >
                  INTEGRATION
                </label>
              </div>
              <div className="">
                <label
                  ref={(el) => (checklistRef.current[0] = el)}
                  htmlFor=""
                  className="text-[25px]  font-bold leading-8 text-dark-2 md:text-[40px] md:leading-[70px] lg:text-[56px]"
                >
                  Seamlessly Connect with Tools You Already Use.
                </label>
              </div>
              <div className="">
                <label htmlFor="" className="text-dark-2">
                  Renttix integrates with the world’s most trusted payment
                  platforms like Visa, Apple Pay, PayPal, and Mastercard. Manage
                  payments effortlessly with tools your customers know and
                  trust, making transactions quick and secure.
                </label>
              </div>
              <label htmlFor="" className="cursor-pointer text-primary">
                View all Integration
              </label>
            </div>
            <div className="flex items-center justify-center">
              <img src="/images/sections/sharedoc.png" alt="" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto  max-w-screen-2xl px-4 py-40 ">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <label
              htmlFor=""
              className="text-center text-[25px] font-bold leading-5 text-dark-2 md:text-[40px] md:leading-[57px] lg:text-[56px]"
              ref={(el) => (checklistRef.current[4] = el)}
            >
              Serve customers faster with order management on mobile
            </label>
          </div>
          <div className="text-center md:w-[50%]">
            <label htmlFor="" className="text-center">
              Manage Your Rental Business Anytime, Anywhere <br />
              With Renttix&apos;s mobile app, you can take your rental
              operations on the go. From creating orders to managing pickups,
              our app ensures seamless service for your customers while keeping
              your business running smoothly.
            </label>
          </div>
          <div className="flex gap-4">
            <div className="cursor-pointer transition-transform duration-300 hover:scale-110">
              <img src="/images/sections/googleplay.png" alt="" />
            </div>
            <div className="cursor-pointer transition-transform duration-300 hover:scale-110">
              <img src="/images/sections/appstore.png" alt="" />
            </div>
          </div>
          <div className="transition-transform duration-300 hover:scale-110">
            <img src="/images/sections/Background.png" alt="" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingSection;
