/**
 * Calculate the centroid of a polygon
 * @param {Array} coordinates - Array of [lat, lng] coordinates
 * @returns {Object} - { lat, lng } of the centroid
 */
export const getPolygonCentroid = (coordinates) => {
  let lat = 0;
  let lng = 0;
  const n = coordinates.length;

  coordinates.forEach(coord => {
    lat += coord[0];
    lng += coord[1];
  });

  return {
    lat: lat / n,
    lng: lng / n
  };
};

/**
 * Get a short display name for a route
 * @param {String} routeName - Full route name
 * @returns {String} - Short display name
 */
export const getRouteDisplayNumber = (routeName) => {
  // Extract number from route name if it exists
  const match = routeName.match(/\d+/);
  if (match) {
    return match[0];
  }
  
  // Otherwise, return first letter of each word
  return routeName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
};

/**
 * Create a Leaflet DivIcon for route labels
 * @param {String} text - Text to display
 * @param {String} color - Background color
 * @returns {L.DivIcon} - Leaflet DivIcon
 */
export const createRouteLabel = (L, text, color = '#3B82F6') => {
  return L.divIcon({
    className: 'route-label-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${text}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};