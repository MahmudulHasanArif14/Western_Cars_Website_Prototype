"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

import "leaflet/dist/leaflet.css";

interface Coordinates {
  lat: number;
  lng: number;
}

export interface ViaCoordinate extends Coordinates {
  id: string;
}

interface Props {
  pickupCoords: Coordinates;
  destinationCoords: Coordinates | null;
  viaCoords: ViaCoordinate[];

  onPickupChange: (coords: Coordinates) => void;
  onDestinationChange: (coords: Coordinates) => void;
  onViaChange: (id: string, coords: Coordinates) => void;

  onRouteChange: (data: {
    distanceMiles: number;
    durationMinutes: number;
  }) => void;

  onRouteError?: (message: string | null) => void;
}

/* ==========================================================================
   LEAFLET ICON FIX
========================================================================== */

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ==========================================================================
   COLORS
========================================================================== */

export const MARKER_COLORS = {
  pickup: "#16803c",
  via: "#2563eb",
  destination: "#c62828",
};

/* ==========================================================================
   MARKER ICON
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
    popupAnchor: [0, -20],
  });
};

const pickupIcon = createMarkerIcon("P", MARKER_COLORS.pickup);
const destinationIcon = createMarkerIcon("D", MARKER_COLORS.destination);

/* ==========================================================================
   DISTANCE
========================================================================== */

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

const MAX_LEG_DISTANCE_KM = 900;

/* ==========================================================================
   MAP RESIZE CONTROLLER
========================================================================== */

function MapResizeController() {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize();
    };

    const timer1 = window.setTimeout(resizeMap, 100);
    const timer2 = window.setTimeout(resizeMap, 500);
    const timer3 = window.setTimeout(resizeMap, 1000);

    window.addEventListener("resize", resizeMap);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
      window.removeEventListener("resize", resizeMap);
    };
  }, [map]);

  return null;
}

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
  viaCoords: ViaCoordinate[];

  onRouteChange: Props["onRouteChange"];
  onRouteError?: Props["onRouteError"];
}) {
  const map = useMap();

  const [route, setRoute] = useState<[number, number][]>([]);

  const requestId = useRef(0);

  const onRouteChangeRef = useRef(onRouteChange);
  const onRouteErrorRef = useRef(onRouteError);

  useEffect(() => {
    onRouteChangeRef.current = onRouteChange;
    onRouteErrorRef.current = onRouteError;
  }, [onRouteChange, onRouteError]);

  useEffect(() => {
    let cancelled = false;

    const calculateRoute = async () => {
      /*
       * No destination = no route.
       */
      if (!destinationCoords) {
        setRoute([]);

        onRouteErrorRef.current?.(null);

        onRouteChangeRef.current({
          distanceMiles: 0,
          durationMinutes: 0,
        });

        return;
      }

      /*
       * Only use completed via stops.
       */
      const validVias = viaCoords.filter(
        (via) => Number.isFinite(via.lat) && Number.isFinite(via.lng),
      );

      /*
       * Build:
       *
       * Pickup
       *   ↓
       * Via 1
       *   ↓
       * Via 2
       *   ↓
       * Destination
       */
      const points: Coordinates[] = [
        pickupCoords,
        ...validVias,
        destinationCoords,
      ];

      /*
       * Validate each leg.
       */
      const legs: [Coordinates, Coordinates][] = [];

      for (let i = 0; i < points.length - 1; i++) {
        legs.push([points[i], points[i + 1]]);
      }

      const tooFar = legs.some(
        ([from, to]) => haversineKm(from, to) > MAX_LEG_DISTANCE_KM,
      );

      if (tooFar) {
        setRoute([]);

        onRouteChangeRef.current({
          distanceMiles: 0,
          durationMinutes: 0,
        });

        onRouteErrorRef.current?.(
          "That destination looks to be outside our service area. Please check the pickup and destination addresses.",
        );

        return;
      }

      /*
       * Create a unique request ID.
       *
       * If the user changes a via while a previous request
       * is still running, the old request cannot overwrite
       * the newer route.
       */
      const currentRequest = ++requestId.current;

      try {
        const coordinates = points.map((point) => [point.lng, point.lat]);

        const response = await fetch("/api/maps/route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates,
          }),
        });

        if (cancelled || currentRequest !== requestId.current) {
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          const friendly =
            errorData?.message ||
            "We couldn't calculate a route for those addresses.";

          console.error("Route API error:", response.status, errorData);

          setRoute([]);

          onRouteChangeRef.current({
            distanceMiles: 0,
            durationMinutes: 0,
          });

          onRouteErrorRef.current?.(friendly);

          return;
        }

        const data = await response.json();

        if (cancelled || currentRequest !== requestId.current) {
          return;
        }

        const feature = data.features?.[0];

        if (!feature) {
          throw new Error("No route returned.");
        }

        const geometry = feature.geometry?.coordinates || [];

        const leafletRoute: [number, number][] = geometry.map(
          (point: number[]) => [point[1], point[0]],
        );

        const summary = feature.properties?.summary;

        const distanceMeters = Number(summary?.distance) || 0;

        const durationSeconds = Number(summary?.duration) || 0;

        /*
         * Update route first.
         */
        setRoute(leafletRoute);

        /*
         * Clear any previous error.
         */
        onRouteErrorRef.current?.(null);

        /*
         * Tell BookingPanel that calculation is finished.
         *
         * BookingPanel will set routeLoading(false).
         */
        onRouteChangeRef.current({
          distanceMiles: distanceMeters / 1609.344,

          durationMinutes: durationSeconds / 60,
        });

        /*
         * Fit map to the complete route.
         */
        if (leafletRoute.length > 0) {
          const bounds = L.latLngBounds(leafletRoute);

          map.fitBounds(bounds, {
            paddingTopLeft: [30, 100],
            paddingBottomRight: [30, 100],
            maxZoom: 15,
          });
        }
      } catch (error) {
        if (cancelled || currentRequest !== requestId.current) {
          return;
        }

        console.error("Route calculation error:", error);

        setRoute([]);

        onRouteChangeRef.current({
          distanceMiles: 0,
          durationMinutes: 0,
        });

        onRouteErrorRef.current?.(
          "We couldn't calculate a route right now. Please try again.",
        );
      }
    };

    calculateRoute();

    return () => {
      cancelled = true;
    };
  }, [
    pickupCoords.lat,
    pickupCoords.lng,
    destinationCoords?.lat,
    destinationCoords?.lng,

    /*
     * IMPORTANT:
     * Recalculate when the actual via coordinates change.
     */
    viaCoords.map((via) => `${via.id}:${via.lat}:${via.lng}`).join("|"),

    map,
  ]);

  return route.length > 0 ? (
    <Polyline
      positions={route}
      pathOptions={{
        color: "#1e3a5f",
        weight: 6,
        opacity: 0.9,
      }}
    />
  ) : null;
}

