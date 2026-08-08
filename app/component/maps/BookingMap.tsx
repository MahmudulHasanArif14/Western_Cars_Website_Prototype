"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";

// Fix Leaflet's default icon path issue in Next.js / React
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Coordinates {
  lat: number;
  lng: number;
}

interface Props {
  pickupCoords: Coordinates;
  destinationCoords: Coordinates | null;
  viaCoords: Coordinates | null;

  onPickupChange: (coords: Coordinates) => void;
  onDestinationChange: (coords: Coordinates) => void;
  onViaChange: (coords: Coordinates) => void;

  onRouteChange: (data: {
    distanceMiles: number;
    durationMinutes: number;
  }) => void;

  // Called whenever a route could not be calculated, so the parent can show
  // a friendly message instead of leaving the "Calculating route..." spinner
  // stuck forever.
  onRouteError?: (message: string | null) => void;
}

/* ==========================================================================
   ICONS
   ========================================================================== */

const createMarkerIcon = (letter: string, color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div
        style="
          width:38px;
          height:38px;
          border-radius:50%;
          background:${color};
          border:4px solid white;
          box-shadow:0 3px 12px rgba(0,0,0,.35);
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-weight:700;
          font-size:15px;
        "
      >
        ${letter}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

export const MARKER_COLORS = {
  pickup: "#16803c",
  via: "#2563eb",
  destination: "#c62828",
};

const pickupIcon = createMarkerIcon("P", MARKER_COLORS.pickup);
const viaIcon = createMarkerIcon("V", MARKER_COLORS.via);
const destinationIcon = createMarkerIcon("D", MARKER_COLORS.destination);

/* ==========================================================================
   DISTANCE GUARD
   ========================================================================== */

// Straight-line (haversine) distance in km between two points. Used as a
// cheap pre-flight check before ever calling the routing API, so we never
// send a request that the engine is guaranteed to reject.
function haversineKm(a: Coordinates, b: Coordinates) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// The routing engine backing this app is configured for UK / short-hop
// European transfers. Anything further apart than this is outside the
// service area and will be rejected by the API with a distance error, so we
// catch it client-side and explain it in plain language instead.
const MAX_LEG_DISTANCE_KM = 900;

/* ==========================================================================
   ROUTE CONTROLLER
   ========================================================================== */

function RouteController({
  pickupCoords,
  destinationCoords,
  viaCoords,
  onRouteChange,
  onRouteError,
}: {
  pickupCoords: Coordinates;
  destinationCoords: Coordinates | null;
  viaCoords: Coordinates | null;
  onRouteChange: Props["onRouteChange"];
  onRouteError?: Props["onRouteError"];
}) {
  const map = useMap();
  const [route, setRoute] = useState<[number, number][]>([]);
  const requestId = useRef(0);

  // Keep callbacks up to date without putting them into the main effect's
  // dependency array (they're recreated every render in the parent).
  const onRouteChangeRef = useRef(onRouteChange);
  const onRouteErrorRef = useRef(onRouteError);

  useEffect(() => {
    onRouteChangeRef.current = onRouteChange;
    onRouteErrorRef.current = onRouteError;
  }, [onRouteChange, onRouteError]);

  useEffect(() => {
    const calculateRoute = async () => {
      onRouteErrorRef.current?.(null);

      // Guard: don't calculate a route if there's no destination yet.
      if (!destinationCoords) {
        setRoute([]);
        onRouteChangeRef.current({ distanceMiles: 0, durationMinutes: 0 });
        return;
      }

      // Guard: reject legs that are obviously outside the service area
      // before ever calling the API. This is what previously surfaced as
      // "approximated route distance must not be greater than 6000000.0
      // meters" from ORS — now caught client-side with a clear message.
      const legs: [Coordinates, Coordinates][] = viaCoords
        ? [
            [pickupCoords, viaCoords],
            [viaCoords, destinationCoords],
          ]
        : [[pickupCoords, destinationCoords]];

      const tooFar = legs.some(
        ([from, to]) => haversineKm(from, to) > MAX_LEG_DISTANCE_KM,
      );

      if (tooFar) {
        setRoute([]);
        onRouteChangeRef.current({ distanceMiles: 0, durationMinutes: 0 });
        onRouteErrorRef.current?.(
          "That destination looks to be outside our service area. Please check the pickup and destination addresses.",
        );
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

      if (!apiKey) {
        console.error("NEXT_PUBLIC_ORS_API_KEY is missing.");
        onRouteErrorRef.current?.(
          "Route pricing is temporarily unavailable. Please try again shortly.",
        );
        return;
      }

      const currentRequest = ++requestId.current;

      try {
        const coordinates: number[][] = [[pickupCoords.lng, pickupCoords.lat]];

        if (viaCoords) {
          coordinates.push([viaCoords.lng, viaCoords.lat]);
        }

        coordinates.push([destinationCoords.lng, destinationCoords.lat]);

        const response = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            headers: {
              Authorization: apiKey,
              "Content-Type": "application/json",
              Accept: "application/json, application/geo+json",
            },
            body: JSON.stringify({
              coordinates,
              instructions: false,
              preference: "recommended",
            }),
          },
        );

        if (currentRequest !== requestId.current) {
          return;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          let friendly = "We couldn't calculate a route for those addresses.";

          try {
            const parsed = JSON.parse(errorBody);
            const code = parsed?.error?.code;

            if (code === 2004 || code === 2010) {
              friendly =
                "That destination looks to be outside our service area. Please check the pickup and destination addresses.";
            } else if (code === 2099 || response.status === 404) {
              friendly =
                "We couldn't find a drivable route between those two points.";
            }
          } catch {
            // Body wasn't JSON — keep the generic message.
          }

          console.error(`ORS route error ${response.status}: ${errorBody}`);
          setRoute([]);
          onRouteChangeRef.current({ distanceMiles: 0, durationMinutes: 0 });
          onRouteErrorRef.current?.(friendly);
          return;
        }

        const data = await response.json();
        const feature = data.features?.[0];

        if (!feature) {
          throw new Error("No route returned.");
        }

        const geometry = feature.geometry?.coordinates || [];

        const leafletRoute: [number, number][] = geometry.map(
          (point: number[]) => [point[1], point[0]],
        );

        setRoute(leafletRoute);

        const summary = feature.properties?.summary;
        const distanceMeters = summary?.distance || 0;
        const durationSeconds = summary?.duration || 0;

        onRouteChangeRef.current({
          distanceMiles: distanceMeters / 1609.344,
          durationMinutes: durationSeconds / 60,
        });

        if (leafletRoute.length > 0) {
          const bounds = L.latLngBounds(leafletRoute);
          map.fitBounds(bounds, {
            paddingTopLeft: [30, 100],
            paddingBottomRight: [30, 100],
          });
        }
      } catch (error) {
        if (currentRequest !== requestId.current) {
          return;
        }

        console.error("OpenRouteService route error:", error);

        setRoute([]);
        onRouteChangeRef.current({ distanceMiles: 0, durationMinutes: 0 });
        onRouteErrorRef.current?.(
          "We couldn't calculate a route right now. Please try again.",
        );
      }
    };

    calculateRoute();
  }, [
    pickupCoords.lat,
    pickupCoords.lng,
    destinationCoords?.lat,
    destinationCoords?.lng,
    viaCoords?.lat,
    viaCoords?.lng,
    map,
  ]);

  return (
    <>
      {route.length > 0 && (
        <Polyline
          positions={route}
          pathOptions={{
            color: "#1e3a5f",
            weight: 6,
            opacity: 0.9,
          }}
        />
      )}
    </>
  );
}

