import React from "react";

const MapSection = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto  py-16   md:py-40 ">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <label
              htmlFor=""
              className="text-center text-[25px] lg:text-[56px] font-bold leading-5 md:leading-[57px] md:text-[30px] text-dark-2"
            >
              Over 6000 rental businesses already use us, why dont you?
            </label>
          </div>
          <div className="flex">
          
            <a
                  href="/signin"
                  className="group relative overflow-hidden rounded-full border border-orange-500 bg-orange-500 px-8 py-3 font-medium text-white transition-transform duration-300 ease-in-out"
                >
                  <span className="relative z-10">Join them now</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-500 ease-out group-hover:translate-x-0"></span>
                </a>
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="w-full ">
            <img src="/images/sections/maps.png" className="w-full" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
