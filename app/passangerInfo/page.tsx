"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Via {
  id: string;
  stopNumber: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface BookingData {
  journeyType: "oneway" | "return";

  pickup: {
    address: string;
    latitude: number;
    longitude: number;
  };

  vias: Via[];

  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };

  date: string;
  time: string;

  passengers: number;
  luggage: number;

  route: {
    distanceMiles: number;
    durationMinutes: number;
  };

  estimatedCost: number;
}

const countryCodes = [
  { code: "+44", label: "UK" },
  { code: "+1", label: "US" },
  { code: "+91", label: "IN" },
  { code: "+61", label: "AU" },
  { code: "+81", label: "JP" },
  { code: "+86", label: "CN" },
  { code: "+49", label: "DE" },
  { code: "+33", label: "FR" },
  { code: "+353", label: "IE" },
  { code: "+34", label: "ES" },
  { code: "+39", label: "IT" },
  { code: "+31", label: "NL" },
  { code: "+32", label: "BE" },
  { code: "+41", label: "CH" },
  { code: "+46", label: "SE" },
  { code: "+47", label: "NO" },
  { code: "+45", label: "DK" },
  { code: "+358", label: "FI" },
  { code: "+351", label: "PT" },
  { code: "+30", label: "GR" },
];

function formatDuration(minutes: number) {
  if (!minutes) return "—";

  const rounded = Math.round(minutes);

  if (rounded < 60) {
    return `${rounded} min`;
  }

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function formatDistance(miles: number) {
  if (!miles) return "—";

  return `${miles.toFixed(1)} miles`;
}

function formatDate(date: string) {
  if (!date) return "Not selected";

  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PassengerInfo() {
  const router = useRouter();

  const [booking, setBooking] = useState<BookingData | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+44",
    note: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem("bookingData");

    if (!storedBooking) {
      router.replace("/bookNow");
      return;
    }

    try {
      const parsedBooking: BookingData = JSON.parse(storedBooking);

      setBooking(parsedBooking);
    } catch (error) {
      console.error("Invalid booking data:", error);

      router.replace("/bookNow");
    }
  }, [router]);

  const validateForm = () => {
    let valid = true;

    const newErrors = {
      name: "",
      email: "",
      phone: "",
    };

    if (form.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
      valid = false;
    }

    if (form.phone.trim().length < 6) {
      newErrors.phone = "Please enter a valid phone number.";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!booking) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const finalBooking = {
      ...booking,

      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        countryCode: form.countryCode,
      },

      note: form.note.trim(),
    };

    sessionStorage.setItem("bookingData", JSON.stringify(finalBooking));

    console.log("FINAL BOOKING:", finalBooking);

    // Replace this with your API request later.
    await new Promise((resolve) => setTimeout(resolve, 500));

    router.push("/bookingConfirmation");
  };

  if (!booking) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading booking...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef3fa] via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-[#101827]" />

        <div className="absolute top-[-180px] left-[-180px] w-[420px] h-[420px] rounded-full bg-[#1e3a5f]/10 blur-3xl" />

        <div className="absolute bottom-[-180px] right-[-180px] w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-20 px-4 sm:px-6 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-black/80 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.push("/bookNow")}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition"
        >
          <span className="text-xl">←</span>

          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-white font-bold tracking-wide">Western Cars</div>

        <div className="w-16" />
      </header>

      {/* Main */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>

              <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Journey
              </span>
            </div>

            <div className="w-12 sm:w-24 h-px bg-[#1e3a5f] mx-3" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold">
                2
              </div>

              <span className="hidden sm:block text-sm font-semibold text-gray-900 dark:text-white">
                Passenger
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8 items-start">
          {/* Passenger Form */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-5 sm:p-7"
          >
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Passenger Details
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                Enter your details to complete your booking.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Your full name"
                  className={`w-full px-4 py-3.5 rounded-xl border ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition`}
                />

                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address *
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3.5 rounded-xl border ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition`}
                />

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Phone Number *
                </label>

                <div className="flex gap-2">
                  <select
                    value={form.countryCode}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        countryCode: event.target.value,
                      }))
                    }
                    className="w-28 sm:w-32 px-3 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label} {country.code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Phone number"
                    className={`flex-1 min-w-0 px-4 py-3.5 rounded-xl border ${
                      errors.phone
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition`}
                  />
                </div>

                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Additional Notes
                </label>

                <textarea
                  rows={4}
                  value={form.note}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Any additional information for your driver..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] resize-none transition"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/bookNow")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl bg-[#1e3a5f] text-white font-semibold hover:bg-[#162d49] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </motion.section>

          {/* Booking Summary */}
          <motion.aside
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.1,
            }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-black/5 dark:border-white/10 p-5 sm:p-6 lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Journey Summary
                </h2>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {booking.journeyType === "return"
                    ? "Return journey"
                    : "One way journey"}
                </p>
              </div>

              <span className="bg-[#eef3fa] dark:bg-[#1e3a5f]/25 text-[#1e3a5f] dark:text-[#8fb4dd] text-xs font-semibold px-3 py-1 rounded-full">
                Private
              </span>
            </div>

            {/* Route */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 p-4">
              {/* Pickup */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-3 h-3 rounded-full bg-[#16803c] mt-1.5" />

                  <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600 my-1" />
                </div>

                <div className="min-w-0 pb-4">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-gray-400 mb-1">
                    Pickup
                  </div>

                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
                    {booking.pickup.address}
                  </div>
                </div>
              </div>

              {/* Vias */}
              {booking.vias?.map((via, index) => (
                <div key={via.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />

                    <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600 my-1" />
                  </div>

                  <div className="min-w-0 pb-4">
                    <div className="text-[10px] uppercase tracking-wide font-bold text-blue-500 mb-1">
                      Via Stop {index + 1}
                    </div>

                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
                      {via.address || "Stop not selected"}
                    </div>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex gap-3">
                <div>
                  <span className="block w-3 h-3 rounded-full bg-[#c62828] mt-1.5" />
                </div>

                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-gray-400 mb-1">
                    Destination
                  </div>

                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
                    {booking.destination.address}
                  </div>
                </div>
              </div>
            </div>

            {/* Date / Time */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-3.5">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                  Date
                </div>

                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(booking.date)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-3.5">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                  Time
                </div>

                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {booking.time || "Not selected"}
                </div>
              </div>
            </div>

            {/* Route Info */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-3.5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Distance
                </div>

                <div className="font-bold text-gray-900 dark:text-white mt-1">
                  {formatDistance(booking.route.distanceMiles)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-100 dark:bg-gray-700 p-3.5">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Journey Time
                </div>

                <div className="font-bold text-gray-900 dark:text-white mt-1">
                  {formatDuration(booking.route.durationMinutes)}
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="mt-4 flex items-center justify-between px-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Passengers
              </span>

              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {booking.passengers}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Luggage
              </span>

              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {booking.luggage}
              </span>
            </div>

            {/* Fare */}
            <div className="mt-5 rounded-xl bg-[#1e3a5f] text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-80">Estimated Fare</div>

                  <div className="text-[11px] opacity-60 mt-1">
                    Final fare may vary
                  </div>
                </div>

                <div className="text-2xl font-bold">
                  £{booking.estimatedCost.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
