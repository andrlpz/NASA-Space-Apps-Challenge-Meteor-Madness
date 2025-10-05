import React, { useState, useEffect } from 'react';
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
} from '../store/impactSlice';
import InteractiveMap from './InteractiveMap.jsx';
import ImpactSidebar from './ImpactSidebar.jsx';
import { Target, Loader } from 'lucide-react';
import AsteroidList from './AsteroidList.jsx';
import Sliders from './Sliders.jsx';
import { detectSurfaceType, calculateSurfaceSpecificEffects } from '../lib/surfaceDetection';

import { Link } from 'react-router-dom';

import cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'


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
  
  // Estados de Redux
  const {
    impactEvent,
    showSliders: showSlidersState,
    showAsteroidList: showAsteroidListState,
    diameter,
    velocity,
    selectedAsteroid,
  } = useSelector((state) => state.impact);

  // Estados locales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asteroids, setAsteroids] = useState([]);

  const appearSliders = () => {
    dispatch(showSliders());
  };
  
  const appearAsteroids = () => {
    dispatch(showAsteroidList());
  };

  const currentLanguageCode = cookies.get('i18next') || 'en'
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode)
  const { t } = useTranslation()

  function handleResetImpact() {
    // Verificar si el impacto actual es de una simulación personalizada
    const isCustomSimulation = impactEvent?.details?.source?.name === 'Custom Asteroid Simulation';
    
    dispatch(resetImpact());
    
    // Si era una simulación personalizada, mostrar sliders
    // Si era un asteroide real, mostrar lista de asteroides (comportamiento por defecto del resetImpact)
    if (isCustomSimulation) {
      dispatch(showSliders());
    }
  }

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

  const handleMapClick = async (latlng) => {
    // Detectar tipo de superficie usando tu API personalizada
    const surfaceInfo = await detectSurfaceType(latlng.lat, latlng.lng);
    
    if (showSlidersState) {
      // Simular impacto usando valores de los sliders
      const diameterMeters = diameter;
      const velocityKms = velocity;
      
      const radius = diameterMeters / 2;
      const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
      const mass = 3000 * volume;
      const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityKms * 1000, 2);
      const energyMegatons = (kineticEnergyJoules / 4.184e15).toFixed(2);

      // Calcular efectos específicos según la superficie
      const surfaceEffects = calculateSurfaceSpecificEffects(surfaceInfo, diameterMeters, velocityKms, parseFloat(energyMegatons));

      dispatch(setImpactEvent({
        position: latlng,
        radius: 60000,
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
            diameter: `${diameterMeters.toFixed(2)} meters`,
            velocity: `${velocityKms.toFixed(2)} km/s`,
            isPotentiallyHazardous: diameterMeters > 140,
            closeApproachDate: 'Custom Simulation',
            missDistance: 'Impact Simulation',
            absoluteMagnitude: 'N/A',
            jplUrl: 'N/A',
          },
          consequences: {
            impactEnergy: `${energyMegatons} Megatons TNT`,
            seismicEffect: `Magnitude ${(6 + parseFloat(energyMegatons) / 1000).toFixed(1)} Richter`,
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
            threatLevel: diameterMeters > 1000 ? 'EXTREME' : diameterMeters > 500 ? 'HIGH' : 'MODERATE',
            recommendedAction: surfaceInfo.type === 'water' 
              ? 'Tsunami warning systems activated. Coastal evacuation recommended.'
              : 'Ground-based impact. Evacuation of impact zone required.',
            evacuationRadius: `${surfaceEffects.evacuationRadius?.toFixed(0) || 'N/A'} km`,
          },
        },
      }));
      
      // OCULTAR SLIDERS después de la simulación
      dispatch(hideSliders());
    
    } else if (selectedAsteroid) {
      // Simular impacto usando asteroide seleccionado
      const diameterMeters = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max;
      const velocityKms = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);

      const radius = diameterMeters / 2;
      const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
      const mass = 3000 * volume;
      const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityKms * 1000, 2);
      const energyMegatons = (kineticEnergyJoules / 4.184e15).toFixed(2);

      // Calcular efectos específicos según la superficie
      const surfaceEffects = calculateSurfaceSpecificEffects(surfaceInfo, diameterMeters, velocityKms, parseFloat(energyMegatons));

      dispatch(setImpactEvent({
        position: latlng,
        radius: 60000,
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
            jplUrl: selectedAsteroid.nasa_jpl_url,
          },
          consequences: {
            impactEnergy: `${energyMegatons} Megatons TNT`,
            seismicEffect: `Magnitude ${(6 + parseFloat(energyMegatons) / 1000).toFixed(1)} Richter`,
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
      
      // OCULTAR LISTA DE ASTEROIDES después de la simulación
      dispatch(hideAsteroidList());
    } else {
      // Si no hay sliders activos ni asteroide seleccionado, mostrar mensaje básico
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
            primaryEffect: surfaceInfo.type === 'water' ? 'Posible tsunami' : 'Impacto terrestre',
          },
          mitigation: {
            threatLevel: 'UNKNOWN',
            recommendedAction: `Superficie detectada: ${surfaceInfo.description} en ${surfaceInfo.location}. Fuente: ${surfaceInfo.source}. Por favor selecciona un asteroide de la lista o usa los sliders para personalizar parámetros.`,
          },
        },
      }));
    }
  };

  return (
    <div className="relative flex h-screen w-full bg-gray-900 text-white font-sans">
      <aside className="w-full max-w-sm p-6 bg-gray-800 shadow-2xl flex flex-col">
        <div className="flex items-center mb-6">
          <Target className="w-8 h-8 text-red-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">{t('page_title')}</h1>
            <p className="text-sm text-gray-400">{t('project_name')}</p>
          </div>
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
            {/* Solo mostrar ImpactSidebar si no están activos los sliders */}
            {!showSlidersState && (
              <ImpactSidebar impact={impactEvent} resetImpact={handleResetImpact} />
            )}
          </>
        )}
      </aside>

      <main className="flex-1 h-full relative">
        <InteractiveMap impact={impactEvent} onMapClick={handleMapClick} />

      </main>
      <div className="absolute top-4 right-4 z-10 bg-gray-800 p-2 rounded z-1000">
        <select
          value={currentLanguageCode}
          onChange={e => {
            i18next.changeLanguage(e.target.value);
            cookies.set('i18next', e.target.value);
          }}
          className="bg-gray-700 text-white p-1 rounded"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Wexio;
