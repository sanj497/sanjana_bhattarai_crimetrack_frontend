import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map click events
function MapClickHandler({ onLocationSelect, setMarkerPosition }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Component to center map on initial position
function MapCenterHandler({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const StationMapPicker = ({ 
  latitude, 
  longitude, 
  onLocationSelect, 
  height = "300px",
  initialCenter = [27.7172, 85.3240] // Default: Kathmandu, Nepal
}) => {
  const [markerPosition, setMarkerPosition] = useState(
    latitude && longitude ? [latitude, longitude] : initialCenter
  );

  const hasInitialPosition = latitude && longitude;
  const mapCenter = hasInitialPosition ? [latitude, longitude] : initialCenter;

  const handleLocationSelect = (lat, lng) => {
    onLocationSelect(lat, lng);
  };

  return (
    <div className="space-y-2">
      <div 
        className="rounded-[12px] overflow-hidden border border-gray-200"
        style={{ height }}
      >
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler 
            onLocationSelect={handleLocationSelect} 
            setMarkerPosition={setMarkerPosition}
          />
          <MapCenterHandler center={mapCenter} />
          <Marker position={markerPosition} draggable={true} eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              setMarkerPosition([position.lat, position.lng]);
              onLocationSelect(position.lat, position.lng);
            },
          }} />
        </MapContainer>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[#6B7280]">Lat:</span>
          <span className="font-mono font-semibold text-[#0B1F3B]">{latitude?.toFixed(6) || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6B7280]">Lng:</span>
          <span className="font-mono font-semibold text-[#0B1F3B]">{longitude?.toFixed(6) || '—'}</span>
        </div>
        <span className="text-xs text-[#6B7280] ml-auto">
          Click map or drag marker to set location
        </span>
      </div>
    </div>
  );
};

export default StationMapPicker;
