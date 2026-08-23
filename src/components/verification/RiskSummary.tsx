interface RiskSummaryProps {
  summary: string;
}

export default function RiskSummary({ summary }: RiskSummaryProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-muted-custom border border-subtle text-center">
      <p className="text-xs sm:text-sm text-secondary-color leading-relaxed font-normal">
        {summary}
      </p>
    </div>
  );
}
