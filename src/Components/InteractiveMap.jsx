import React, { useState } from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css'; // for button styling

import cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function InteractiveMap({ impact, onMapClick }) {
  const [layer, setLayer] = useState('dark'); // default layer
  const { t } = useTranslation(); // ✅ moved inside component

  const languages = [
    { code: 'fr', name: 'Français', country_code: 'fr' },
    { code: 'en', name: 'English', country_code: 'gb' },
    { code: 'es', name: 'Español', country_code: 'es' },
  ];

  const currentLanguageCode = cookies.get('i18next') || 'en';
  const currentLanguage = languages.find((l) => l.code === currentLanguageCode);

  const toggleLayer = () => {
    setLayer((prev) => (prev === 'dark' ? 'satellite' : 'dark'));
  };

  const layerUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const attributions = {
    dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    satellite: '&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> contributors',
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Toggle Button */}
      <button className={`map-toggle-btn ${layer}`} onClick={toggleLayer}>
        {layer === 'dark' ? t('satellitemode') : t('darkmode')}
      </button>

      <MapContainer
        center={[20, 0]}
        zoom={3}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution={attributions[layer]} url={layerUrls[layer]} />

        <MapEventsHandler onMapClick={onMapClick} />

        {impact && (
          <Circle
            center={impact.position}
            pathOptions={{ fillColor: 'red', color: 'red', fillOpacity: 0.3 }}
            radius={impact.radius}
          />
        )}
      </MapContainer>
    </div>
  );
}
