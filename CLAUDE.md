# CLAUDE.md - AI Assistant Guide for transport-automate

## Project Overview

**Transport-Automate** is a web-based transportation data analysis and speed limit setting tool for Virginia (VDOT - Virginia Department of Transportation). It provides interactive geospatial analysis capabilities for transportation professionals to make data-driven speed limit and safety recommendations.

### Key Features
- Interactive map-based analysis with drawing tools
- Integration with VDOT ArcGIS services for real-time data
- Speed limit recommendations based on NACTO City Limits methodology
- Crash data analysis and visualization
- PDF/CSV/JSON export capabilities
- Census boundary data integration via TIGERweb API

## Codebase Structure

```
transport-automate/
├── index (2).html              # Main Speed Study Analysis Tool (198 KB, ~4,000 lines)
├── fhwa-speed-tool.html        # FHWA Speed Limit Setting Tool (35 KB, ~1,000 lines)
├── virginia_boundary.json      # Virginia state boundary GeoJSON (2.0 MB)
├── Tigerweb api.txt            # Census boundary configuration (66 KB)
├── README.md                   # Basic project identifier
├── CLAUDE.md                   # This file
│
├── data/                       # Traffic infrastructure data
│   ├── Speed limit.csv         # Speed limit signs (4,496 rows)
│   └── Stop and Yield.csv      # Stop/yield signs (8,138 rows)
│
├── document/                   # Reference documentation
│   ├── Speed-Limit-Setting-Handbook.pdf    # FHWA official guide
│   └── Nationwide Traffic Data Assessment.docx
│
└── vdot_*.json                 # VDOT API query result cache files
```

## Technology Stack

### Frontend (No Build Required)
- **HTML5** - Single-page applications
- **CSS3** - CSS variables for theming (`--primary: #1a5f7a`)
- **Vanilla JavaScript (ES6+)** - No framework dependencies

### Mapping & Geospatial Libraries (CDN-based)
| Library | Version | Purpose |
|---------|---------|---------|
| Leaflet.js | 1.9.4 | Core mapping |
| Leaflet Draw | 1.0.4 | Drawing tools (polygons, circles) |
| Leaflet MarkerCluster | 1.4.1 | Marker clustering |
| Esri Leaflet | 3.0.10 | ArcGIS integration |
| Esri Leaflet Vector | 4.2.3 | Vector tile support |

### Data Processing Libraries (CDN-based)
| Library | Version | Purpose |
|---------|---------|---------|
| PapaParse | 5.4.1 | CSV parsing |
| FileSaver.js | 2.0.5 | Client-side file export |
| html2canvas | 1.4.1 | Screenshot capture |
| jsPDF | 2.5.1 | PDF generation |

### External APIs
- **VDOT ArcGIS Feature Services** - Speed limits, traffic volume, crash data, sidewalks
- **US Census TIGERweb API** - Geographic boundaries (FIPS codes, tracts)
- **OpenStreetMap** - Base map tiles

## Key Code Patterns

### Configuration Constants
```javascript
// VDOT service endpoints
const VDOT_SERVICES = {
    SPEED_LIMITS: 'https://services.arcgis.com/.../VDOT_Posted_Speed_Limits/FeatureServer/0',
    TRAFFIC_VOLUME: 'https://services.arcgis.com/.../VDOT_Traffic_Volume_2024/FeatureServer/0',
    CRASHES: 'https://services.arcgis.com/.../Full_Crash/FeatureServer/0'
};

// Virginia jurisdiction definitions
const JURISDICTIONS = { /* county metadata with FIPS codes */ };

// TIGERweb configuration
const TIGERWEB_CONFIG = { /* Census boundary styling */ };
```

### Naming Conventions
- **Variables/Functions**: `camelCase` (e.g., `centerCoordinates`, `fetchVDOTData()`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `VDOT_SERVICES`, `JURISDICTIONS`)
- **CSS Variables**: `--kebab-case` (e.g., `--primary-dark`, `--gray-600`)

