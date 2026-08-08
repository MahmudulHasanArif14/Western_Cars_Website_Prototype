"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { isValidPhoneNumber } from "libphonenumber-js";

import Header from "../component/layout/Header";
import Footer from "../component/layout/Footer";
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

/* ==========================================================================
   LEAFLET MAP
   ========================================================================== */

const LeafletMap = dynamic(() => import("../component/maps/BookingMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-5 py-3 rounded-xl shadow-lg">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full animate-spin" />
        <span className="text-sm text-gray-700 dark:text-gray-200">
          Loading map...
        </span>
      </div>
    </div>
  ),
});

/* ==========================================================================
   DEFAULT LOCATIONS / SERVICE AREA
   ========================================================================== */

const DEFAULT_PICKUP: Coordinates = {
  lat: 51.4545,
  lng: -0.9781,
};

// Loose bounding box around the UK + Ireland. The routing engine behind this
// app only has usable road-network coverage here, so geolocation results
// outside this box must NOT be auto-filled as the pickup — that mismatch
// (a real GPS position thousands of km away vs. a UK-only routing graph) is
// what produced the "route distance must not be greater than 6,000,000
// meters" error from ORS. Outside the box, we simply leave pickup blank for
// manual entry instead of guessing.
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

// `iso` is the ISO 3166-1 alpha-2 code — used both to pull the flag JPG from
// the free flagcdn.com image API (https://flagcdn.com/{size}/{iso}.jpg, no
// key required) and to validate the phone number for that country via
// libphonenumber-js.
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
  `https://flagcdn.com/48x36/${iso.toLowerCase()}.jpg`;

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FlagChip({ iso, label }: { iso: string; label: string }) {
  return (
    <span className="inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 dark:ring-white/15">
      <img
        src={flagUrl(iso)}
        alt={label}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  );
}

/* ==========================================================================
   COUNTRY CODE SELECT
   ========================================================================== */

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
}

function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const current = countryCodes.find((c) => c.code === value) || countryCodes[0];

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
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-between gap-1.5 w-26 h-13 px-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 ${
          open
            ? "border-[#1e3a5f] ring-2 ring-[#1e3a5f]/30"
            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
        }`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <FlagChip iso={current.iso} label={current.label} />
          <span className="text-sm font-medium tabular-nums">
            {current.code}
          </span>
        </span>

        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            className="absolute z-1000 left-0 mt-1.5 w-60 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl py-1"
          >
            {countryCodes.map((country) => (
              <button
                key={country.code + country.iso}
                type="button"
                role="option"
                aria-selected={country.code === value}
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition ${
                  country.code === value
                    ? "bg-[#1e3a5f]/5 dark:bg-[#1e3a5f]/20"
                    : ""
                }`}
              >
                <FlagChip iso={country.iso} label={country.label} />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {country.label}
                </span>
                <span className="text-sm text-gray-400 ml-auto tabular-nums">
                  {country.code}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   ORS AUTOCOMPLETE INPUT
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
  // Colour-codes the label dot to match the marker pin on the map, so the
  // form visually maps onto what the person sees on the map underneath.
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        // ORS occasionally returns the same place twice (different gazetteer
        // layers pointing at identical coordinates/label). De-dupe here so
        // React never sees two list items with the same key.
        const seen = new Set<string>();
        const results = rawResults.filter((item) => {
          const dedupeKey = `${item.lat}-${item.lng}-${item.label}`;

          if (seen.has(dedupeKey)) {
            return false;
          }

          seen.add(dedupeKey);
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
    <div className="relative mb-4">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {dotColor && (
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
              aria-hidden="true"
            />
          )}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <PinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-500 pointer-events-none" />

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
          className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
            error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
          } bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition`}
        />

        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-1000 left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${index}-${suggestion.lat}-${suggestion.lng}-${suggestion.label}`}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(suggestion);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition"
            >
              <div className="flex gap-3">
                <PinIcon className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />

                <span className="text-sm text-gray-800 dark:text-gray-200 leading-5">
                  {suggestion.label}
                </span>
              </div>
            </button>
          ))}

          <div className="px-4 py-2 text-[10px] text-gray-400 text-right bg-gray-50 dark:bg-gray-900/50">
            © OpenStreetMap contributors • openrouteservice
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   REVERSE GEOCODE HELPER
   ========================================================================== */

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    );

    if (!response.ok) {
      throw new Error(`Nominatim reverse geocode failed: ${response.status}`);
    }

    const data = await response.json();

    return data.display_name || "Custom location";
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return "Custom location";
  }
}

/* ==========================================================================
   MAIN PAGE
   ========================================================================== */

