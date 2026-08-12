import { Coordinates } from "../types/booking";

const SERVICE_AREA_BOUNDS = {
  minLat: 49.8,
  maxLat: 60.9,
  minLng: -8.7,
  maxLng: 1.8,
} as const;


/* ==========================================================================
   HELPERS
========================================================================== */


export function isWithinServiceArea(coords: Coordinates) {
  return (
    coords.lat >= SERVICE_AREA_BOUNDS.minLat &&
    coords.lat <= SERVICE_AREA_BOUNDS.maxLat &&
    coords.lng >= SERVICE_AREA_BOUNDS.minLng &&
    coords.lng <= SERVICE_AREA_BOUNDS.maxLng
  );
}

export function formatDuration(minutes: number) {
  if (!minutes) {
    return "—";
  }

  const rounded = Math.round(minutes);

  if (rounded < 60) {
    return `${rounded} min`;
  }

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

export function formatDistance(miles: number) {
  if (!miles) {
    return "—";
  }

  return `${miles.toFixed(1)} miles`;
}

export function calculateEstimatedFare(miles: number) {
  if (!miles || miles <= 0) {
    return 0;
  }

  const baseFare = 5;
  const perMile = 1.8;

  return baseFare + miles * perMile;
}






/* ==========================================================================
   REVERSE GEOCODE
========================================================================== */

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });

    const response = await fetch(`/api/geocode/reverse?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed: ${response.status}`);
    }

    const data = await response.json();

    return data.address || "New Build Area";
  } catch (error) {
    console.error("Reverse geocode error:", error);

    return "Area May Not Be Covered";
  }
}