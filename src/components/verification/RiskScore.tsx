import { RiskLevel } from "@/lib/risk-engine/types";

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
}

export default function RiskScore({ score, level }: RiskScoreProps) {
  const levelLabels: Record<RiskLevel, string> = {
    safe: "Low risk",
    review: "Needs review",
    high: "High risk",
  };

  const levelStyles: Record<
    RiskLevel,
    { text: string; bg: string; border: string }
  > = {
    safe: {
      text: "text-accent-primary",
      bg: "bg-accent-light",
      border: "border-accent-light",
    },
    review: {
      text: "text-warning-color",
      bg: "bg-warning-light",
      border: "border-warning-light",
    },
    high: {
      text: "text-danger-color",
      bg: "bg-danger-light",
      border: "border-danger-light",
    },
  };

  const currentStyle = levelStyles[level] || levelStyles.review;

  return (
    <div className="text-center space-y-2">
      <div className="flex items-baseline justify-center gap-1.5">
        <span
          className={`text-5xl sm:text-6xl font-medium tabular-nums tracking-tight ${currentStyle.text}`}
        >
          {score}
        </span>
        <span className="text-lg sm:text-xl font-normal text-tertiary-color">
          / 100
        </span>
      </div>

      <div>
        <span
          className={`inline-block ${currentStyle.bg} ${currentStyle.text} border ${currentStyle.border} text-xs font-medium px-3.5 py-1 rounded-full uppercase tracking-wider`}
        >
          {levelLabels[level]}
        </span>
      </div>
    </div>
  );
}
