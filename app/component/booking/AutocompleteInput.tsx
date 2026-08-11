"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import type { AddressSelection, Suggestion } from "../../types/booking";

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

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
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

export default function AutocompleteInput({
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

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        text: trimmedQuery,
      });

      const response = await fetch(
        `/api/geocode/autocomplete?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.status}`);
      }

      const data = await response.json();

      const rawResults: Suggestion[] = (data.features || [])
        .map((feature: unknown) => {
          const item = feature as {
            geometry?: {
              coordinates?: unknown;
            };
            properties?: {
              label?: string;
              name?: string;
              id?: string;
            };
          };

          const coordinates = item.geometry?.coordinates;

          if (!Array.isArray(coordinates) || coordinates.length < 2) {
            return null;
          }

          const lng = Number(coordinates[0]);
          const lat = Number(coordinates[1]);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }

          return {
            label:
              item.properties?.label ||
              item.properties?.name ||
              "Unknown location",
            lng,
            lat,
            id: item.properties?.id,
          };
        })
        .filter((item): item is Suggestion => item !== null);

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
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Autocomplete error:", error);

      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    onChange(nextValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (nextValue.trim().length < 3) {
      abortControllerRef.current?.abort();

      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);

      return;
    }

    timerRef.current = setTimeout(() => {
      void fetchSuggestions(nextValue);
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
      const target = event.target;

      if (
        inputRef.current &&
        target instanceof Node &&
        !inputRef.current.contains(target)
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

      abortControllerRef.current?.abort();
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
          aria-invalid={error}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) {
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
        <div
          className="absolute z-1000 left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${index}-${suggestion.lat}-${suggestion.lng}`}
              type="button"
              role="option"
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
