"use client";

import Form from "next/form";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Header from "../component/layout/Header";
import ThemeToggle from "../ui/ThemeToggle";

import "leaflet/dist/leaflet.css";

import type {
  Coordinates,
  AddressSelection,
  Suggestion,
  RouteInfo,
  Via,
} from "../types/booking";

import AutocompleteInput from "../component/booking/AutocompleteInput";

import ViaStops from "../component/booking/ViaStops";

import JourneyTypeSelector from "../component/booking/JourneyTypeSelector";
import DateTimeSelector from "../component/booking/DateTimeSelector";

import RouteSummary from "../component/booking/RouteSummary";

/* ==========================================================================
   LEAFLET MAP
========================================================================== */

const LeafletMap = dynamic(() => import("../component/maps/BookingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-900">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#1e3a5f]"
        aria-label="Loading map"
      />
    </div>
  ),
});

/* ==========================================================================
   CONSTANTS
========================================================================== */

const DEFAULT_PICKUP: Coordinates = {
  lat: 51.125,
  lng: -0.0061,
};

const SERVICE_AREA_BOUNDS = {
  minLat: 49.8,
  maxLat: 60.9,
  minLng: -8.7,
  maxLng: 1.8,
} as const;

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
] as const;

const flagUrl = (iso: string) =>
  `https://flagcdn.com/48x36/${iso.toLowerCase()}.png`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ==========================================================================
   HELPERS
========================================================================== */

function isWithinServiceArea(coords: Coordinates) {
  return (
    coords.lat >= SERVICE_AREA_BOUNDS.minLat &&
    coords.lat <= SERVICE_AREA_BOUNDS.maxLat &&
    coords.lng >= SERVICE_AREA_BOUNDS.minLng &&
    coords.lng <= SERVICE_AREA_BOUNDS.maxLng
  );
}

