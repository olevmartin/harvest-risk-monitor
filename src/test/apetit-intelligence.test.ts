import { describe, expect, it } from "vitest";
import { crops, filterAlerts, intelligenceAlerts, getSupportImpact } from "@/lib/apetit-intelligence";
describe("Apetit farmer-first intelligence", () => {
  it("includes all six requested crops", () => { expect(crops).toEqual(["Peas", "Carrots", "Potatoes", "Spinach", "Turnips", "Rapeseed (Canola)"]); });
  it("filters crops and categories together", () => { expect(filterAlerts("Potatoes", "Political").map(alert => alert.id)).toEqual(["fertilizer"]); expect(filterAlerts("Spinach", "Economic")).toEqual([]); });
  it("covers all five risk categories", () => { expect(new Set(intelligenceAlerts.map(alert => alert.category))).toEqual(new Set(["Climate", "Economic", "Political", "Logistical", "Biological"])); });
  it("calculates farmer support benefits without charging unused supplier capacity", () => {
    const alert = intelligenceAlerts[0]; const action = alert?.actions[0];
    if (!alert || !action) throw new Error("Missing harvest-schedule proposal");
    const result = getSupportImpact(alert, action, 180);
    expect(result.cost).toBe(22000); expect(result.protectedValue).toBe(875000); expect(result.netBenefit).toBe(853000); expect(result.residualLoss).toBe(375000); expect(result.roi).toBe(3877);
  });
  it("prices the targeted irrigation subsidy at €15,000 protecting €200,000 of yield", () => {
    const alert = intelligenceAlerts.find(item => item.id === "finland-drought");
    const action = alert?.actions.find(item => item.id === "irrigation");
    expect(action?.cost).toBe(15000); expect(action?.protection).toBe(0.8);
    const result = alert && action ? getSupportImpact(alert, action, 180) : undefined;
    expect(result?.protectedValue).toBe(1000000); expect(result?.netBenefit).toBe(985000);
  });
  it("cites realistic public data sources for every alert", () => {
    for (const alert of intelligenceAlerts) {
      expect(alert.dataSources.length).toBeGreaterThan(0);
      for (const source of alert.dataSources) expect(["Climate/Weather", "Logistics/Traffic", "Economic/Political"]).toContain(source.type);
    }
    const drought = intelligenceAlerts.find(item => item.id === "finland-drought");
    expect(drought?.dataSources.map(source => source.name)).toEqual(["FMI Open Data", "Copernicus Soil Moisture", "Frogcast API"]);
  });
  it("keeps harvest adjustment at four days with a grower-support action", () => { const alert = intelligenceAlerts.find(item => item.id === "poland-rain"); expect(alert?.actions.find(action => action.id === "harvest")?.cost).toBe(26000); expect(alert?.actions.find(action => action.id === "harvest")?.protection).toBe(0.75); });
});
