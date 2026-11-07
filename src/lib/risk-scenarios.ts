import { getHeatwaveForecast, type MapSupplier } from "@/lib/climate-forecast";

export type RiskId = "heatwave" | "rainfall" | "economic";
export type SourcingSupplier = MapSupplier & { pricePerTon: number; leadTime: string };
export interface RiskScenario {
  id: RiskId;
  title: string;
  country: string;
  type: "Weather Risk" | "Economic Risk";
  severity: string;
  summary: string;
  impact: string;
  metricLabel: string;
  metricValue: string;
  baselinePerTon: number;
  stockoutCost: number;
  logisticsPremium: number;
  safetyReason: string;
  suppliers: SourcingSupplier[];
  replacements: SourcingSupplier[];
}

// Weather rendering remains available for all modes; only the supplied Säkylä dataset is active.
export const riskScenarios: RiskScenario[] = [];

export function getRiskTimeline(id: RiskId) {
  if (id === "rainfall") return { max: 14, unit: "day" as const, horizon: "Next 14 Days", endLabel: "Day 14" };
  if (id === "heatwave") return { max: 180, unit: "day" as const, horizon: "Next 6 Months", endLabel: "Day 180" };
  return { max: 6, unit: "month" as const, horizon: "Next 6 Months", endLabel: "Month 6" };
}

export function getForecastLabel(id: RiskId, value: number) {
  if (value === 0) return "Today";
  return `${getRiskTimeline(id).unit === "day" ? "Day" : "Month"} ${value}`;
}

export function getWeatherForecast(id: RiskId, day: number) {
  if (id === "heatwave") return getHeatwaveForecast(day);
  const clamped = Math.max(0, Math.min(14, day));
  return { center: [52.1 + clamped * 0.035, 20.5 + clamped * 0.05] as [number, number], radius: 160_000 + clamped * 5_000 };
}

export const SPAIN_OUTLINE: [number, number][] = [
  [43.4,-1.8],[42.8,0.2],[42.7,0.7],[42.4,1.4],[42.5,2.0],[42.4,3.2],[41.8,3.1],[41.4,2.2],[40.7,0.8],[40.0,0.1],[39.4,-0.3],[38.8,0.2],[38.0,-0.7],[37.6,-0.8],[36.7,-2.2],[36.7,-3.8],[36.4,-5.2],[36.0,-5.6],[36.7,-6.4],[37.2,-7.4],[37.6,-7.5],[38.0,-7.0],[38.5,-7.3],[38.9,-7.0],[39.6,-7.5],[39.7,-7.0],[40.1,-6.9],[41.0,-6.9],[41.6,-6.2],[41.9,-6.6],[41.8,-7.5],[41.9,-8.2],[41.9,-8.8],[42.6,-9.0],[43.0,-9.3],[43.6,-8.3],[43.7,-7.7],[43.5,-6.0],[43.4,-4.0],[43.4,-1.8],
];

export function pointInSpain(lat: number, lng: number) {
  let inside = false;
  for (let i = 0, j = SPAIN_OUTLINE.length - 1; i < SPAIN_OUTLINE.length; j = i++) {
    const a = SPAIN_OUTLINE[i]; const b = SPAIN_OUTLINE[j];
    if (!a || !b) continue;
    if ((a[0] > lat) !== (b[0] > lat) && lng < ((b[1] - a[1]) * (lat - a[0])) / (b[0] - a[0]) + a[1]) inside = !inside;
  }
  return inside;
}