function formatDuration(minutes: number) {
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

function formatDistance(miles: number) {
  if (!miles) {
    return "—";
  }

  return `${miles.toFixed(1)} miles`;
}

function calculateEstimatedFare(miles: number) {
  if (!miles || miles <= 0) {
    return 0;
  }

  const baseFare = 2.5;
  const perMile = 1.8;

  return baseFare + miles * perMile;
}

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
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
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
      aria-hidden="true"
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
    <span className="h-5 w-7 shrink-0 overflow-hidden rounded bg-gray-100">
      <img
        src={flagUrl(iso)}
        alt={label}
        width={28}
        height={20}
        loading="lazy"
        className="h-full w-full object-cover"
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
    countryCodes.find((country) => country.code === value) ?? countryCodes[0];

  useEffect(() => {
    if (!open) {
      return;
    }

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
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-13 w-24 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:w-28"
      >
        <span>{current.code}</span>

        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${
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
            className="absolute left-0 z-[1000] mt-1.5 max-h-64 w-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            role="listbox"
          >
            {countryCodes.map((country) => (
              <button
                key={`${country.code}-${country.iso}`}
                type="button"
                role="option"
                aria-selected={country.code === value}
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
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

/* ==========================================================================
   REVERSE GEOCODE
========================================================================== */

async function reverseGeocode(lat: number, lng: number): Promise<string> {
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

/* ==========================================================================
   MAIN
========================================================================== */

export default function Home() {
  const router = useRouter();

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

  const mapViaCoords = useMemo(
    () =>
      vias
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
        })),
    [vias],
  );

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
     DERIVED FARE
  ------------------------------------------------------------------------ */

  const cost = useMemo(() => calculateEstimatedFare(distance), [distance]);

  /* ------------------------------------------------------------------------
     GEOLOCATION
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocatingPickup(false);
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) {
          return;
        }

        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!isWithinServiceArea(coords)) {
          if (!cancelled) {
            setOutsideServiceArea(true);
            setLocatingPickup(false);
          }

          return;
        }

        setPickupCoords(coords);

        const address = await reverseGeocode(coords.lat, coords.lng);

        if (cancelled) {
          return;
        }

        setForm((previous) => ({
          ...previous,
          pickup: address,
        }));

        setLocatingPickup(false);
      },
      (error) => {
        if (cancelled) {
          return;
        }

        console.error("Geolocation error:", error);
        setLocatingPickup(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------
     ROUTE CALLBACKS
  ------------------------------------------------------------------------ */

  const handleRouteChange = useCallback(
    ({ distanceMiles, durationMinutes }: RouteInfo) => {
      setDistance(distanceMiles);
      setDuration(durationMinutes);
      setRouteLoading(false);
      setRouteError(null);
    },
    [],
  );

  const handleRouteError = useCallback((message: string | null) => {
    setRouteError(message);
    setRouteLoading(false);
  }, []);

  /* ------------------------------------------------------------------------
     PICKUP SELECTION
  ------------------------------------------------------------------------ */

  const handlePickupSelect = useCallback((selection: AddressSelection) => {
    const coords = {
      lat: selection.lat,
      lng: selection.lng,
    };

    setPickupCoords(coords);

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
    const coords = {
      lat: selection.lat,
      lng: selection.lng,
    };

    setDestinationCoords(coords);

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
    setRouteError(null);
    setRouteLoading(true);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((previous) => ({
      ...previous,
      pickup: address,
    }));
  }, []);

  /* ------------------------------------------------------------------------
     DESTINATION DRAG
  ------------------------------------------------------------------------ */

  const handleDestinationDrag = useCallback(async (coords: Coordinates) => {
    setDestinationCoords(coords);
    setRouteError(null);
    setRouteLoading(true);

    const address = await reverseGeocode(coords.lat, coords.lng);

    setForm((previous) => ({
      ...previous,
      destination: address,
    }));
  }, []);

  /* ------------------------------------------------------------------------
     VIA DRAG
  ------------------------------------------------------------------------ */

  const handleViaDrag = useCallback(async (id: string, coords: Coordinates) => {
    setRouteError(null);
    setRouteLoading(true);

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

    const country = countryCodes.find((item) => item.code === form.countryCode);

    const valid = country ? isValidPhoneNumber(form.phone, country.iso) : false;

    setErrors((previous) => ({
      ...previous,
      phone: valid ? "" : `Enter a valid ${country?.label ?? ""} phone number.`,
    }));
  }, [form.phone, form.countryCode]);

  /* ------------------------------------------------------------------------
     VALIDATION
  ------------------------------------------------------------------------ */

  const validateForm = useCallback(() => {
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

    if (!EMAIL_REGEX.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";

      valid = false;
    }

    if (form.phone.trim()) {
      const country = countryCodes.find(
        (item) => item.code === form.countryCode,
      );

      const validPhone = country
        ? isValidPhoneNumber(form.phone, country.iso)
        : false;

      if (!validPhone) {
        newErrors.phone = `Enter a valid ${country?.label ?? ""} phone number.`;

        valid = false;
      }
    }

    setErrors(newErrors);

    return valid;
  }, [form, destinationCoords]);

  /* ------------------------------------------------------------------------
     SUBMIT
  ------------------------------------------------------------------------ */

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
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

        note: form.note,

        route: {
          distanceMiles: distance,
          durationMinutes: duration,
        },

        estimatedCost: cost,
      };

      sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

      router.push("/passengerInfo");
    },
    [
      validateForm,
      destinationCoords,
      routeError,
      activeTab,
      form,
      pickupCoords,
      vias,
      distance,
      duration,
      cost,
      router,
    ],
  );

  const canBook = !routeLoading && !routeError && Boolean(destinationCoords);

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <>
      {/* ==================================================================
          MAP
      ================================================================== */}

      <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden">
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

        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-transparent to-black/25" />
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
          MAIN
      ================================================================== */}

      <main className="pointer-events-none relative z-10 min-h-screen w-full px-1 pb-8 pt-24 sm:px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-center gap-4 sm:gap-5 lg:flex-row lg:gap-6">
          {/* ==============================================================
              JOURNEY PANEL
          ============================================================== */}

          <motion.div
            className="pointer-events-auto fixed left-4 top-1/2 z-20 w-full max-w-2xl -translate-y-1/2 overflow-visible rounded-2xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-gray-800/97 sm:p-5 md:p-6 lg:left-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                Book Your Transfer
              </h2>

              <span className="shrink-0 rounded-full bg-[#eef3fa] px-3 py-1 text-xs font-semibold text-[#1e3a5f] dark:bg-[#1e3a5f]/25 dark:text-[#8fb4dd]">
                Private
              </span>
            </div>

            <JourneyTypeSelector value={activeTab} onChange={setActiveTab} />

            {/* ============================================================
                NEXT FORM
            ============================================================ */}

            <Form
              action="/passengerInfo"
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6"
            >
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Journey
              </h4>

              {/* SERVICE AREA */}

              {outsideServiceArea && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800">
                  <AlertIcon className="h-4 w-4 shrink-0" />

                  <span>
                    We couldn't detect a pickup point inside our current service
                    area (UK). Please enter your pickup address manually.
                  </span>
                </div>
              )}

              {/* TRIP DETAILS */}

              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Trip Details
                </h4>

                <DateTimeSelector
                  date={form.date}
                  time={form.time}
                  onDateChange={(date) =>
                    setForm((previous) => ({
                      ...previous,
                      date,
                    }))
                  }
                  onTimeChange={(time) =>
                    setForm((previous) => ({
                      ...previous,
                      time,
                    }))
                  }
                />
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
                  <p className="mt-1 text-xs text-red-500">{errors.pickup}</p>
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
                  <p className="mt-1 text-xs text-red-500">
                    {errors.destination}
                  </p>
                )}
              </div>

              {/* VIA SUMMARY */}

              <ViaStops
                vias={vias}
                showStopsPopup={showStopsPopup}
                onOpenStops={() => {
                  if (vias.length === 0) {
                    addVia();
                  }

                  setShowStopsPopup(true);
                }}
                onCloseStops={() => setShowStopsPopup(false)}
                onAddVia={addVia}
                onRemoveVia={removeVia}
                onViaChange={(id, value) => {
                  setVias((previous) =>
                    previous.map((item) =>
                      item.id === id
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
                onViaSelect={handleViaSelect}
                onConfirmStops={() => {
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
              />

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={!canBook}
                className="w-full rounded-xl bg-[#1e3a5f] py-3.5 font-semibold text-white transition hover:bg-[#162d49] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {routeLoading ? "Calculating route..." : "Continue"}
              </button>
            </Form>
          </motion.div>

          {/* ==============================================================
              ROUTE / FARE PANEL
          ============================================================== */}

          <motion.div
            className="pointer-events-auto fixed bottom-4 right-4 z-20 w-full overflow-visible rounded-2xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-gray-800/97 sm:w-105 sm:p-5 md:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            <RouteSummary
              distance={distance}
              duration={duration}
              cost={cost}
              routeLoading={routeLoading}
              routeError={routeError}
              hasDestination={Boolean(destinationCoords)}
            />
          </motion.div>
        </div>
      </main>

      <ThemeToggle />
    </>
  );
}
