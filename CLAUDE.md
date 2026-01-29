# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static, zero-build web application for Virginia transportation engineers to perform speed limit studies using NACTO City Limits methodology and FHWA guidance, integrated with live VDOT ArcGIS data services.

## Development Commands

```bash
# Serve locally (needed for VDOT API calls and CSV loading due to CORS)
python3 -m http.server 8000
# Open http://localhost:8000/index%20(2).html

# No build, lint, or test commands - this is vanilla HTML/CSS/JS with CDN dependencies
```

## Architecture

Two self-contained single-page HTML applications with all logic inline:

- **`index (2).html`** (~3,400 lines) - Primary Speed Study Analysis Tool implementing NACTO City Limits methodology. Contains the full UI, map integration, checklist scoring, risk matrix, report generation, and project save/load.
- **`fhwa-speed-tool.html`** (~1,100 lines) - Complementary tool focused on FHWA Speed Limit Setting Handbook methodology with 85th percentile calculator and crash rate analysis.

### Core Data Flow

1. User clicks map location -> `fetchVDOTData()` queries VDOT ArcGIS REST APIs with 500m buffer
2. Form fields auto-populate (roadway name, speed limit, traffic volume, crash count)
3. User completes conflict density + activity level checklists
4. `updateAnalysis()` tallies weighted scores -> risk matrix lookup -> recommended speed
5. `calculateRecommendation()` compares 85th percentile rounding with NACTO result
6. Export via `generateWordDoc()`, `printFullReport()`, or `saveProject()` (JSON)

### Key State

```javascript
let analysisState = {
    conflictDensity: 'moderate',   // 'high' | 'moderate' | 'low'
    activityLevel: 'moderate',      // 'high' | 'moderate' | 'low'
    recommendedSpeed: null,         // NACTO result (20/25/30/35 MPH)
    p85RecommendedSpeed: null       // 85th percentile rounded
};

const riskMatrix = {
    'high-high': 20, 'high-moderate': 20, 'high-low': 25,
    'moderate-high': 20, 'moderate-moderate': 25, 'moderate-low': 30,
    'low-high': 25, 'low-moderate': 25, 'low-low': 35
};
```

### External Dependencies (all CDN-hosted)

- **Leaflet.js 1.9.4** + Leaflet.draw, Leaflet.markercluster - Map rendering and drawing tools
- **Esri Leaflet 3.0.10** - VDOT ArcGIS Feature Service integration
- **PapaParse 5.4.1** - CSV parsing for sign location data
- **jsPDF 2.5.1** + html2canvas - PDF generation
- **FileSaver.js 2.0.5** - Word document export

### VDOT ArcGIS API Endpoints

All queries hit `services.arcgis.com/p5v98VHDX9Atv3l7` for:
- Posted Speed Limits, Traffic Volume (2024), Full Crash data, Sidewalk Inventory

### Data Files

- **`virginia_boundary.json`** - GeoJSON state boundary
- **`data/*.csv`** - Speed limit and stop/yield sign coordinates (on some branches)
- **`vdot_*_search*.json`** - Cached ArcGIS API search results in various encodings (UTF-8, UTF-16, UTF-8-BOM)

## Key Considerations

- All application code lives inline in the HTML files; there are no separate JS/CSS files
- Map is centered on Richmond, VA (37.59, -77.605) by default
- The risk matrix and checklist scoring logic are the core analytical components - changes require understanding NACTO methodology
- Project save/load serializes all form data and checklist state as JSON
- Some JSON data files use UTF-16 LE encoding with BOM
