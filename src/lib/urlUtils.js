
/**
 * @param {Object} state - The application state to encode
 * @returns {URLSearchParams} - URL parameters object
 */
export function encodeStateToURL(state) {
  const params = new URLSearchParams();

  if (state.impactEvent) {
    params.set('lat', state.impactEvent.position.lat.toString());
    params.set('lng', state.impactEvent.position.lng.toString());
    
    const source = state.impactEvent.details.source;
    
    if (source.name === 'Custom Asteroid Simulation') {
      params.set('type', 'custom');
      params.set('diameter', state.diameter.toString());
      params.set('velocity', state.velocity.toString());
    } else if (source.name !== 'Click simulation') {
      params.set('type', 'asteroid');
      params.set('asteroid', encodeURIComponent(source.name));
      
      if (state.selectedAsteroid) {
        const asteroidData = {
          name: state.selectedAsteroid.name,
          diameter: state.selectedAsteroid.estimated_diameter.meters.estimated_diameter_max,
          velocity: parseFloat(state.selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second),
          isPotentiallyHazardous: state.selectedAsteroid.is_potentially_hazardous_asteroid,
          id: state.selectedAsteroid.id
        };
        params.set('asteroidData', btoa(JSON.stringify(asteroidData)));
      }
    }
  }

  params.set('map3d', state.is3DMap.toString());

  return params;
}

/**
 * @param {URLSearchParams} params - URL parameters to decode
 * @returns {Object} - Decoded state object
 */
export function decodeURLToState(params) {
  const state = {};

  console.log('Decoding URL params:', Array.from(params.entries()));

  const lat = params.get('lat');
  const lng = params.get('lng');
  
  if (lat && lng) {
    state.impactPosition = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    console.log('Found impact position:', state.impactPosition);
  }

  const type = params.get('type');
  console.log('Impact type from URL:', type);
  
  if (type === 'custom') {
    const diameter = params.get('diameter');
    const velocity = params.get('velocity');
    
    if (diameter && velocity) {
      state.impactType = 'custom';
      state.customDiameter = parseFloat(diameter);
      state.customVelocity = parseFloat(velocity);
      console.log('Found custom parameters:', { diameter: state.customDiameter, velocity: state.customVelocity });
    }
  } else if (type === 'asteroid') {
    const asteroidName = params.get('asteroid');
    const asteroidDataEncoded = params.get('asteroidData');
    
    if (asteroidName) {
      state.impactType = 'asteroid';
      state.asteroidName = decodeURIComponent(asteroidName);
      console.log('Found asteroid name:', state.asteroidName);
      
      if (asteroidDataEncoded) {
        try {
          state.asteroidData = JSON.parse(atob(asteroidDataEncoded));
          console.log('Decoded asteroid data:', state.asteroidData);
        } catch (e) {
          console.warn('Failed to decode asteroid data from URL:', e);
        }
      }
    }
  }

  const map3d = params.get('map3d');
  if (map3d !== null) {
    state.is3DMap = map3d === 'true';
    console.log('Found map mode:', state.is3DMap);
  }

  console.log('Final decoded state:', state);
  return state;
}

/**
 * @param {Object} state - The application state to encode in URL
 */
export function updateURL(state) {
  const params = encodeStateToURL(state);
  const newURL = `${window.location.pathname}?${params.toString()}`;
  
  window.history.replaceState(null, '', newURL);
}

/**
 * @returns {URLSearchParams} - Current URL parameters
 */
export function getCurrentURLParams() {
  return new URLSearchParams(window.location.search);
}

/**
 * @param {Object} state - The application state to encode
 * @returns {string} - Complete shareable URL
 */
export function createShareableURL(state) {
  const params = encodeStateToURL(state);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/**
 * @param {Object} state - The application state to encode
 * @returns {Promise<boolean>} - Success status
 */
export async function copyShareableURL(state) {
  try {
    const url = createShareableURL(state);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
}