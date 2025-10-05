/**
 * Surface Detection and Effects Calculation Library
 * Detects surface type (water/land) and calculates impact-specific effects
 */

/**
 * Detects the surface type at given coordinates using OpenStreetMap Nominatim API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Surface information object
 */
export async function detectSurfaceType(lat, lng) {
  // Validate coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Invalid coordinates provided');
  }

  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&extratags=1&namedetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Meteor-Madness-App/1.0 (NASA Space Apps Challenge)'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Nominatim API response:', data);
      
      if (data && data.place_id) {
        let surfaceType = 'water'; // Default assumption
        let confidence = 'high';
        let description = 'Open Water';
        let locationName = data.display_name || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;
        
        // Check if we have address components (indicates land)
        if (data.address && Object.keys(data.address).length > 0) {
          // Has address components - this indicates land
          surfaceType = 'land';
          description = 'Land Area';
          
          // Check for specific water body types in class/type
          if (data.class === 'natural' && ['water', 'bay', 'strait', 'fjord'].includes(data.type)) {
            surfaceType = 'water';
            description = `Water Body (${data.type})`;
          } else if (data.class === 'waterway') {
            surfaceType = 'water';
            description = `Waterway (${data.type})`;
          } else if (data.class === 'leisure' && data.type === 'marina') {
            surfaceType = 'water';
            description = 'Marina/Harbor';
          }
        } else {
          // No address components - likely water body
          surfaceType = 'water';
          description = 'Open Water (No Address)';
          confidence = 'medium';
        }
        
        // Extract country info from address
        const countryInfo = data.address?.country || null;
        
        // Create location description based on available data
        if (data.address) {
          const locationParts = [];
          if (data.address.city || data.address.town || data.address.village) {
            locationParts.push(data.address.city || data.address.town || data.address.village);
          }
          if (data.address.state || data.address.region) {
            locationParts.push(data.address.state || data.address.region);
          }
          if (data.address.country) {
            locationParts.push(data.address.country);
          }
          if (locationParts.length > 0) {
            locationName = locationParts.join(', ');
          }
        }
        
        return {
          type: surfaceType,
          description: description,
          location: locationName,
          confidence: confidence,
          source: 'OpenStreetMap',
          countryInfo: countryInfo,
          apiData: {
            fullResponse: data,
            coordinates: { lat, lng }
          }
        };
      } else {
        // No data found - likely open ocean
        return {
          type: 'water',
          description: 'Open Ocean ',
          location: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
          confidence: 'medium',
          source: 'OpenStreetMap',
          countryInfo: null,
          apiData: {
            coordinates: { lat, lng }
          }
        };
      }
    } else {
      console.log('Nominatim API response not ok:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.log('Surface detection API error:', error.message);
  }
  
  // Fallback: If API fails, assume water for unknown coordinates
  return {
    type: 'water',
    description: 'Unknown Surface (API Error)',
    location: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
    confidence: 'low',
    source: 'fallback',
    countryInfo: null,
    apiData: {
      coordinates: { lat, lng }
    }
  };
}



/**
 * Calculates surface-specific effects based on impact parameters
 * @param {Object} surfaceInfo - Surface information from detectSurfaceType
 * @param {number} diameterMeters - Asteroid diameter in meters
 * @param {number} velocityKms - Impact velocity in km/s
 * @param {number} energyMegatons - Impact energy in megatons TNT
 * @returns {Object} Surface-specific effects object
 */
