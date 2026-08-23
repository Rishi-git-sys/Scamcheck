import { Check } from "lucide-react";

interface RecommendationsProps {
  recommendations: string[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      {recommendations.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 text-xs sm:text-sm text-primary-color p-2 rounded-lg"
        >
          <div className="w-5 h-5 rounded-full bg-accent-light text-accent-primary flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
          <span className="leading-relaxed font-normal">{item}</span>
        </div>
      ))}
    </div>
  );
}
