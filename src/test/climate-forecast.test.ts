import { describe, expect, it } from "vitest";
import { distanceMeters, HEATWAVE_LAST_DAY, HEATWAVE_WINDOW, getHeatwaveForecast, initialSuppliers, replacementSuppliers } from "@/lib/climate-forecast";

describe("Climate forecast", () => {
  it("only shows the heatwave during its 10-day window", () => {
    expect(HEATWAVE_WINDOW.end - HEATWAVE_WINDOW.start + 1).toBe(10);
    expect(getHeatwaveForecast(0).active).toBe(false);
    expect(getHeatwaveForecast(HEATWAVE_WINDOW.start - 1).radius).toBe(0);
    expect(getHeatwaveForecast(HEATWAVE_WINDOW.end + 1).active).toBe(false);
    expect(getHeatwaveForecast(HEATWAVE_LAST_DAY).active).toBe(false);
    expect(getHeatwaveForecast(12).active).toBe(true);
  });

  it("moves west to east, peaks near Turku, then fades", () => {
    const first = getHeatwaveForecast(HEATWAVE_WINDOW.start);
    const last = getHeatwaveForecast(HEATWAVE_WINDOW.end);
    expect(first.center[1]).toBeLessThan(21); // Baltic Sea
    expect(last.center[1]).toBeGreaterThan(27); // eastern Finland
    const samples = Array.from({ length: 10 }, (_, i) => getHeatwaveForecast(HEATWAVE_WINDOW.start + i));
    const peak = samples.reduce((a, b) => (b.intensity > a.intensity ? b : a));
    expect(Math.abs(peak.center[1] - 22.27)).toBeLessThan(2);
    expect(last.intensity).toBeLessThan(peak.intensity / 2);
  });

  it.each([...initialSuppliers, ...replacementSuppliers])("keeps $name strictly outside the heat front", (supplier) => {
    for (let sample = 0; sample <= 2000; sample++) {
      const risk = getHeatwaveForecast(sample * HEATWAVE_LAST_DAY / 2000);
      expect(distanceMeters(risk.center, [supplier.lat, supplier.lng])).toBeGreaterThan(risk.radius + 50_000);
    }
  });
});
