import { describe, expect, it } from "vitest";
import { distanceMeters, FORECAST_LAST_DAY, getHeatwaveForecast, initialSuppliers, replacementSuppliers } from "@/lib/climate-forecast";

describe("Climate forecast", () => {
  it("covers Today through Day 10", () => {
    expect(FORECAST_LAST_DAY).toBe(10);
    expect(getHeatwaveForecast(-1)).toEqual(getHeatwaveForecast(0));
    expect(getHeatwaveForecast(11)).toEqual(getHeatwaveForecast(10));
  });

  it("moves and expands the risk zone as the timeline advances", () => {
    const today = getHeatwaveForecast(0);
    for (let day = 1; day <= 10; day++) {
      const previous = getHeatwaveForecast(day - 1);
      const next = getHeatwaveForecast(day);
      expect(next.radius).toBeGreaterThan(previous.radius);
      expect(distanceMeters(previous.center, next.center)).toBeGreaterThan(0);
    }
    expect(distanceMeters(today.center, getHeatwaveForecast(10).center)).toBeGreaterThan(0);
  });

  it.each([...initialSuppliers, ...replacementSuppliers])("keeps $name strictly outside the red zone for the entire 10-day forecast", (supplier) => {
    // Sub-day samples also cover intermediate positions, not just slider stops.
    for (let sample = 0; sample <= 1000; sample++) {
      const risk = getHeatwaveForecast(sample / 100);
      const distance = distanceMeters(risk.center, [supplier.lat, supplier.lng]);
      expect(distance).toBeGreaterThan(risk.radius + 50_000);
    }
  });
});