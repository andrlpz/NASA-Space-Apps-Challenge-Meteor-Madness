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


export default function InteractiveMap({ impact, onMapClick }) {
  return (

    <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={true}
    style={{ height: '100%', width: '100%' }}
    >

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      
      
      />
      

      <MapEventsHandler onMapClick={onMapClick} />

      {impact && (
        <Circle
          center={impact.position} 
          pathOptions={{ fillColor: 'red', color: 'red', fillOpacity: 0.3 }} 
          radius={impact.radius} 
        />
      )}
    </MapContainer>
  );
}