export default function Home() {
  /* ------------------------------------------------------------------------
     LENIS (smooth scroll)
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
    via: "",

    date: "",
    time: "",

    passengers: 1,
    luggage: 0,

    note: "",
  });

  /* ------------------------------------------------------------------------
     COORDINATES
  ------------------------------------------------------------------------ */

  const [pickupCoords, setPickupCoords] = useState<Coordinates>(DEFAULT_PICKUP);

  // Starts null (not a UK default) — the destination field is empty until
  // the person picks one, and there must be no coordinate behind it either.
  const [destinationCoords, setDestinationCoords] =
    useState<Coordinates | null>(null);

  const [viaCoords, setViaCoords] = useState<Coordinates | null>(null);

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
     GEOLOCATION — default pickup to the user's current location, but only
     if that location is actually inside the service area the routing
     engine can handle. Otherwise leave pickup blank for manual entry.
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
        // Permission denied or unavailable — leave pickup empty for manual entry.
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
    },
    [calculateFare],
  );

  const handleRouteError = useCallback((message: string | null) => {
    setRouteError(message);
    setRouteLoading(false);
  }, []);

  /* ------------------------------------------------------------------------
     LOCATION SELECTION (from autocomplete)
  ------------------------------------------------------------------------ */

  const handlePickupSelect = useCallback((selection: AddressSelection) => {
    setPickupCoords({ lat: selection.lat, lng: selection.lng });

    setForm((previous) => ({ ...previous, pickup: selection.address }));
    setErrors((previous) => ({ ...previous, pickup: "" }));
    setRouteError(null);
    setRouteLoading(true);
  }, []);

  const handleDestinationSelect = useCallback((selection: AddressSelection) => {
    setDestinationCoords({ lat: selection.lat, lng: selection.lng });

    setForm((previous) => ({ ...previous, destination: selection.address }));
    setErrors((previous) => ({ ...previous, destination: "" }));
    setRouteError(null);
    setRouteLoading(true);
  }, []);

  const handleViaSelect = useCallback((selection: AddressSelection) => {
    setViaCoords({ lat: selection.lat, lng: selection.lng });

    setForm((previous) => ({ ...previous, via: selection.address }));
    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     LOCATION CHANGE (from marker drag)
  ------------------------------------------------------------------------ */

  const handlePickupDrag = useCallback(async (coords: Coordinates) => {
    setPickupCoords(coords);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((prev) => ({ ...prev, pickup: address }));
    setRouteError(null);
    setRouteLoading(true);
  }, []);

  const handleDestinationDrag = useCallback(async (coords: Coordinates) => {
    setDestinationCoords(coords);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((prev) => ({ ...prev, destination: address }));
    setRouteError(null);
    setRouteLoading(true);
  }, []);

  const handleViaDrag = useCallback(async (coords: Coordinates) => {
    setViaCoords(coords);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((prev) => ({ ...prev, via: address }));
    setRouteError(null);
    setRouteLoading(true);
  }, []);

  /* ------------------------------------------------------------------------
     REMOVE VIA
  ------------------------------------------------------------------------ */

  const removeVia = () => {
    setViaCoords(null);

    setForm((previous) => ({ ...previous, via: "" }));
    setRouteError(null);
    setRouteLoading(true);
  };

  /* ------------------------------------------------------------------------
     PHONE VALIDATION (live, against the selected country)
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!form.phone.trim()) {
      setErrors((previous) => ({ ...previous, phone: "" }));
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

      via: viaCoords
        ? {
            address: form.via,
            latitude: viaCoords.lat,
            longitude: viaCoords.lng,
          }
        : null,

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
      {/* ================================================================
          MAP
      ================================================================ */}

      <div className="fixed inset-0 z-0">
        <LeafletMap
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
          viaCoords={viaCoords}
          onPickupChange={handlePickupDrag}
          onDestinationChange={handleDestinationDrag}
          onViaChange={handleViaDrag}
          onRouteChange={handleRouteChange}
          onRouteError={handleRouteError}
        />

        <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-black/5 via-transparent to-black/5" />
      </div>

      {/* ================================================================
          CONTENT
      ================================================================ */}

      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        <div className="pointer-events-auto ">
          <Header />
        </div>

        <main className="flex items-center flex-1 p-4 md:p-6 w-full">
          <motion.div
            className="pointer-events-auto   bg-white/95 dark:bg-gray-800/97 backdrop-blur-md rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* HEADER */}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Book Your Transfer
                <span className="bg-[#eef3fa] dark:bg-[#1e3a5f]/25 text-[#1e3a5f] dark:text-[#8fb4dd] text-xs font-semibold px-3 py-1 rounded-full">
                  Private
                </span>
              </h2>

              <ThemeToggle />
            </div>

            {/* TABS */}

            <div className="flex gap-1 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-full p-1 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("oneway")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
                  activeTab === "oneway"
                    ? "bg-[#1e3a5f] text-white shadow-md shadow-[#1e3a5f]/40"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                One Way
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("return")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
                  activeTab === "return"
                    ? "bg-[#1e3a5f] text-white shadow-md shadow-[#1e3a5f]/40"
                    : "text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Return
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* JOURNEY */}

              <h4 className="text-xs font-bold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-3">
                Journey
              </h4>

              {outsideServiceArea && (
                <div className="flex items-start gap-2 mb-4 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs leading-5">
                  <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    We couldn't detect a pickup point inside our current service
                    area (UK). Please enter your pickup address manually.
                  </span>
                </div>
              )}

              {/* PICKUP */}

              <AutocompleteInput
                label="Pickup Location"
                placeholder={
                  locatingPickup
                    ? "Detecting your current location…"
                    : "Enter pickup address"
                }
                value={form.pickup}
                onChange={(value) =>
                  setForm((previous) => ({ ...previous, pickup: value }))
                }
                onSelect={handlePickupSelect}
                required
                disabled={locatingPickup}
                error={Boolean(errors.pickup)}
                dotColor="#16803c"
              />

              {errors.pickup && (
                <p className="text-red-500 text-xs -mt-3 mb-3">
                  {errors.pickup}
                </p>
              )}

              {/* DESTINATION */}

              <AutocompleteInput
                label="Destination"
                placeholder="Enter destination"
                value={form.destination}
                onChange={(value) =>
                  setForm((previous) => ({ ...previous, destination: value }))
                }
                onSelect={handleDestinationSelect}
                required
                error={Boolean(errors.destination)}
                dotColor="#c62828"
              />

              {errors.destination && (
                <p className="text-red-500 text-xs -mt-3 mb-3">
                  {errors.destination}
                </p>
              )}

              {/* VIA */}

              <div className="mb-4">
                {!viaCoords ? (
                  <AutocompleteInput
                    label="Via"
                    placeholder="Add a stop / via address"
                    value={form.via}
                    onChange={(value) =>
                      setForm((previous) => ({ ...previous, via: value }))
                    }
                    onSelect={handleViaSelect}
                    dotColor="#2563eb"
                  />
                ) : (
                  <>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: "#2563eb" }}
                      />
                      Via
                    </label>

                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                          VIA STOP
                        </div>

                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {form.via}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeVia}
                        aria-label="Remove via stop"
                        className="px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* DATE / TIME */}

              <h4 className="text-xs font-bold tracking-wide uppercase text-gray-400 dark:text-gray-500 mt-6 mb-3">
                Trip Details
              </h4>

              <div className="flex flex-row gap-3 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
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

              {/* PASSENGERS */}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Passengers
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={form.passengers}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        passengers: parseInt(event.target.value) || 1,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Luggage
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={form.luggage}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        luggage: parseInt(event.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
                  />
                </div>
              </div>

              {/* CUSTOMER */}

              <div className="border-t border-gray-200 dark:border-white/10 pt-5 mt-6">
                <h4 className="text-xs font-bold tracking-wide uppercase text-gray-400 dark:text-gray-500 mb-3">
                  Passenger Details
                </h4>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Name *
                  </label>

                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
                  />

                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email *
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
                  />

                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number
                  </label>

                  <div className="flex gap-2">
                    <CountryCodeSelect
                      value={form.countryCode}
                      onChange={(code) =>
                        setForm((previous) => ({
                          ...previous,
                          countryCode: code,
                        }))
                      }
                    />

                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          phone: event.target.value,
                        }))
                      }
                      className={`flex-1 h-[52px] px-4 rounded-xl border ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500/40"
                          : "border-gray-200 dark:border-gray-600 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f]"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 transition`}
                    />
                  </div>

                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Additional Notes
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Any additional information for your driver..."
                    value={form.note}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        note: event.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] resize-none transition"
                  />
                </div>
              </div>

              {/* ROUTE STATUS */}

              <div className="mt-6 mb-3 flex justify-between items-center">
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

              {routeError && (
                <div className="flex items-start gap-2 mb-4 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs leading-5">
                  <AlertIcon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{routeError}</span>
                </div>
              )}

              {/* SUMMARY */}

              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4 border border-gray-100 dark:border-white/10">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Distance</span>

                  <strong className="text-gray-900 dark:text-white">
                    {formatDistance(distance)}
                  </strong>
                </div>

                <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-gray-300">
                  <span>Estimated Time</span>

                  <strong className="text-gray-900 dark:text-white">
                    {formatDuration(duration)}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-sm mt-2 pt-3 border-t border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                  <span>Estimated Cost</span>

                  <strong className="text-lg text-[#1e3a5f] dark:text-[#8fb4dd]">
                    {cost > 0 ? `£${cost.toFixed(2)}` : "—"}
                  </strong>
                </div>
              </div>

              {/* BOOK */}

              <button
                type="submit"
                disabled={!canBook}
                className={`w-full py-3.5 ${
                  !canBook
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-[#1e3a5f] hover:bg-[#16304a] shadow-lg shadow-[#1e3a5f]/30"
                } text-white font-semibold rounded-2xl transition`}
              >
                {routeLoading
                  ? "CALCULATING ROUTE..."
                  : routeError
                    ? "FIX ROUTE TO CONTINUE"
                    : "BOOK NOW"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-[#1e3a5f] hover:underline">
                Login to my account
              </a>
            </div>
          </motion.div>
        </main>

        <div className="pointer-events-auto">
          <Footer />
        </div>
      </div>
    </>
  );
}
