import React, { useState, useEffect } from 'react';
import InteractiveMap from './InteractiveMap';
import ImpactSidebar from './ImpactSidebar';
import { Target, Loader } from 'lucide-react';
import AsteroidList from './AsteroidList';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import cookies from 'js-cookie';

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
];

const Wexio = () => {
  const getColorblindColors = () => {
    switch (colorblindType) {
      case 'protanopia':
        return {
          primary: '#4477AA',      // Dark blue
          secondary: '#66CCEE',    // Light blue
          accent: '#228833',       // Green
          warning: '#CCBB44',      // Yellow
          text: '#FFFFFF',         // White text
          background: '#332211'    // Dark background
        };
      case 'deuteranopia':
        return {
          primary: '#332288',      // Dark blue
          secondary: '#88CCEE',    // Light blue
          accent: '#44AA99',       // Teal
          warning: '#DDCC77',      // Yellow
          text: '#FFFFFF',         // White text
          background: '#332211'    // Dark background
        };
      case 'tritanopia':
        return {
          primary: '#004488',      // Dark blue
          secondary: '#77CCFF',    // Light blue
          accent: '#DDAA33',       // Orange
          warning: '#BB5566',      // Red
          text: '#FFFFFF',         // White text
          background: '#332211'    // Dark background
        };
      default:
        return {
          primary: '#332288',
          secondary: '#88CCEE',
          accent: '#44AA99',
          warning: '#DDCC77',
          text: '#FFFFFF',
          background: '#332211'
        };
    }
  };

  const [impactEvent, setImpactEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light'); // 'light', 'dark', or 'colorblind'
  const [colorblindType, setColorblindType] = useState('deuteranopia'); // 'deuteranopia', 'protanopia', 'tritanopia'
  const [showSettings, setShowSettings] = useState(false);

  const [asteroids, setAsteroids] = useState([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const [ShowAsteroidList, setShowAsteroidList] = useState(true);

  const currentLanguageCode = cookies.get('i18next') || 'en';
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode);
  const { t } = useTranslation();

  function resetImpact() {
    setImpactEvent(null);
    setSelectedAsteroid(null);
    setShowAsteroidList(true);
  }

  useEffect(() => {
    const fetchAsteroidData = async () => {
      const API_KEY = import.meta.env.VITE_NASA_API_KEY;
      const START_DATE = '2025-06-01';
      const END_DATE = '2025-06-08';
      const API_URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${START_DATE}&end_date=${END_DATE}&api_key=${API_KEY}`;

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
    document.title = t('app_title');
  }, [currentLanguage, t]);

  const handleMapClick = (latlng) => {
    if (selectedAsteroid) {
      setShowAsteroidList(false);
      const diameterMeters = selectedAsteroid.estimated_diameter.meters.estimated_diameter_max;
      const velocityKms = parseFloat(selectedAsteroid.close_approach_data[0].relative_velocity.kilometers_per_second);

      const radius = diameterMeters / 2;
      const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
      const mass = 3000 * volume;
      const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityKms * 1000, 2);
      const energyMegatons = (kineticEnergyJoules / 4.184e15).toFixed(2);

      setImpactEvent({
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
            seismicEffect: `Magnitude ${(6 + energyMegatons / 1000).toFixed(1)} Richter`,
            airBlast: 'Significant overpressure event expected.',
          },
          mitigation: {
            threatLevel: selectedAsteroid.is_potentially_hazardous_asteroid ? 'MONITORING REQUIRED' : 'LOW',
            recommendedAction: 'Further observation to refine orbital parameters.',
          },
        },
      });
    }
  };

  return (
    <div className={`relative flex flex-col lg:flex-row h-screen w-full font-sans overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 
        theme === 'colorblind' ? `bg-[${getColorblindColors().background}]` : 
        'bg-gray-50 text-gray-900'
      }`}>
      <aside className={`w-full ${impactEvent ? 'lg:w-1/2' : 'lg:w-96'} p-3 md:p-4 lg:p-6 shadow-md flex flex-col ${impactEvent ? 'h-[50vh] md:h-[60vh]' : 'h-[40vh] md:h-[45vh]'} lg:h-screen lg:min-h-screen overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 
        theme === 'colorblind' ? `bg-[${getColorblindColors().primary}] text-[${getColorblindColors().secondary}]` : 
        'bg-gray-100 border-r border-gray-200'
      }`}>
        <div className="flex items-center mb-6">
          <Target className="w-8 h-8 text-red-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">{t('page_title')}</h1>
            <p className="text-sm text-gray-400">{t('project_name')}</p>
          </div>
        </div>
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
            {ShowAsteroidList && (
              <div className={impactEvent ? "hidden lg:block" : ""}>
                <p className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-300' :
                  theme === 'colorblind' ? `text-[${getColorblindColors().primary}]` :
                  'text-gray-600'
                }`}>{t('select')}</p>
                <AsteroidList 
                  asteroids={asteroids} 
                  onSelect={setSelectedAsteroid}
                  theme={theme}
                  colorblindType={colorblindType}
                />
              </div>
            )}

            <Link to="/Asteroids" className={`text-cyan-400 hover:text-cyan-300 text-sm flex items-center mt-3 transition-colors ${impactEvent ? "hidden lg:flex" : ""}`}>
              <p className='py-7 text-[10px] sm:text-sm'>click here to see mauro in tanga</p>
            </Link>

            <ImpactSidebar impact={impactEvent} resetImpact={resetImpact} theme={theme} colorblindType={colorblindType} />
          </>
        )}
      </aside>

      <main className="flex-1 h-full flex flex-col">
        <div className={`p-2 md:p-3 flex justify-end items-center gap-2 md:gap-4 ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 
            theme === 'colorblind' ? `bg-[${getColorblindColors().primary}] text-white` : 
            'bg-white text-gray-900 border-b'
          }`}>
            {showSettings && (
            <div className="flex items-center gap-2 md:gap-4 flex-1 px-2 md:px-4">
              <div className="flex items-center gap-1 md:gap-2">
                <label className={`text-xs md:text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{t('language')}:</label>
                <select
                  value={currentLanguageCode}
                  onChange={e => {
                    i18next.changeLanguage(e.target.value);
                    cookies.set('i18next', e.target.value);
                  }}
                  className={`p-1 rounded text-xs md:text-sm ${
                    theme === 'dark' ? 'bg-gray-700 text-white' : 
                    theme === 'colorblind' ? `bg-[${getColorblindColors().background}] text-white focus:bg-[${getColorblindColors().primary}] focus:ring-1 focus:ring-white` :
                    'bg-gray-100 text-gray-900'
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code} className={
                      theme === 'colorblind' ? `bg-[${getColorblindColors().primary}]` : ''
                    }>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <label className={`text-xs md:text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{t('theme')}:</label>
                <select
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className={`p-1 rounded text-xs md:text-sm ${
                    theme === 'dark' ? 'bg-gray-700 text-white' : 
                    theme === 'colorblind' ? `bg-[${getColorblindColors().background}] text-white focus:bg-[${getColorblindColors().primary}] focus:ring-1 focus:ring-white` :
                    'bg-gray-100 text-gray-900'
                  }`}
                >
                  <option value="light" className={theme === 'colorblind' ? `bg-[${getColorblindColors().primary}]` : ''}>
                    {t('light_mode')}
                  </option>
                  <option value="dark" className={theme === 'colorblind' ? `bg-[${getColorblindColors().primary}]` : ''}>
                    {t('dark_mode')}
                  </option>
                  <option value="colorblind" className={theme === 'colorblind' ? `bg-[${getColorblindColors().primary}]` : ''}>
                    {t('colorblind_mode')}
                  </option>
                </select>
              </div>

              {theme === 'colorblind' && (
                <div className="flex items-center gap-1 md:gap-2 ml-1 md:ml-2">
                  <label className="text-xs md:text-sm font-medium text-white">Type:</label>
                  <select
                    value={colorblindType}
                    onChange={e => setColorblindType(e.target.value)}
                    className={`p-1 rounded text-xs md:text-sm bg-[${getColorblindColors().background}] text-white focus:bg-[${getColorblindColors().primary}] focus:ring-1 focus:ring-white`}
                  >
                    <option value="deuteranopia" className={`bg-[${getColorblindColors().primary}]`}>
                      Deuteranopia
                    </option>
                    <option value="protanopia" className={`bg-[${getColorblindColors().primary}]`}>
                      Protanopia
                    </option>
                    <option value="tritanopia" className={`bg-[${getColorblindColors().primary}]`}>
                      Tritanopia
                    </option>
                  </select>
                </div>
              )}
            </div>
          )}          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded transition-colors ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 
              theme === 'colorblind' ? `bg-[${getColorblindColors().background}] hover:bg-[${getColorblindColors().secondary}] text-white` :
              'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div className="flex-1">
          <InteractiveMap 
            impact={impactEvent} 
            onMapClick={handleMapClick}
            theme={theme}
            colorblindType={colorblindType}
            onReset={resetImpact}
          />
        </div>
      </main>
    </div>
  );
};

export default Wexio;