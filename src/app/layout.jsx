"use client";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primeicons/primeicons.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import "@/components/ProfileBox/Accessibility.css";

import React, { useEffect, useState } from "react";
import { PrimeReactProvider } from "primereact/api";
import ReduxProvider from "@/components/ReduxProvider";
import useColorMode from "@/hooks/useColorMode";
import { usePathname, useRouter } from "next/navigation";
import { ConfirmDialog } from "primereact/confirmdialog";
import AccessibilityProvider from "@/components/ProfileBox/AccessibilityProvider";
import ColorBlindFilters from "@/components/ProfileBox/ColorBlindFilters";
export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  // useEffect(() => {
  //   const checkOnlineStatus = () => {
  //     setIsOnline(navigator.onLine);
  //     if (!navigator.onLine) {
  //       localStorage.setItem("lastPage", pathname); // Store last visited page
  //       router.push("/no-internet"); // Redirect to No Internet page
  //     }
  //   };

  //   window.addEventListener("online", checkOnlineStatus);
  //   window.addEventListener("offline", checkOnlineStatus);

  //   return () => {
  //     window.removeEventListener("online", checkOnlineStatus);
  //     window.removeEventListener("offline", checkOnlineStatus);
  //   };
  // }, [pathname, router]);


  return (
    <html lang="en">
     
      <body suppressHydrationWarning={true}>
        <ReduxProvider>
          <PrimeReactProvider value={{ unstyled: false, pt: {} }}>
            <AccessibilityProvider>
              <ConfirmDialog />
              <ColorBlindFilters />
              {children}
            </AccessibilityProvider>
          </PrimeReactProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
