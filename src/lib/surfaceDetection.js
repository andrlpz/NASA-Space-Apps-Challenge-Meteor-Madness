/**
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Surface information object
 */
export async function detectSurfaceType(lat, lng) {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Invalid coordinates provided");
  }

  const GEOAPIFY_API_KEY = "3af853c388e54db88930158cdcdfbc25";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); 

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log("Geoapify API response:", data);

      const feature = data.features?.[0];
      if (feature) {
        const props = feature.properties;

        let surfaceType = "water";
        let confidence = "medium";
        let description = "Open Water";
        let locationName =
          props.formatted || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`;

        if (props.country) {
          surfaceType = "land";
          description = "Land Area";
          confidence = "high";

          const waterIndicators = [
            "bay",
            "sea",
            "ocean",
            "lake",
            "river",
            "harbor",
            "marina",
          ];

          if (
            waterIndicators.some((word) =>
              (props.name || "").toLowerCase().includes(word)
            ) ||
            ["water", "bay", "sea", "ocean", "lake", "river"].includes(
              props.result_type
            )
          ) {
            surfaceType = "water";
            description = `Water Body (${props.result_type || "unknown"})`;
          }
        }

        const locationParts = [];
        if (props.city || props.town || props.village)
          locationParts.push(props.city || props.town || props.village);
        if (props.state) locationParts.push(props.state);
        if (props.country) locationParts.push(props.country);

        if (locationParts.length > 0) {
          locationName = locationParts.join(", ");
        }

        return {
          type: surfaceType,
          description,
          location: locationName,
          confidence,
          source: "Geoapify",
          countryInfo: props.country_code || null, 
          countryName: props.country || null, 
          apiData: {
            fullResponse: data,
            coordinates: { lat, lng },
          },
        };
      } else {
        return {
          type: "water",
          description: "Open Ocean",
          location: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
          confidence: "medium",
          source: "Geoapify",
          countryInfo: null,
          countryName: null,
          apiData: { coordinates: { lat, lng } },
        };
      }
    } else {
      console.warn(
        "Geoapify API not ok:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.warn("Geoapify API error:", error.message);
  }

  return {
    type: "water",
    description: "Unknown Surface (API Error)",
    location: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
    confidence: "low",
    source: "fallback",
    countryInfo: null,
    countryName: null,
    apiData: { coordinates: { lat, lng } },
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
    craterDiameter: diameterMeters * 15, 
    craterType: surfaceInfo.type === 'water' ? 'Underwater crater' : 'Surface crater',
    devastationRadius: energyMegatons * 8, 
    evacuationRadius: energyMegatons * 5, 
    specialEffects: []
  };

  if (surfaceInfo.type === 'water') {
    const tsunamiHeightMeters = Math.min(energyMegatons * 2, 100); 
    const tsunamiRangeKm = Math.min(energyMegatons * 50, 2000); 

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
 * @param {Array} testCases - Array of {lat, lng, expectedType, name} objects
 */
export function testSurfaceDetection(testCases = null) {
  const defaultTestCases = [
    { lat: 0, lng: -140, expectedType: 'water', name: 'Pacific Ocean' },
    { lat: 30, lng: -40, expectedType: 'water', name: 'Atlantic Ocean' },
    { lat: -20, lng: 70, expectedType: 'water', name: 'Indian Ocean' },
    { lat: 40, lng: 15, expectedType: 'water', name: 'Mediterranean Sea' },
    
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
