import Link from "next/link";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import React from "react";

















const Footer = () => {
  const sections = [
    {
      title: "Company",
      links: [
        { name: "About Renttix", route: "/about-renttix" },
        { name: "Corporate Responsibility", route: "/corporate-responsibility" },
        { name: "Newsroom", route: "/newsroom" },
        { name: "Careers", route: "/careers" },
      ],
    },
    {
      title: "Additional Services",
      links: [
        { name: "Sales Tax and VAT", route: "/sales-management" },
        { name: "Partner with Renttix", route: "/features" },
        { name: "Join as a Verified Supplier", route: "/product-updates" },
        { name: "Blockchain Asset Tracking", route: "/blockchain" },
      ],
    },
    {
      title: "Get support",
      links: [
        { name: "Help Center", route: "/blog" },
        { name: "Live chat", route: "/customer-stories" },
        { name: "Report an Issue", route: "/report-issue" },
        { name: "Data Processing Agreement", route: "/data-processing" },
        { name: "General Terms", route: "/general-terms" },
        { name: "Cookie Policy", route: "/cookiePolicy" },
        { name: "Privacy Statement", route: "/privacy-statement" },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-screen-2xl rounded-2xl p-4 pt-10">
      <div className="py-7">
        <img src="/images/logo/logo-dark.svg" alt="Logo" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <div key={index} className="flex flex-col gap-2 md:gap-5">
              <h2 className="text-[15px] md:text-[20px] font-bold text-dark-2">
                {section.title}
              </h2>
              {section.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.route}
                  className="text-[14px] md:text-[18px] text-dark-2"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div>
          <div className="mb-5">
            <h2 className="text-[15px] md:text-[20px] font-bold text-dark-2">
              Subscribe to our newsletter
            </h2>
          </div>
          <div className="relative w-full">
            <input
              type="email"
              className="w-full rounded-full border border-orange-500 px-4 py-4 focus:outline-none"
              placeholder="Enter your Email"
            />
            <a
              href="#"
              className="absolute right-[5px] top-[5px] rounded-full bg-orange-500 px-8 py-3 font-medium text-white shadow-md transition hover:bg-orange-600"
            >
              Try for free
            </a>
          </div>
          <div className="py-4">
            <p className="text-[14px] md:text-[18px] text-dark-2">
              Stay ahead with the latest updates, tips, and news from Renttix. Enter your
              email and join our growing community of rental business leaders.
            </p>
          </div>
        </div>
      </div>

      <div className="my-5 w-full bg-black h-px"></div>

      <div className="flex items-center justify-between">
        <div className="flex gap-5">
          <a href="#" className="text-[14px] md:text-[18px] text-dark-2">
            Terms & Conditions
          </a>
          <a href="#" className="text-[14px] md:text-[18px] text-dark-2">
            Privacy Policy
          </a>
        </div>
        <p className="text-[14px] md:text-[18px] text-dark-2">
          © {new Date().getFullYear()}. All Rights Reserved
        </p>
      </div>
    </section>
  );
};

export default Footer;


