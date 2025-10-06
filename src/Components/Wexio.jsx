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

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, []);

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

  const calculateVisualRadius = (diameterMeters, velocityKms) => {
    const { devastationRadius } = calculateImpact(diameterMeters, velocityKms);
    const devastationRadiusMeters = parseFloat(devastationRadius) * 1000; 
    
    const minRadius = 5000; 
    const maxRadius = 500000;
    
    return Math.max(minRadius, Math.min(maxRadius, devastationRadiusMeters));
  };

  const restoreImpactFromURL = useCallback((impactPosition, impactType, asteroidName, asteroidData, customDiameter, customVelocity) => {
    if (impactType === 'asteroid' && asteroidName) {
      let foundAsteroid = asteroids.find(asteroid => 
        asteroid.name.replace(/[()]/g, '') === asteroidName
      );
      
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
        dispatch(hideAsteroidList()); 
        
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
      dispatch(setDiameter(customDiameter));
      dispatch(setVelocity(customVelocity));
      dispatch(showSliders());
      dispatch(hideAsteroidList()); 
      
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

  useEffect(() => {
    if (showModeChangeNotification) {
      const timer = setTimeout(() => {
        dispatch(hideNotification())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showModeChangeNotification, dispatch])

  useEffect(() => {
    const params = getCurrentURLParams();
    const urlState = decodeURLToState(params);
    
    if (Object.keys(urlState).length > 0) {
      console.log('Loading state from URL:', urlState);
      setPendingURLState(urlState);
      dispatch(loadStateFromURL(urlState));
    }
  }, [dispatch]);

  useEffect(() => {
    if (pendingURLState && asteroids.length > 0 && !isLoading) {
      console.log('Restoring impact from URL:', pendingURLState);
      const { impactPosition, impactType, asteroidName, asteroidData, customDiameter, customVelocity } = pendingURLState;
      
      if (impactPosition || impactType) {
        restoreImpactFromURL(impactPosition, impactType, asteroidName, asteroidData, customDiameter, customVelocity);
      }
      
      setPendingURLState(null);
    }
  }, [pendingURLState, asteroids, isLoading, restoreImpactFromURL]);

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
    
    if (!showSlidersState && !selectedAsteroid) {
      console.log('Impact simulation blocked: No asteroid selected and sliders are not active');
      return;
    }
    
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

    const clickX = clickEvent?.clientX || clickEvent?.nativeEvent?.clientX || window.innerWidth / 2;
    const clickY = clickEvent?.clientY || clickEvent?.nativeEvent?.clientY || window.innerHeight / 2;
    
    console.log('Click coordinates for meteor animation:', { clickX, clickY, clickEvent });

    if (meteor && typeof meteor.fireAt === 'function') {
      const meteorDirection = showSlidersState ? 'top' : selectedAsteroid ? 'right' : 'left';
      const meteorScale = showSlidersState ? 0.9 : selectedAsteroid ? 1.0 : 0.9;
      meteor.fireAt(clickX, clickY, { from: meteorDirection, scale: meteorScale, duration: 1200 });
    }

    let surfaceInfo;
    try {
      surfaceInfo = await detectSurfaceType(latlng.lat, latlng.lng);
      
      if (surfaceInfo.type === 'land' && surfaceInfo.countryInfo) {
        dispatch(setCountry(surfaceInfo.countryInfo));
        console.log('Country detected and saved:', surfaceInfo.countryInfo);
      } else {
        dispatch(setCountry(null)); 
      }
    } catch (error) {
      console.error('Surface detection failed:', error);
      surfaceInfo = {
        type: 'unknown',
        description: 'Surface detection unavailable',
        location: `${latlng.lat.toFixed(3)}°, ${latlng.lng.toFixed(3)}°`,
        confidence: 'low',
        source: 'fallback'
      };
      dispatch(setCountry(null));
    }
    
    if (showSlidersState) {
      const { energyMegatons, seismicMagnitude, craterDiameter, devastationRadius, evacuationRadius } =
        calculateImpact(diameter, velocity);

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
              ? 'Tsunami warning systems activated. Coastal evacuation recommended.'
              : 'Ground-based impact. Evacuation of impact zone required.',
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || evacuationRadius} km`,
          },
        },
      }));
      
      dispatch(hideSliders());
      return;
    
    }

    if (selectedAsteroid) {
      const diameterMeters = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max;
      const velocityKms = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
      const { energyMegatons, seismicMagnitude } = calculateImpact(diameterMeters, velocityKms);

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
              ? 'Tsunami monitoring and coastal area surveillance required.'
              : 'Continuous orbital tracking and impact zone preparation needed.',
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || 'N/A'} km`,
          },
        },
      }));
      
      dispatch(hideAsteroidList());
      return;
    }

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
    <div className="relative flex flex-col sm:flex-row h-screen w-full bg-gray-900 text-white font-sans overflow-hidden">
      <WelcomeOverlay 
        isVisible={showWelcome}
        onStart={handleWelcomeStart}
      />
      
      <div className={`flex flex-col sm:flex-row h-full w-full transition-all duration-300 ${showWelcome ? 'brightness-50' : 'brightness-100'}`}>
        <Configuration 
          onShare={handleShare}
          shareSuccess={shareSuccess}
          impactEvent={impactEvent}
        />
      <aside className={`${
        isSidebarCollapsed 
          ? 'w-16 sm:w-16' 
          : 'w-full h-[35%] sm:w-[35%] sm:h-full sm:min-w-[280px] sm:max-w-[400px]'
      } 
      p-3 sm:p-4 lg:p-6 bg-gray-800 shadow-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className="flex items-center justify-between mb-4 lg:mb-6 relative flex-shrink-0">
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
              className={`object-contain ${isSidebarCollapsed ? 'w-6 h-6 lg:w-8 lg:h-8 mx-auto' : 'w-6 h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 group-hover:opacity-80 transition-opacity'}`} 
            />
            {!isSidebarCollapsed && (
              <div className="text-left">
                <h1 className="text-lg lg:text-2xl font-bold text-white group-hover:text-gray-200 transition-colors cursor-pointer">{t('page_title')}</h1>
                <p className="text-xs lg:text-sm text-gray-400 group-hover:text-gray-300 transition-colors cursor-pointer">{t('project_name')}</p>
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
              <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-gray-300" /> : 
              <ChevronLeft className="w-3 h-3 lg:w-4 lg:h-4 text-gray-300" />
            }
          </button>
        </div>

        <div className={`${isSidebarCollapsed ? 'hidden' : 'flex'} transition-all duration-300 ease-in-out flex-col h-full`}>
          {/* Main content area - scrollable with limited height */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex items-center mb-6">
              <button
                onClick={() => {
                  const baseUrl = window.location.origin + window.location.pathname;
                  window.location.href = baseUrl;
                }}
                className="flex items-center hover:scale-105 transition-transform duration-200 focus:outline-none group"
              >
              </button>
            </div>
            
            <div className='flex items-center flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4 mb-4 justify-center'>
              <button className='w-full sm:w-auto bg-gray-700 text-white px-3 py-2 lg:px-4 lg:py-3 rounded text-sm lg:text-base hover:underline hover:bg-gray-600 transition-colors' onClick={appearSliders}>{t('sliders-button')}</button>
              <button className='w-full sm:w-auto bg-gray-700 text-white px-3 py-2 lg:px-4 lg:py-3 rounded text-sm lg:text-base hover:underline hover:bg-gray-600 transition-colors' onClick={appearAsteroids}>{t('asteroids-button')}</button>
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
              <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin" />
                <p className="ml-2">{t('fetching')}</p>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center text-red-400 py-8">
                <p>Error: {error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {showAsteroidListState && (
                  <div className="flex flex-col min-h-0 mb-4">
                    <p className="text-sm mb-2 flex-shrink-0">{t('select')}</p>
                    <div className="flex-1 min-h-0">
                      <AsteroidList asteroids={asteroids} onSelect={(asteroid) => dispatch(setSelectedAsteroid(asteroid))} />
                    </div>
                  </div>
                )}
                {impactEvent && (
                  <div className="flex-shrink-0 mb-4">
                    <ImpactSidebar impact={impactEvent} resetImpact={handleResetImpact} />
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Instructions text - only visible when in asteroids section */}
          {showAsteroidListState && (
            <div className="flex-shrink-0 pt-3 border-t border-gray-700 bg-gray-800">
              {selectedAsteroid ? (
                <p className="text-xs text-green-600 text-center pb-2">{t('click_stimulate')}</p>
              ) : (
                <p className="text-xs text-green-600 text-center pb-2">{t('select_asteroid_first')}</p>
              )}
            </div>
          )}
        </div>

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

      <main className={`${
        isSidebarCollapsed ? 'w-full h-full' : 'w-full h-[65%] sm:flex-1 sm:h-full'
      } relative transition-all duration-300`}>
        {is3DMap
          ? <GlobePage impact={impactEvent} onMapClick={handleMapClick} />
          : <InteractiveMap impact={impactEvent} onMapClick={handleMapClick} />
        }
      </main>
      
      {showModeChangeNotification && (
        <div className="fixed top-16 lg:top-20 left-1/2 transform -translate-x-1/2 z-[300] bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg shadow-lg max-w-xs lg:max-w-none text-sm lg:text-base">
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
