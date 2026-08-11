"use client";

import type { ReactNode } from "react";

interface RouteSummaryProps {
  distance: number;
  duration: number;
  cost: number;
  routeLoading: boolean;
  routeError: string | null;
  hasDestination: boolean;
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

export default function RouteSummary({
  distance,
  duration,
  cost,
  routeLoading,
  routeError,
  hasDestination,
}: RouteSummaryProps) {
  let statusText: string;

  if (routeLoading) {
    statusText = "Calculating route...";
  } else if (routeError) {
    statusText = "Route unavailable";
  } else if (distance > 0) {
    statusText = "Route calculated";
  } else if (!hasDestination) {
    statusText = "Choose a destination to see fare";
  } else {
    statusText = "Enter locations";
  }

  return (
    <>
      {routeError && (
        <div className="text-sm text-red-500 mt-3">{routeError}</div>
      )}

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
            {statusText}
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

      <div className="rounded-xl bg-[#1e3a5f] text-white p-4 mt-3">
        <div className="text-sm opacity-80">Estimated Fare</div>

        <div className="text-2xl font-bold">£{cost.toFixed(2)}</div>
      </div>
    </>
  );
}
