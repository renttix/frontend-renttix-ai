import React from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLaout";
import Signin from "@/components/Auth/Signin";
import NavigationBar from "@/components/navbar/NavigationBar";

export const metadata = {
  title: "Next.js Login Page | NextAdmin - Next.js Dashboard Kit",
  description: "This is Next.js Login Page NextAdmin Dashboard Kit",
};

const page = () => {
  return (
    <>
      {/* <NavigationBar /> */}
      <div className=" mt-10 flex items-center justify-center md:mt-0 md:h-screen">
        <div className="my-auto w-[80%]">
          {/* <Breadcrumb pageName="Sign In" /> */}

          <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
            <div className="flex flex-wrap items-center">
              <div className="w-full xl:w-1/2">
                <div className="w-full p-4 sm:p-12.5 xl:p-15">
                  <Signin />
                </div>
              </div>

              <div className="relative hidden w-full p-7.5 xl:block xl:w-1/2">
                <div className="relative">
                  <img
                    src="/images/auth/auth-bg.png"
                    className="w-full"
                    alt=""
                  />
                </div>
                <div className=" custom-gradient-1 absolute top-0 h-[100%] flex-col overflow-hidden rounded-2xl  px-12.5 pt-12.5 dark:!bg-dark-2 dark:bg-none ">
                  <Link className="mb-10 inline-block" href="/">
                    <Image
                      className="hidden dark:block"
                      src={"/images/logo/logo.svg"}
                      alt="Logo"
                      width={176}
                      height={32}
                    />
                    <Image
                      className="dark:hidden"
                      src={"/images/logo/logo-dark.svg"}
                      alt="Logo"
                      width={176}
                      height={32}
                    />
                  </Link>
                  <p className="mb-3 text-xl font-medium text-dark dark:text-white">
                    Sign in to your account
                  </p>

                  <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white sm:text-heading-3">
                    Welcome Back!
                  </h1>

                  <p className="w-full max-w-[375px] font-medium text-dark-4 dark:text-dark-6">
                    Please sign in to your account by completing the necessary
                    fields below
                  </p>

                  <div className="mt-31">
                    <Image
                      src={"/images/grids/grid-02.svg"}
                      alt="Logo"
                      width={405}
                      height={325}
                      className="mx-auto dark:opacity-30"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
