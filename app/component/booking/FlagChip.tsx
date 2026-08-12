


const flagUrl = (iso: string) =>
  `https://flagcdn.com/48x36/${iso.toLowerCase()}.png`;


export function FlagChip({ iso, label }: { iso: string; label: string }) {
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