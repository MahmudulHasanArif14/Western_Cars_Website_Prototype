"use client";

export type JourneyType = "oneway" | "return";

interface JourneyTypeSelectorProps {
  value: JourneyType;
  onChange: (value: JourneyType) => void;
}

export default function JourneyTypeSelector({
  value,
  onChange,
}: JourneyTypeSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-full p-1 mb-6">
      <button
        type="button"
        onClick={() => onChange("oneway")}
        aria-pressed={value === "oneway"}
        className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
          value === "oneway" ? "bg-[#1e3a5f] text-white" : "text-gray-500"
        }`}
      >
        One Way
      </button>

      <button
        type="button"
        onClick={() => onChange("return")}
        aria-pressed={value === "return"}
        className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition ${
          value === "return" ? "bg-[#1e3a5f] text-white" : "text-gray-500"
        }`}
      >
        Return
      </button>
    </div>
  );
}
