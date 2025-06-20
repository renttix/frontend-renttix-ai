"use client";
import BlogPost from "@/components/navbar/BlogPost";
import ContactForm from "@/components/navbar/ContactForm";
import Footer from "@/components/navbar/Footer";
import LandingSection from "@/components/navbar/LandingSection";
import MapSection from "@/components/navbar/MapSection";
import NavigationBar from "@/components/navbar/NavigationBar";
import Testimonial from "@/components/navbar/Testimonial";
import TopHeader from "@/components/navbar/TopHeader";
import TrialSub from "@/components/navbar/TrialSub";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect } from "react";

const page = () => {

  return (
    <div>
      
      <NavigationBar />

      <TopHeader />
      <LandingSection />
      <MapSection />
      <BlogPost />
      <Testimonial />
      <TrialSub />
      <ContactForm/>
      <Footer />
    </div>
  );
};

export default page;
