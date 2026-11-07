import type { RiskId } from "@/lib/risk-scenarios";
import { APETIT_BASELINE } from "@/lib/apetit-baseline";

export const crops = ["Peas", "Carrots", "Potatoes", "Spinach", "Turnips", "Rapeseed (Canola)"] as const;
export type Crop = typeof crops[number];
export type Category = "Climate" | "Economic" | "Political" | "Logistical" | "Biological";
export interface SupportAction { id: string; title: string; detail: string; benefit: string; cost: number | null; protection: number; }
export interface DataSource { name: string; type: "Climate/Weather" | "Logistics/Traffic" | "Economic/Political"; detail: string; }
export interface IntelligenceAlert {
  id: string; title: string; category: Category; severity: "Critical" | "Watch" | "Managed";
  crops: Crop[]; region: string; farmers: number | null; location: [number, number];
  mapRisk: RiskId; overlay: "radar" | "routes" | "farms";
  problem: string; exposure: number | null; baseline: number | null;
  source: string; sourceUrl: string; evidence: string; dataSources: DataSource[]; actions: SupportAction[];
}
// Only the supplied corporate brief has a replacement dataset. Unsupported demo alerts are not scientific observations.
export const intelligenceAlerts: IntelligenceAlert[] = [{
  id: "finland-drought", title: "Copernicus ERA5 Soil Moisture Deficit & FMI Extreme Heat Alert (>28°C)",
  category: "Climate", severity: "Critical", crops: ["Peas"], region: "Säkylä, Finland", farmers: null,
  location: APETIT_BASELINE.contractFarm, mapRisk: "heatwave", overlay: "radar",
  problem: "Contract Farming Peas (Finland): 6,000,000 kg grown across 2,000 ha. Projected 30% yield loss (1,800,000 kg deficit) due to critical soil moisture drop in Säkylä region.",
  exposure: null, baseline: null,
  source: "User-supplied Apetit corporate baseline · ERA5 / FMI methodology",
  sourceUrl: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land",
  evidence: "Coordinates, volumes and intervention assumptions are transcribed from the supplied brief, not independently verified corporate disclosures. No ERA5 observations or live FMI alerts were supplied or retrieved. The moving anomaly remains a simulated 10-day scenario, not an IPCC prediction.",
  dataSources: [
    { name: "Apetit supplied baseline", type: "Economic/Political", detail: "User-provided corporate figures. Reporting year, accounting boundary and source disclosure were not supplied." },
    { name: "Copernicus ERA5-Land", type: "Climate/Weather", detail: "Soil-moisture reanalysis methodology reference; no measured soil-moisture time series is connected." },
    { name: "FMI Open Data", type: "Climate/Weather", detail: "Weather methodology reference for the supplied >28°C scenario; no live warning or forecast has been retrieved." },
  ],
  actions: [
    { id: "shift-sourcing", title: "Shift sourcing (Modify product mix)", detail: "Substitute the lost pea volume with Frozen Chickpeas (Kikherne Pakaste) and Frozen Corn (Maissi). Supplier 2 (Belgium, Origin: BE/CA/IT/ES) and Supplier 1 (Hungary). Product split, supplier capacities, exact locations and quotes were not supplied.", benefit: "Targets substitution of 1,800,000 kg. Preserves product availability, not the local pea harvest.", cost: null, protection: 1 },
    { id: "irrigation", title: "Local agronomic adaptation (Emergency drip irrigation)", detail: "Deploy subsidized localized drip irrigation using nearby surface water to save the 1,800,000 kg pea yield. Equipment & operational subsidies: €85,000. Requires basin assessment and water-use approval.", benefit: "Targets saving 1,800,000 kg of local peas and avoids the +3,600 tonnes CO2e imported-goods penalty; agronomic efficacy remains unverified.", cost: APETIT_BASELINE.irrigationCost, protection: 1 },
  ],
}];

export function filterAlerts(crop: Crop | "All crops", category: Category | "All risks") {
  return intelligenceAlerts.filter(alert => (crop === "All crops" || alert.crops.includes(crop)) && (category === "All risks" || alert.category === category));
}
// Missing prices and financial losses remain unknown; forecast scrubbing cannot invent monetary valuations.
export function getSupportImpact(alert: IntelligenceAlert, action: SupportAction, _period: number) {
  const unresolved = alert.exposure;
  const protectedValue = unresolved === null ? null : Math.round(unresolved * action.protection);
  const netBenefit = protectedValue === null || action.cost === null ? null : protectedValue - action.cost;
  return { unresolved, protectedValue, residualLoss: unresolved === null || protectedValue === null ? null : unresolved - protectedValue,
    cost: action.cost, netBenefit, roi: netBenefit === null || action.cost === null || action.cost === 0 ? null : Math.round(netBenefit / action.cost * 100) };
}
export interface Tradeoff { ghgTons: number | null; ghgNote: string; nature: string; critical?: boolean; }
export const actionTradeoffs: Record<string, Tradeoff> = {
  "shift-sourcing": { ghgTons: APETIT_BASELINE.importedGoodsGhgTons, ghgNote: "Scope 3 (Purchased Goods). Based on supplied emission factor: 2 kg CO2e/kg product (excl. Land Use Change). European logistics adds emissions but is not quantified; +3,600 tonnes excludes logistics.", nature: "Supplied qualitative screening assumption: Neutral local water impact, but high embedded nature risk in EU sourcing supply chains. Neither neutrality nor supply-chain risk has been independently assessed." },
  irrigation: { ghgTons: null, ghgNote: "Minimal Scope 1 emission increase (diesel pumps); quantity not supplied. Avoids the +3,600 Scope 3 penalty from imported goods.", critical: true, nature: "CRITICAL ALERT: Will increase local Lake Water withdrawal by +15,000 m³ (a 36% spike against the 41,438 m³ baseline). Supplied scenario flags a violation of SBTN Freshwater stress thresholds for the local basin; basin-specific thresholds and compliance have not been verified." },
};
export const climateScenarios = [
  { id: "baseline", label: "Baseline (Current Emissions)" },
  { id: "ssp585", label: "SSP5-8.5 (Fossil-Fueled Development)" },
] as const;
export type ClimateScenarioId = typeof climateScenarios[number]["id"];
