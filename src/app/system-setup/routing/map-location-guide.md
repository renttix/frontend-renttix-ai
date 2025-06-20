# Map Location Guide for Renttix Routing

## Where to Find the Map

The map appears in the **Create Maintenance Route** tab of the Routing Configuration page.

### Navigation Path:
1. Log in to Renttix
2. Open the side menu (hamburger icon)
3. Scroll down to find "System Setup"
4. Click on "System Setup" → "Routing"
5. Click on the "Create Maintenance Route" tab

### Map Features:

#### In the Create Route Tab:
- **Location**: The map appears in the main content area
- **Size**: Full width of the content area, 500px height
- **Features**:
  - Draw polygon tool for creating service areas
  - Depot location marker
  - Clear Area button
  - Detect Coverage Gaps button

#### In the Route Overlays Panel (right side):
- Shows all routes for the selected depot
- Color-coded route list with checkboxes
- Toggle visibility of each route
- "Show All/Hide All" button
- Coverage analysis section

### Map Functionality:
1. **Drawing Service Areas**: Click the polygon tool to start drawing
2. **Viewing Other Routes**: Check/uncheck routes in the overlay panel
3. **Editing Existing Routes**: Available when editing a route
4. **Coverage Analysis**: Click "Detect Coverage Gaps" to analyze service coverage

### Troubleshooting:

If the map doesn't appear:
1. **Clear browser cache**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check console errors**: F12 → Console tab
3. **Verify depot selection**: A depot must be selected for the map to load
4. **Browser compatibility**: Use Chrome, Firefox, or Edge for best results

### Technical Details:
- Uses Leaflet.js for mapping
- OpenStreetMap tiles for base map
- Dynamic loading with Next.js SSR disabled for map components
- Geofence data stored as GeoJSON polygons