### Core Functions
| Function | Purpose |
|----------|---------|
| `fetchVDOTData()` | Async data retrieval from ArcGIS services |
| `calculateRecommendation()` | Core speed limit recommendation algorithm |
| `clearAll()` / `clearAllSelections()` | Reset data and UI state |
| `addSpeedMarker()` / `addStopYieldMarker()` | Map marker visualization |
| `activateCircleDraw()` / `activatePolygonDraw()` | Enable drawing tools |
| `collectAllData()` | Aggregate data for export |

### Leaflet Map Patterns
```javascript
// Layer management
map.addLayer(layer);
map.removeLayer(layer);

// Feature layer queries
L.esri.featureLayer({ url: VDOT_SERVICES.SPEED_LIMITS })
    .query()
    .within(polygon)
    .run(callback);

// Marker clustering
L.markerClusterGroup().addLayer(markers);
```

## Development Workflow

### Running the Application
This is a static HTML application - no build step required:
1. Open `index (2).html` in a web browser for the main tool
2. Open `fhwa-speed-tool.html` for the FHWA speed limit tool

### Testing Changes
- No automated test framework is configured
- Test manually by:
  - Loading the HTML files in a browser
  - Testing drawing tools and data fetching
  - Verifying export functionality (PDF, CSV, JSON)

### Deployment
- Static files can be served from any web server
- Previously used GitHub Pages (workflow was removed)
- All dependencies are CDN-based, no server-side components required

## Data Files

### CSV Data Format
**Speed limit.csv** and **Stop and Yield.csv**:
```csv
id,mutcd,name,class,speed,lat,lon,first_seen
# mutcd: R2-1 (speed limit), R1-1 (stop), R1-2 (yield)
# class: Regulatory
# speed: 25-70 mph
# Geographic focus: Richmond, VA area
```

### JSON Files
- `virginia_boundary.json` - GeoJSON polygon of Virginia state
- `vdot_*_search*.json` - Cached VDOT API query results (various encodings)
- `vdot_*_metadata.json` - Empty placeholder files

## Important Notes for AI Assistants

### Architecture Considerations
1. **Monolithic HTML files** - All CSS, JS, and HTML in single files
2. **No package management** - Dependencies via CDN URLs
3. **Client-side only** - No backend/server components
4. **Data committed to repo** - Large data files in repository

### When Making Changes
1. Read the entire relevant section before editing (files are large)
2. Preserve existing code organization patterns
3. Maintain CSS variable usage for theming
4. Keep Leaflet.js patterns consistent
5. Test in browser after changes - no automated tests

### File Naming Issue
Note: Main file is named `index (2).html` with a space and parentheses. This may cause issues with some tools - use quotes when referencing.

### Common Tasks
| Task | Approach |
|------|----------|
| Add new map layer | Add to `VDOT_SERVICES` constant, create fetch function |
| Modify UI styling | Edit CSS variables in `:root` or inline styles |
| Add export format | Extend export functions using FileSaver.js/jsPDF |
| Add jurisdiction | Update `JURISDICTIONS` constant with FIPS codes |

### External Documentation
- FHWA Speed Limit Setting Handbook: `document/Speed-Limit-Setting-Handbook.pdf`
- Census TIGERweb API configuration: `Tigerweb api.txt`

## Git Conventions

### Branch Naming
- Feature branches: `claude/<description>-<session-id>`
- Main development on `main` branch

### Commit Style
Recent commits use short version labels (v1, v2, v3, etc.) with occasional descriptive messages.

## Color Theme Reference

```css
:root {
    --primary: #1a5f7a;       /* Main brand color */
    --primary-dark: #134a5e;  /* Darker variant */
    --secondary: #57837b;     /* Secondary accent */
    --accent: #c38154;        /* Highlight color */
    --danger: #ef4444;        /* Error states */
    --success: #22c55e;       /* Success states */
    --warning: #f59e0b;       /* Warning states */
    --info: #3b82f6;          /* Info states */
}
```
