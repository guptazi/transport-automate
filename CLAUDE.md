# CLAUDE.md - Transport Automate

## Project Overview

**Transport Automate** is a Virginia-focused transportation data analysis and automation toolkit. It provides web-based tools for traffic engineering tasks, particularly speed limit setting and traffic sign analysis, integrated with live VDOT (Virginia Department of Transportation) data services.

## Repository Structure

```
transport-automate/
├── fhwa-speed-tool.html       # Speed Limit Setting Tool (main application)
├── index (2).html             # Speed Study Analysis Tool (full-featured map viewer)
├── data/
│   ├── Speed limit.csv        # Speed limit sign locations with coordinates
│   └── Stop and Yield.csv     # Stop/Yield sign locations with coordinates
├── document/
│   ├── Speed-Limit-Setting-Handbook.pdf    # FHWA reference handbook
│   └── Nationwide Traffic Data Assessment.docx
├── vdot_*.json                # VDOT ArcGIS API search results and metadata
├── virginia_boundary.json     # GeoJSON boundary for Virginia state
├── Tigerweb api.txt           # US Census TIGERweb API documentation
└── README.md
```

## Key Components

### Web Applications

#### 1. Speed Limit Setting Tool (`fhwa-speed-tool.html`)
- **Purpose**: Decision support system for setting speed limits
- **Standards**: MUTCD 11th Edition compliant, Safe System Approach
- **Features**:
  - Interactive Leaflet map centered on Richmond, VA
  - Project information form (roadway, study date, locations)
  - 85th percentile speed calculator
  - Crash rate calculator
  - AADT averaging helper
  - Speed limit recommendation engine
- **External APIs**:
  - VDOT Speed Limits: `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Posted_Speed_Limits/FeatureServer/0`
  - VDOT Traffic Volume: `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Traffic_Volume_2024/FeatureServer/0`
  - OpenStreetMap Nominatim for geocoding

#### 2. Speed Study Analysis Tool (`index (2).html`)
- **Purpose**: Comprehensive traffic analysis with advanced mapping
- **Libraries**: Leaflet, Leaflet.draw, MarkerCluster, jsPDF, html2canvas, FileSaver
- **Features**: Drawing tools, VDOT data layers, PDF export

### Data Files

#### CSV Traffic Sign Data
- **Format**: `id, mutcd, name, class, speed, lat, lon, first_seen`
- **MUTCD Codes**:
  - `R2-1`: Speed Limit signs (with speed values 25, 35, 45 mph)
  - `R1-1`: STOP signs
  - `R1-2`: YIELD signs
- **Location**: Richmond, VA metropolitan area (~37.5-37.6 lat, ~-77.6 lon)

#### VDOT JSON Data Files
| File | Purpose |
|------|---------|
| `vdot_speed_metadata.json` | Speed limit layer metadata |
| `vdot_crash_search*.json` | Crash data search results |
| `vdot_roadway_search*.json` | Roadway segment data |
| `vdot_signal_search*.json` | Traffic signal locations |
| `vdot_aadt_search*.json` | Annual Average Daily Traffic data |
| `vdot_volume_metadata.json` | Traffic volume layer metadata |
| `vdot_sidewalk_metadata.json` | Sidewalk infrastructure data |
| `vdot_assets_search.json` | General transportation assets |
| `vdot_rns_signal_search.json` | Road network signal data |

### Reference Documents
- **Speed-Limit-Setting-Handbook.pdf**: FHWA guidance for speed limit decisions
- **Nationwide Traffic Data Assessment.docx**: Traffic data assessment methodology

## Technology Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Data APIs**: VDOT ArcGIS REST services, US Census TIGERweb
- **Export**: jsPDF, html2canvas, FileSaver.js

## VDOT ArcGIS API Integration

### Base URL
```
https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/
```

### Common Query Pattern
```javascript
const url = `${SERVICE_URL}/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${buffer}&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
```

### Available Services
- `VDOT_Posted_Speed_Limits/FeatureServer/0`
- `VDOT_Traffic_Volume_2024/FeatureServer/0`
- `Full_Crash/FeatureServer/0` (crash data)

## Development Guidelines

### Code Conventions
- Use vanilla JavaScript (no frameworks)
- CSS custom properties for theming (see `:root` variables)
- Responsive design with CSS Grid and media queries
- Async/await for API calls with try/catch error handling

### API Error Handling
- Log errors to console with descriptive messages
- Display user-friendly error popups on map markers
- Gracefully degrade when VDOT services are unavailable

### Map Conventions
- Default center: Richmond, VA (37.54, -77.43)
- Default zoom: 10
- Use marker clustering for large datasets
- Include attribution for data sources

### File Naming
- JSON files use `vdot_[category]_[type].json` pattern
- Multiple versions indicated by `_utf8`, `_final`, `_new` suffixes

## Speed Limit Calculation Rules

The recommendation engine uses these rules (from embedded JSON):
```json
{
  "rounding_bin_mph": 5,
  "min_sample_size": 100,
  "functional_class": ["local", "collector", "arterial", "freeway"],
  "area_type": ["urban", "rural"],
  "context": ["urban_main_street", "downtown", "residential_mixed", "suburban_commercial", "rural_two_lane"]
}
```

### Adjustment Factors
- Crash rate >= 1.5x statewide average: -5 mph
- Pedestrian volume >= 100/hour: -5 mph
- Minimum recommended speed: 15 mph

## Testing

No automated test suite exists. Manual testing approach:
1. Test map interactions (click, zoom, pan)
2. Verify VDOT API responses populate forms correctly
3. Test calculators (85th percentile, crash rate, AADT)
4. Validate recommendation logic with known inputs

## Common Tasks

### Adding New VDOT Data Layer
1. Find service URL from VDOT ArcGIS portal
2. Query metadata: `{SERVICE_URL}?f=json`
3. Store results in `vdot_[name]_metadata.json`
4. Add fetch logic following existing patterns

### Updating Sign Data CSVs
1. Ensure CSV format matches: `id,mutcd,name,class,speed,lat,lon,first_seen`
2. Validate coordinates are in WGS84 (EPSG:4326)
3. MUTCD codes must be valid (R2-1 for speed, R1-1 for stop, R1-2 for yield)

### Modifying Speed Recommendation Logic
1. Edit the embedded `rules-embed` JSON in HTML files
2. Update calculation logic in the `btn-compute` click handler
3. Add new adjustment factors as needed

## External Resources

- [VDOT Open Data Portal](https://www.virginiaroads.org/)
- [MUTCD (Manual on Uniform Traffic Control Devices)](https://mutcd.fhwa.dot.gov/)
- [Leaflet Documentation](https://leafletjs.com/)
- [ArcGIS REST API Reference](https://developers.arcgis.com/rest/)
- [US Census TIGERweb](https://tigerweb.geo.census.gov/)

## Notes for AI Assistants

1. **No build process**: Files are served directly; no compilation needed
2. **UTF-8 encoding**: Some JSON files have BOM markers (handle appropriately)
3. **Large files**: `virginia_boundary.json` (~1.9MB) and some API text files exceed typical read limits
4. **Coordinate system**: All geographic data uses WGS84 (EPSG:4326)
5. **API rate limits**: VDOT services may have rate limits; implement appropriate delays if batching requests
6. **Browser-only**: Tools are designed for browser execution, not Node.js