export function calculateSurfaceSpecificEffects(surfaceInfo, diameterMeters, velocityKms, energyMegatons) {
  const baseEffects = {
    primaryEffect: surfaceInfo.type === 'water' ? 'Tsunami Generation' : 'Ground Impact',
    craterDiameter: diameterMeters * 15, // Approximate crater diameter
    craterType: surfaceInfo.type === 'water' ? 'Underwater crater' : 'Surface crater',
    devastationRadius: energyMegatons * 8, // km
    evacuationRadius: energyMegatons * 5, // km
    specialEffects: []
  };

  if (surfaceInfo.type === 'water') {
    // Water impact effects
    const tsunamiHeightMeters = Math.min(energyMegatons * 2, 100); // Max 100m tsunami
    const tsunamiRangeKm = Math.min(energyMegatons * 50, 2000); // Max 2000km range
    
    return {
      ...baseEffects,
      tsunamiHeight: `${tsunamiHeightMeters.toFixed(1)} meters`,
      tsunamiRange: `${tsunamiRangeKm.toFixed(0)} km from impact point`,
      coastalImpact: energyMegatons > 10 ? 'CRITICAL' : energyMegatons > 1 ? 'HIGH' : 'MODERATE',
      specialEffects: [
        'Generation of underwater seismic waves',
        'Massive water vaporization',
        'Acid rain from contaminated vapor',
        'Disruption of ocean currents',
        ...(energyMegatons > 5 ? ['Global climate effects from water vapor'] : [])
      ]
    };
  } else {
    // Land impact effects
    const fireballRadiusKm = Math.sqrt(energyMegatons) * 2;
    const seismicRangeKm = energyMegatons * 20;
    
    return {
      ...baseEffects,
      fireballRadius: `${fireballRadiusKm.toFixed(1)} km radius`,
      seismicRange: `Seismic effects up to ${seismicRangeKm.toFixed(0)} km`,
      groundEffect: energyMegatons > 50 ? 'TOTAL DESTRUCTION within 100 km radius' : 
                   energyMegatons > 10 ? 'Massive local destruction' : 
                   'Severe damage in immediate area',
      specialEffects: [
        'Impact crater formation',
        'Rock material ejection',
        'Massive forest fires',
        'Atmospheric dust contamination',
        ...(energyMegatons > 10 ? ['Regional impact winter'] : []),
        ...(energyMegatons > 100 ? ['Potential mass extinction'] : [])
      ]
    };
  }
}

/**
 * Test API endpoint availability
 * @param {number} lat - Test latitude
 * @param {number} lng - Test longitude
 * @returns {Promise<Object>} Test result
 */
export async function testAPIEndpoint(lat = 40.7128, lng = -74.0060) {
  try {
    const result = await detectSurfaceType(lat, lng);
    console.log('🧪 API Test Result:', result);
    return {
      success: true,
      result,
      usingAPI: result.source === 'pafodev_api'
    };
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return {
      success: false,
      error: error.message,
      usingAPI: false
    };
  }
}

/**
 * Test function to verify surface detection accuracy
 * @param {Array} testCases - Array of {lat, lng, expectedType, name} objects
 */
export function testSurfaceDetection(testCases = null) {
  const defaultTestCases = [
    // Water test cases
    { lat: 0, lng: -140, expectedType: 'water', name: 'Pacific Ocean' },
    { lat: 30, lng: -40, expectedType: 'water', name: 'Atlantic Ocean' },
    { lat: -20, lng: 70, expectedType: 'water', name: 'Indian Ocean' },
    { lat: 40, lng: 15, expectedType: 'water', name: 'Mediterranean Sea' },
    
    // Land test cases  
    { lat: 40, lng: -100, expectedType: 'land', name: 'North America (Kansas)' },
    { lat: 52, lng: 13, expectedType: 'land', name: 'Europe (Berlin)' },
    { lat: -26, lng: 28, expectedType: 'land', name: 'Africa (Johannesburg)' },
    { lat: 35, lng: 139, expectedType: 'land', name: 'Asia (Tokyo)' },
    { lat: -34, lng: 151, expectedType: 'land', name: 'Australia (Sydney)' },
  ];
  
  const cases = testCases || defaultTestCases;
  
  console.log('🧪 Testing Surface Detection...');
  let correct = 0;
  
  cases.forEach(testCase => {
    const result = detectSurfaceTypeLocal(testCase.lat, testCase.lng);
    const isCorrect = result.type === testCase.expectedType;
    
    console.log(`${isCorrect ? '✅' : '❌'} ${testCase.name}: Expected ${testCase.expectedType}, Got ${result.type} (${result.confidence} confidence)`);
    
    if (isCorrect) correct++;
  });
  
  console.log(`📊 Accuracy: ${correct}/${cases.length} (${(correct/cases.length*100).toFixed(1)}%)`);
  return { correct, total: cases.length, accuracy: correct/cases.length };
}
