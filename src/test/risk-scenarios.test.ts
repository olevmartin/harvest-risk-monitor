import { describe, expect, it } from "vitest";
import { getRiskTimeline, getWeatherForecast, pointInSpain } from "@/lib/risk-scenarios";
import { APETIT_BASELINE } from "@/lib/apetit-baseline";
describe("Preserved forecast controls", () => {
  it("keeps six-month heat and economic horizons", () => { expect(getRiskTimeline("heatwave").max).toBe(180); expect(getRiskTimeline("economic").max).toBe(6); });
  it("keeps the fourteen-day rainfall horizon", () => { expect(getRiskTimeline("rainfall").max).toBe(14); });
  it("moves the heatwave through the exact Säkylä ground-zero site on day 11", () => { const f = getWeatherForecast("heatwave", 11); expect(f.center).toEqual(APETIT_BASELINE.contractFarm); });
  it("preserves economic country geometry", () => { expect(pointInSpain(40.42, -3.7)).toBe(true); expect(pointInSpain(38.72, -9.14)).toBe(false); });
});
