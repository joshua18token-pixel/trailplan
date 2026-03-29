import type { Difficulty } from "@/data/mockData";

const config: Record<Difficulty, { bg: string; text: string; label: string }> = {
  easy: { bg: "bg-green-100", text: "text-green-800", label: "Easy" },
  moderate: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Moderate" },
  hard: { bg: "bg-orange-100", text: "text-orange-800", label: "Hard" },
  expert: { bg: "bg-red-100", text: "text-red-800", label: "Expert" },
};

export default function DifficultyBadge({ difficulty, size = "sm" }: { difficulty: Difficulty | string; size?: "sm" | "md" }) {
  const key = (typeof difficulty === "string" ? difficulty.toLowerCase() : difficulty) as Difficulty;
  const c = config[key] || config.moderate;
  const sizeClasses = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${c.bg} ${c.text} ${sizeClasses}`}>
      {c.label}
    </span>
  );
}
