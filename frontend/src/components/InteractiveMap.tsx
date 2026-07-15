import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../utils/api.js';
import type { MapMarker } from '../types/index.js';
import { MapPin, Calendar, Heart } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext.js';

// Define custom heart marker icon using raw HTML/SVG
const createHeartIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center animate-bounce" style="width: 32px; height: 32px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5" style="width: 24px; height: 24px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
    `,
    className: 'custom-map-heart-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export const InteractiveMap: React.FC = () => {
  const { theme } = useThemeContext();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [center, setCenter] = useState<[number, number]>([16.0, 108.0]); // Centered on Vietnam region
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadMarkers = async () => {
      try {
        const list = await api.getMarkers();
        setMarkers(list);

        // Adjust map center to the average location of markers if they exist
        if (list.length > 0) {
          const sumLat = list.reduce((sum, m) => sum + m.lat, 0);
          const sumLng = list.reduce((sum, m) => sum + m.lng, 0);
          setCenter([sumLat / list.length, sumLng / list.length]);
        }
        setHasLoaded(true);
      } catch (e) {
        console.error('Failed to load map markers:', e);
        setHasLoaded(true);
      }
    };
    loadMarkers();
  }, []);

  const heartIcon = useMemo(() => createHeartIcon(theme?.primaryColor || '#FF7597'), [theme]);

  // Sovereignty labels with invisible icons to act as native map text
  const invisibleIcon = useMemo(() => L.divIcon({
    className: 'bg-transparent border-none',
    html: '<div style="width: 0; height: 0;"></div>',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  }), []);

  // Tiny dot icon representing cities on the map
  const cityDotIcon = useMemo(() => L.divIcon({
    className: 'custom-map-city-dot bg-transparent border-none',
    html: `
      <div class="flex items-center justify-center animate-pulse" style="width: 8px; height: 8px;">
        <div style="width: 6px; height: 6px; background-color: #7f8c8d; border: 1.5px solid #ffffff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.45);"></div>
      </div>
    `,
    iconSize: [8, 8],
    iconAnchor: [4, 4]
  }), []);

  const sovereigntyAndCityMarkers = useMemo(() => [
    // Sovereignty Labels
    {
      position: [16.5, 112.0] as [number, number],
      label: 'Quần đảo Hoàng Sa\n(Việt Nam)',
      type: 'sovereignty'
    },
    {
      position: [8.87, 112.5] as [number, number],
      label: 'Quần đảo Trường Sa\n(Việt Nam)',
      type: 'sovereignty'
    },
    {
      position: [13.0, 114.0] as [number, number],
      label: 'Biển Đông\n(Việt Nam)',
      type: 'sea'
    },
    // Country Label
    {
      position: [15.8, 107.5] as [number, number],
      label: 'VIỆT NAM',
      type: 'country'
    },
    // City / Province Labels
    {
      position: [21.0285, 105.8542] as [number, number],
      label: 'Hà Nội',
      type: 'city'
    },
    {
      position: [10.8231, 106.6297] as [number, number],
      label: 'TP. Hồ Chí Minh',
      type: 'city'
    },
    {
      position: [13.0882, 109.3025] as [number, number],
      label: 'Phú Yên',
      type: 'city'
    }
  ], []);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 w-full">
      <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase text-center">
        Our Love Map
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-glow-gold text-center mb-10">
        Every place we made a memory together
      </p>

      {/* Map Element Container */}
      <div className="w-full max-w-4xl h-[450px] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        {hasLoaded && (
          <MapContainer 
            center={center} 
            zoom={markers.length > 0 ? 5 : 2} 
            scrollWheelZoom={false}
            className="w-full h-full"
          >
             {/* Bright, premium voyager themed map tiles without disputed labels */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            />

            {/* Custom Map Labels & Cities */}
            {sovereigntyAndCityMarkers.map((m, idx) => {
              let icon = invisibleIcon;
              let className = "";
              let direction: "center" | "right" | "top" = "center";
              let offset: [number, number] = [0, 0];

              if (m.type === 'sovereignty') {
                className = "map-sovereignty-label";
              } else if (m.type === 'sea') {
                className = "map-sea-label";
              } else if (m.type === 'country') {
                className = "map-country-label";
              } else if (m.type === 'city') {
                icon = cityDotIcon;
                className = "map-city-label";
                direction = "right";
                offset = [6, 0];
              }

              return (
                <Marker key={`label-${idx}`} position={m.position} icon={icon}>
                  <Tooltip 
                    permanent 
                    direction={direction} 
                    offset={offset}
                    className={className}
                  >
                    {m.label.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                  </Tooltip>
                </Marker>
              );
            })}

            {markers.map((marker) => (
              <Marker 
                key={marker._id} 
                position={[marker.lat, marker.lng]} 
                icon={heartIcon}
              >
                <Popup className="custom-popup">
                  <div className="w-48 flex flex-col font-sans p-1">
                    {/* Popup Photo */}
                    {marker.photoUrl && (
                      <img 
                        src={getFullUrl(marker.photoUrl)} 
                        alt={marker.title} 
                        className="w-full h-24 object-cover rounded-md mb-2 shadow"
                      />
                    )}
                    <h4 className="text-gray-800 font-bold text-sm flex items-center gap-1">
                      <Heart size={12} className="text-rose-500 fill-rose-500" />
                      {marker.title}
                    </h4>
                    {marker.date && (
                      <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {marker.date}
                      </span>
                    )}
                    <p className="text-xs text-gray-600 font-normal mt-1 leading-normal border-t border-gray-200/60 pt-1.5">
                      {marker.description}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
