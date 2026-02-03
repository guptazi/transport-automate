# Wrong Way Driving (WWD) Audit API

A Node.js Express server that provides MUTCD-compliant safety audits for highway interchanges using OpenRouter's Gemini API.

## Overview

This API accepts geographic coordinates and returns a comprehensive MUTCD (Manual on Uniform Traffic Control Devices) safety audit focused on Wrong Way Driving prevention. The system analyzes interchange types and provides specific signage requirements including R5-1 (DO NOT ENTER) and R5-3 (WRONG WAY) signs with Section 2B.41 compliance details.

## Features

- **Interchange Type Identification**: Automatically identifies Diamond, Parclo, Cloverleaf, SPUI, DDI, and other interchange types
- **MUTCD Compliance**: Provides detailed signage requirements per MUTCD standards
- **Section 2B.41 Requirements**: Includes specific height and placement specifications
- **OpenRouter Integration**: Leverages Gemini 2.0 Flash for intelligent analysis
- **Bubble.io Compatible**: Easy integration with no-code platforms

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

The `.env` file should contain:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3000
```

3. **Start the server:**

```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "WWD Audit API",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### Audit Intersection

**POST** `/audit-intersection`

Perform a WWD safety audit for the specified coordinates.

**Request Body:**
```json
{
  "lat": 37.5407,
  "long": -77.4360
}
```

**Response:**
```json
{
  "success": true,
  "coordinates": {
    "latitude": 37.5407,
    "longitude": -77.436
  },
  "audit": "Detailed MUTCD audit analysis...",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "model": "google/gemini-2.0-flash-exp:free"
}
```

**Error Response:**
```json
{
  "error": "Missing required parameters: lat and long are required"
}
```

## Bubble.io Integration Guide

### Step 1: Start Your Local Server

Make sure your WWD Audit API is running locally:

```bash
npm start
```

You should see:
```
WWD Audit API server running on port 3000
Health check: http://localhost:3000/health
API endpoint: POST http://localhost:3000/audit-intersection
```

### Step 2: Configure Bubble.io API Connector

1. **Open your Bubble.io app**
2. Navigate to **Plugins** → **API Connector**
3. Click **Add another API**

### Step 3: API Configuration

**General Settings:**
- **API Name**: `WWD_Audit_API`
- **Authentication**: None (or Private Key if you add authentication)

### Step 4: Add API Call

Click **Add another call** and configure:

**Call Configuration:**
- **Name**: `audit_intersection`
- **Use as**: Action
- **Data type**: JSON
- **Method**: POST
- **URL**: `http://localhost:3000/audit-intersection`

**Headers:**
- `Content-Type`: `application/json`

**Body type**: JSON
```json
{
  "lat": <latitude>,
  "long": <longitude>
}
```

### Step 5: Initialize the Call

1. Replace `<latitude>` with a test value (e.g., `37.5407`)
2. Replace `<longitude>` with a test value (e.g., `-77.4360`)
3. Click **Initialize call**
4. Wait for the response

### Step 6: Configure Response Structure

After initialization, Bubble will detect the response structure. You should see:

- `success` (boolean)
- `coordinates` (object)
  - `latitude` (number)
  - `longitude` (number)
- `audit` (text)
- `timestamp` (text)
- `model` (text)

### Step 7: Use in Bubble Workflows

**Example Workflow:**

1. Create a button with text "Audit Intersection"
2. Add a workflow: **When Button is clicked**
3. Add action: **Plugins** → **WWD_Audit_API - audit_intersection**
4. Set parameters:
   - `latitude`: `Map's Center Latitude` (or from input field)
   - `longitude`: `Map's Center Longitude` (or from input field)
5. Add action: **Display data** → Show `Result of Step 1's audit` in a text element

**Example Display:**

Create a text element and set its content to:
```
Result of step 1's audit
```

This will display the full MUTCD safety audit.

### Step 8: Production Deployment

For production use:

1. **Deploy your API to a cloud service** (Heroku, AWS, DigitalOcean, etc.)
2. **Update the Bubble.io API URL** to your production URL
3. **Add authentication** (API keys, JWT) for security
4. **Enable HTTPS** for secure communication

### Example: Deploying to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-wwd-audit-api

# Set environment variables
heroku config:set OPENROUTER_API_KEY=your_key_here

# Deploy
git push heroku main

# Your API will be available at:
# https://your-wwd-audit-api.herokuapp.com
```

Then update Bubble.io API Connector URL to:
```
https://your-wwd-audit-api.herokuapp.com/audit-intersection
```

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:3000/audit-intersection \
  -H "Content-Type: application/json" \
  -d '{"lat": 37.5407, "long": -77.4360}'
```

### Using Postman

1. Create a new POST request
2. URL: `http://localhost:3000/audit-intersection`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "lat": 37.5407,
  "long": -77.4360
}
```

### Using JavaScript (fetch)

```javascript
fetch('http://localhost:3000/audit-intersection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    lat: 37.5407,
    long: -77.4360
  })
})
.then(response => response.json())
.then(data => console.log(data.audit))
.catch(error => console.error('Error:', error));
```

## MUTCD Compliance Details

The API analyzes intersections according to MUTCD Section 2B.41 standards:

### R5-1 Signs (DO NOT ENTER)
- Minimum height: 7 feet from bottom of sign to pavement
- Maximum height: 19 feet (preferably lower for optimal visibility)
- Placement: Directly visible to wrong-way drivers
- Mounting: On rigid supports or overhead

### R5-3 Signs (WRONG WAY)
- Minimum height: 7 feet from bottom of sign to pavement
- Maximum height: 19 feet
- Placement: Downstream of R5-1, typically 50-100 feet
- Orientation: Perpendicular to traffic flow

## Interchange Types Analyzed

- Diamond Interchange
- Partial Cloverleaf (Parclo A, B, AB)
- Full Cloverleaf
- Single Point Urban Interchange (SPUI)
- Diverging Diamond Interchange (DDI)
- Trumpet Interchange
- Directional Interchange
- Split Diamond

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for API keys
- Implement rate limiting for production
- Add authentication for public deployments
- Use HTTPS in production
- Validate and sanitize all inputs

## Troubleshooting

### API returns 400 error
- Check that `lat` and `long` are included in request body
- Verify coordinates are valid numbers
- Ensure latitude is between -90 and 90
- Ensure longitude is between -180 and 180

### API returns 500 error
- Verify OpenRouter API key is valid
- Check server logs for detailed error messages
- Ensure OpenRouter service is accessible

### Bubble.io can't connect
- Verify local server is running
- Check that URL is `http://localhost:3000` (not https)
- Ensure CORS is enabled (included by default)
- For production, use a public URL, not localhost

## Support

For issues or questions related to:
- MUTCD standards: Consult the official MUTCD manual
- OpenRouter API: Visit https://openrouter.ai/docs
- Bubble.io integration: Check Bubble.io API Connector documentation

## License

ISC
