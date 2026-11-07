import { Slider } from "@/components/ui/slider";
import { getRiskTimeline, getForecastLabel, type RiskId } from "@/lib/risk-scenarios";

export function ForecastTimeline({ riskId, day, onDayChange }: { riskId: RiskId; day: number; onDayChange: (day: number) => void }) {
  const timeline = getRiskTimeline(riskId);
  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <label id="forecast-timeline-label" className="font-medium text-foreground">Forecast Timeline</label>
        <span className="text-xs text-muted-foreground">{timeline.horizon}</span>
        <output className="font-semibold text-primary" aria-live="polite">{getForecastLabel(riskId, day)}</output>
      </div>
      <Slider
        aria-labelledby="forecast-timeline-label"
        aria-valuetext={getForecastLabel(riskId, day)}
        min={0}
        max={timeline.max}
        step={1}
        value={[day]}
        onValueChange={([value]) => { if (value !== undefined) onDayChange(value); }}
      />
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Today</span><span>{timeline.endLabel}</span>
      </div>
    </div>
  );
}