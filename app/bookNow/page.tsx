"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { isValidPhoneNumber } from "libphonenumber-js";

import Header from "../component/layout/Header";
import ThemeToggle from "../ui/ThemeToggle";

import "leaflet/dist/leaflet.css";

/* ==========================================================================
   TYPES
========================================================================== */

interface Coordinates {
  lat: number;
  lng: number;
}

interface AddressSelection {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface Suggestion {
  label: string;
  lat: number;
  lng: number;
  id?: string;
}

interface RouteInfo {
  distanceMiles: number;
  durationMinutes: number;
}

interface Via {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

/* ==========================================================================
   LEAFLET MAP
========================================================================== */

const LeafletMap = dynamic(() => import("../component/maps/BookingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-[#1e3a5f] rounded-full animate-spin" />
    </div>
  ),
});

/* ==========================================================================
   DEFAULT PICKUP
========================================================================== */

const DEFAULT_PICKUP: Coordinates = {
  lat: 51.125,
  lng: -0.0061,
};

/* ==========================================================================
   SERVICE AREA
========================================================================== */

const SERVICE_AREA_BOUNDS = {
  minLat: 49.8,
  maxLat: 60.9,
  minLng: -8.7,
  maxLng: 1.8,
};

function isWithinServiceArea(coords: Coordinates) {
  return (
    coords.lat >= SERVICE_AREA_BOUNDS.minLat &&
    coords.lat <= SERVICE_AREA_BOUNDS.maxLat &&
    coords.lng >= SERVICE_AREA_BOUNDS.minLng &&
    coords.lng <= SERVICE_AREA_BOUNDS.maxLng
  );
}

/* ==========================================================================
   COUNTRY CODES
========================================================================== */

const countryCodes = [
  { code: "+44", iso: "GB", label: "UK" },
  { code: "+1", iso: "US", label: "US" },
  { code: "+91", iso: "IN", label: "IN" },
  { code: "+61", iso: "AU", label: "AU" },
  { code: "+81", iso: "JP", label: "JP" },
  { code: "+86", iso: "CN", label: "CN" },
  { code: "+49", iso: "DE", label: "DE" },
  { code: "+33", iso: "FR", label: "FR" },
  { code: "+353", iso: "IE", label: "IE" },
  { code: "+34", iso: "ES", label: "ES" },
  { code: "+39", iso: "IT", label: "IT" },
  { code: "+31", iso: "NL", label: "NL" },
  { code: "+32", iso: "BE", label: "BE" },
  { code: "+41", iso: "CH", label: "CH" },
  { code: "+46", iso: "SE", label: "SE" },
  { code: "+47", iso: "NO", label: "NO" },
  { code: "+45", iso: "DK", label: "DK" },
  { code: "+358", iso: "FI", label: "FI" },
  { code: "+351", iso: "PT", label: "PT" },
  { code: "+30", iso: "GR", label: "GR" },
];

const flagUrl = (iso: string) =>
  `https://flagcdn.com/48x36/${iso.toLowerCase()}.png`;

/* ==========================================================================
   ICONS
========================================================================== */

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function FlagChip({ iso, label }: { iso: string; label: string }) {
  return (
    <span className="w-7 h-5 rounded overflow-hidden shrink-0 bg-gray-100">
      <img
        src={flagUrl(iso)}
        alt={label}
        className="w-full h-full object-cover"
      />
    </span>
  );
}

/* ==========================================================================
   COUNTRY SELECT
========================================================================== */

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
}

