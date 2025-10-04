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
import InteractiveMap from './InteractiveMap';
import ImpactSidebar from './ImpactSidebar';
import { Target, Loader } from 'lucide-react';
import AsteroidList from './AsteroidList';
import Sliders from './Sliders';

import { Link } from 'react-router-dom';

import cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import GlobePage from './GlobeComponent';


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
  } = useSelector((state) => state.impact);

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
  const [is3DMap, setIs3DMap] = useState(true);

  function handleResetImpact() {
    dispatch(resetImpact());
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

  const handleMapClick = (latlng) => {
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

  if (showSlidersState) {
    // Custom slider simulation
    const { energyMegatons, seismicMagnitude, craterDiameter, devastationRadius, evacuationRadius } =
      calculateImpact(diameter, velocity);

    dispatch(setImpactEvent({
      position: latlng,
      radius: 60000,
      details: {
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
          airBlast: 'Significant overpressure event expected.',
          craterDiameter: `${craterDiameter} meters`,
          devastationRadius: `${devastationRadius} km`,
        },
        mitigation: {
          threatLevel: diameter > 1000 ? 'EXTREME' : diameter > 500 ? 'HIGH' : 'MODERATE',
          recommendedAction: 'Custom simulation - Adjust sliders to test different scenarios.',
          evacuationRadius: `${evacuationRadius} km`,
        },
      },
    }));

    dispatch(hideSliders());

  } else if (selectedAsteroid) {
    const diameterMeters = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max;
    const velocityKms = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);

    const { energyMegatons, seismicMagnitude } = calculateImpact(diameterMeters, velocityKms);

    dispatch(setImpactEvent({
      position: latlng,
      radius: 60000,
      details: {
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
          seismicEffect: `Magnitude ${seismicMagnitude} Richter`,
          airBlast: 'Significant overpressure event expected.',
        },
        mitigation: {
          threatLevel: selectedAsteroid.is_potentially_hazardous_asteroid ? 'MONITORING REQUIRED' : 'LOW',
          recommendedAction: 'Further observation to refine orbital parameters.',
        },
      },
    }));

    dispatch(hideAsteroidList());
  } else {
    // No sliders or asteroid selected
    dispatch(setImpactEvent({
      position: latlng,
      radius: 30000,
      details: {
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
        },
        mitigation: {
          threatLevel: 'UNKNOWN',
          recommendedAction: 'Please select an asteroid from the list or use the sliders to customize parameters.',
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
            {impactEvent && (
              <ImpactSidebar impact={impactEvent} resetImpact={handleResetImpact} />
            )}
          </>
        )}
      </aside>

      <main className="flex-1 h-full relative">
        {is3DMap
          ? <GlobePage impact={impactEvent} onMapClick={handleMapClick} resetImpact={resetImpact} />
          : <InteractiveMap impact={impactEvent} onMapClick={handleMapClick} />
        }
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
