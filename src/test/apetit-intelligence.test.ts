import { describe, expect, it } from "vitest";
import { crops, filterAlerts, intelligenceAlerts, getSupportImpact } from "@/lib/apetit-intelligence";
describe("Apetit farmer-first intelligence", () => {
  it("includes all six requested crops", () => { expect(crops).toEqual(["Peas", "Carrots", "Potatoes", "Spinach", "Turnips", "Rapeseed (Canola)"]); });
  it("filters crops and categories together", () => { expect(filterAlerts("Potatoes", "Political").map(alert => alert.id)).toEqual(["fertilizer"]); expect(filterAlerts("Spinach", "Economic")).toEqual([]); });
  it("covers all five risk categories", () => { expect(new Set(intelligenceAlerts.map(alert => alert.category))).toEqual(new Set(["Climate", "Economic", "Political", "Logistical", "Biological"])); });
  it("calculates farmer support benefits without charging unused supplier capacity", () => {
    const alert = intelligenceAlerts[0]; const action = alert?.actions[0];
    if (!alert || !action) throw new Error("Missing irrigation proposal");
    const result = getSupportImpact(alert, action, 6);
    expect(result.cost).toBe(42000); expect(result.protectedValue).toBe(1000000); expect(result.netBenefit).toBe(958000); expect(result.residualLoss).toBe(250000); expect(result.roi).toBe(2281);
  });
  it("keeps harvest adjustment at four days with a grower-support action", () => { const alert = intelligenceAlerts.find(item => item.id === "poland-rain"); expect(alert?.actions.find(action => action.id === "harvest")?.cost).toBe(26000); expect(alert?.actions.find(action => action.id === "harvest")?.protection).toBe(0.75); });
});