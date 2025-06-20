import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import ReactFlagsSelect from 'react-flags-select';
import { BaseURL, imageBaseURL } from '../../../utils/baseUrl';

// const languageOptions = {
//   "CN": { "name": "China", "language": { "code": "zh", "name": "Chinese" } },
//   "IN": { "name": "India", "language": { "code": "hi", "name": "Hindi" } },
//   "US": { "name": "United States", "language": { "code": "en", "name": "English" } },
//   "ID": { "name": "Indonesia", "language": { "code": "id", "name": "Indonesian" } },
//   "PK": { "name": "Pakistan", "language": { "code": "ur", "name": "Urdu" } },
//   "BR": { "name": "Brazil", "language": { "code": "pt", "name": "Portuguese" } },
//   "NG": { "name": "Nigeria", "language": { "code": "en", "name": "English" } },
//   "BD": { "name": "Bangladesh", "language": { "code": "bn", "name": "Bengali" } },
//   "RU": { "name": "Russia", "language": { "code": "ru", "name": "Russian" } },
//   "MX": { "name": "Mexico", "language": { "code": "es", "name": "Spanish" } },
//   "JP": { "name": "Japan", "language": { "code": "ja", "name": "Japanese" } },
//   "ET": { "name": "Ethiopia", "language": { "code": "am", "name": "Amharic" } },
//   "PH": { "name": "Philippines", "language": { "code": "tl", "name": "Filipino" } },
//   "EG": { "name": "Egypt", "language": { "code": "ar", "name": "Arabic" } },
//   "VN": { "name": "Vietnam", "language": { "code": "vi", "name": "Vietnamese" } },
//   "CD": { "name": "Democratic Republic of the Congo", "language": { "code": "fr", "name": "French" } },
//   "TR": { "name": "Turkey", "language": { "code": "tr", "name": "Turkish" } },
//   "IR": { "name": "Iran", "language": { "code": "fa", "name": "Persian" } },
//   "DE": { "name": "Germany", "language": { "code": "de", "name": "German" } },
//   "TH": { "name": "Thailand", "language": { "code": "th", "name": "Thai" } },
//   "GB": { "name": "United Kingdom", "language": { "code": "en", "name": "English" } },
//   "FR": { "name": "France", "language": { "code": "fr", "name": "French" } },
//   "IT": { "name": "Italy", "language": { "code": "it", "name": "Italian" } },
//   "TZ": { "name": "Tanzania", "language": { "code": "sw", "name": "Swahili" } },
//   "ZA": { "name": "South Africa", "language": { "code": "af", "name": "Afrikaans" } },
//   "MM": { "name": "Myanmar", "language": { "code": "my", "name": "Burmese" } },
//   "KR": { "name": "South Korea", "language": { "code": "ko", "name": "Korean" } },
//   "CO": { "name": "Colombia", "language": { "code": "es", "name": "Spanish" } },
//   "KE": { "name": "Kenya", "language": { "code": "sw", "name": "Swahili" } },
//   "ES": { "name": "Spain", "language": { "code": "es", "name": "Spanish" } },
//   "AR": { "name": "Argentina", "language": { "code": "es", "name": "Spanish" } },
//   "UG": { "name": "Uganda", "language": { "code": "en", "name": "English" } },
//   "UA": { "name": "Ukraine", "language": { "code": "uk", "name": "Ukrainian" } },
//   "SD": { "name": "Sudan", "language": { "code": "ar", "name": "Arabic" } },
//   "IQ": { "name": "Iraq", "language": { "code": "ar", "name": "Arabic" } },
//   "CA": { "name": "Canada", "language": { "code": "en", "name": "English" } },
//   "PL": { "name": "Poland", "language": { "code": "pl", "name": "Polish" } },
//   "MA": { "name": "Morocco", "language": { "code": "ar", "name": "Arabic" } },
//   "SA": { "name": "Saudi Arabia", "language": { "code": "ar", "name": "Arabic" } },
//   "UZ": { "name": "Uzbekistan", "language": { "code": "uz", "name": "Uzbek" } },
//   "PE": { "name": "Peru", "language": { "code": "es", "name": "Spanish" } },
//   "AF": { "name": "Afghanistan", "language": { "code": "ps", "name": "Pashto" } },
//   "MY": { "name": "Malaysia", "language": { "code": "ms", "name": "Malay" } },
//   "AO": { "name": "Angola", "language": { "code": "pt", "name": "Portuguese" } },
//   "GH": { "name": "Ghana", "language": { "code": "en", "name": "English" } },
//   "MZ": { "name": "Mozambique", "language": { "code": "pt", "name": "Portuguese" } },
//   "YE": { "name": "Yemen", "language": { "code": "ar", "name": "Arabic" } },
//   "NP": { "name": "Nepal", "language": { "code": "ne", "name": "Nepali" } }
// }


const TopNavigation = () => {
  const [selectedCountry, setSelectedCountry] = useState('US'); // Default to 'US'
  
  const path = usePathname();
  const { token } = useSelector((state) => state?.authReducer);
  const [languageOptions,setlanguageOptions] = useState({})


  useEffect(() => {
    const fetchCountry = async () => {
      try {
        
        const response = await fetch(`${BaseURL}/country`);
        const data = await response.json();
          setlanguageOptions(data.data);
        
      } catch (error) {
        console.error('Error fetching user country:', error);
      }
    };

    fetchCountry();
  }, []);


  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        
        const response = await fetch('https://ipinfo.io/json?token=944109c00168fa');
        const data = await response.json();
        const userCountryCode = data.country; // ISO 3166 country code
        if (languageOptions[userCountryCode]) {
          setSelectedCountry(userCountryCode);
        }
      } catch (error) {
        console.error('Error fetching user country:', error);
      }
    };
    if (languageOptions) {
      fetchUserCountry();

    }
  }, [languageOptions]);

  const handleSelect = (countryCode) => {
    setSelectedCountry(countryCode);
    // Additional logic if needed when a country is selected
  };

  return (
    <div className="bg-dark">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-end">
        <div className="flex gap-4">
          <div className="hidden gap-3 md:flex">
            {path !== '/login/login' && !token && (
              <Link
                className="block py-2 font-semibold text-white hover:text-orange-600"
                href="/login/login"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Language Dropdown */}
     {languageOptions &&   <div className="relative mx-4">
            <ReactFlagsSelect
              selected={selectedCountry}
              onSelect={handleSelect}
              countries={Object.keys(languageOptions)}
              customLabels={Object.fromEntries(
                Object.entries(languageOptions)?.map(([countryCode, { language }]) => [
                  countryCode,
                  language?.name?.toUpperCase(),
                ])
              )}
              showSelectedLabel={true}
              showOptionLabel={true}
              className="custom-flag-select text"
            />
          </div>}
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
