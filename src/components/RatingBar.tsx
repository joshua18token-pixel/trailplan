interface RatingBarProps {
  label: string;
  score: number; // 1-10
  color?: string;
}

export default function RatingBar({ label, score, color = "bg-forest" }: RatingBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-night/70 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-cream-dark rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className="text-sm font-bold text-night w-8 text-right">{score}/10</span>
    </div>
  );
}
