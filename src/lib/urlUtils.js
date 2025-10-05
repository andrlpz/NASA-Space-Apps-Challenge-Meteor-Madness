/**
 * Utility functions for encoding/decoding application state in URL parameters
 */

/**
 * Encodes application state into URL parameters
 * @param {Object} state - The application state to encode
 * @returns {URLSearchParams} - URL parameters object
 */
export function encodeStateToURL(state) {
  const params = new URLSearchParams();

  if (state.impactEvent) {
    // Encode impact position
    params.set('lat', state.impactEvent.position.lat.toString());
    params.set('lng', state.impactEvent.position.lng.toString());
    
    // Encode impact type and source data
    const source = state.impactEvent.details.source;
    
    if (source.name === 'Custom Asteroid Simulation') {
      // Custom simulation - encode slider values
      params.set('type', 'custom');
      params.set('diameter', state.diameter.toString());
      params.set('velocity', state.velocity.toString());
    } else if (source.name !== 'Click simulation') {
      // Real asteroid - encode asteroid identifier
      params.set('type', 'asteroid');
      params.set('asteroid', encodeURIComponent(source.name));
      
      // Store additional asteroid data for fallback
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

  // Encode map mode
  params.set('map3d', state.is3DMap.toString());

  return params;
}

/**
 * Decodes URL parameters back to application state
 * @param {URLSearchParams} params - URL parameters to decode
 * @returns {Object} - Decoded state object
 */
export function decodeURLToState(params) {
  const state = {};

  console.log('Decoding URL params:', Array.from(params.entries()));

  // Decode impact position
  const lat = params.get('lat');
  const lng = params.get('lng');
  
  if (lat && lng) {
    state.impactPosition = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    console.log('Found impact position:', state.impactPosition);
  }

  // Decode impact type and configuration
  const type = params.get('type');
  console.log('Impact type from URL:', type);
  
  if (type === 'custom') {
    // Custom simulation
    const diameter = params.get('diameter');
    const velocity = params.get('velocity');
    
    if (diameter && velocity) {
      state.impactType = 'custom';
      state.customDiameter = parseFloat(diameter);
      state.customVelocity = parseFloat(velocity);
      console.log('Found custom parameters:', { diameter: state.customDiameter, velocity: state.customVelocity });
    }
  } else if (type === 'asteroid') {
    // Real asteroid
    const asteroidName = params.get('asteroid');
    const asteroidDataEncoded = params.get('asteroidData');
    
    if (asteroidName) {
      state.impactType = 'asteroid';
      state.asteroidName = decodeURIComponent(asteroidName);
      console.log('Found asteroid name:', state.asteroidName);
      
      // Try to decode full asteroid data if available
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

  // Decode map mode
  const map3d = params.get('map3d');
  if (map3d !== null) {
    state.is3DMap = map3d === 'true';
    console.log('Found map mode:', state.is3DMap);
  }

  console.log('Final decoded state:', state);
  return state;
}

/**
 * Updates the browser URL without causing a page reload
 * @param {Object} state - The application state to encode in URL
 */
export function updateURL(state) {
  const params = encodeStateToURL(state);
  const newURL = `${window.location.pathname}?${params.toString()}`;
  
  // Use replaceState to update URL without adding to history stack
  window.history.replaceState(null, '', newURL);
}

/**
 * Gets the current URL parameters
 * @returns {URLSearchParams} - Current URL parameters
 */
export function getCurrentURLParams() {
  return new URLSearchParams(window.location.search);
}

/**
 * Creates a shareable URL for the current state
 * @param {Object} state - The application state to encode
 * @returns {string} - Complete shareable URL
 */
export function createShareableURL(state) {
  const params = encodeStateToURL(state);
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/**
 * Copies the current shareable URL to clipboard
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