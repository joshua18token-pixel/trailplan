interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  emoji?: string;
}

export default function FilterChip({ label, active, onClick, emoji }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
        ${active
          ? "bg-forest text-white shadow-md"
          : "bg-white text-night/70 hover:bg-forest/5 hover:text-forest border border-cream-dark"
        }`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}
