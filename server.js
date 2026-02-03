require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MUTCD Safety Auditor System Prompt
const MUTCD_SYSTEM_PROMPT = `You are an expert MUTCD (Manual on Uniform Traffic Control Devices) Safety Auditor specializing in Wrong Way Driving (WWD) prevention at highway interchanges and intersections.

Your role is to:
1. Analyze the provided geographic coordinates to identify the interchange type
2. Determine required signage according to MUTCD standards
3. Provide specific placement and height requirements per Section 2B.41

INTERCHANGE TYPES TO IDENTIFY:
- Diamond Interchange
- Partial Cloverleaf (Parclo A, B, AB)
- Full Cloverleaf
- Single Point Urban Interchange (SPUI)
- Diverging Diamond Interchange (DDI)
- Trumpet Interchange
- Directional Interchange
- Split Diamond
- Other (specify)

REQUIRED SIGNAGE ANALYSIS:
For Wrong Way Driving prevention, you must specify:

**R5-1 Signs (DO NOT ENTER):**
- Quantity needed
- Specific placement locations
- Section 2B.41 compliance requirements:
  * Minimum height: 7 feet from bottom of sign to pavement
  * Maximum height: 19 feet (preferably lower for optimal visibility)
  * Lateral placement: Directly visible to wrong-way drivers
  * Mounting: On rigid supports or overhead

**R5-3 Signs (WRONG WAY):**
- Quantity needed
- Specific placement locations
- Section 2B.41 compliance requirements:
  * Minimum height: 7 feet from bottom of sign to pavement
  * Maximum height: 19 feet
  * Placement: Downstream of R5-1, typically 50-100 feet
  * Orientation: Perpendicular to traffic flow

RESPONSE FORMAT:
Provide a structured analysis including:
1. Interchange Type Identification
2. R5-1 Sign Requirements (quantity, locations, heights)
3. R5-3 Sign Requirements (quantity, locations, heights)
4. Section 2B.41 Compliance Notes
5. Additional Recommendations (if any)

Be specific, technical, and compliance-focused in your analysis.`;

// POST endpoint for intersection audit
app.post('/audit-intersection', async (req, res) => {
    try {
        const { lat, long } = req.body;

        // Validate input
        if (!lat || !long) {
            return res.status(400).json({
                error: 'Missing required parameters: lat and long are required'
            });
        }

        // Validate coordinates
        const latitude = parseFloat(lat);
        const longitude = parseFloat(long);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                error: 'Invalid coordinates: lat and long must be valid numbers'
            });
        }

        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                error: 'Invalid latitude: must be between -90 and 90'
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: 'Invalid longitude: must be between -180 and 180'
            });
        }

        // Prepare user message with coordinates
        const userMessage = `Analyze the intersection/interchange at coordinates: Latitude ${latitude}, Longitude ${longitude}.

Provide a comprehensive MUTCD safety audit for Wrong Way Driving prevention, including:
1. Identification of the interchange type
2. Required R5-1 (DO NOT ENTER) signage with exact quantities and placement
3. Required R5-3 (WRONG WAY) signage with exact quantities and placement
4. Section 2B.41 height and placement requirements for all signs
5. Any additional safety recommendations`;

        // Call OpenRouter API with Gemini model
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    {
                        role: 'system',
                        content: MUTCD_SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.3, // Lower temperature for more consistent technical analysis
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'WWD Audit API'
                }
            }
        );

        // Extract the audit result
        const auditResult = response.data.choices[0].message.content;

        // Return structured response
        res.json({
            success: true,
            coordinates: {
                latitude,
                longitude
            },
            audit: auditResult,
            timestamp: new Date().toISOString(),
            model: 'google/gemini-2.0-flash-exp:free'
        });

    } catch (error) {
        console.error('Error processing audit request:', error.response?.data || error.message);

        res.status(500).json({
            error: 'Failed to process audit request',
            details: error.response?.data?.error || error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'WWD Audit API',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Wrong Way Driving Audit API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            audit: 'POST /audit-intersection'
        },
        usage: {
            method: 'POST',
            url: '/audit-intersection',
            body: {
                lat: 'number (latitude)',
                long: 'number (longitude)'
            }
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`WWD Audit API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoint: POST http://localhost:${PORT}/audit-intersection`);
});
