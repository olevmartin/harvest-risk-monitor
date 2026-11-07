import { describe, expect, it } from "vitest";
import { APETIT_BASELINE as b } from "@/lib/apetit-baseline";
import { filterAlerts, intelligenceAlerts, getSupportImpact, actionTradeoffs } from "@/lib/apetit-intelligence";

describe("Supplied Apetit baseline", () => {
  it("uses exact factory coordinates", () => { expect(b.headquarters).toEqual([61.078744, 22.253773]); });
  it("uses exact contract farming coordinates", () => { expect(b.contractFarm).toEqual([61.098457, 22.335535]); expect(intelligenceAlerts[0]?.location).toEqual(b.contractFarm); });
  it("calculates the 30% deficit against 6,000,000 kg", () => { expect(b.peaVolumeKg).toBe(6_000_000); expect(b.yieldLossFraction).toBe(0.30); expect(b.deficitKg).toBe(1_800_000); });
  it("uses 2,000 hectares", () => { expect(b.areaHa).toBe(2_000); });
  it("uses Scope 3 of 231,624 tonnes", () => { expect(b.scope3Tons).toBe(231_624); });
  it("uses lake withdrawal of 41,438 m3", () => { expect(b.lakeWithdrawalM3).toBe(41_438); });
  it("derives +3,600 tonnes from 2 kg CO2e per kg excluding logistics", () => { expect(b.emissionFactorKgPerKg).toBe(2); expect(b.importedGoodsGhgTons).toBe(3_600); expect(actionTradeoffs["shift-sourcing"]?.ghgTons).toBe(3_600); });
  it("prices irrigation at €85,000", () => { expect(intelligenceAlerts[0]?.actions.find(a => a.id === "irrigation")?.cost).toBe(85_000); });
  it("calculates the +15,000 m3 water increment as approximately 36%", () => { expect(b.additionalWaterM3).toBe(15_000); expect(b.waterIncreasePercent).toBeCloseTo(36.1986, 3); });
  it("retains only supplied Belgium and Hungary supplier identities without invented sites", () => { expect(b.suppliers.map(s => [s.name, s.country, s.origins])).toEqual([["Supplier 2", "Belgium", "BE/CA/IT/ES"], ["Supplier 1", "Hungary", null]]); });
  it("does not fabricate procurement prices, ROI or pump emissions", () => {
    const alert = intelligenceAlerts[0]; if (!alert) throw new Error("Missing alert");
    const shift = alert.actions[0]; const irrigation = alert.actions[1]; if (!shift || !irrigation) throw new Error("Missing actions");
    expect(shift.cost).toBeNull(); expect(actionTradeoffs["irrigation"]?.ghgTons).toBeNull();
    for (const day of [0, 12, 180]) { const result = getSupportImpact(alert, irrigation, day); expect(result.cost).toBe(85000); expect(result.unresolved).toBeNull(); expect(result.roi).toBeNull(); expect(result.protectedValue).toBeNull(); }
  });
  it("does not present unsupported mock alerts as supplied observations", () => { expect(intelligenceAlerts.map(a => a.id)).toEqual(["finland-drought"]); expect(filterAlerts("Peas", "Climate")).toHaveLength(1); expect(filterAlerts("Potatoes", "Political")).toEqual([]); });
});
