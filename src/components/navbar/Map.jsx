import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const Map = () => {
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  const center = {
    lat: 39.8283, // Default latitude (center of the US)
    lng: -98.5795, // Default longitude (center of the US)
  };

  // Array of locations (replace with your data)
  const locations = [
    { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    { lat: 40.7128, lng: -74.0060 }, // New York
    { lat: 41.8781, lng: -87.6298 }, // Chicago
    { lat: 29.7604, lng: -95.3698 }, // Houston
  ];

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>
        {locations.map((location, index) => (
          <Marker key={index} position={location} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
