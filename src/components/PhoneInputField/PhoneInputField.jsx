import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const PhoneInputField = ({ value,name, onChange }) => {
  const [defaultCountry, setDefaultCountry] = useState("us"); // fallback

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await fetch(
          "https://ipinfo.io/json?token=944109c00168fa",
        );
        const data = await response.json();
        const userCountryCode = data.country; // ISO 3166 country code

        setDefaultCountry(userCountryCode.toLowerCase());
      } catch (error) {
        console.error("Error fetching user country:", error);
      }
    };
    fetchUserCountry();
  }, []);
  return (
    <div>
      <div className="w-full">
        <PhoneInput
        name={name}
          country={defaultCountry}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default PhoneInputField;
