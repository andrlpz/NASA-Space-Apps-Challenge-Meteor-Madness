/**
 * Servicio para detectar tipo de superficie usando la API personalizada
 * URL: https://api.pafodev.com/nasaapi/neo3?lat={lat}&lng={lng}
 */

import i18n from 'i18next';

// Función para obtener información de superficie usando tu API personalizada
async function getLocationInfo(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.pafodev.com/nasaapi/neo3?lat=${latitude}&lng=${longitude}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data) {
      return data;
    } else {
      console.warn('La API no devolvió resultados válidos');
      return null;
    }
  } catch (error) {
    console.error('Error al consultar la API de ubicación:', error);
    return null;
  }
}

// Función para analizar la respuesta de tu API
function analyzeLocationData(data) {
  if (!data) return null;

  console.log('📊 Datos recibidos de la API:', data);

  // Analizar si es agua o tierra basado en la respuesta de tu API
  // Posibles estructuras de respuesta que puede devolver tu API
  const isWater = data.isWater || 
                  data.type === 'water' || 
                  data.surface === 'water' ||
                  data.water === true ||
                  (data.location && data.location.type === 'water');

  // Extraer información del país con diferentes posibles estructuras
  const country = data.country || 
                  data.pais || 
                  data.location?.country ||
                  data.address?.country ||
                  data.countryName ||
                  data.country_name;

  const region = data.region || 
                 data.estado || 
                 data.state ||
                 data.location?.region ||
                 data.location?.state ||
                 data.address?.state;

  const city = data.city || 
               data.ciudad || 
               data.location?.city ||
               data.address?.city ||
               data.locality;

  const population = data.population || 
                     data.poblacion || 
                     data.country_info?.population ||
                     data.countryInfo?.population;

  const area = data.area || 
               data.country_info?.area ||
               data.countryInfo?.area;

  const capital = data.capital ||
                  data.country_info?.capital ||
                  data.countryInfo?.capital;

  // Determinar el nombre del cuerpo de agua si es agua
  const waterBodyName = data.ocean || 
                        data.oceano || 
                        data.waterBody || 
                        data.sea || 
                        data.mar ||
                        data.lake ||
                        data.lago ||
                        data.location?.name ||
                        'Cuerpo de agua';

  if (isWater) {
    return {
      type: 'water',
      description: 'Superficie acuática',
      location: waterBodyName,
      confidence: 'high',
      source: 'pafodev_api',
      details: data,
      // Información adicional si está cerca de una costa
      ...(country && {
        nearbyCountry: {
          country: country,
          region: region,
          city: city,
          population: population,
          area: area,
          capital: capital
        }
      })
    };
  } else {
    // Para tierra, priorizar el país sobre continentes genéricos
    let locationName = country || city || region || 'Ubicación terrestre';
    
    // Si tenemos ciudad y país, combinarlos
    if (city && country && city !== country) {
      locationName = `${city}, ${country}`;
    } else if (region && country && region !== country) {
      locationName = `${region}, ${country}`;
    }

    return {
      type: 'land',
      description: 'Superficie terrestre',
      location: locationName,
      confidence: 'high',
      source: 'pafodev_api',
      details: data,
      countryInfo: {
        country: country,
        region: region,
        city: city,
        population: population,
        area: area,
        capital: capital
      }
    };
  }
}

// Función de detección local (respaldo) - mejorada para detectar países específicos
function detectSurfaceTypeLocal(lat, lng) {
  lng = ((lng + 180) % 360) - 180;
  
  const countryInfo = getCountryFromCoordinates(lat, lng);
  
  if (countryInfo.type === 'land') {
    return {
      type: 'land',
      description: 'Superficie terrestre (detección local)',
      location: countryInfo.country,
      confidence: 'medium',
      source: 'local_detection',
      countryInfo: {
        country: countryInfo.country,
        region: countryInfo.continent,
        population: countryInfo.estimatedPopulation
      }
    };
  } else {
    return {
      type: 'water',
      description: 'Superficie acuática (detección local)',
      location: countryInfo.ocean,
      confidence: 'medium',
      source: 'local_detection'
    };
  }
}

