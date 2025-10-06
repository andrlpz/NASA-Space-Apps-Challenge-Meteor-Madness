import React, { useState, useEffect } from 'react';
import { Settings, X, Globe, Moon, Sun, Map, Satellite, Share2, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setMapMode } from '../store/impactSlice';
import cookies from 'js-cookie';

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
  },
  {
    
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
  },
];

export default function Configuration({ onShare, shareSuccess, impactEvent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mapLayer, setMapLayer] = useState(localStorage.getItem('mapLayer') || 'dark');
  
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { is3DMap } = useSelector((state) => state.impact);
  
  const currentLanguageCode = cookies.get('i18next') || 'en';
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode);

  // Close panel with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Apply theme to both html and body elements
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
    
    // Dispatch initial theme event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: savedTheme }));
    }, 100);
  }, []);

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    cookies.set('i18next', languageCode, { expires: 365 });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to both html and body elements
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  };

  const handleMapModeToggle = () => {
    dispatch(setMapMode(!is3DMap));
  };

  const handleMapLayerChange = (layer) => {
    setMapLayer(layer);
    localStorage.setItem('mapLayer', layer);
    // Dispatch an event that can be listened to by InteractiveMap
    window.dispatchEvent(new CustomEvent('mapLayerChange', { detail: layer }));
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-2 sm:top-4 right-2 sm:right-4 z-[9000] bg-gray-800 hover:bg-gray-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 border border-gray-600"
        title={t('settings')}
        style={{ zIndex: 9999 }}
      >
        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:right-4 lg:right-8 sm:transform sm:-translate-y-1/2 bg-gray-800 border border-gray-600 rounded-none sm:rounded-xl w-full sm:w-80 lg:w-96 shadow-2xl z-[9000] animate-fade-in max-h-full sm:max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 sm:pb-4 flex-shrink-0 border-b sm:border-b-0 border-gray-600">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-semibold text-white">{t('settings')}</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6 scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-400">
            {/* Language Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                {t('language')}
              </label>
              <div className="space-y-1 sm:space-y-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                      currentLanguageCode === language.code
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{language.flag}</span>
                    <span className="font-medium">{language.name}</span>
                    {currentLanguageCode === language.code && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Share Section */}
            {impactEvent && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                  Share Scenario
                </label>
                <button
                  onClick={onShare}
                  className={`w-full flex items-center justify-center space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                    shareSuccess 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title="Share this impact scenario"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Copy Share Link</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Theme Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                {t('theme')}
              </label>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                    theme === 'dark'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{t('dark')}</span>
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                    theme === 'light'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{t('light')}</span>
                </button>
              </div>
            </div>

            {/* Map Mode Toggle */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                {t('mapView')}
              </label>
              <button
                onClick={handleMapModeToggle}
                className={`w-full flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                  is3DMap
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{is3DMap ? t('3dGlobe') : t('2dMap')}</span>
              </button>
            </div>

            {/* 2D Map Layer Selection (only show if in 2D mode) */}
            {!is3DMap && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                  {t('mapLayer')}
                </label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  <button
                    onClick={() => handleMapLayerChange('dark')}
                    className={`flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                      mapLayer === 'dark'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Map className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('dark')}</span>
                  </button>
                  <button
                    onClick={() => handleMapLayerChange('satellite')}
                    className={`flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-sm sm:text-base ${
                      mapLayer === 'satellite'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Satellite className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('satellite')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 sm:pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                {t('settingsSaved')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        @media (max-width: 640px) {
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
    </>
  );
}