function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  


  

  const current =
    countryCodes.find((country) => country.code === value) || countryCodes[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative ">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center justify-between gap-2 w-24 sm:w-28 h-[52px] px-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600"
      >
        <span>{current.code}</span>

        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            className="absolute z-[1000] left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl py-1"
          >
            {countryCodes.map((country) => (
              <button
                key={country.code + country.iso}
                type="button"
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FlagChip iso={country.iso} label={country.label} />

                <span>{country.label}</span>

                <span className="ml-auto text-gray-400">{country.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   AUTOCOMPLETE
========================================================================== */

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: AddressSelection) => void;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  dotColor?: string;
}

function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  required = false,
  error = false,
  disabled = false,
  dotColor,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!apiKey) {
        console.error("NEXT_PUBLIC_ORS_API_KEY is missing.");
        return;
      }

      if (query.trim().length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      try {
        setLoading(true);

        const params = new URLSearchParams({
          api_key: apiKey,
          text: query,
          size: "6",
          "boundary.country": "GBR",
        });

        const response = await fetch(
          `https://api.openrouteservice.org/geocode/autocomplete?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error(`ORS autocomplete failed: ${response.status}`);
        }

        const data = await response.json();

        const rawResults: Suggestion[] = (data.features || [])
          .map((feature: any) => {
            const coordinates = feature.geometry?.coordinates;

            if (!coordinates) {
              return null;
            }

            return {
              label:
                feature.properties?.label ||
                feature.properties?.name ||
                "Unknown location",
              lng: Number(coordinates[0]),
              lat: Number(coordinates[1]),
              id: feature.properties?.id,
            };
          })
          .filter(Boolean);

        const seen = new Set<string>();

        const results = rawResults.filter((item) => {
          const key = `${item.lat}-${item.lng}-${item.label}`;

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);
          return true;
        });

        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error("ORS autocomplete error:", error);

        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    onChange(nextValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      fetchSuggestions(nextValue);
    }, 400);
  };

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.label);

    onSelect({
      address: suggestion.label,
      lat: suggestion.lat,
      lng: suggestion.lng,
      placeId: suggestion.id,
    });

    setSuggestions([]);
    setShowDropdown(false);

    inputRef.current?.blur();
  };




  

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  

  return (
    <div className="relative">
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {dotColor && (
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                backgroundColor: dotColor,
              }}
            />
          )}

          {label}

          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <PinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length) {
              setShowDropdown(true);
            }
          }}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
            error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
          } bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e3a5f]/40`}
        />

        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-[1000] left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${index}-${suggestion.lat}-${suggestion.lng}`}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
            >
              <div className="flex gap-3">
                <PinIcon className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />

                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {suggestion.label}
                </span>
              </div>
            </button>
          ))}

          <div className="px-4 py-2 text-[10px] text-gray-400 text-right">
            © OpenStreetMap contributors • openrouteservice
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   REVERSE GEOCODE
========================================================================== */

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    );

    if (!response.ok) {
      throw new Error(`Reverse geocode failed: ${response.status}`);
    }

    const data = await response.json();

    return data.display_name || "Custom location";
  } catch (error) {
    console.error("Reverse geocode error:", error);

    return "Custom location";
  }
}

/* ==========================================================================
   MAIN
========================================================================== */

export default function Home() {
  /* ------------------------------------------------------------------------
     LENIS
  ------------------------------------------------------------------------ */

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  /* ------------------------------------------------------------------------
     FORM
  ------------------------------------------------------------------------ */

  const [activeTab, setActiveTab] = useState<"oneway" | "return">("oneway");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+44",
    pickup: "",
    destination: "",
    date: "",
    time: "",
    passengers: 1,
    luggage: 0,
    note: "",
  });

  /* ------------------------------------------------------------------------
     VIAS
  ------------------------------------------------------------------------ */

  const [vias, setVias] = useState<Via[]>([]);
  const [showStopsPopup, setShowStopsPopup] = useState(false);

  const addVia = useCallback(() => {
    setVias((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        address: "",
        lat: null,
        lng: null,
      },
    ]);
      setRouteError(null);
  }, []);

  const removeVia = useCallback((id: string) => {
    setVias((previous) => previous.filter((via) => via.id !== id));

    setRouteError(null);
    setRouteLoading(true);
  }, []);

  const mapViaCoords = vias
    .filter(
      (
        via,
      ): via is Via & {
        lat: number;
        lng: number;
      } => via.lat !== null && via.lng !== null,
    )
    .map((via) => ({
      id: via.id,
      lat: via.lat,
      lng: via.lng,
    }));

  /* ------------------------------------------------------------------------
     COORDINATES
  ------------------------------------------------------------------------ */

  const [pickupCoords, setPickupCoords] = useState<Coordinates>(DEFAULT_PICKUP);

  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  /* ------------------------------------------------------------------------
     ROUTE
  ------------------------------------------------------------------------ */

  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);

  const [routeLoading, setRouteLoading] = useState(false);

  const [routeError, setRouteError] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    pickup: "",
    destination: "",
  });

  const [locatingPickup, setLocatingPickup] = useState(true);

  const [outsideServiceArea, setOutsideServiceArea] = useState(false);

  /* ------------------------------------------------------------------------
     GEOLOCATION
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocatingPickup(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!isWithinServiceArea(coords)) {
          setOutsideServiceArea(true);
          setLocatingPickup(false);
          return;
        }

        setPickupCoords(coords);

        const address = await reverseGeocode(coords.lat, coords.lng);

        setForm((previous) => ({
          ...previous,
          pickup: address,
        }));

        setLocatingPickup(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocatingPickup(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, []);

  /* ------------------------------------------------------------------------
     FARE
  ------------------------------------------------------------------------ */

  const calculateFare = useCallback((miles: number) => {
    if (!miles || miles <= 0) {
      setCost(0);
      return;
    }

    const baseFare = 2.5;
    const perMile = 1.8;

    setCost(baseFare + miles * perMile);
  }, []);

  /* ------------------------------------------------------------------------
     ROUTE CALLBACKS
  ------------------------------------------------------------------------ */

  const handleRouteChange = useCallback(
    ({ distanceMiles, durationMinutes }: RouteInfo) => {
      setDistance(distanceMiles);
      setDuration(durationMinutes);
      calculateFare(distanceMiles);
      setRouteLoading(false);
      setRouteError(null);
    },
    [calculateFare],
  );

  const handleRouteError = useCallback((message: string | null) => {
    setRouteError(message);
    setRouteLoading(false);
  }, []);

  /* ------------------------------------------------------------------------
     PICKUP SELECTION
  ------------------------------------------------------------------------ */

  const handlePickupSelect = useCallback((selection: AddressSelection) => {
    setPickupCoords({
      lat: selection.lat,
      lng: selection.lng,
    });

    setForm((previous) => ({
      ...previous,
      pickup: selection.address,
    }));

    setErrors((previous) => ({
      ...previous,
      pickup: "",
    }));

    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     DESTINATION SELECTION
  ------------------------------------------------------------------------ */

  const handleDestinationSelect = useCallback((selection: AddressSelection) => {
    setDestinationCoords({
      lat: selection.lat,
      lng: selection.lng,
    });

    setForm((previous) => ({
      ...previous,
      destination: selection.address,
    }));

    setErrors((previous) => ({
      ...previous,
      destination: "",
    }));

    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     VIA SELECTION
  ------------------------------------------------------------------------ */

  const handleViaSelect = useCallback(
    (id: string, selection: AddressSelection) => {
      setVias((previous) =>
        previous.map((via) =>
          via.id === id
            ? {
                ...via,
                address: selection.address,
                lat: selection.lat,
                lng: selection.lng,
              }
            : via,
        ),
      );

      setRouteError(null);
      setRouteLoading(true);
    },
    [],
  );

  /* ------------------------------------------------------------------------
     PICKUP DRAG
  ------------------------------------------------------------------------ */

  const handlePickupDrag = useCallback(async (coords: Coordinates) => {
    setPickupCoords(coords);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((previous) => ({
      ...previous,
      pickup: address,
    }));

    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     DESTINATION DRAG
  ------------------------------------------------------------------------ */

  const handleDestinationDrag = useCallback(async (coords: Coordinates) => {
    setDestinationCoords(coords);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((previous) => ({
      ...previous,
      destination: address,
    }));

    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     VIA DRAG
  ------------------------------------------------------------------------ */

  const handleViaDrag = useCallback(async (id: string, coords: Coordinates) => {
    const address = await reverseGeocode(coords.lat, coords.lng);

    setVias((previous) =>
      previous.map((via) =>
        via.id === id
          ? {
              ...via,
              lat: coords.lat,
              lng: coords.lng,
              address,
            }
          : via,
      ),
    );

    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     PHONE VALIDATION
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!form.phone.trim()) {
      setErrors((previous) => ({
        ...previous,
        phone: "",
      }));

      return;
    }

    const country = countryCodes.find((c) => c.code === form.countryCode);

    const valid = country
      ? isValidPhoneNumber(form.phone, country.iso as any)
      : false;

    setErrors((previous) => ({
      ...previous,
      phone: valid ? "" : `Enter a valid ${country?.label ?? ""} phone number.`,
    }));
  }, [form.phone, form.countryCode]);

  /* ------------------------------------------------------------------------
     VALIDATION
  ------------------------------------------------------------------------ */

  const validateForm = () => {
    let valid = true;

    const newErrors = {
      name: "",
      email: "",
      phone: "",
      pickup: "",
      destination: "",
    };

    if (form.pickup.trim().length < 3) {
      newErrors.pickup = "Please enter a pickup location.";

      valid = false;
    }

    if (form.destination.trim().length < 3 || !destinationCoords) {
      newErrors.destination =
        "Please select a destination from the suggestions list.";

      valid = false;
    }

    if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";

      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";

      valid = false;
    }

    if (form.phone.trim()) {
      const country = countryCodes.find((c) => c.code === form.countryCode);

      const validPhone = country
        ? isValidPhoneNumber(form.phone, country.iso as any)
        : false;

      if (!validPhone) {
        newErrors.phone = `Enter a valid ${country?.label ?? ""} phone number.`;

        valid = false;
      }
    }

    setErrors(newErrors);

    return valid;
  };

  /* ------------------------------------------------------------------------
     SUBMIT
  ------------------------------------------------------------------------ */

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm() || !destinationCoords || routeError) {
      return;
    }

    const bookingData = {
      journeyType: activeTab,

      pickup: {
        address: form.pickup,
        latitude: pickupCoords.lat,
        longitude: pickupCoords.lng,
      },

      vias: vias.map((via, index) => ({
        stopNumber: index + 1,
        id: via.id,
        address: via.address,
        latitude: via.lat,
        longitude: via.lng,
      })),

      destination: {
        address: form.destination,
        latitude: destinationCoords.lat,
        longitude: destinationCoords.lng,
      },

      date: form.date,
      time: form.time,

      passengers: form.passengers,
      luggage: form.luggage,

      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        countryCode: form.countryCode,
      },

      note: form.note,

      route: {
        distanceMiles: distance,
        durationMinutes: duration,
      },

      estimatedCost: cost,
    };

    console.log("BOOKING:", bookingData);

    alert("Booking submitted!");
  };

  /* ------------------------------------------------------------------------
     FORMAT
  ------------------------------------------------------------------------ */

  const formatDuration = (minutes: number) => {
    if (!minutes) return "—";

    const rounded = Math.round(minutes);

    if (rounded < 60) {
      return `${rounded} min`;
    }

    const hours = Math.floor(rounded / 60);

    const mins = rounded % 60;

    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  };

  const formatDistance = (miles: number) => {
    if (!miles) return "—";

    return `${miles.toFixed(1)} miles`;
  };

  const canBook = !routeLoading && !routeError;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      {/* ==================================================================
          MAP
      ================================================================== */}

      <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
        <LeafletMap
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
          viaCoords={mapViaCoords}
          onPickupChange={handlePickupDrag}
          onDestinationChange={handleDestinationDrag}
          onViaChange={handleViaDrag}
          onRouteChange={handleRouteChange}
          onRouteError={handleRouteError}
        />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/25 z-[1]" />
      </div>

      {/* ==================================================================
          HEADER
      ================================================================== */}

      <div className="relative z-10 flex flex-col pointer-events-none">
        <div className="pointer-events-auto">
          <Header background="bg-black/80" />
        </div>
      </div>

      {/* ==================================================================
          TWO SEPARATE MOTION PANELS
      ================================================================== */}

      <main className="relative z-10 w-full min-h-screen px-1 sm:px-4 md:px-6 lg:px-8 pt-24 pb-8 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center  gap-4 sm:gap-5 lg:gap-6">
          {/* ==============================================================
              MOTION DIV 1 — JOURNEY
          ============================================================== */}

          <motion.div
            className=" pointer-events-auto w-full max-w-2xl
    bg-white/95 dark:bg-gray-800/97 backdrop-blur-md
    rounded-2xl shadow-2xl
    border border-black/5 dark:border-white/10
    p-4 sm:p-5 md:p-6
    overflow-visible
    fixed left-4 lg:left-8 top-1/2 -translate-y-1/2
    z-20"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            drag
            dragMomentum={false}
            dragElastic={0.05}
            dragConstraints={{
              top: -200,
              bottom: 200,
              left: -200,
              right: 200,
            }}
            whileDrag={{
              scale: 1.01,
              cursor: "grabbing",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Book Your Transfer
              </h2>

              <span className="shrink-0 bg-[#eef3fa] dark:bg-[#1e3a5f]/25 text-[#1e3a5f] dark:text-[#8fb4dd] text-xs font-semibold px-3 py-1 rounded-full">
                Private
              </span>
            </div>

            <div className="flex gap-1 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-full p-1 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("oneway")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
                  activeTab === "oneway"
                    ? "bg-[#1e3a5f] text-white"
                    : "text-gray-500"
                }`}
              >
                One Way
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("return")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
                  activeTab === "return"
                    ? "bg-[#1e3a5f] text-white"
                    : "text-gray-500"
                }`}
              >
                Return
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <h4 className="text-xs font-bold tracking-wide uppercase text-gray-400">
                Journey
              </h4>

              {outsideServiceArea && (
                <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertIcon className="w-4 h-4 shrink-0" />

                  <span>
                    We couldn't detect a pickup point inside our current service
                    area (UK). Please enter your pickup address manually.
                  </span>
                </div>
              )}

              {/* DATE / TIME */}

              <div>
                <h4 className="text-xs font-bold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-3">
                  Trip Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Date
                    </label>

                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          date: event.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Time
                    </label>

                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          time: event.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
                    />
                  </div>
                </div>
              </div>

              {/* PICKUP */}

              <div>
                <AutocompleteInput
                  label="Pickup Location"
                  placeholder={
                    locatingPickup
                      ? "Detecting your current location…"
                      : "Enter pickup address"
                  }
                  value={form.pickup}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      pickup: value,
                    }))
                  }
                  onSelect={handlePickupSelect}
                  required
                  disabled={locatingPickup}
                  error={Boolean(errors.pickup)}
                  dotColor="#16803c"
                />

                {errors.pickup && (
                  <p className="text-red-500 text-xs mt-1">{errors.pickup}</p>
                )}
              </div>

              {/* DESTINATION */}

              <div>
                <AutocompleteInput
                  label="Destination"
                  placeholder="Enter destination"
                  value={form.destination}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      destination: value,
                    }))
                  }
                  onSelect={handleDestinationSelect}
                  required
                  error={Boolean(errors.destination)}
                  dotColor="#c62828"
                />

                {errors.destination && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.destination}
                  </p>
                )}
              </div>

              {/* VIA SUMMARY */}

              {vias.length > 0 && (
                <div className="space-y-2">
                  {vias.map((via, index) => (
                    <div key={via.id} className="flex gap-2">
                      <div className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                          VIA STOP {index + 1}
                        </div>

                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {via.address || "Stop not selected"}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVia(via.id)}
                        className="px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ADD STOPS */}

              <button
                type="button"
                onClick={() => {
                  if (vias.length === 0) {
                    addVia();
                  }

                  setShowStopsPopup(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
              >
                + Add More Stops
              </button>

              {/* STOPS POPUP */}

              <AnimatePresence>
                {showStopsPopup && (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-3 sm:p-4"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) {
                        setShowStopsPopup(false);
                      }
                    }}
                  >
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.96,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.96,
                        y: 15,
                      }}
                      className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-4 sm:p-6"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Add More Stops
                          </h2>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Add multiple stops to your journey.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowStopsPopup(false)}
                          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 transition"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-4">
                        {vias.map((via, index) => (
                          <div
                            key={via.id}
                            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs">
                                  {index + 1}
                                </span>
                                Via Stop {index + 1}
                              </label>

                              <button
                                type="button"
                                onClick={() => removeVia(via.id)}
                                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-100 hover:text-red-600 transition"
                              >
                                ×
                              </button>
                            </div>

                            <AutocompleteInput
                              label=""
                              placeholder="Enter stop address"
                              value={via.address}
                              onChange={(value) => {
                                setVias((previous) =>
                                  previous.map((item) =>
                                    item.id === via.id
                                      ? {
                                          ...item,
                                          address: value,
                                          lat: null,
                                          lng: null,
                                        }
                                      : item,
                                  ),
                                );
                              }}
                              onSelect={(selection) =>
                                handleViaSelect(via.id, selection)
                              }
                              dotColor="#2563eb"
                            />

                            {via.lat !== null && via.lng !== null && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {via.lat.toFixed(6)}, {via.lng.toFixed(6)}
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addVia}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                        >
                          + Add Another Stop
                        </button>
                      </div>

                      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowStopsPopup(false)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const incomplete = vias.some(
                              (via) => via.lat === null || via.lng === null,
                            );

                            if (incomplete) {
                              return;
                            }

                            setShowStopsPopup(false);
                            setRouteError(null);

                            setRouteLoading(true);
                          }}
                          disabled={vias.length === 0}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          Add Stops
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={!canBook}
                className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-semibold hover:bg-[#162d49] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {routeLoading ? "Calculating route..." : "Continue"}
              </button>
            </form>
          </motion.div>

          {/* ==============================================================
              MOTION DIV 2 — PASSENGER / BOOKING
          ============================================================== */}

          <motion.div
            className="pointer-events-auto w-full lg:w-[420px] bg-white/95 dark:bg-gray-800/97 backdrop-blur-md rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-4 sm:p-5 md:p-6 overflow-visible cursor-grab active:cursor-grabbing fixed bottom-4 right-4 z-20"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
            drag
            dragMomentum={false}
            dragElastic={0.05}
            dragConstraints={{
              top: -200,
              bottom: 1000,
              left: -200,
              right: 1200,
            }}
            whileDrag={{
              scale: 1.01,
              cursor: "grabbing",
            }}
          >
            {routeError && (
              <div className="text-sm text-red-500 mt-3">{routeError}</div>
            )}

            {/* ROUTE STATUS */}

            <div className="mt-6 mb-3 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    routeLoading
                      ? "bg-yellow-400 animate-pulse"
                      : routeError
                        ? "bg-red-500"
                        : distance > 0
                          ? "bg-green-500"
                          : "bg-gray-400"
                  }`}
                />

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {routeLoading
                    ? "Calculating route..."
                    : routeError
                      ? "Route unavailable"
                      : distance > 0
                        ? "Route calculated"
                        : !destinationCoords
                          ? "Choose a destination to see fare"
                          : "Enter locations"}
                </span>
              </div>

              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                OpenStreetMap + ORS
              </span>
            </div>

            {/* ROUTE ERROR */}

            {routeError && (
              <div className="flex items-start gap-2 mb-4 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs leading-5">
                <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />

                <span>{routeError}</span>
              </div>
            )}

            {/* ROUTE INFO */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Distance
                </div>

                <div className="font-bold text-gray-900 dark:text-white">
                  {formatDistance(distance)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Estimated Time
                </div>

                <div className="font-bold text-gray-900 dark:text-white">
                  {formatDuration(duration)}
                </div>
              </div>
            </div>

            {/* FARE */}

            <div className="rounded-xl bg-[#1e3a5f] text-white p-4 mt-3">
              <div className="text-sm opacity-80">Estimated Fare</div>

              <div className="text-2xl font-bold">£{cost.toFixed(2)}</div>
            </div>
          </motion.div>
        </div>
      </main>

      <ThemeToggle />
    </>
  );
}
