# VDOT Data Sources for Form Auto-Population

## Overview
This document describes the VDOT ArcGIS REST API endpoints and data sources that can be used to auto-populate the Speed Study Analysis Tool forms.

## Available VDOT API Endpoints

### 1. VDOT Traffic Volume (AADT Data)
**Endpoint**: `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Traffic_Volume_2024/FeatureServer/0`

**Available Data**:
- `AADT` / `AADT_2024` / `TRAFFIC_VOLUME` / `ADT` - Average Annual Daily Traffic
- `DIR_AADT` - Directional AADT (if available)
- `PEAK_HOUR_VOLUME` - Peak hour volumes
- `ROUTE_NAME` / `RTE_NM` - Route identification

**Use Cases**:
- Bidirectional Traffic Volume Analysis (Northbound/Southbound or Eastbound/Westbound splits)
- Average Daily Traffic (ADT) field population
- AADT Averaging Helper calculations

**Query Example**:
```javascript
const url = `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Traffic_Volume_2024/FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=50&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
```

---

### 2. VDOT Posted Speed Limits
**Endpoint**: `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Posted_Speed_Limits/FeatureServer/0`

**Available Data**:
- `SPEED_LIMIT` / `POSTED_SPEED_LIMIT_1` / `SPD_LMT` - Posted speed limit value
- `ROUTE_NAME` / `RTE_NM` / `STREET_NAME` / `ROAD_NAME` - Road identification
- `FUNCTIONAL_CLASS` / `FUNC_CLASS` / `FC_DESC` - Functional classification

**Use Cases**:
- Speed Data section - reference for comparison with 85th percentile
- Project information roadway name
- Functional classification

**Query Example**:
```javascript
const url = `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Posted_Speed_Limits/FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=50&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
```

---

### 3. VDOT Crash Data (Full_Crash)
**Endpoint**: `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/Full_Crash/FeatureServer/0`

**Available Data**:
- `CRASH_DATE` / `CRASH_YEAR` - Date/year of crash
- `CRASH_SEVERITY` / `SEVERITY` - Severity classification (Fatal, Severe Injury, Minor Injury, PDO)
- `CRASH_TYPE` - Type of crash
- `LOCATION_ROUTE` - Route identifier
- Crash counts can be aggregated by querying within a buffer distance

**Use Cases**:
- Crash Rate Calculator - Total crashes count
- Enhanced Crash Severity Analysis - Fatal, Severe Injury, Minor Injury, PDO counts
- Years of data calculation (by filtering date ranges)

**Query Example** (Get crashes within 500m of a point):
```javascript
const url = `https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/Full_Crash/FeatureServer/0/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=500&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
```

**Filtering by Date Range** (Last 3-5 years):
```javascript
const threeYearsAgo = new Date();
threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
const threeYearsTimestamp = threeYearsAgo.getTime();