// Función mejorada para detectar países específicos por coordenadas
function getCountryFromCoordinates(lat, lng) {
  // España
  if (lat >= 35.2 && lat <= 43.8 && lng >= -9.3 && lng <= 3.3) {
    return { type: 'land', country: 'España', continent: 'Europa', estimatedPopulation: 47400000 };
  }
  // Francia
  if (lat >= 41.3 && lat <= 51.1 && lng >= -5.1 && lng <= 9.6) {
    return { type: 'land', country: 'Francia', continent: 'Europa', estimatedPopulation: 67800000 };
  }
  // Reino Unido
  if (lat >= 49.9 && lat <= 60.8 && lng >= -8.2 && lng <= 1.8) {
    return { type: 'land', country: 'Reino Unido', continent: 'Europa', estimatedPopulation: 67500000 };
  }
  // Alemania
  if (lat >= 47.3 && lat <= 55.1 && lng >= 5.9 && lng <= 15.0) {
    return { type: 'land', country: 'Alemania', continent: 'Europa', estimatedPopulation: 83200000 };
  }
  // Italia
  if (lat >= 35.5 && lat <= 47.1 && lng >= 6.6 && lng <= 18.5) {
    return { type: 'land', country: 'Italia', continent: 'Europa', estimatedPopulation: 59100000 };
  }
  // Estados Unidos
  if (lat >= 24.4 && lat <= 49.4 && lng >= -125.0 && lng <= -66.9) {
    return { type: 'land', country: 'Estados Unidos', continent: 'América del Norte', estimatedPopulation: 331900000 };
  }
  // Canadá
  if (lat >= 41.7 && lat <= 83.1 && lng >= -141.0 && lng <= -52.6) {
    return { type: 'land', country: 'Canadá', continent: 'América del Norte', estimatedPopulation: 38200000 };
  }
  // México
  if (lat >= 14.5 && lat <= 32.7 && lng >= -118.4 && lng <= -86.7) {
    return { type: 'land', country: 'México', continent: 'América del Norte', estimatedPopulation: 128900000 };
  }
  // Brasil
  if (lat >= -33.8 && lat <= 5.3 && lng >= -73.0 && lng <= -28.8) {
    return { type: 'land', country: 'Brasil', continent: 'América del Sur', estimatedPopulation: 215300000 };
  }
  // Argentina
  if (lat >= -55.1 && lat <= -21.8 && lng >= -73.6 && lng <= -53.6) {
    return { type: 'land', country: 'Argentina', continent: 'América del Sur', estimatedPopulation: 45400000 };
  }
  // China
  if (lat >= 18.2 && lat <= 53.6 && lng >= 73.5 && lng <= 135.0) {
    return { type: 'land', country: 'China', continent: 'Asia', estimatedPopulation: 1412000000 };
  }
  // India
  if (lat >= 6.8 && lat <= 37.1 && lng >= 68.1 && lng <= 97.4) {
    return { type: 'land', country: 'India', continent: 'Asia', estimatedPopulation: 1380000000 };
  }
  // Japón
  if (lat >= 24.0 && lat <= 46.0 && lng >= 123.0 && lng <= 146.0) {
    return { type: 'land', country: 'Japón', continent: 'Asia', estimatedPopulation: 125800000 };
  }
  // Rusia
  if (lat >= 41.2 && lat <= 81.9 && lng >= 19.6 && lng <= 180.0) {
    return { type: 'land', country: 'Rusia', continent: 'Eurasia', estimatedPopulation: 145900000 };
  }
  // Australia
  if (lat >= -44.0 && lat <= -10.0 && lng >= 113.0 && lng <= 154.0) {
    return { type: 'land', country: 'Australia', continent: 'Oceanía', estimatedPopulation: 25700000 };
  }
  // Sudáfrica
  if (lat >= -35.0 && lat <= -22.1 && lng >= 16.3 && lng <= 32.9) {
    return { type: 'land', country: 'Sudáfrica', continent: 'África', estimatedPopulation: 59300000 };
  }
  // Egipto
  if (lat >= 22.0 && lat <= 31.7 && lng >= 25.0 && lng <= 36.9) {
    return { type: 'land', country: 'Egipto', continent: 'África', estimatedPopulation: 102300000 };
  }
  // Nigeria
  if (lat >= 4.3 && lat <= 13.9 && lng >= 2.7 && lng <= 14.7) {
    return { type: 'land', country: 'Nigeria', continent: 'África', estimatedPopulation: 218500000 };
  }
  // Kenia
  if (lat >= -4.7 && lat <= 5.5 && lng >= 33.9 && lng <= 41.9) {
    return { type: 'land', country: 'Kenia', continent: 'África', estimatedPopulation: 54000000 };
  }
  // Etiopía
  if (lat >= 3.4 && lat <= 14.9 && lng >= 32.9 && lng <= 48.0) {
    return { type: 'land', country: 'Etiopía', continent: 'África', estimatedPopulation: 117900000 };
  }
  // Marruecos
  if (lat >= 21.0 && lat <= 35.9 && lng >= -17.1 && lng <= -1.0) {
    return { type: 'land', country: 'Marruecos', continent: 'África', estimatedPopulation: 37500000 };
  }
  // Argelia
  if (lat >= 19.0 && lat <= 37.1 && lng >= -8.7 && lng <= 12.0) {
    return { type: 'land', country: 'Argelia', continent: 'África', estimatedPopulation: 44600000 };
  }
  // Libia
  if (lat >= 19.5 && lat <= 33.2 && lng >= 9.3 && lng <= 25.2) {
    return { type: 'land', country: 'Libia', continent: 'África', estimatedPopulation: 6900000 };
  }
  // Ghana
  if (lat >= 4.7 && lat <= 11.2 && lng >= -3.3 && lng <= 1.2) {
    return { type: 'land', country: 'Ghana', continent: 'África', estimatedPopulation: 32800000 };
  }
  // República Democrática del Congo
  if (lat >= -13.5 && lat <= 5.4 && lng >= 12.2 && lng <= 31.3) {
    return { type: 'land', country: 'República Democrática del Congo', continent: 'África', estimatedPopulation: 95200000 };
  }
  // Tanzania
  if (lat >= -11.7 && lat <= -1.0 && lng >= 29.3 && lng <= 40.4) {
    return { type: 'land', country: 'Tanzania', continent: 'África', estimatedPopulation: 61500000 };
  }
  // Angola
  if (lat >= -18.0 && lat <= -4.4 && lng >= 11.7 && lng <= 24.1) {
    return { type: 'land', country: 'Angola', continent: 'África', estimatedPopulation: 33900000 };
  }
  // Túnez
  if (lat >= 30.2 && lat <= 37.5 && lng >= 7.5 && lng <= 11.6) {
    return { type: 'land', country: 'Túnez', continent: 'África', estimatedPopulation: 11800000 };
  }
  // Madagascar
  if (lat >= -25.6 && lat <= -11.9 && lng >= 43.2 && lng <= 50.5) {
    return { type: 'land', country: 'Madagascar', continent: 'África', estimatedPopulation: 28400000 };
  }
  // Senegal
  if (lat >= 12.3 && lat <= 16.7 && lng >= -17.5 && lng <= -11.3) {
    return { type: 'land', country: 'Senegal', continent: 'África', estimatedPopulation: 17200000 };
  }

  // Si no coincide con ningún país específico, usar detección por continente
  if (isOnLandLocal(lat, lng)) {
    const continent = getContinentLocal(lat, lng);
    return { 
      type: 'land', 
      country: `Región de ${continent}`, 
      continent: continent, 
      estimatedPopulation: null 
    };
  } else {
    const ocean = getOceanLocal(lat, lng);
    return { 
      type: 'water', 
      ocean: ocean, 
      continent: null, 
      estimatedPopulation: null 
    };
  }
}

