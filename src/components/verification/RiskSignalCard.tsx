import { RiskSignal, SignalSeverity } from "@/lib/risk-engine/types";
import { Info } from "lucide-react";

interface RiskSignalCardProps {
  signal: RiskSignal;
}

export default function RiskSignalCard({ signal }: RiskSignalCardProps) {
  const isInfo = signal.isInformational || signal.points === 0;

  const severityStyles: Record<
    SignalSeverity,
    { label: string; text: string; bg: string; border: string }
  > = {
    high: {
      label: "High risk",
      text: "text-danger-color",
      bg: "bg-danger-light",
      border: "border-danger-light",
    },
    medium: {
      label: "Needs review",
      text: "text-warning-color",
      bg: "bg-warning-light",
      border: "border-warning-light",
    },
    low: {
      label: "Low concern",
      text: "text-accent-primary",
      bg: "bg-accent-light",
      border: "border-accent-light",
    },
  };

  const style = severityStyles[signal.severity] || severityStyles.low;

  return (
    <div className="p-5 sm:p-6 space-y-2 border-b border-subtle last:border-b-0 hover:bg-muted-custom transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isInfo ? (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-muted-custom border border-subtle text-secondary-color flex items-center gap-1">
              <Info className="w-3 h-3 text-tertiary-color" strokeWidth={2} />
              <span>Observation</span>
            </span>
          ) : (
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${style.bg} ${style.text}`}
            >
              {style.label}
            </span>
          )}

          <h4 className="text-sm font-medium text-primary-color">
            {signal.title}
          </h4>
        </div>

        {!isInfo && signal.points > 0 && (
          <span className={`text-xs font-mono font-medium tabular-nums ${style.text}`}>
            +{signal.points}
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-secondary-color leading-relaxed font-normal">
        {signal.description}
      </p>
    </div>
  );
}
