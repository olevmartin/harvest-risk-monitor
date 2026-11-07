import { APETIT_BASELINE } from "@/lib/apetit-baseline";

export interface MapSupplier {
  name: string;
  region: string;
  country: string;
  capacity: number;
  lat: number;
  lng: number;
}

/** Six-month horizon expressed in days so a short heat spike can be scrubbed day by day. */
export const HEATWAVE_LAST_DAY = 180;
/** The anomaly only exists for a 10-day window; the map is clear outside it. */
export const HEATWAVE_WINDOW = { start: 8, end: 17 } as const;

/**
 * Front spawns over the Baltic Sea (west), sweeps over Turku, peaks, then fades moving east.
 * intensity is 0 outside the window (radius 0 = nothing drawn).
 */
export function getHeatwaveForecast(day: number) {
  const { start, end } = HEATWAVE_WINDOW;
  const t = Math.max(0, Math.min(1, (day - start) / (end - start)));
  const active = day >= start && day <= end;
  const center: [number, number] = [APETIT_BASELINE.contractFarm[0] + (t - 1 / 3) * 1.4, APETIT_BASELINE.contractFarm[1] + (t - 1 / 3) * 11.2];
  // Ramp up to a peak near Turku (t≈0.35), then slowly dissipate eastward.
  const intensity = !active ? 0 : t < 0.35 ? 0.35 + (t / 0.35) * 0.65 : Math.max(0.15, 1 - ((t - 0.35) / 0.65) * 0.85);
  return { center, radius: active ? 90_000 + intensity * 40_000 : 0, intensity, active };
}

export function distanceMeters(a: [number, number], b: [number, number]) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(b[0] - a[0]);
  const longitudeDelta = radians(b[1] - a[1]);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(a[0])) * Math.cos(radians(b[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

// Supplier countries are supplied, but exact sites/capacities/prices are not: do not fabricate map markers.
export const initialSuppliers: (MapSupplier & { pricePerTon: number; leadTime: string })[] = [];
export const replacementSuppliers: (MapSupplier & { pricePerTon: number; leadTime: string })[] = [];
