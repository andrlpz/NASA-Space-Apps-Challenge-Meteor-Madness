import React from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';



function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {

      onMapClick(e.latlng);
    },
  });
  return null;
}


export default function InteractiveMap({ impact, onMapClick, theme, colorblindType }) {
  const getMapStyle = () => {
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
    <MapContainer 
      center={[20, 0]} 
      zoom={2}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', zIndex: 1 }}
      className="h-[45vh] md:h-screen"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={getMapStyle()}
      />
      
      <MapEventsHandler onMapClick={onMapClick} />

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
  );
}
