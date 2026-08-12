"use client";

import Form from "next/form";

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

import Header from "../../component/layout/Header";
import ThemeToggle from "../../ui/ThemeToggle";

import "leaflet/dist/leaflet.css";

import type {
  Coordinates,
  AddressSelection,
  Suggestion,
  RouteInfo,
  Via,
  CountryCodeSelectProps,
} from "../../types/booking";

import AutocompleteInput from "../booking/AutocompleteInput";

import ViaStops from "../booking/ViaStops";

import JourneyTypeSelector from "../booking/JourneyTypeSelector";
import DateTimeSelector from "../booking/DateTimeSelector";

import RouteSummary from "../booking/RouteSummary";

import { countryCodes } from "../../constants/country-codes";

import {
  isWithinServiceArea,
  formatDuration,
  formatDistance,
  calculateEstimatedFare,
  reverseGeocode,
} from "../../book/helpers";
import dynamic from "next/dynamic";
import { AlertIcon } from "../icons/AlertIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { FlagChip } from "../booking/FlagChip";
import { CountryCodeSelect } from "../booking/CountryCodeSelect";

/* ==========================================================================
   LEAFLET MAP
========================================================================== */

const LeafletMap = dynamic(() => import("../maps/BookingMap"), {
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

const DEFAULT_PICKUP: Coordinates = {
  lat: 51.4545,
  lng: -0.9781,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 

/* ==========================================================================
   MAIN
========================================================================== */

export default function BookingPanel() {
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

        console.log("Geolocation error:", {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT,
        });
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

    // Update coordinates immediately so route recalculates.
    setVias((previous) =>
      previous.map((via) =>
        via.id === id
          ? {
              ...via,
              lat: coords.lat,
              lng: coords.lng,
            }
          : via,
      ),
    );

    // Update address separately.
    const address = await reverseGeocode(coords.lat, coords.lng);

    setVias((previous) =>
      previous.map((via) =>
        via.id === id
          ? {
              ...via,
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
