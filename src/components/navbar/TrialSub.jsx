import { Button } from "primereact/button";
import React from "react";

const TrialSub = () => {
  return (
    <section className="mx-auto  max-w-screen-2xl rounded-2xl  bg-[#F0F0F0] p-4 ">
      <div className="flex w-full flex-col items-center gap-6  ">
        <div className="flex flex-col gap-3 p-2 text-center text-[#131314]">
          <label
            htmlFor=""
            className="text-[30px] font-semibold leading-tight text-[#131314] md:text-[40px] sm:text-[55px] lg:text-[60px]"
          >
           Discover the Power of Renttix
          </label>
          <label
            htmlFor=""
            className="text-[16px] sm:text-[18px] md:text-[22px]"
          >
           From seamless order management to automated invoicing, experience tools that help you save time and boost profits.
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex space-x-4">
                
                <a
                  href="#"
                  className="group relative overflow-hidden rounded-lg border text-[14px]  md:text-[19px] border-orange-500 bg-orange-500 px-10 py-4 font-medium text-white transition-transform duration-300 ease-in-out"
                >
                  <span className="relative z-10">Start free trial</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-500 ease-out group-hover:translate-x-0"></span>
                </a>

                <a
                  href="#"
                  className="group relative overflow-hidden rounded-lg text-[14px]  md:text-[19px]  border  border-orange-500 px-10 py-4 font-medium text-[#131314] transition-transform duration-300 ease-in-out hover:text-white"
                >
                  <span className="relative z-10">Watch Demo</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-500 ease-out group-hover:translate-x-0"></span>
                </a>
              </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-[16px] text-[#131314] sm:text-[18px]">
            <i className="pi pi-check-circle text-orange-400" />
            <label htmlFor="">Free 14-day trial</label>
          </div>
          <div className="flex items-center gap-2 text-[16px] text-[#131314] sm:text-[18px]">
            <i className="pi pi-check-circle text-orange-400" />
            <label htmlFor="">No credit card required</label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrialSub;