/* ==========================================================================
   BOOKING MAP
========================================================================== */

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
      scrollWheelZoom={true}
      dragging={true}
      touchZoom={true}
      doubleClickZoom={true}
      boxZoom={true}
      keyboard={true}
      zoomControl={true}
      attributionControl={true}
      className="w-full h-full"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        zIndex: 0,
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapResizeController />

      {/* PICKUP */}

      <Marker
        position={[pickupCoords.lat, pickupCoords.lng]}
        icon={pickupIcon}
        draggable={true}
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target as L.Marker;

            const position = marker.getLatLng();

            onPickupChange({
              lat: position.lat,
              lng: position.lng,
            });
          },
        }}
      >
        <Popup>
          <strong>Pickup</strong>
        </Popup>
      </Marker>

      {/* VIA STOPS */}

      {viaCoords.map((via, index) => {
        const viaIcon = createMarkerIcon(String(index + 1), MARKER_COLORS.via);

        return (
          <Marker
            key={via.id}
            position={[via.lat, via.lng]}
            icon={viaIcon}
            draggable={true}
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as L.Marker;

                const position = marker.getLatLng();

                onViaChange(via.id, {
                  lat: position.lat,
                  lng: position.lng,
                });
              },
            }}
          >
            <Popup>
              <strong>Via stop {index + 1}</strong>
            </Popup>
          </Marker>
        );
      })}

      {/* DESTINATION */}

      {destinationCoords && (
        <Marker
          position={[destinationCoords.lat, destinationCoords.lng]}
          icon={destinationIcon}
          draggable={true}
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;

              const position = marker.getLatLng();

              onDestinationChange({
                lat: position.lat,
                lng: position.lng,
              });
            },
          }}
        >
          <Popup>
            <strong>Destination</strong>
          </Popup>
        </Marker>
      )}

      {/* ROUTE */}

      <RouteController
        pickupCoords={pickupCoords}
        destinationCoords={destinationCoords}
        viaCoords={viaCoords}
        onRouteChange={onRouteChange}
        onRouteError={onRouteError}
      />
    </MapContainer>
  );
}
