"use client";

interface DateTimeSelectorProps {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

export default function DateTimeSelector({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimeSelectorProps) {
  return (
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
            required
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1e3a5f]/40 focus:border-[#1e3a5f] transition"
          />
        </div>
      </div>
    </div>
  );
}