function isOnLandLocal(lat, lng) {
  // África
  if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 52) return true;
  // Asia
  if (lat >= -10 && lat <= 81 && lng >= 25 && lng <= 180) return true;
  // Europa
  if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) return true;
  // América del Norte
  if (lat >= 15 && lat <= 83 && lng >= -168 && lng <= -52) return true;
  // América del Sur
  if (lat >= -56 && lat <= 15 && lng >= -82 && lng <= -35) return true;
  // Australia
  if (lat >= -44 && lat <= -10 && lng >= 113 && lng <= 154) return true;
  // Antártida
  if (lat <= -60) return true;
  // Groenlandia
  if (lat >= 60 && lat <= 84 && lng >= -73 && lng <= -12) return true;
  
  return false;
}

function getContinentLocal(lat, lng) {
  if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 52) return 'África';
  if (lat >= -10 && lat <= 81 && lng >= 25 && lng <= 180) return 'Asia';
  if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 40) return 'Europa';
  if (lat >= 15 && lat <= 83 && lng >= -168 && lng <= -52) return 'América del Norte';
  if (lat >= -56 && lat <= 15 && lng >= -82 && lng <= -35) return 'América del Sur';
  if (lat >= -44 && lat <= -10 && lng >= 113 && lng <= 154) return 'Australia';
  if (lat <= -60) return 'Antártida';
  return 'Región terrestre';
}

