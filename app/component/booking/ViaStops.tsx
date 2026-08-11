"use client";

import { AnimatePresence, motion } from "framer-motion";

import AutocompleteInput from "./AutocompleteInput";

import type { AddressSelection, Via } from "../../types/booking";

interface ViaStopsProps {
  vias: Via[];
  showStopsPopup: boolean;
  onOpenStops: () => void;
  onCloseStops: () => void;
  onAddVia: () => void;
  onRemoveVia: (id: string) => void;
  onViaChange: (id: string, value: string) => void;
  onViaSelect: (id: string, selection: AddressSelection) => void;
  onConfirmStops: () => void;
}

export default function ViaStops({
  vias,
  showStopsPopup,
  onOpenStops,
  onCloseStops,
  onAddVia,
  onRemoveVia,
  onViaChange,
  onViaSelect,
  onConfirmStops,
}: ViaStopsProps) {
  return (
    <>
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
                onClick={() => onRemoveVia(via.id)}
                className="px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition"
                aria-label={`Remove via stop ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenStops}
        className="w-full sm:w-auto px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
      >
        + Add More Stops
      </button>

      <AnimatePresence>
        {showStopsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-3 sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                onCloseStops();
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
              role="dialog"
              aria-modal="true"
              aria-labelledby="via-stops-title"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2
                    id="via-stops-title"
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    Add More Stops
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add multiple stops to your journey.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCloseStops}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 transition"
                  aria-label="Close stops"
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
                        onClick={() => onRemoveVia(via.id)}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-100 hover:text-red-600 transition"
                        aria-label={`Remove via stop ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>

                    <AutocompleteInput
                      label=""
                      placeholder="Enter stop address"
                      value={via.address}
                      onChange={(value) => onViaChange(via.id, value)}
                      onSelect={(selection) => onViaSelect(via.id, selection)}
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
                  onClick={onAddVia}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  + Add Another Stop
                </button>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onCloseStops}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirmStops}
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
    </>
  );
}
