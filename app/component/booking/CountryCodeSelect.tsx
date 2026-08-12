import type { CountryCodeSelectProps } from "../../types/booking";
import { AnimatePresence, motion } from "framer-motion";

import { useEffect, useRef, useState } from "react";
import { countryCodes } from "../../constants/country-codes";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { FlagChip } from "../booking/FlagChip";

export function CountryCodeSelect({ value, onChange }: CountryCodeSelectProps) {
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
            className="absolute left-0 z-1000 mt-1.5 max-h-64 w-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
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
