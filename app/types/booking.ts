/* ==========================================================================
   TYPES for booking 
========================================================================== */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressSelection {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface Suggestion {
  label: string;
  lat: number;
  lng: number;
  id?: string;
}

export interface RouteInfo {
  distanceMiles: number;
  durationMinutes: number;
}

export interface Via {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
}


export interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
}