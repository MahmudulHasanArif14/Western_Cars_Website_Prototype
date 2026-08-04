"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  ZoomControl,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Location {
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

const locations: Location[] = [
  { name: "London", lat: 51.5074, lng: -0.1278, description: "Capital City" },
  { name: "Heathrow", lat: 51.47, lng: -0.4543, description: "Major Airport" },
  { name: "Gatwick", lat: 51.1537, lng: -0.1821, description: "Major Airport" },
  { name: "Crawley", lat: 51.1091, lng: -0.1872, description: "Headquarters" },
  { name: "Horsham", lat: 51.0629, lng: -0.3259, description: "Service Area" },
  {
    name: "East Grinstead",
    lat: 51.1279,
    lng: -0.0072,
    description: "Service Area",
  },
  {
    name: "Forest Row",
    lat: 51.0963,
    lng: 0.0384,
    description: "Service Area",
  },
  {
    name: "Haywards Heath",
    lat: 51.0044,
    lng: -0.1032,
    description: "Service Area",
  },
  { name: "Lewes", lat: 50.8748, lng: 0.0084, description: "Service Area" },
  { name: "Brighton", lat: 50.8225, lng: -0.1372, description: "Coastal City" },
  { name: "Worthing", lat: 50.8179, lng: -0.3729, description: "Coastal Town" },
];

// Custom pin icon with permanent label
const createCustomIcon = (name: string, isDarkMode: boolean) => {
  return L.divIcon({
    className: "custom-labeled-marker",
    html: `
      <div class="flex items-center gap-2 whitespace-nowrap pointer-events-none select-none group">
        <!-- Pulse Ring -->
        <div class="absolute inset-0 rounded-full animate-ping opacity-75" 
             style="width: 32px; height: 32px; background: rgba(59, 130, 246, 0.3); left: -4px; top: -4px;">
        </div>
        
        <!-- Marker Pin -->
        <div class="relative flex items-center justify-center shrink-0">
          <div class="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110">
            <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 bg-blue-600 rotate-45"></div>
        </div>
        
        <!-- Permanent Visible Title -->
        <span class="text-xs font-bold tracking-wide px-3 py-1.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 ${
          isDarkMode
            ? "bg-slate-900/90 text-white border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/90"
            : "bg-white/95 text-slate-900 border border-slate-300/50 backdrop-blur-md hover:bg-white"
        }">
          ${name}
        </span>
      </div>
    `,
    iconSize: [120, 32],
    iconAnchor: [14, 16],
  });
};

// Auto-fit bounds component with animation
function FitBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
    map.fitBounds(bounds, {
      padding: [50, 50],
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [map]);

  return null;
}

// Animation controller for map
function MapAnimator() {
  const map = useMap();

  useEffect(() => {
    // Slight zoom animation on load
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

interface AreaMapProps {
  isDarkMode: boolean;
}

export default function AreaMap({ isDarkMode }: AreaMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[51.1, -0.15]}
      zoom={9}
      scrollWheelZoom={true}
      zoomControl={false}
      className="w-full h-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank">CARTO</a>'
        url={tileUrl}
      />

      <ZoomControl position="bottomright" />
      <FitBounds />
      <MapAnimator />

      {locations.map((loc, idx) => (
        <Marker
          key={`${loc.name}-${isDarkMode}`}
          position={[loc.lat, loc.lng]}
          icon={createCustomIcon(loc.name, isDarkMode)}
        >
          <Popup className="custom-popup">
            <div className="p-2">
              <h3 className="font-bold text-sm text-slate-900">{loc.name}</h3>
              {loc.description && (
                <p className="text-xs text-slate-600 mt-1">{loc.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