/* ==========================================================================
   MAP COMPONENT
   ========================================================================== */

function MapMarkerController() {
  useMapEvents({
    click() {
      // Reserved for future "select location on map".
    },
  });

  return null;
}

export default function BookingMap({
  pickupCoords,
  destinationCoords,
  viaCoords,
  onPickupChange,
  onDestinationChange,
  onViaChange,
  onRouteChange,
  onRouteError,
}: Props) {
  return (
    <MapContainer
      center={[pickupCoords.lat, pickupCoords.lng]}
      zoom={13}
      scrollWheelZoom
      zoomControl
      attributionControl
      className="w-full h-full"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* PICKUP — always has coordinates, safe to render unconditionally */}
      <Marker
        position={[pickupCoords.lat, pickupCoords.lng]}
        icon={pickupIcon}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const position = (event.target as L.Marker).getLatLng();
            onPickupChange({ lat: position.lat, lng: position.lng });
          },
        }}
      >
        <Popup>
          <strong>Pickup</strong>
        </Popup>
      </Marker>

      {/* VIA — only rendered once real coordinates exist */}
      {viaCoords && (
        <Marker
          position={[viaCoords.lat, viaCoords.lng]}
          icon={viaIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const position = (event.target as L.Marker).getLatLng();
              onViaChange({ lat: position.lat, lng: position.lng });
            },
          }}
        >
          <Popup>
            <strong>Via stop</strong>
          </Popup>
        </Marker>
      )}

      {/* DESTINATION — only rendered once real coordinates exist. This is
          the guard that was missing when the null-reference crash occurred:
          destinationCoords must be checked here, not assumed non-null. */}
      {destinationCoords && (
        <Marker
          position={[destinationCoords.lat, destinationCoords.lng]}
          icon={destinationIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const position = (event.target as L.Marker).getLatLng();
              onDestinationChange({ lat: position.lat, lng: position.lng });
            },
          }}
        >
          <Popup>
            <strong>Destination</strong>
          </Popup>
        </Marker>
      )}

      <RouteController
        pickupCoords={pickupCoords}
        destinationCoords={destinationCoords}
        viaCoords={viaCoords}
        onRouteChange={onRouteChange}
        onRouteError={onRouteError}
      />

      <MapMarkerController />
    </MapContainer>
  );
}
