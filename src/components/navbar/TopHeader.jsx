import { Button } from "primereact/button";
import React, { useEffect, useRef } from "react";
import { SiTelegram } from "react-icons/si";
import { BsShieldLockFill } from "react-icons/bs";
import { AiOutlineGlobal } from "react-icons/ai";

import { gsap } from "gsap";
import { useDispatch } from "react-redux";
import { fetchLocationData } from "@/store/locationSlice";

const TopHeader = () => {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const textRef = useRef([]);
  const dispatch = useDispatch()
  useEffect(()=>{
    dispatch(fetchLocationData());
    },[])
  useEffect(() => {
    // Header animation
    gsap.from(headerRef.current, {
      opacity: 0,
      y: -50,
      duration: 1.5,
      ease: "power2.out",
    });

    // Cards animation
    gsap.from(cardsRef.current, {
      opacity: 0,
      y: 50,
      stagger: 0.3,
      duration: 1,
      ease: "power2.out",
    });

    // Text animation
    gsap.from(textRef.current, {
      opacity: 0,
      scale: 0.8,
      stagger: 0.2,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
    });
  }, []);

  const DynamicIcon = ({ Icon }) => {
    return (
      <div className="">
        <Icon
          className={`text-[50px] 
            text-[#28170B] group-hover:text-white
            sm:text-[75px]`}
        />
      </div>
    );
  };
  return (
    <div className="relative flex flex-col items-center justify-center bg-white text-[#131314]">
      <div className="absolute top-0 w-full">
        <img src="/images/navbar/Gradient.svg" className="w-full" alt="" />
      </div>
      <div className=" cover flex  w-full flex-col items-center justify-center bg-white bg-no-repeat  px-4 ">
        <div className="absolute top-[20px]">
          <img
            className="flex  animate-pendulum"
            src="/images/navbar/lines.svg"
            alt=""
          />
        </div>
        <div className=" flex max-w-screen-2xl flex-wrap items-center justify-between">
          <div className="mt-0 flex h-[100vh] w-full flex-col items-center justify-center gap-6">
            <div
              ref={(el) => (textRef.current[0] = el)}
              className="mt-[-3rem] flex flex-col gap-3 p-2 text-center"
            >
              <label
                htmlFor=""
                className="text-2xl font-bold  md:text-6xl lg:text-6xl"
              >
                Simplify Your Rental Business <br /> with Renttix
              </label>
              <div className="flex items-center justify-center   ">
                <label
                  htmlFor=""
                  className="py-2 text-[16px]  sm:text-[18px] md:text-[22px] lg:w-[50%] "
                >
                  The all-in-one rental software designed to streamline
                  operations, maximize profits, and deliver an exceptional
                  customer experience. Rent smarter, not harder.
                </label>
              </div>
            </div>
            <div
              ref={(el) => (textRef.current[1] = el)}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="group relative overflow-hidden rounded-lg border border-orange-500  bg-orange-500 px-10 py-4 text-[14px] font-medium text-white transition-transform duration-300 ease-in-out md:text-[19px]"
                >
                  <span className="relative z-10">Start free trial</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-500 ease-out group-hover:translate-x-0"></span>
                </a>

                <a
                  href="#"
                  className="group relative overflow-hidden rounded-lg border  border-orange-500  px-10  py-4 text-[14px] font-medium text-[#131314] transition-transform duration-300 ease-in-out hover:text-white md:text-[19px]"
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
            <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-8 sm:gap-12 md:mt-40 ">
              {[
                "/images/navbar/quickbook.svg",
                "/images/navbar/verify.svg",
                "/images/navbar/xero.svg",
                "/images/navbar/gohire.svg",
              ].map((src, index) => (
                <div
                  key={index}
                  className="relative flex items-center justify-center transition-transform duration-500"
                >
                  <img
                    src={src}
                    alt=""
                    className=" transition-transform duration-500 ease-in-out hover:scale-110 "
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className=" flex flex-col items-center justify-center">
        <span className="mb-1 block text-2xl font-bold text-[#131314] md:text-3xl lg:text-6xl ">
          Seamless Integration with
        </span>
        <div className="mb-3 text-2xl font-bold text-primary md:text-3xl lg:text-6xl">
          Industry-Leading Tools
        </div>
        <p className="line-height-3 mb-4 mt-0 p-2 text-center text-[#131314]">
          Renttix integrates effortlessly with QuickBooks, Veriff, Xero, and
          GoHire to simplify your accounting, identity verification, and
          workforce management. Everything you need, in one platform.
        </p>
      </div>
      <div className="mt-14 flex flex-wrap justify-center gap-5 px-4">
        {[
          { icon: SiTelegram, title: " Unmatched Innovation and Versatility" },
          { icon: BsShieldLockFill, title: "Trust and Reliability" },
          { icon: AiOutlineGlobal, title: "A Global Community of Success" },
        ].map((item, i) => (
          <div
            key={i}
            ref={(el) => (cardsRef.current[i] = el)}
            className={`group relative flex h-[144px] w-[300px] cursor-pointer items-center justify-around gap-4 overflow-hidden rounded-xl bg-[#F0F0F0]
        p-4 sm:w-[440px]`}
          >
            <DynamicIcon Icon={item.icon} />

            {/* Animated Background */}
            <div
              className="absolute inset-0 z-[-1] -translate-x-full translate-y-full scale-150
        bg-gradient-to-br from-primary to-primary opacity-0 
        transition-transform duration-500 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            ></div>

            <div></div>
            <div>
              <label
                htmlFor=""
                className={`text-[18px] 
          text-[#28170B] group-hover:text-white
          sm:text-[20px] md:text-[25px]`}
              >
                {item.title}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopHeader;
