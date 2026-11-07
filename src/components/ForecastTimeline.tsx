import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getRiskTimeline, getForecastLabel, type RiskId } from "@/lib/risk-scenarios";

export function ForecastTimeline({ riskId, day, onDayChange }: { riskId: RiskId; day: number; onDayChange: (day: number) => void }) {
  const timeline = getRiskTimeline(riskId);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => onDayChange((day + 1) % (timeline.max + 1)), 900);
    return () => clearInterval(interval);
  }, [playing, day, timeline.max, onDayChange]);
  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <Button type="button" size="icon" variant="outline" className="h-7 w-7" aria-label={playing ? "Pause forecast animation" : "Play forecast animation"} aria-pressed={playing} onClick={() => setPlaying(previous => !previous)}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <label id="forecast-timeline-label" className="font-medium text-foreground">Forecast Timeline</label>
        </span>
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
        onValueChange={([value]) => { if (value !== undefined) { setPlaying(false); onDayChange(value); } }}
      />
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Today</span><span>{timeline.endLabel}</span>
      </div>
    </div>
  );
}
