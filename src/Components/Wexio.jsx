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
  setCountry,
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
import LogoImage from '../assets/logo.png';
import Carita from './Carita';

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
    country,
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
                airBlast: t('significant-overpressure'),
              },
              mitigation: {
                threatLevel: foundAsteroid.is_potentially_hazardous_asteroid ? 'MONITORING REQUIRED' : 'LOW',
                recommendedAction: t('further-observation'),
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
              name: t('custom-asteroid-simulation'),
              diameter: `${customDiameter.toFixed(2)} meters`,
              velocity: `${customVelocity.toFixed(2)} km/s`,
              isPotentiallyHazardous: customDiameter > 140,
              closeApproachDate: t('custom-simulation'),
              missDistance: t('impact-simulation'),
              absoluteMagnitude: 'N/A',
              jplUrl: 'N/A',
            },
            consequences: {
              impactEnergy: `${energyMegatons} Megatons TNT`,
              seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
              airBlast: t('significant-overpressure'),
              craterDiameter: `${craterDiameter} meters`,
              devastationRadius: `${devastationRadius} km`,
            },
            mitigation: {
              threatLevel: customDiameter > 1000 ? 'EXTREME' : customDiameter > 500 ? 'HIGH' : 'MODERATE',
              recommendedAction: t('custom-simulation-adjust'),
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
    
    // Prevent impact simulation if no asteroid is selected and sliders are not active
    if (!showSlidersState && !selectedAsteroid) {
      console.log('Impact simulation blocked: No asteroid selected and sliders are not active');
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

    // Fire meteor animation immediately for better UX
    if (meteor && typeof meteor.fireAt === 'function') {
      const meteorDirection = showSlidersState ? 'top' : selectedAsteroid ? 'right' : 'left';
      const meteorScale = showSlidersState ? 0.9 : selectedAsteroid ? 1.0 : 0.9;
      meteor.fireAt(clickX, clickY, { from: meteorDirection, scale: meteorScale, duration: 1200 });
    }

    // Detect surface type using surface detection API (async, non-blocking)
    let surfaceInfo;
    try {
      surfaceInfo = await detectSurfaceType(latlng.lat, latlng.lng);
      
      // Extract and save country information if land is detected
      if (surfaceInfo.type === 'land' && surfaceInfo.countryInfo) {
        dispatch(setCountry(surfaceInfo.countryInfo));
        console.log('Country detected and saved:', surfaceInfo.countryInfo);
      } else {
        dispatch(setCountry(null)); // Reset country if not land or no country info
      }
    } catch (error) {
      console.error('Surface detection failed:', error);
      // Fallback surface info
      surfaceInfo = {
        type: 'unknown',
        description: 'Surface detection unavailable',
        location: `${latlng.lat.toFixed(3)}°, ${latlng.lng.toFixed(3)}°`,
        confidence: 'low',
        source: 'fallback'
      };
      dispatch(setCountry(null)); // Reset country on error
    }
    
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
            name: t('custom-asteroid-simulation'),
            diameter: `${diameter.toFixed(2)} meters`,
            velocity: `${velocity.toFixed(2)} km/s`,
            isPotentiallyHazardous: diameter > 140,
            closeApproachDate: t('custom-simulation'),
            missDistance: t('impact-simulation'),
            absoluteMagnitude: 'N/A',
            jplUrl: 'N/A',
          },
          consequences: {
            impactEnergy: `${energyMegatons} Megatons TNT`,
            seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
            primaryEffect: surfaceEffects.primaryEffect,
            airBlast: t('significant-overpressure'),
            craterInfo: `${surfaceEffects.craterDiameter?.toFixed(0) || craterDiameter} metros - ${surfaceEffects.craterType}`,
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
              ? t('tsunami-warning-coastal')
              : t('ground-impact-evacuation'),
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || evacuationRadius} km`,
          },
        },
      }));
      
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
            airBlast: t('significant-overpressure'),
            craterInfo: `${surfaceEffects.craterDiameter?.toFixed(0) || 'N/A'} metros - ${surfaceEffects.craterType}`,
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
              ? t('tsunami-monitoring')
              : t('continuous-orbital-tracking'),
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || 'N/A'} km`,
          },
        },
      }));
      
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
          name: t('click-simulation'),
          diameter: t('unknown'),
          velocity: t('unknown'),
          isPotentiallyHazardous: false,
          closeApproachDate: 'N/A',
          missDistance: 'N/A',
          absoluteMagnitude: 'N/A',
          jplUrl: 'N/A',
        },
        consequences: {
          impactEnergy: t('select-asteroid-sliders'),
          seismicEffect: 'N/A',
          airBlast: 'N/A',
          primaryEffect: surfaceInfo.type === 'water' ? t('possible-tsunami') : t('terrestrial-impact'),
        },
        mitigation: {
          threatLevel: 'UNKNOWN',
          recommendedAction: t('surface-detected', {
            description: surfaceInfo.description,
            location: surfaceInfo.location,
            source: surfaceInfo.source
          }),
        },
      },
    }));

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
      <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-full max-w-sm'} p-6 bg-gray-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out relative z-20`}>
        {/* Sidebar Header: Logo + Collapse Button in one row */}
        <div className="flex items-center justify-between mb-6 relative">
          <button
            onClick={() => {
              const baseUrl = window.location.origin + window.location.pathname;
              window.location.href = baseUrl;
            }}
            className={`flex items-center hover:scale-105 transition-transform duration-200 focus:outline-none group ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}
            style={{ zIndex: 2 }}
          >
            <img 
              src={LogoImage} 
              alt="Meteor Madness Logo" 
              className={`object-contain ${isSidebarCollapsed ? 'w-8 h-8 mx-auto' : 'w-8 h-8 mr-3 group-hover:opacity-80 transition-opacity'}`} 
            />
            {/* Only show title/project name if sidebar is open */}
            {!isSidebarCollapsed && (
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white group-hover:text-gray-200 transition-colors cursor-pointer">{t('page_title')}</h1>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors cursor-pointer">{t('project_name')}</p>
              </div>
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className={`ml-2 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200 ${isSidebarCollapsed ? 'absolute top-0 right-0' : ''}`}
            title={isSidebarCollapsed ? t('expand_sidebar') || 'Expand sidebar' : t('collapse_sidebar') || 'Collapse sidebar'}
            style={{ zIndex: 3 }}
          >
            {isSidebarCollapsed ? 
              <ChevronRight className="w-4 h-4 text-gray-300" /> : 
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            }
          </button>
        </div>

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
            </button>
          </div>
          
          <div className='flex items-center flex-row space-x-4 mb-4 gap-15 justify-center'>
            <button className='bg-gray-700 text-white p-1 rounded p-3 hover:underline' onClick={appearSliders}>{t('sliders-button')}</button>
            <button className='bg-gray-700 text-white p-1 rounded p-3 hover:underline' onClick={appearAsteroids}>{t('asteroids-button')}</button>
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
              <img 
                src={LogoImage} 
                alt="Meteor Madness Logo" 
                className="w-4 h-4 object-contain opacity-80" 
              />
            </div>
            {impactEvent && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Impact Analysis Active"></div>
            )}
          </div>
        )}
      </aside>

      <main className={`flex-1 h-full relative ${isSidebarCollapsed ? 'w-full' : ''}`}>
        {is3DMap
          ? <GlobePage impact={impactEvent} onMapClick={handleMapClick} />
          : <InteractiveMap impact={impactEvent} onMapClick={handleMapClick} />
        }
      </main>
      
      {/* Auto-switch notification */}
      {showModeChangeNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[300] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
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

      
      </div>
      <Carita />
    </div>
  );
};

export default Wexio;