function getOceanLocal(lat, lng) {
  if (lng >= -70 && lng <= 20) return 'Océano Atlántico';
  if (lng >= 20 && lng <= 147) return 'Océano Índico';
  if (lng >= 147 || lng <= -70) return 'Océano Pacífico';
  if (lat >= 66) return 'Océano Ártico';
  if (lat <= -60) return 'Océano Antártico';
  return 'Océano';
}

// Función principal para detectar superficie
export async function detectSurfaceType(lat, lng) {
  console.log(`🌍 Detectando tipo de superficie en: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  
  // Intentar primero con tu API personalizada
  try {
    const apiData = await getLocationInfo(lat, lng);
    if (apiData) {
      const apiResult = analyzeLocationData(apiData);
      if (apiResult) {
        console.log('✅ Detección exitosa con PafoDev API:', apiResult);
        return apiResult;
      }
    }
  } catch (error) {
    console.warn('⚠️ Error con PafoDev API, usando detección local:', error);
  }

  // Usar detección local como respaldo
  const localResult = detectSurfaceTypeLocal(lat, lng);
  console.log('🔄 Usando detección local:', localResult);
  return localResult;
}

// Función para calcular efectos específicos según el tipo de superficie
export function calculateSurfaceSpecificEffects(surfaceInfo, diameterMeters, velocityKms, energyMegatons) {
  const baseEffects = {
    craterDiameter: Math.min(diameterMeters * 20, 20000),
    devastationRadius: Math.min(energyMegatons * 10, 500),
    evacuationRadius: Math.min(energyMegatons * 5, 200),
  };

  if (surfaceInfo.type === 'water') {
    const tsunamiHeight = Math.min(energyMegatons * 2, 50);
    const tsunamiRange = Math.min(energyMegatons * 100, 5000);
    
    return {
      ...baseEffects,
      primaryEffect: i18n.t('tsunami'),
      tsunamiHeight: `${tsunamiHeight.toFixed(1)} ${i18n.t('meters')}`,
      tsunamiRange: `${tsunamiRange.toFixed(0)} km`,
      craterType: i18n.t('temporary-underwater-crater'),
      specialEffects: [
        i18n.t('seismic-waves-underwater'),
        i18n.t('massive-water-displacement'),
        i18n.t('possible-underwater-volcanic-activity'),
        i18n.t('water-vapor-contamination')
      ],
      coastalImpact: tsunamiRange > 100 ? i18n.t('critical') : i18n.t('moderate')
    };
  } else {
    const seismicRange = Math.min(energyMegatons * 50, 2000);
    const fireballRadius = Math.min(energyMegatons * 3, 100);
    
    return {
      ...baseEffects,
      primaryEffect: i18n.t('impact-crater'),
      craterType: i18n.t('permanent-surface-crater'),
      fireballRadius: `${fireballRadius.toFixed(0)} km`,
      seismicRange: `${seismicRange.toFixed(0)} km`,
      specialEffects: [
        i18n.t('material-ejection'),
        i18n.t('massive-fires'),
        i18n.t('terrestrial-seismic-waves'),
        i18n.t('dust-and-debris-cloud')
      ],
      groundEffect: baseEffects.craterDiameter > 1000 ? i18n.t('total-devastation') : i18n.t('localized-damage')
    };
  }
}