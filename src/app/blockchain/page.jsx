import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <div className="bg-gray-50 py-8 text-dark-2">
        <div class="mx-auto  max-w-6xl px-3">
          <p class="mb-5 mt-5 text-lg font-semibold">
            Blockchain Asset Tracking
          </p>
          <p class="mb-5 mt-5">
            At Renttix, we&apos;re bringing a new level of transparency and security
            to asset tracking through blockchain technology. By tokenizing each
            piece of equipment, we create a unique digital identity on a
            decentralized ledger. This means you can trace every step of an
            asset&apos;s journey from acquisition to decommissioning, with an
            unchangeable record of maintenance, ownership, and usage.
          </p>
          <p class="mb-5 mt-5">
            How Renttix Implements Asset Tracking Through Tokenization
          </p>
          <p class="mb-5 mt-5">
            We use blockchain to assign a token&apos;a unique digital identifier&apos;to
            each piece of rental equipment. This token holds real-time data
            about the asset&apos;s location, usage hours, and maintenance history.
            Because it&apos;s on the blockchain, this information is stored securely
            and can&apos;t be altered. Our clients benefit from full asset visibility
            and increased accountability, which means better planning, reduced
            loss, and higher equipment utilization. Plus, this secure tracking
            method helps foster trust with customers by showing exactly how
            assets are managed over time.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
