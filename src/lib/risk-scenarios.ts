import { getHeatwaveForecast, initialSuppliers, replacementSuppliers, type MapSupplier } from "@/lib/climate-forecast";

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

export const riskScenarios: RiskScenario[] = [
  {
    id: "heatwave", title: "Heatwave & Drought in Finland", country: "Finland", type: "Weather Risk", severity: "Critical",
    summary: "Heatwave and drought threaten Southwest Finland's pea harvests over the next six months. Expected yield reduction: 30%. Deficit: 450 tons.",
    impact: "−30% yield", metricLabel: "Forecast pea supply", metricValue: "1,050 t",
    baselinePerTon: 390, stockoutCost: 1_250_000, logisticsPremium: 8_000,
    safetyReason: "Outside Finland's drought footprint throughout the six-month forecast",
    suppliers: initialSuppliers, replacements: replacementSuppliers,
  },
  {
    id: "rainfall", title: "Heavy Rainfall & Flooding in Poland", country: "Poland", type: "Weather Risk", severity: "High",
    summary: "Persistent rainfall threatens central Polish harvests and road access. 450 tons of pea supply require alternative sourcing.",
    impact: "4-day delays", metricLabel: "At-risk shipment volume", metricValue: "450 t",
    baselinePerTon: 380, stockoutCost: 860_000, logisticsPremium: 12_000,
    safetyReason: "Outside Poland's storm footprint; logistics bypass flood-exposed Polish roads",
    suppliers: [
      { name: "Elbe Harvest GmbH", country: "Germany", region: "Lower Saxony", capacity: 200, pricePerTon: 402, leadTime: "3 days", lat: 53.1, lng: 9.1 },
      { name: "Jutland Growers ApS", country: "Denmark", region: "Central Jutland", capacity: 150, pricePerTon: 430, leadTime: "4 days", lat: 56.2, lng: 9.5 },
      { name: "Baltic Fields UAB", country: "Lithuania", region: "Kaunas", capacity: 150, pricePerTon: 395, leadTime: "2 days", lat: 54.9, lng: 23.9 },
    ],
    replacements: [
      { name: "Weser Agrar GmbH", country: "Germany", region: "Bremen", capacity: 220, pricePerTon: 410, leadTime: "3 days", lat: 53.08, lng: 8.8 },
      { name: "Fyn Produce ApS", country: "Denmark", region: "Funen", capacity: 170, pricePerTon: 422, leadTime: "4 days", lat: 55.4, lng: 10.4 },
      { name: "Klaipėda Agro UAB", country: "Lithuania", region: "Klaipėda", capacity: 140, pricePerTon: 401, leadTime: "3 days", lat: 55.7, lng: 21.1 },
    ],
  },
  {
    id: "economic", title: "Inflation & Transport Cost Spike in Spain", country: "Spain", type: "Economic Risk", severity: "High",
    summary: "Rising fuel and transport costs are increasing Spanish sourcing expenses. Reroute 450 tons to suppliers outside Spain.",
    impact: "+24% freight", metricLabel: "Forecast freight index", metricValue: "124",
    baselinePerTon: 360, stockoutCost: 620_000, logisticsPremium: 6_000,
    safetyReason: "Non-Spanish sourcing and regional logistics avoid Spain's high-cost corridors",
    suppliers: [
      { name: "Loire Récoltes SAS", country: "France", region: "Loire Valley", capacity: 210, pricePerTon: 390, leadTime: "3 days", lat: 47.4, lng: 0.7 },
      { name: "Alentejo Verde Lda", country: "Portugal", region: "Alentejo", capacity: 160, pricePerTon: 375, leadTime: "2 days", lat: 38.57, lng: -7.91 },
      { name: "Po Valley Cooperativa", country: "Italy", region: "Emilia-Romagna", capacity: 140, pricePerTon: 415, leadTime: "4 days", lat: 44.5, lng: 11.3 },
    ],
    replacements: [
      { name: "Bretagne Légumes SAS", country: "France", region: "Brittany", capacity: 220, pricePerTon: 398, leadTime: "3 days", lat: 48.1, lng: -1.7 },
      { name: "Ribatejo Colheitas Lda", country: "Portugal", region: "Ribatejo", capacity: 170, pricePerTon: 382, leadTime: "2 days", lat: 39.2, lng: -8.7 },
      { name: "Piemonte Agro SRL", country: "Italy", region: "Piedmont", capacity: 160, pricePerTon: 408, leadTime: "4 days", lat: 45.07, lng: 7.69 },
    ],
  },
];

export function getRiskTimeline(id: RiskId) {
  if (id === "rainfall") return { max: 14, unit: "day" as const, horizon: "Next 14 Days", endLabel: "Day 14" };
  if (id === "heatwave") return { max: 180, unit: "day" as const, horizon: "Next 6 Months", endLabel: "Day 180" };
  return { max: 6, unit: "month" as const, horizon: "Next 6 Months", endLabel: "Month 6" };
}

export function getForecastLabel(id: RiskId, value: number) {
  if (value === 0) return "Today";
  return `${getRiskTimeline(id).unit === "day" ? "Day" : "Month"} ${value}`;
}

export function getFinancialImpact(risk: RiskScenario, suppliers: SourcingSupplier[], period: number) {
  const progress = Math.max(0, Math.min(1, period / getRiskTimeline(risk.id).max));
  const baseline = risk.baselinePerTon * 450;
  const procurement = allocateReplacement(suppliers).reduce((total, supplier) => total + supplier.subtotal, 0);
  const logistics = Math.round(risk.logisticsPremium * (1 + progress * 0.25));
  const alternativeExtra = Math.max(0, procurement - baseline) + logistics;
  const unresolved = Math.round(risk.stockoutCost * (0.65 + progress * 0.35));
  const avoidedLoss = unresolved - alternativeExtra;
  return { baseline, procurement, logistics, alternativeExtra, unresolved, avoidedLoss,
    roiPercent: alternativeExtra > 0 ? Math.round(avoidedLoss / alternativeExtra * 100) : 0 };
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

export function allocateReplacement(suppliers: SourcingSupplier[], requiredTons = 450) {
  let remaining = requiredTons;
  return suppliers.map((supplier) => {
    const allocatedTons = Math.min(remaining, supplier.capacity);
    remaining -= allocatedTons;
    return { ...supplier, allocatedTons, subtotal: allocatedTons * supplier.pricePerTon };
  });
}