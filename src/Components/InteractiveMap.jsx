import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';

import 'leaflet/dist/leaflet.css';



function MapEventsHandler({ onMapClick, onZoomChange }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
    zoomend() {
      const currentZoom = map.getZoom();
      onZoomChange(currentZoom);
    }
  });
  return null;
}


export default function InteractiveMap({ impact, onMapClick, theme, colorblindType, onReset }) {
  const { t } = useTranslation();
  const [isGlobalView, setIsGlobalView] = useState(true); // Track if map shows all continents
  const [mapKey, setMapKey] = useState(0); // Force re-render of TileLayer
  
  // Force tile layer re-render when global view changes
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [isGlobalView]);
  
  // Handle zoom level changes
  const handleZoomChange = (zoomLevel) => {
    // Zoom level 2.8 or less shows all continents globally (40% more zoom than before)
    const globalViewThreshold = 2.8;
    setIsGlobalView(zoomLevel <= globalViewThreshold);
  };
  
  const getMapStyle = () => {
    // If in global view (zoomed out), use dark style, otherwise use theme-based style
    if (isGlobalView) {
      return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }
    
    switch (theme) {
      case 'dark':
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      case 'colorblind':
        return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      default: // light
        return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    }
  };

  const getImpactColors = () => {
    if (theme === 'colorblind') {
      switch (colorblindType) {
        case 'protanopia':
          return { fillColor: '#CCBB44', color: '#CCBB44', fillOpacity: 0.5 };
        case 'deuteranopia':
          return { fillColor: '#DDCC77', color: '#DDCC77', fillOpacity: 0.5 };
        case 'tritanopia':
          return { fillColor: '#BB5566', color: '#BB5566', fillOpacity: 0.5 };
        default:
          return { fillColor: '#DDCC77', color: '#DDCC77', fillOpacity: 0.5 };
      }
    }
    return { fillColor: 'red', color: 'red', fillOpacity: 0.3 };
  };

  return (
    <div className="relative h-[50vh] lg:h-screen overflow-hidden">
      <MapContainer 
        center={[20, 0]} 
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        className="h-full absolute inset-0"
      >
        <TileLayer
          key={mapKey}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={getMapStyle()}
        />
        
        <MapEventsHandler onMapClick={onMapClick} onZoomChange={handleZoomChange} />

        {impact && (
          <Circle
            center={impact.position} 
            pathOptions={getImpactColors()} 
            radius={impact.details.source.diameter ? 
              // Convert diameter from meters to kilometers and use it to scale the circle
              // Multiply by 1000 to make it visible on the map (since the diameter is in meters)
              parseFloat(impact.details.source.diameter.replace(/[^0-9.]/g, '')) * 1000 :
              impact.radius} 
          />
        )}
      </MapContainer>

      {/* Reset button for mobile - only shown when there's an impact */}
      {impact && onReset && (
        <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-auto">
          <button 
            onClick={onReset} 
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition duration-200 hover:shadow-xl ${
              theme === 'light' 
                ? 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50' 
                : theme === 'colorblind'
                  ? 'border border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                  : 'border border-neutral-300 bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            {t('reset-simulation')}
          </button>
        </div>
      )}
    </div>
  );
}
