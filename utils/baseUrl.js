import { getApiUrl } from '../src/utils/envCheck';

export const BaseURL = getApiUrl();
export const imageBaseURL = process.env.NEXT_PUBLIC_API_URL_IMAGE || `${BaseURL}/uploads`;
export const postionStackApiKey = "d5fb00c5859953f9904fddeca69263c9";

// Log environment status in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', BaseURL);
  console.log('Image Base URL:', imageBaseURL);
}
