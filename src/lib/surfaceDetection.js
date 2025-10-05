/**
 * Surface Detection and Effects Calculation Library
 * Detects surface type (water/land) and calculates impact-specific effects
 */

/**
 * Detects the surface type at given coordinates
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
    // Try to use PafoDev API for surface detection with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`https://api.pafodev.com/nasa?lat=${lat}&lng=${lng}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Validate API response structure
      if (typeof data === 'object' && data !== null) {
        return {
          type: data.isWater ? 'water' : 'land',
          description: data.isWater ? 
            (data.waterBodyType || 'Ocean/Water Body') : 
            (data.description || 'Land Surface'),
          location: data.location || data.placeName || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
          confidence: data.confidence || 'high',
          source: 'pafodev_api',
          countryInfo: data.countryInfo || data.country || null
        };
      }
    }
    
    // If API response is not ok or data is invalid, fall through to local detection
    console.log('API response not ok or invalid, using local detection');
    
  } catch (error) {
    // Log the error but continue with fallback
    console.log('Surface detection API error:', error.message, '- using local detection');
  }
  
  // Fallback to improved local geographic detection
  return detectSurfaceTypeLocal(lat, lng);
}

/**
 * Local surface detection using basic geographic heuristics
 * @param {number} lat - Latitude  
 * @param {number} lng - Longitude
 * @returns {Object} Basic surface information
 */
function detectSurfaceTypeLocal(lat, lng) {
  // More accurate land/water detection using known land masses and water bodies
  
  // First, check if it's clearly in major land masses
  const isInMajorLandMass = (
    // North America
    (lng >= -168 && lng <= -52 && lat >= 7 && lat <= 72 && 
     !(lng >= -165 && lng <= -140 && lat >= 55 && lat <= 72)) || // Excluding Bering Sea
    
    // South America
    (lng >= -82 && lng <= -34 && lat >= -56 && lat <= 13) ||
    
    // Europe
    (lng >= -10 && lng <= 40 && lat >= 35 && lat <= 71 && 
     !(lng >= 20 && lng <= 30 && lat >= 35 && lat <= 42)) || // Excluding Mediterranean
    
    // Africa
    (lng >= -17 && lng <= 51 && lat >= -35 && lat <= 37) ||
    
    // Asia (main landmass)
    (lng >= 26 && lng <= 180 && lat >= 1 && lat <= 78 && 
     !(lng >= 100 && lng <= 140 && lat >= 1 && lat <= 25)) || // Excluding Southeast Asian seas
    
    // Australia
    (lng >= 113 && lng <= 154 && lat >= -44 && lat <= -10) ||
    
    // Antarctica (land under ice)
    (lat <= -60)
  );

  // Check for major water bodies
  const isInMajorWaterBody = (
    // Pacific Ocean (main areas)
    (lng >= -180 && lng <= -120 && lat >= -60 && lat <= 60 && !isInMajorLandMass) ||
    (lng >= 120 && lng <= 180 && lat >= -60 && lat <= 60 && !isInMajorLandMass) ||
    
    // Atlantic Ocean
    (lng >= -70 && lng <= -10 && lat >= -60 && lat <= 70 && !isInMajorLandMass) ||
    
    // Indian Ocean
    (lng >= 20 && lng <= 120 && lat >= -60 && lat <= 30 && !isInMajorLandMass) ||
    
    // Arctic Ocean
    (lat >= 70 && !isInMajorLandMass) ||
    
    // Major seas and gulfs
    // Mediterranean Sea
    (lng >= 5 && lng <= 36 && lat >= 30 && lat <= 46) ||
    // Red Sea
    (lng >= 32 && lng <= 43 && lat >= 12 && lat <= 30) ||
    // Persian Gulf
    (lng >= 48 && lng <= 56 && lat >= 24 && lat <= 30) ||
    // Gulf of Mexico
    (lng >= -98 && lng <= -80 && lat >= 18 && lat <= 31) ||
    // Caribbean Sea
    (lng >= -85 && lng <= -60 && lat >= 9 && lat <= 25) ||
    // North Sea
    (lng >= -4 && lng <= 12 && lat >= 51 && lat <= 62) ||
    // Baltic Sea
    (lng >= 9 && lng <= 31 && lat >= 54 && lat <= 66)
  );

  // Enhanced logic: if clearly in water, return water; if clearly on land, return land
  const isWater = isInMajorWaterBody && !isInMajorLandMass;
  const isLand = isInMajorLandMass && !isInMajorWaterBody;
  
  // For ambiguous areas, use additional heuristics
  let surfaceType, confidence, description;
  
  if (isWater) {
    surfaceType = 'water';
    confidence = 'high';
    description = 'Ocean/Sea Area';
  } else if (isLand) {
    surfaceType = 'land';
    confidence = 'high';
    description = 'Continental Land Mass';
  } else {
    // For coastal or island areas, make educated guess based on distance from known land centers
    const distanceFromLandCenters = Math.min(
      // Distance from major population centers (rough approximation)
      Math.abs(lat - 40) + Math.abs(lng - (-95)), // North America center
      Math.abs(lat - (-15)) + Math.abs(lng - (-60)), // South America center
      Math.abs(lat - 50) + Math.abs(lng - 10), // Europe center
      Math.abs(lat - 0) + Math.abs(lng - 20), // Africa center
      Math.abs(lat - 35) + Math.abs(lng - 105), // Asia center
      Math.abs(lat - (-25)) + Math.abs(lng - 135) // Australia center
    );
    
    if (distanceFromLandCenters < 30) {
      surfaceType = 'land';
      confidence = 'medium';
      description = 'Coastal/Island Area';
    } else {
      surfaceType = 'water';
      confidence = 'medium';
      description = 'Open Ocean (Estimated)';
    }
  }

  return {
    type: surfaceType,
    description: description,
    location: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
    confidence: confidence,
    source: 'local_detection',
    countryInfo: null
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
      tsunamiHeight: `${tsunamiHeightMeters.toFixed(1)} metros`,
      tsunamiRange: `${tsunamiRangeKm.toFixed(0)} km desde el punto de impacto`,
      coastalImpact: energyMegatons > 10 ? 'CRÍTICO' : energyMegatons > 1 ? 'ALTO' : 'MODERADO',
      specialEffects: [
        'Generación de ondas sísmicas submarinas',
        'Vaporización masiva de agua',
        'Lluvia ácida por vapor contaminado',
        'Perturbación de corrientes oceánicas',
        ...(energyMegatons > 5 ? ['Efectos climáticos globales por vapor de agua'] : [])
      ]
    };
  } else {
    // Land impact effects
    const fireballRadiusKm = Math.sqrt(energyMegatons) * 2;
    const seismicRangeKm = energyMegatons * 20;
    
    return {
      ...baseEffects,
      fireballRadius: `${fireballRadiusKm.toFixed(1)} km de radio`,
      seismicRange: `Efectos sísmicos hasta ${seismicRangeKm.toFixed(0)} km`,
      groundEffect: energyMegatons > 50 ? 'DESTRUCCIÓN TOTAL en un radio de 100 km' : 
                   energyMegatons > 10 ? 'Destrucción masiva local' : 
                   'Daños severos en área inmediata',
      specialEffects: [
        'Formación de cráter de impacto',
        'Eyección de material rocoso',
        'Incendios forestales masivos',
        'Contaminación atmosférica por polvo',
        ...(energyMegatons > 10 ? ['Invierno de impacto regional'] : []),
        ...(energyMegatons > 100 ? ['Extinción masiva potencial'] : [])
      ]
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
