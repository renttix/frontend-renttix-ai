// store/locationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Async thunk to fetch location-related data
export const fetchLocationData = createAsyncThunk(
  "location/fetchData",
  async () => {
    // Fetch currency rates
    const currencyResponse = await fetch("https://open.er-api.com/v6/latest");
    const currencyData = await currencyResponse.json();
    let currencies = [];
    if (currencyData && currencyData.rates) {
      currencies = Object.keys(currencyData.rates).map((code) => ({
        label: code,
        value: code,
      }));
    }

    // Fetch countries with flags
    const countriesResponse = await fetch("https://restcountries.com/v3.1/all");
    const countriesData = await countriesResponse.json();
    let countries = countriesData.map((country) => ({
      label: country.name.common,
      value: country.cca2, // using the country code as value
      flag: country.flags && (country.flags.png || country.flags.svg),
    }));
    // Sort countries alphabetically
    countries.sort((a, b) => a.label.localeCompare(b.label));

    // Fetch user location info (currency and country) from IP API
    const userLocationResponse = await fetch(
      "http://ip-api.com/json/?fields=currency,country,countryCode"
    );
    const userLocationData = await userLocationResponse.json();

    return {
      currencies,
      countries,
      userCurrency: userLocationData?.currency || null,
      userCountry: userLocationData?.countryCode || null,
    };
  }
);

const initialState = {
  currencies: [],
  countries: [],
  userCurrency: null,
  userCountry: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    // You can add synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLocationData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currencies = action.payload.currencies;
        state.countries = action.payload.countries;
        state.userCurrency = action.payload.userCurrency;
        state.userCountry = action.payload.userCountry;
      })
      .addCase(fetchLocationData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

const persistConfig = {
  key: "location",
  storage,
};

export default persistReducer(persistConfig, locationSlice.reducer);
