/** Transcribed from the user-supplied brief; not independently verified corporate disclosures. */
export const APETIT_BASELINE = {
  headquarters: [61.078744, 22.253773] as [number, number],
  contractFarm: [61.098457, 22.335535] as [number, number],
  peaVolumeKg: 6_000_000,
  areaHa: 2_000,
  yieldLossFraction: 0.30,
  deficitKg: 6_000_000 * 0.30,
  scope3Tons: 231_624,
  lakeWithdrawalM3: 41_438,
  emissionFactorKgPerKg: 2,
  importedGoodsGhgTons: 1_800_000 * 2 / 1_000,
  irrigationCost: 85_000,
  additionalWaterM3: 15_000,
  waterIncreasePercent: 15_000 / 41_438 * 100,
  suppliers: [
    { name: "Supplier 2", country: "Belgium", origins: "BE/CA/IT/ES" },
    { name: "Supplier 1", country: "Hungary", origins: null },
  ],
};