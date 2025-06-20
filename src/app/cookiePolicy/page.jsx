import Footer from "@/components/navbar/Footer";
import NavigationBar from "@/components/navbar/NavigationBar";
import React from "react";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <div class="bg-gray-50 my-2 ">
        <div class="mx-auto max-w-6xl px-4 py-14 text-dark-2">
          <div class="mb-8">
            <h1 class="mb-4 text-center text-3xl font-bold sm:text-left">
              Cookie Policy for Renttix.com
            </h1>
            <p class="leading-relaxed ">
              At Renttix, we use cookies—small text files containing information
              that are downloaded to your device when you visit our website.
              These cookies are sent back to us on each of your visits or to
              other websites that recognize the same cookie. They help websites
              recognize your device and improve user experience. For more
              details on cookies and how to manage them via your browser
              settings or other tools, please visit:
              <a
                class="mx-1 text-blue-600 hover:underline"
                href="http://www.allaboutcookies.org"
              >
                www.allaboutcookies.org
              </a>
              and
              <a
                class="ml-1 text-blue-600 hover:underline"
                href="http://www.youronlinechoices.eu"
              >
                www.youronlinechoices.eu
              </a>
              .
            </p>
          </div>
          <div>
            <h1 class="mb-4 text-center text-3xl font-bold sm:text-left">
              We use the following types of cookies:
            </h1>
            <ul class="list-inside list-disc space-y-4 leading-relaxed ">
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary
                for the proper functioning of our website, such as enabling you
                to complete forms or navigate the site.
              </li>
              <li>
                <strong>Analytical Cookies:</strong> These cookies allow us to
                track visitor numbers and analyze how users interact with our
                website. This helps us enhance site functionality and ensure
                that visitors can easily find what they need.
              </li>
              <li>
                <strong>Marketing Cookies:</strong> These cookies recognize you
                on return visits, allowing us to customize our content based on
                your preferences and interests. They also track your activity on
                our site, such as pages visited and links clicked, so we can
                offer more relevant communications and advertisements.
              </li>
              <li>
                Additionally, we may use other technologies such as device
                identifiers, beacons, pixels, tags, and similar tools for
                similar purposes. Please note that third-party ad networks may
                set their own cookies or other technologies when you access
                advertisements through our site, allowing them to view or modify
                those cookies just as if you had visited their website directly.
              </li>
              <li>
                By using{" "}
                <a
                  class="ml-1 text-blue-600 hover:underline"
                  href="http://www.renttix.com"
                >
                  Renttix.com
                </a>
                , you consent to the use of these cookies and technologies.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default page;
