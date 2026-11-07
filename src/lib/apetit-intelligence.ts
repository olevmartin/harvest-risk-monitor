import { riskScenarios, getFinancialImpact, type RiskId } from "@/lib/risk-scenarios";

export const crops = ["Peas", "Carrots", "Potatoes", "Spinach", "Turnips", "Rapeseed (Canola)"] as const;
export type Crop = typeof crops[number];
export type Category = "Climate" | "Economic" | "Political" | "Logistical" | "Biological";
export interface SupportAction { id: string; title: string; detail: string; benefit: string; cost: number; protection: number; }
export interface DataSource { name: string; type: "Climate/Weather" | "Logistics/Traffic" | "Economic/Political"; detail: string; }
export interface IntelligenceAlert {
  id: string; title: string; category: Category; severity: "Critical" | "Watch" | "Managed";
  crops: Crop[]; region: string; farmers: number; location: [number, number];
  mapRisk: RiskId; overlay: "radar" | "routes" | "farms";
  problem: string; exposure: number; baseline: number;
  source: string; sourceUrl: string; evidence: string; dataSources: DataSource[]; actions: SupportAction[];
}
export const intelligenceAlerts: IntelligenceAlert[] = [
  { id: "finland-drought", title: "Severe Heatwave & Drought in Southwest Finland", category: "Climate", severity: "Critical", crops: ["Peas", "Spinach"], region: "Southwest Finland", farmers: 24, location: [60.8, 22.5], mapRisk: "heatwave", overlay: "radar",
    problem: "FMI’s 10-day forecast shows temperatures above 28°C while Copernicus satellite data reports critically low soil moisture. Pea yields could drop 30%, leaving a 450-ton gap. Local contract farms need water support before crop stress becomes irreversible.", exposure: 1250000, baseline: 175500,
    source: "Finnish Meteorological Institute", sourceUrl: "https://en.ilmatieteenlaitos.fi/", evidence: "Illustrative drought outlook and soil-moisture assumptions. No live forecast has been retrieved.",
    dataSources: [
      { name: "FMI Open Data", type: "Climate/Weather", detail: "Finnish Meteorological Institute 10-day forecast: >28°C across Southwest Finland." },
      { name: "Copernicus Soil Moisture", type: "Climate/Weather", detail: "Satellite soil-moisture readings below critical levels for pea crops." },
      { name: "Frogcast API", type: "Climate/Weather", detail: "Hyperlocal field-level weather projections for the Turku region." },
    ],
    actions: [
      { id: "harvest-schedule", title: "Adjust harvest schedule", detail: "Move the pea harvest up by 3 days for 15 farms in the Turku region, before soil moisture drops below critical levels.", benefit: "Secures the harvest ahead of peak heat; keeps local contracts intact.", cost: 22000, protection: 0.7 },
      { id: "irrigation", title: "Targeted irrigation subsidies", detail: "Deploy mobile water pumps to 5 small-scale farmers located near rivers but lacking infrastructure. Estimated subsidy cost: €15,000.", benefit: "Saves €200,000 in pea crop yield.", cost: 15000, protection: 0.8 },
    ] },
  { id: "poland-rain", title: "Heavy rainfall disrupts harvests", category: "Climate", severity: "Watch", crops: ["Carrots", "Potatoes", "Turnips"], region: "Central Poland", farmers: 12, location: [52.1, 20.5], mapRisk: "rainfall", overlay: "radar",
    problem: "Forecast rainfall could delay root-crop harvesting and road access by four days. Help partner growers protect the harvest instead of replacing them.", exposure: 860000, baseline: 171000,
    source: "IMGW · Polish meteorological institute", sourceUrl: "https://www.imgw.pl/en", evidence: "Illustrative 14-day rainfall scenario; shipment and farmer counts are demo assumptions.",
    dataSources: [
      { name: "Frogcast API", type: "Climate/Weather", detail: "Field-level precipitation nowcasts for central Polish growing regions." },
      { name: "Copernicus Soil Moisture", type: "Climate/Weather", detail: "Satellite flood-risk and soil-saturation monitoring." },
      { name: "Fintraffic", type: "Logistics/Traffic", detail: "Road and rail disruption feeds for harvest collection routes." },
    ],
    actions: [
      { id: "harvest", title: "Bring harvest forward 4 days", detail: "Agree an earlier harvest window with growers and reserve shared machinery before roads become exposed.", benefit: "Secures the harvest and preserves existing grower relationships.", cost: 26000, protection: 0.75 },
      { id: "storage", title: "Reserve dry storage & transport", detail: "Cover temporary dry storage and use flood-avoiding routes for the existing harvest.", benefit: "Limits spoilage while growers retain their supply contracts.", cost: 34000, protection: 0.85 },
    ] },
  { id: "spain-cost", title: "Energy & freight costs climb", category: "Economic", severity: "Watch", crops: ["Rapeseed (Canola)", "Peas"], region: "Spain · European routes", farmers: 9, location: [40.42, -3.7], mapRisk: "economic", overlay: "routes",
    problem: "A simulated 24% freight increase puts European sourcing margins under pressure. Buffer partner costs and consolidate loads rather than terminate contracts.", exposure: 620000, baseline: 162000,
    source: "Eurostat · Energy price statistics", sourceUrl: "https://ec.europa.eu/eurostat", evidence: "Illustrative fuel-price and freight-index stress test, not a retrieved market quote.",
    dataSources: [
      { name: "Trading Economics API", type: "Economic/Political", detail: "Diesel fuel and freight-index price spike tracking." },
      { name: "MarineTraffic", type: "Logistics/Traffic", detail: "Shipment tracking for Iberian supply corridors." },
    ],
    actions: [
      { id: "buffer", title: "Provide a temporary cost buffer", detail: "Offer a time-limited partner advance and review repayment terms jointly with growers.", benefit: "Protects farm cash flow and secures next year’s contracts.", cost: 38000, protection: 0.7 },
      { id: "loads", title: "Consolidate regional freight", detail: "Combine shipments from existing partners and review lower-cost corridors.", benefit: "Reduces transport exposure without abandoning suppliers.", cost: 16000, protection: 0.55 },
    ] },
  { id: "fertilizer", title: "Fertilizer route uncertainty", category: "Political", severity: "Watch", crops: ["Rapeseed (Canola)", "Potatoes"], region: "Finland · Baltic supply corridor", farmers: 31, location: [60.3, 24.8], mapRisk: "economic", overlay: "farms",
    problem: "A hypothetical disruption to Baltic fertilizer deliveries could affect spring planting. Local Finnish farms need a supply buffer and financial support.", exposure: 480000, baseline: 120000,
    source: "European Commission · Trade policy", sourceUrl: "https://policy.trade.ec.europa.eu/", evidence: "Hypothetical geopolitical disruption. No current restriction or event is asserted.",
    dataSources: [
      { name: "Trading Economics API", type: "Economic/Political", detail: "Fertilizer price spike tracking across European markets." },
      { name: "MarineTraffic", type: "Logistics/Traffic", detail: "Fertilizer and seed shipment tracking across the Baltic corridor." },
    ],
    actions: [{ id: "fertilizer-buffer", title: "Fund a shared fertilizer buffer", detail: "Arrange a grower-owned reserve from compliant sources, with agronomic checks on application rates.", benefit: "Protects planting schedules across 31 local contract farms.", cost: 32000, protection: 0.7 }] },
  { id: "harvest-access", title: "Harvest access under pressure", category: "Logistical", severity: "Watch", crops: ["Carrots", "Turnips"], region: "Satakunta, Finland", farmers: 16, location: [61.3, 21.9], mapRisk: "rainfall", overlay: "farms",
    problem: "A hypothetical shortage of harvest machinery could delay collections from local farms. Coordinate equipment and collection windows before the harvest peak.", exposure: 310000, baseline: 98000,
    source: "Natural Resources Institute Finland (Luke)", sourceUrl: "https://www.luke.fi/en", evidence: "Illustrative seasonal harvest-capacity scenario. Farm schedules are not connected.",
    dataSources: [
      { name: "Fintraffic", type: "Logistics/Traffic", detail: "Finnish road disruption and access feeds for collection routes." },
      { name: "FMI Open Data", type: "Climate/Weather", detail: "Harvest-window weather forecasts for Satakunta." },
    ],
    actions: [{ id: "machinery", title: "Coordinate shared harvest machinery", detail: "Propose a pooled equipment calendar and farmer-approved collection slots.", benefit: "Keeps 16 growers on schedule without changing suppliers.", cost: 21000, protection: 0.8 }] },
  { id: "pests", title: "Pest pressure under monitoring", category: "Biological", severity: "Managed", crops: ["Spinach", "Peas", "Rapeseed (Canola)"], region: "Southwest Finland", farmers: 18, location: [60.45, 23.2], mapRisk: "heatwave", overlay: "farms",
    problem: "Illustrative pest pressure is being monitored in leafy and oilseed crops. Prioritize field scouting and integrated pest management with local growers.", exposure: 220000, baseline: 85000,
    source: "Finnish Food Authority · Plant health", sourceUrl: "https://www.ruokavirasto.fi/en/", evidence: "Demo monitoring case, not a confirmed pest outbreak or a pesticide recommendation.",
    dataSources: [
      { name: "FMI Open Data", type: "Climate/Weather", detail: "Temperature and humidity trends driving pest-pressure models." },
      { name: "Copernicus Soil Moisture", type: "Climate/Weather", detail: "Vegetation-stress satellite monitoring for leafy and oilseed crops." },
    ],
    actions: [{ id: "scouting", title: "Arrange joint field scouting", detail: "Fund agronomist visits and threshold-based, locally approved integrated pest management.", benefit: "Protects crop quality with targeted, lower-impact interventions.", cost: 12000, protection: 0.65 }] },
];

export function filterAlerts(crop: Crop | "All crops", category: Category | "All risks") {
  return intelligenceAlerts.filter(alert => (crop === "All crops" || alert.crops.includes(crop)) && (category === "All risks" || alert.category === category));
}
export function getSupportImpact(alert: IntelligenceAlert, action: SupportAction, period: number) {
  const scenario = riskScenarios.find(risk => risk.id === alert.mapRisk);
  const progress = scenario ? getFinancialImpact(scenario, scenario.suppliers, period).unresolved / scenario.stockoutCost : 1;
  const unresolved = Math.round(alert.exposure * progress);
  const protectedValue = Math.round(unresolved * action.protection);
  const netBenefit = protectedValue - action.cost;
  return { unresolved, protectedValue, residualLoss: unresolved - protectedValue, cost: action.cost, netBenefit, roi: Math.round(netBenefit / action.cost * 100) };
}