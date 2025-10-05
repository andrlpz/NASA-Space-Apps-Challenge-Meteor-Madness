import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setImpactEvent,
  resetImpact,
  showSliders,
  hideSliders,
  showAsteroidList,
  hideAsteroidList,
  setDiameter,
  setVelocity,
  setSelectedAsteroid,
  toggleMapMode,
  updateZoomLevel,
  setMapMode,
  hideNotification,
  showAsteroidSelectionNotification,
  hideAsteroidSelectionNotification,
  loadStateFromURL,
  restoreImpactFromURL,
} from '../store/impactSlice';
import InteractiveMap from './InteractiveMap';
import ImpactSidebar from './ImpactSidebar';
import { Target, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import AsteroidList from './AsteroidList';
import Sliders from './Sliders';
import Configuration from './configuration';
import { detectSurfaceType, calculateSurfaceSpecificEffects } from '../lib/surfaceDetection';
import { 
  getCurrentURLParams, 
  decodeURLToState, 
  updateURL, 
  copyShareableURL 
} from '../lib/urlUtils';

import cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import GlobePage from './GlobeComponent';
import { useMeteor } from './MeteorProvider';
import WelcomeOverlay from './WelcomeOverlay';


const languages = [
  {
    code: 'fr',
    name: 'Français',
    country_code: 'fr',
  },
  {
    code: 'en',
    name: 'English',
    country_code: 'gb',
  },
  {
    code: 'es',
    name: 'Español',
    country_code: 'es',
  },
]

const Wexio = () => {
  const dispatch = useDispatch();
  
  const {
    impactEvent,
    showSliders: showSlidersState,
    showAsteroidList: showAsteroidListState,
    diameter,
    velocity,
    selectedAsteroid,
    is3DMap,
    currentZoomLevel,
    zoomThresholdFor2D,
    zoomThresholdFor3D,
    showModeChangeNotification,
    showAsteroidSelectionNotification,
  } = useSelector((state) => state.impact);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asteroids, setAsteroids] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [pendingURLState, setPendingURLState] = useState(null);
  const [mouse, setMouse] = useState({ x: window.innerWidth/2, y: window.innerHeight/2 });
  const [showWelcome, setShowWelcome] = useState(true);
  const meteor = useMeteor();

  const appearSliders = () => {
    dispatch(showSliders());
  };
  
  const appearAsteroids = () => {
    dispatch(showAsteroidList());
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleWelcomeStart = () => {
    setShowWelcome(false);
  };

  const currentLanguageCode = cookies.get('i18next') || 'en'
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode)
  const { t } = useTranslation()

  function handleResetImpact() {
    dispatch(resetImpact());
  }

  // Handle sharing current state
  const handleShare = async () => {
    const success = await copyShareableURL({
      impactEvent,
      selectedAsteroid,
      diameter,
      velocity,
      is3DMap
    });
    
    if (success) {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  // Mouse tracking for meteor effects
  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, []);

  // Calculate impact function (moved here for reusability)
  const calculateImpact = (diameterMeters, velocityKms) => {
    const radius = diameterMeters / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m³
    const density = 3000; // kg/m³ typical rock
    const mass = density * volume; // kg
    const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityKms * 1000, 2); // J
    const energyMegatons = kineticEnergyJoules / 4.184e15; // MT TNT

    // Realistic seismic magnitude
    const seismicMagnitude = Math.min((2 / 3) * Math.log10(kineticEnergyJoules) - 3.2, 10).toFixed(1);

    // Crater and devastation radius approximations
    const craterDiameter = Math.min(diameterMeters * 20, 20000); // max 20 km
    const devastationRadius = Math.min(energyMegatons * 10, 500); // max 500 km
    const evacuationRadius = Math.min(energyMegatons * 5, 200); // max 200 km

    return {
      energyMegatons: energyMegatons.toFixed(2),
      seismicMagnitude,
      craterDiameter: craterDiameter.toFixed(0),
      devastationRadius: devastationRadius.toFixed(0),
      evacuationRadius: evacuationRadius.toFixed(0),
    };
  };

  // Calculate visual radius for map display based on asteroid size and impact effects
  const calculateVisualRadius = (diameterMeters, velocityKms) => {
    const { devastationRadius } = calculateImpact(diameterMeters, velocityKms);
    const devastationRadiusMeters = parseFloat(devastationRadius) * 1000; // Convert km to meters
    
    // Use devastation radius as the visual representation, with reasonable min/max bounds
    const minRadius = 5000; // 5km minimum for visibility
    const maxRadius = 500000; // 500km maximum for practical display
    
    return Math.max(minRadius, Math.min(maxRadius, devastationRadiusMeters));
  };

  // Function to restore impact from URL parameters
  const restoreImpactFromURL = useCallback((impactPosition, impactType, asteroidName, asteroidData, customDiameter, customVelocity) => {
    if (impactType === 'asteroid' && asteroidName) {
      // Try to find the asteroid in the loaded list
      let foundAsteroid = asteroids.find(asteroid => 
        asteroid.name.replace(/[()]/g, '') === asteroidName
      );
      
      // If not found in list, create from stored data
      if (!foundAsteroid && asteroidData) {
        foundAsteroid = {
          name: asteroidData.name,
          id: asteroidData.id,
          estimated_diameter: {
            meters: {
              estimated_diameter_max: asteroidData.diameter
            }
          },
          close_approach_data: [{
            relative_velocity: {
              kilometers_per_second: asteroidData.velocity.toString()
            },
            close_approach_date_full: 'Restored from URL',
            miss_distance: {
              kilometers: '0'
            }
          }],
          is_potentially_hazardous_asteroid: asteroidData.isPotentiallyHazardous,
          absolute_magnitude_h: 'N/A',
          nasa_jpl_url: 'N/A'
        };
      }
      
      if (foundAsteroid) {
        dispatch(setSelectedAsteroid(foundAsteroid));
        dispatch(hideAsteroidList()); // Ensure asteroid list stays hidden
        
        // Create asteroid impact event only if we have a position
        if (impactPosition) {
          const diameterMeters = foundAsteroid.estimated_diameter.meters.estimated_diameter_max;
          const velocityKms = parseFloat(foundAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
          const { energyMegatons, seismicMagnitude } = calculateImpact(diameterMeters, velocityKms);
          const visualRadius = calculateVisualRadius(diameterMeters, velocityKms);

          dispatch(setImpactEvent({
            position: impactPosition,
            radius: visualRadius,
            details: {
              source: {
                name: foundAsteroid.name.replace(/[()]/g, ''),
                diameter: `${diameterMeters.toFixed(2)} meters`,
                velocity: `${velocityKms.toFixed(2)} km/s`,
                isPotentiallyHazardous: foundAsteroid.is_potentially_hazardous_asteroid,
                closeApproachDate: foundAsteroid.close_approach_data[0].close_approach_date_full,
                missDistance: `${parseFloat(foundAsteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km`,
                absoluteMagnitude: foundAsteroid.absolute_magnitude_h,
                jplUrl: foundAsteroid.nasa_jpl_url,
              },
              consequences: {
                impactEnergy: `${energyMegatons} Megatons TNT`,
                seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
                airBlast: 'Significant overpressure event expected.',
              },
              mitigation: {
                threatLevel: foundAsteroid.is_potentially_hazardous_asteroid ? 'MONITORING REQUIRED' : 'LOW',
                recommendedAction: 'Further observation to refine orbital parameters.',
              },
            },
          }));
        }
      }
    } else if (impactType === 'custom' && customDiameter && customVelocity) {
      // Set custom values
      dispatch(setDiameter(customDiameter));
      dispatch(setVelocity(customVelocity));
      dispatch(showSliders());
      dispatch(hideAsteroidList()); // Ensure asteroid list stays hidden
      
      // Create custom impact event only if we have a position
      if (impactPosition) {
        const { energyMegatons, seismicMagnitude, craterDiameter, devastationRadius, evacuationRadius } =
          calculateImpact(customDiameter, customVelocity);
        const visualRadius = calculateVisualRadius(customDiameter, customVelocity);

        dispatch(setImpactEvent({
          position: impactPosition,
          radius: visualRadius,
          details: {
            source: {
              name: 'Custom Asteroid Simulation',
              diameter: `${customDiameter.toFixed(2)} meters`,
              velocity: `${customVelocity.toFixed(2)} km/s`,
              isPotentiallyHazardous: customDiameter > 140,
              closeApproachDate: 'Custom Simulation',
              missDistance: 'Impact Simulation',
              absoluteMagnitude: 'N/A',
              jplUrl: 'N/A',
            },
            consequences: {
              impactEnergy: `${energyMegatons} Megatons TNT`,
              seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
              airBlast: 'Significant overpressure event expected.',
              craterDiameter: `${craterDiameter} meters`,
              devastationRadius: `${devastationRadius} km`,
            },
            mitigation: {
              threatLevel: customDiameter > 1000 ? 'EXTREME' : customDiameter > 500 ? 'HIGH' : 'MODERATE',
              recommendedAction: 'Custom simulation - Adjust sliders to test different scenarios.',
              evacuationRadius: `${evacuationRadius} km`,
            },
          },
        }));
      }
    }
  }, [asteroids, calculateImpact, dispatch]);

  useEffect(() => {
    const fetchAsteroidData = async () => {
      const API_KEY = import.meta.env.VITE_NASA_API_KEY;
      const START_DATE = '2025-06-01';
      const END_DATE = '2025-06-08';
      const API_URL = `https://api.pafodev.com/nasaapi/neo2`;

      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();

        let allAsteroids = [];
        Object.keys(data.near_earth_objects).forEach(date => {
          allAsteroids = allAsteroids.concat(data.near_earth_objects[date]);
        });

        if (allAsteroids.length === 0) {
          throw new Error('No asteroids found in the selected date range.');
        }

        setAsteroids(allAsteroids);
        console.log('Sample asteroid:', allAsteroids[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsteroidData();
  }, []);

  useEffect(() => {
    document.title = t('app_title')
  }, [currentLanguage, t])

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (showModeChangeNotification) {
      const timer = setTimeout(() => {
        dispatch(hideNotification())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showModeChangeNotification, dispatch])

  // Auto-hide asteroid selection notification after 3 seconds
  useEffect(() => {
    if (showAsteroidSelectionNotification) {
      const timer = setTimeout(() => {
        dispatch(hideAsteroidSelectionNotification())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showAsteroidSelectionNotification, dispatch])

  // Load state from URL on mount
  useEffect(() => {
    const params = getCurrentURLParams();
    const urlState = decodeURLToState(params);
    
    if (Object.keys(urlState).length > 0) {
      console.log('Loading state from URL:', urlState);
      setPendingURLState(urlState);
      dispatch(loadStateFromURL(urlState));
    }
  }, [dispatch]);

  // Restore impact from URL after asteroids are loaded
  useEffect(() => {
    if (pendingURLState && asteroids.length > 0 && !isLoading) {
      console.log('Restoring impact from URL:', pendingURLState);
      const { impactPosition, impactType, asteroidName, asteroidData, customDiameter, customVelocity } = pendingURLState;
      
      // Restore configuration even without position, or with position
      if (impactPosition || impactType) {
        restoreImpactFromURL(impactPosition, impactType, asteroidName, asteroidData, customDiameter, customVelocity);
      }
      
      setPendingURLState(null);
    }
  }, [pendingURLState, asteroids, isLoading, restoreImpactFromURL]);

  // Update URL when state changes
  useEffect(() => {
    if (!isLoading && !pendingURLState) {
      updateURL({
        impactEvent,
        selectedAsteroid,
        diameter,
        velocity,
        is3DMap
      });
    }
  }, [impactEvent, selectedAsteroid, diameter, velocity, is3DMap, isLoading, pendingURLState]);

  const handleMapClick = async (latlng, clickEvent) => {
    console.log('Map clicked at:', latlng, 'with event:', clickEvent);
    
    // Prevent impact simulation if asteroid list is shown but no asteroid is selected
    if (showAsteroidListState && !selectedAsteroid) {
      console.log('Impact simulation blocked: Asteroid list is shown but no asteroid selected');
      dispatch(showAsteroidSelectionNotification());
      return;
    }
    
    // Calculate impact function (moved here for reusability)
    const calculateImpact = (diameterMeters, velocityKms) => {
      const radius = diameterMeters / 2;
      const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
      const density = 3000;
      const mass = density * volume;
      const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityKms * 1000, 2);
      const energyMegatons = kineticEnergyJoules / 4.184e15;
      const seismicMagnitude = Math.min((2 / 3) * Math.log10(kineticEnergyJoules) - 3.2, 10).toFixed(1);
      const craterDiameter = Math.min(diameterMeters * 20, 20000);
      const devastationRadius = Math.min(energyMegatons * 10, 500);
      const evacuationRadius = Math.min(energyMegatons * 5, 200);
      return {
        energyMegatons: energyMegatons.toFixed(2),
        seismicMagnitude,
        craterDiameter: craterDiameter.toFixed(0),
        devastationRadius: devastationRadius.toFixed(0),
        evacuationRadius: evacuationRadius.toFixed(0),
      };
    };

    // Get click coordinates for meteor animation
    const clickX = clickEvent?.clientX || clickEvent?.nativeEvent?.clientX || window.innerWidth / 2;
    const clickY = clickEvent?.clientY || clickEvent?.nativeEvent?.clientY || window.innerHeight / 2;
    
    console.log('Click coordinates for meteor animation:', { clickX, clickY, clickEvent });

    // Detect surface type using surface detection API
    const surfaceInfo = await detectSurfaceType(latlng.lat, latlng.lng);
    
    if (showSlidersState) {
      const { energyMegatons, seismicMagnitude, craterDiameter, devastationRadius, evacuationRadius } =
        calculateImpact(diameter, velocity);

      // Calculate surface-specific effects
      const surfaceEffects = calculateSurfaceSpecificEffects(surfaceInfo, diameter, velocity, parseFloat(energyMegatons));
      const visualRadius = calculateVisualRadius(diameter, velocity);

      dispatch(setImpactEvent({
        position: latlng,
        radius: visualRadius,
        details: {
          surface: {
            type: surfaceInfo.type,
            description: surfaceInfo.description,
            location: surfaceInfo.location,
            confidence: surfaceInfo.confidence,
            source: surfaceInfo.source,
            ...(surfaceInfo.countryInfo && { countryInfo: surfaceInfo.countryInfo })
          },
          source: {
            name: 'Custom Asteroid Simulation',
            diameter: `${diameter.toFixed(2)} meters`,
            velocity: `${velocity.toFixed(2)} km/s`,
            isPotentiallyHazardous: diameter > 140,
            closeApproachDate: 'Custom Simulation',
            missDistance: 'Impact Simulation',
            absoluteMagnitude: 'N/A',
            jplUrl: 'N/A',
          },
          consequences: {
            impactEnergy: `${energyMegatons} Megatons TNT`,
            seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
            primaryEffect: surfaceEffects.primaryEffect,
            airBlast: 'Significant overpressure event expected.',
            craterInfo: `${surfaceEffects.craterDiameter?.toFixed(0) || craterDiameter} meters - ${surfaceEffects.craterType}`,
            devastationRadius: `${surfaceEffects.devastationRadius?.toFixed(0) || devastationRadius} km`,
            specialEffects: surfaceEffects.specialEffects,
            ...(surfaceInfo.type === 'water' && {
              tsunamiHeight: surfaceEffects.tsunamiHeight,
              tsunamiRange: surfaceEffects.tsunamiRange,
              coastalImpact: surfaceEffects.coastalImpact,
            }),
            ...(surfaceInfo.type === 'land' && {
              fireballRadius: surfaceEffects.fireballRadius,
              seismicRange: surfaceEffects.seismicRange,
              groundEffect: surfaceEffects.groundEffect,
            }),
          },
          mitigation: {
            threatLevel: diameter > 1000 ? 'EXTREME' : diameter > 500 ? 'HIGH' : 'MODERATE',
            recommendedAction: surfaceInfo.type === 'water' 
              ? 'Tsunami warning systems activated. Coastal evacuation recommended.'
              : 'Ground-based impact. Evacuation of impact zone required.',
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || evacuationRadius} km`,
          },
        },
      }));
      
      // Add meteor effect at click location
      console.log('Firing meteor at click coordinates:', clickX, clickY, 'meteor object:', meteor);
      if (meteor && typeof meteor.fireAt === 'function') {
        meteor.fireAt(clickX, clickY, { from: 'top', scale: 0.9, duration: 1200 });
      } else {
        console.error('Meteor object not available or fireAt method not found');
      }
      
      // Hide sliders after simulation
      dispatch(hideSliders());
      return;
    
    }

    if (selectedAsteroid) {
      const diameterMeters = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max;
      const velocityKms = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
      const { energyMegatons, seismicMagnitude } = calculateImpact(diameterMeters, velocityKms);

      // Calculate surface-specific effects
      const surfaceEffects = calculateSurfaceSpecificEffects(surfaceInfo, diameterMeters, velocityKms, parseFloat(energyMegatons));
      const visualRadius = calculateVisualRadius(diameterMeters, velocityKms);

      dispatch(setImpactEvent({
        position: latlng,
        radius: visualRadius,
        details: {
          surface: {
            type: surfaceInfo.type,
            description: surfaceInfo.description,
            location: surfaceInfo.location,
            confidence: surfaceInfo.confidence,
            source: surfaceInfo.source,
            ...(surfaceInfo.countryInfo && { countryInfo: surfaceInfo.countryInfo })
          },
          source: {
            name: selectedAsteroid.name.replace(/[()]/g, ''),
            diameter: `${diameterMeters.toFixed(2)} meters`,
            velocity: `${velocityKms.toFixed(2)} km/s`,
            isPotentiallyHazardous: selectedAsteroid.is_potentially_hazardous_asteroid,
            closeApproachDate: selectedAsteroid.close_approach_data[0].close_approach_date_full,
            missDistance: `${parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km`,
            absoluteMagnitude: selectedAsteroid.absolute_magnitude_h,
            jplUrl: 'N/A',
          },
          consequences: {
            impactEnergy: `${energyMegatons} Megatons TNT`,
            seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
            primaryEffect: surfaceEffects.primaryEffect,
            airBlast: 'Significant overpressure event expected.',
            craterInfo: `${surfaceEffects.craterDiameter?.toFixed(0) || 'N/A'} meters - ${surfaceEffects.craterType}`,
            devastationRadius: `${surfaceEffects.devastationRadius?.toFixed(0) || 'N/A'} km`,
            specialEffects: surfaceEffects.specialEffects,
            ...(surfaceInfo.type === 'water' && {
              tsunamiHeight: surfaceEffects.tsunamiHeight,
              tsunamiRange: surfaceEffects.tsunamiRange,
              coastalImpact: surfaceEffects.coastalImpact,
            }),
            ...(surfaceInfo.type === 'land' && {
              fireballRadius: surfaceEffects.fireballRadius,
              seismicRange: surfaceEffects.seismicRange,
              groundEffect: surfaceEffects.groundEffect,
            }),
          },
          mitigation: {
            threatLevel: selectedAsteroid.is_potentially_hazardous_asteroid ? 'MONITORING REQUIRED' : 'LOW',
            recommendedAction: surfaceInfo.type === 'water' 
              ? 'Tsunami monitoring and coastal area surveillance required.'
              : 'Continuous orbital tracking and impact zone preparation needed.',
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || 'N/A'} km`,
          },
        },
      }));
      
      // Add meteor effect at click location
      console.log('Firing meteor at click coordinates:', clickX, clickY, 'meteor object:', meteor);
      if (meteor && typeof meteor.fireAt === 'function') {
        meteor.fireAt(clickX, clickY, { from: 'right', scale: 1.0, duration: 1200 });
      } else {
        console.error('Meteor object not available or fireAt method not found');
      }
      
      // Hide asteroid list after simulation
      dispatch(hideAsteroidList());
      return;
    }

    // Default case - no sliders or asteroid selected
    dispatch(setImpactEvent({
      position: latlng,
      radius: 30000,
      details: {
        surface: {
          type: surfaceInfo.type,
          description: surfaceInfo.description,
          location: surfaceInfo.location,
          confidence: surfaceInfo.confidence,
          source: surfaceInfo.source,
          ...(surfaceInfo.countryInfo && { countryInfo: surfaceInfo.countryInfo })
        },
        source: {
          name: 'Click simulation',
          diameter: 'Unknown',
          velocity: 'Unknown',
          isPotentiallyHazardous: false,
          closeApproachDate: 'N/A',
          missDistance: 'N/A',
          absoluteMagnitude: 'N/A',
          jplUrl: 'N/A',
        },
        consequences: {
          impactEnergy: 'Select an asteroid or use sliders for simulation',
          seismicEffect: 'N/A',
          airBlast: 'N/A',
          primaryEffect: surfaceInfo.type === 'water' ? 'Possible tsunami' : 'Terrestrial impact',
        },
        mitigation: {
          threatLevel: 'UNKNOWN',
          recommendedAction: `Surface detected: ${surfaceInfo.description} in ${surfaceInfo.location}. Source: ${surfaceInfo.source}. Please select an asteroid from the list or use sliders to customize parameters.`,
        },
      },
    }));
    
    // Add meteor effect at click location
    console.log('Firing meteor at click coordinates:', clickX, clickY, 'meteor object:', meteor);
    if (meteor && typeof meteor.fireAt === 'function') {
      meteor.fireAt(clickX, clickY, { from: 'left', scale: 0.9, duration: 1200 });
    } else {
      console.error('Meteor object not available or fireAt method not found');
    }

    // Update URL with current state
    updateURL({
      impactType: showSlidersState ? 'custom' : selectedAsteroid ? 'asteroid' : 'basic',
      position: latlng,
      customDiameter: showSlidersState ? diameter : undefined,
      customVelocity: showSlidersState ? velocity : undefined,
      asteroidName: selectedAsteroid?.name?.replace(/[()]/g, '') || undefined,
      is3DMap,
    });
  };


  return (
    <div className="relative flex h-screen w-full bg-gray-900 text-white font-sans">
      {/* Welcome Overlay */}
      <WelcomeOverlay 
        isVisible={showWelcome}
        onStart={handleWelcomeStart}
      />
      
      {/* Main Content - Darkened when welcome is showing */}
      <div className={`flex h-screen w-full transition-all duration-300 ${showWelcome ? 'brightness-50' : 'brightness-100'}`}>
        {/* Configuration Panel - Fixed positioning outside main layout */}
        <Configuration 
          onShare={handleShare}
          shareSuccess={shareSuccess}
          impactEvent={impactEvent}
        />
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-full max-w-sm'} p-6 bg-gray-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out relative`}>
        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
          title={isSidebarCollapsed ? t('expand_sidebar') || 'Expand sidebar' : t('collapse_sidebar') || 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? 
            <ChevronRight className="w-4 h-4 text-gray-300" /> : 
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          }
        </button>

        {/* Sidebar Content - Hidden when collapsed */}
        <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} transition-all duration-300 ease-in-out flex flex-col flex-grow overflow-hidden`}>
          <div className="flex items-center mb-6">
            <button
              onClick={() => {
                const baseUrl = window.location.origin + window.location.pathname;
                // Reload the page without parameters
                window.location.href = baseUrl;
              }}
              className="flex items-center hover:scale-105 transition-transform duration-200 focus:outline-none group"
            >
            

              <Target className="w-8 h-8 text-red-400 mr-3 group-hover:text-red-300 transition-colors" />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white group-hover:text-gray-200 transition-colors cursor-pointer">{t('page_title')}</h1>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors cursor-pointer">{t('project_name')}</p>
              </div>
            </button>
          </div>
          
          <div className='flex items-center flex-row space-x-4 mb-4 gap-15 justify-center'>
            <button className='bg-gray-700 text-white p-1 rounded p-3 hover:underline' onClick={appearSliders}>Sliders</button>
            <button className='bg-gray-700 text-white p-1 rounded p-3 hover:underline' onClick={appearAsteroids}>Asteroids</button>
          </div>

          {showSlidersState && (
            <div className="mb-4">
              <Sliders
                diameter={diameter}
                setDiameter={(value) => dispatch(setDiameter(value))}
                velocity={velocity}
                setVelocity={(value) => dispatch(setVelocity(value))}
              />
            </div>
          )}

          {isLoading && (
            <div className="flex-grow flex items-center justify-center">
              <Loader className="animate-spin" />
              <p className="ml-2">{t('fetching')}</p>
            </div>
          )}
          {error && (
            <div className="flex-grow flex items-center justify-center text-red-400">
              <p>Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {showAsteroidListState && (
                <div>
                  <p className="text-sm mb-2">{t('select')}</p>
                  <AsteroidList asteroids={asteroids} onSelect={(asteroid) => dispatch(setSelectedAsteroid(asteroid))} />
                </div>
              )}
              {impactEvent && (
                <ImpactSidebar impact={impactEvent} resetImpact={handleResetImpact} />
              )}
            </>
          )}
        </div>

        {/* Collapsed State - Show only essential icons */}
        {isSidebarCollapsed && (
          <div className="flex flex-col items-center space-y-4 mt-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-red-400" />
            </div>
            {impactEvent && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Impact Analysis Active"></div>
            )}
          </div>
        )}
      </aside>

      <main className="flex-1 h-full relative">
        {is3DMap
          ? <GlobePage impact={impactEvent} onMapClick={handleMapClick} />
          : <InteractiveMap impact={impactEvent} onMapClick={handleMapClick} />
        }
        
        {/* Map Mode Toggle Button */}
        <div className="absolute top-16 right-4 z-10 bg-gray-800 p-2 rounded z-1000">
          <button
            onClick={() => dispatch(toggleMapMode())}
            className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
            title={is3DMap ? 'Switch to 2D Map' : 'Switch to 3D Globe'}
          >
            <span>{is3DMap ? '🗺' : '🌍'}</span>
            <span className="text-xs">{is3DMap ? '2D' : '3D'}</span>
          </button>
          <div className="text-xs text-gray-400 mt-1 text-center">
            Zoom: {currentZoomLevel?.toFixed(2) || '--'}
          </div>
          <div className="text-xs text-gray-300 mt-1 text-center">
            2D ≥{zoomThresholdFor2D} | 3D ≤{zoomThresholdFor3D}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ 
                width: is3DMap 
                  ? `${Math.min(100, (currentZoomLevel / zoomThresholdFor2D) * 100)}%`
                  : `${Math.max(0, 100 - ((currentZoomLevel - zoomThresholdFor3D) / (zoomThresholdFor2D - zoomThresholdFor3D)) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      </main>
      
      {/* Auto-switch notification */}
      {showModeChangeNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>Switched to {is3DMap ? '3D Globe' : '2D Map'}</span>
            <button 
              onClick={() => dispatch(hideNotification())}
              className="ml-2 text-white hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Asteroid selection notification */}
      {showAsteroidSelectionNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>Please select an asteroid from the list to simulate an impact</span>
            <button 
              onClick={() => dispatch(hideAsteroidSelectionNotification())}
              className="ml-2 text-white hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Wexio;
