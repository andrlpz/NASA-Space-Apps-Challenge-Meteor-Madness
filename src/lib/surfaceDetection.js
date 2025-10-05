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
  try {
    // Try to use PafoDev API for surface detection
    const response = await fetch(`https://api.pafodev.com/location?lat=${lat}&lng=${lng}`);
    
    if (response.ok) {
      const data = await response.json();
      
      return {
        type: data.isWater ? 'water' : 'land',
        description: data.isWater ? 'Ocean/Water Body' : data.description || 'Land Surface',
        location: data.location || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
        confidence: data.confidence || 'high',
        source: 'pafodev_api',
        countryInfo: data.countryInfo || null
      };
    } else {
      throw new Error('API not available');
    }
  } catch (error) {
    // Fallback to basic geographic heuristics
    return detectSurfaceTypeLocal(lat, lng);
  }
}

/**
 * Local surface detection using basic geographic heuristics
 * @param {number} lat - Latitude  
 * @param {number} lng - Longitude
 * @returns {Object} Basic surface information
 */
function detectSurfaceTypeLocal(lat, lng) {
  // Simple heuristic: major ocean areas
  const isInOcean = (
    // Pacific Ocean
    (lng >= -180 && lng <= -60 && lat >= -60 && lat <= 60) ||
    // Atlantic Ocean  
    (lng >= -60 && lng <= 20 && lat >= -60 && lat <= 70) ||
    // Indian Ocean
    (lng >= 20 && lng <= 150 && lat >= -60 && lat <= 30) ||
    // Arctic Ocean
    (lat >= 70) ||
    // Antarctic Ocean
    (lat <= -60)
  );

  return {
    type: isInOcean ? 'water' : 'land',
    description: isInOcean ? 'Ocean Area (Estimated)' : 'Land Area (Estimated)',
    location: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
    confidence: 'medium',
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
