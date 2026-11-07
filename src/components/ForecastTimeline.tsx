import { Slider } from "@/components/ui/slider";
import { FORECAST_LAST_DAY } from "@/lib/climate-forecast";

export function ForecastTimeline({ day, onDayChange }: { day: number; onDayChange: (day: number) => void }) {
  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <label id="forecast-timeline-label" className="font-medium text-foreground">Forecast Timeline</label>
        <output className="text-muted-foreground" aria-live="polite">{day === 0 ? "Today" : `Day ${day}`}</output>
      </div>
      <Slider
        aria-labelledby="forecast-timeline-label"
        aria-valuetext={day === 0 ? "Today" : `Day ${day}`}
        min={0}
        max={FORECAST_LAST_DAY}
        step={1}
        value={[day]}
        onValueChange={([value]) => { if (value !== undefined) onDayChange(value); }}
      />
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Today</span><span>Day 10</span>
      </div>
    </div>
  );
}