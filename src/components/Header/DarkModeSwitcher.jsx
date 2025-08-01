import useColorMode from "@/hooks/useColorMode";
import Head from "next/head";
import { useEffect } from "react";
// import "primereact/resources/themes/lara-light-orange/theme.css"
import '../../../public/themes/lara-light-pink/theme.css'

const DarkModeSwitcher = () => {
  const [colorMode, setColorMode] = useColorMode();

  useEffect(() => {
    const themeLink = document.getElementById("theme-link");

    if (themeLink) {
      themeLink.href = `/themes/${
        colorMode === "light"
          ? "lara-light-orange/theme.css"
          : "lara-dark-purple/theme.css"
      }`;
    } else {
      const link = document.createElement("link");
      link.id = "theme-link";
      link.rel = "stylesheet";
      link.href = `/themes/${
        colorMode === "light"
          ? "lara-light-orange/theme.css"
          : "lara-dark-purple/theme.css"
      }`;
      document.head.appendChild(link);
    }
  }, [colorMode]);
  return (
    <>
     <Head>
            {/* The theme link is dynamically managed */}
            <link id="theme-link" rel="stylesheet" href="/themes/lara-light-orange/theme.css" />
          </Head>
   
    <li>
      <div
        onClick={() => {
          if (typeof setColorMode === "function") {
            setColorMode(colorMode === "light" ? "dark" : "light");
          }
        }}
        className={`relative z-10 flex h-12 w-[96px] cursor-pointer items-center gap-2.5 rounded-full bg-gray-3 p-[5px] text-dark dark:bg-[#020d1a] dark:text-white`}
      >
        <div
          className={`absolute left-0.5 top-1/2 z-1 h-9.5 w-9.5 -translate-y-1/2 rounded-full bg-white transition-transform duration-300 ease-in-out dark:bg-dark-3 ${colorMode === "dark" ? "translate-x-[51px]" : "translate-x-[3px]"}`}
        />

        <span className="relative z-10 flex h-9.5 w-full max-w-9.5 items-center justify-center">
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 1.0415C10.3452 1.0415 10.625 1.32133 10.625 1.6665V2.49984C10.625 2.84502 10.3452 3.12484 10 3.12484C9.65484 3.12484 9.37502 2.84502 9.37502 2.49984V1.6665C9.37502 1.32133 9.65484 1.0415 10 1.0415ZM3.66553 3.66535C3.90961 3.42127 4.30533 3.42127 4.54941 3.66535L4.87678 3.99271C5.12085 4.23679 5.12085 4.63252 4.87678 4.87659C4.6327 5.12067 4.23697 5.12067 3.99289 4.87659L3.66553 4.54923C3.42145 4.30515 3.42145 3.90942 3.66553 3.66535ZM16.3343 3.66556C16.5784 3.90964 16.5784 4.30537 16.3343 4.54945L16.0069 4.87681C15.7629 5.12089 15.3671 5.12089 15.123 4.87681C14.879 4.63273 14.879 4.237 15.123 3.99293L15.4504 3.66556C15.6945 3.42148 16.0902 3.42148 16.3343 3.66556ZM10 5.62484C7.58377 5.62484 5.62502 7.58359 5.62502 9.99984C5.62502 12.4161 7.58377 14.3748 10 14.3748C12.4163 14.3748 14.375 12.4161 14.375 9.99984C14.375 7.58359 12.4163 5.62484 10 5.62484ZM4.37502 9.99984C4.37502 6.89324 6.89342 4.37484 10 4.37484C13.1066 4.37484 15.625 6.89324 15.625 9.99984C15.625 13.1064 13.1066 15.6248 10 15.6248C6.89342 15.6248 4.37502 13.1064 4.37502 9.99984ZM1.04169 9.99984C1.04169 9.65466 1.32151 9.37484 1.66669 9.37484H2.50002C2.8452 9.37484 3.12502 9.65466 3.12502 9.99984C3.12502 10.345 2.8452 10.6248 2.50002 10.6248H1.66669C1.32151 10.6248 1.04169 10.345 1.04169 9.99984ZM16.875 9.99984C16.875 9.65466 17.1548 9.37484 17.5 9.37484H18.3334C18.6785 9.37484 18.9584 9.65466 18.9584 9.99984C18.9584 10.345 18.6785 10.6248 18.3334 10.6248H17.5C17.1548 10.6248 16.875 10.345 16.875 9.99984ZM15.123 15.1229C15.3671 14.8788 15.7629 14.8788 16.0069 15.1229L16.3343 15.4502C16.5784 15.6943 16.5784 16.09 16.3343 16.3341C16.0902 16.5782 15.6945 16.5782 15.4504 16.3341L15.123 16.0067C14.879 15.7627 14.879 15.3669 15.123 15.1229ZM4.87678 15.1231C5.12085 15.3672 5.12085 15.7629 4.87678 16.007L4.54941 16.3343C4.30533 16.5784 3.90961 16.5784 3.66553 16.3343C3.42145 16.0903 3.42145 15.6945 3.66553 15.4504L3.99289 15.1231C4.23697 14.879 4.6327 14.879 4.87678 15.1231ZM10 16.8748C10.3452 16.8748 10.625 17.1547 10.625 17.4998V18.3332C10.625 18.6783 10.3452 18.9582 10 18.9582C9.65484 18.9582 9.37502 18.6783 9.37502 18.3332V17.4998C9.37502 17.1547 9.65484 16.8748 10 16.8748Z"
              fill=""
            />
          </svg>
        </span>
        <span className="relative z-10 flex h-9.5 w-full max-w-9.5 items-center justify-center">
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.18118 2.33448C5.30895 2.74335 2.29169 6.01923 2.29169 9.99984C2.29169 14.257 5.74283 17.7082 10 17.7082C13.9806 17.7082 17.2565 14.6909 17.6654 10.8187C16.5598 12.2222 14.8439 13.1248 12.9167 13.1248C9.57997 13.1248 6.87502 10.4199 6.87502 7.08317C6.87502 5.15599 7.77765 3.44009 9.18118 2.33448ZM1.04169 9.99984C1.04169 5.05229 5.05247 1.0415 10 1.0415C10.5972 1.0415 10.8962 1.51755 10.9474 1.89673C10.9967 2.26148 10.8618 2.72538 10.4426 2.97873C9.05223 3.81884 8.12502 5.34302 8.12502 7.08317C8.12502 9.72954 10.2703 11.8748 12.9167 11.8748C14.6568 11.8748 16.181 10.9476 17.0211 9.55731C17.2745 9.13804 17.7384 9.00321 18.1031 9.05247C18.4823 9.10368 18.9584 9.40265 18.9584 9.99984C18.9584 14.9474 14.9476 18.9582 10 18.9582C5.05247 18.9582 1.04169 14.9474 1.04169 9.99984Z"
              fill=""
            />
          </svg>
        </span>
      </div>
    </li>
    </>
  );
};

export default DarkModeSwitcher;