const url = `...&where=CRASH_DATE >= ${threeYearsTimestamp}&...`;
```

---

### 4. VDOT Traffic Signals
**Endpoint**: Search results in `vdot_signal_search.json` and `vdot_rns_signal_search.json`

**Available Data**:
- Traffic signal locations
- Signal type and timing information

**Use Cases**:
- Intersection Density Analysis
- Signalized intersections count

---

### 5. VDOT Sidewalk Infrastructure
**Endpoint**: Metadata in `vdot_sidewalk_metadata.json`

**Available Data**:
- Sidewalk presence and location
- Buffer zones

**Use Cases**:
- NACTO Modal Mixing analysis
- Pedestrian facility assessment

---

## Data Integration Strategy

### Bidirectional Traffic Volume Analysis
**Primary Data Source**: VDOT_Traffic_Volume_2024
1. Query traffic volume at selected point
2. Extract directional data if available (northbound/southbound splits)
3. Calculate directional split percentage
4. Assess balance (balanced, minor imbalance, major imbalance)

**Fields to Populate**:
- `trafficDirection1` (Northbound/Eastbound vpd)
- `trafficDirection2` (Southbound/Westbound vpd)
- `directionalSplit` (percentage split)
- `balanceAssessment` (text assessment)

---

### Speed Data Section
**Primary Data Sources**:
- Local speed study data (manual entry or upload)
- VDOT_Posted_Speed_Limits (for reference/comparison)

**Fields to Populate**:
- Mean Speed (mph) - from study data
- Median Speed (mph) - from study data
- 85th Percentile Speed (mph) - from study data or calculator
- Minimum/Maximum Speed - from study data
- Standard Deviation - from study data
- Total Vehicles Surveyed - from study data
- Average Daily Traffic (ADT) - **from VDOT_Traffic_Volume_2024**

**Calculator Integration**:
- Paste spot speeds feature for percentile calculation
- Auto-fill from calculator results

**VDOT Button Function**:
```javascript
async function fetchVDOTSpeedData(lat, lng) {
  const trafficUrl = `${VDOT_SERVICES.TRAFFIC_VOLUME}/query?...`;
  const trafficData = await (await fetch(trafficUrl)).json();

  if (trafficData.features && trafficData.features.length > 0) {
    const aadt = trafficData.features[0].attributes.AADT;
    document.getElementById('avgDailyTraffic').value = aadt;
  }
}
```

---

### Crash Rate Calculator
**Primary Data Source**: Full_Crash FeatureServer

**Fields to Populate**:
- Total Crashes (lookback period) - **from Full_Crash query**
- Years of Data - default 3, user can adjust
- Statewide Rate (per MVMT) - reference value (typically 3.2 for Virginia)

**Calculation**:
```
Crash Rate = (Total Crashes) / (AADT × 365 × Miles × Years) × 1,000,000
Multiple vs Statewide = Crash Rate / Statewide Rate
```

**VDOT Button Function**:
```javascript
async function fetchVDOTCrashData(lat, lng, years = 3) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);

  const crashUrl = `${VDOT_SERVICES.CRASH}/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&distance=500&units=esriSRUnit_Meter&where=CRASH_DATE >= ${startDate.getTime()}&outFields=*&f=json`;

  const crashData = await (await fetch(crashUrl)).json();
  const totalCrashes = crashData.features.length;

  document.getElementById('cr_crashes').value = totalCrashes;
  document.getElementById('cr_years').value = years;
}
```

---

## Statewide Reference Values (Virginia)

Based on VDOT data and national standards:

- **Statewide Crash Rate**: ~3.2 crashes per Million Vehicle Miles Traveled (MVMT)
- **High Crash Threshold**: 1.5× statewide rate (≥ 4.8 per MVMT)
- **Typical AADT Ranges**:
  - Local roads: 500-5,000 vpd
  - Collectors: 2,000-15,000 vpd
  - Arterials: 10,000-50,000 vpd
  - Freeways: 20,000-150,000+ vpd

---

## Implementation Notes

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Rate Limiting**: VDOT services may have rate limits; implement delays if batching
3. **Buffer Distance**: Use 50m for speed/AADT queries, 500m for crash queries
4. **Data Currency**: Traffic volume data is typically updated annually (current: 2024)
5. **Coordinate System**: All queries use WGS84 (EPSG:4326)

---

## Example Integration Code

```javascript
// VDOT Service URLs
const VDOT_SERVICES = {
  SPEED_LIMITS: 'https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Posted_Speed_Limits/FeatureServer/0',
  TRAFFIC_VOLUME: 'https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/VDOT_Traffic_Volume_2024/FeatureServer/0',
  CRASH: 'https://services.arcgis.com/p5v98VHDX9Atv3l7/arcgis/rest/services/Full_Crash/FeatureServer/0'
};

// Fetch all VDOT data for a location
async function fetchAllVDOTData(lat, lng) {
  const buffer = 50; // meters for traffic/speed data
  const point = `${lng},${lat}`;

  try {
    // Traffic Volume
    const trafficUrl = `${VDOT_SERVICES.TRAFFIC_VOLUME}/query?geometry=${point}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${buffer}&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
    const trafficData = await (await fetch(trafficUrl)).json();

    // Speed Limits
    const speedUrl = `${VDOT_SERVICES.SPEED_LIMITS}/query?geometry=${point}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=${buffer}&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
    const speedData = await (await fetch(speedUrl)).json();

    // Crash Data (larger buffer)
    const crashUrl = `${VDOT_SERVICES.CRASH}/query?geometry=${point}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&distance=500&units=esriSRUnit_Meter&outFields=*&returnGeometry=false&f=json`;
    const crashData = await (await fetch(crashUrl)).json();

    return { trafficData, speedData, crashData };
  } catch (error) {
    console.error('VDOT API Error:', error);
    return null;
  }
}
```
