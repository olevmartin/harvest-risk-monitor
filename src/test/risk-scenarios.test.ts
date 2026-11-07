import { describe, expect, it } from "vitest";
import { distanceMeters } from "@/lib/climate-forecast";
import { allocateReplacement, getWeatherForecast, pointInSpain, riskScenarios } from "@/lib/risk-scenarios";

describe("Risk-specific alternative sourcing", () => {
  it("provides distinct Finland weather, Poland weather, and Spain economic scenarios", () => {
    expect(riskScenarios.map(risk => [risk.country, risk.type])).toEqual([["Finland", "Weather Risk"], ["Poland", "Weather Risk"], ["Spain", "Economic Risk"]]);
    expect(new Set(riskScenarios.flatMap(risk => risk.suppliers.map(supplier => supplier.name))).size).toBe(9);
  });
  for (const risk of riskScenarios) {
    it(`${risk.country} alternatives and replacements stay outside affected areas for Today–Day 10`, () => {
      for (const supplier of [...risk.suppliers, ...risk.replacements]) {
        expect(supplier.country).not.toBe(risk.country);
        if (risk.id === "economic") {
          expect(pointInSpain(supplier.lat, supplier.lng)).toBe(false);
        } else for (let day = 0; day <= 10; day += 0.1) {
          const forecast = getWeatherForecast(risk.id, day);
          expect(distanceMeters(forecast.center, [supplier.lat, supplier.lng])).toBeGreaterThan(forecast.radius + 50_000);
        }
      }
    });
    it(`${risk.country} sourcing covers exactly 450 tons with capacity available after all swaps`, () => {
      for (let mask = 0; mask < 8; mask++) {
        const suppliers = risk.suppliers.map((supplier, index) => mask & (1 << index) ? risk.replacements[index] ?? supplier : supplier);
        const allocation = allocateReplacement(suppliers);
        expect(allocation.reduce((total, supplier) => total + supplier.allocatedTons, 0)).toBe(450);
        allocation.forEach(supplier => expect(supplier.allocatedTons).toBeLessThanOrEqual(supplier.capacity));
      }
    });
  }
  it("charges Finland replacement for 450 tons, not all 490 tons of available capacity", () => {
    const risk = riskScenarios[0];
    if (!risk) throw new Error("Missing Finland scenario");
    const allocation = allocateReplacement(risk.suppliers);
    expect(allocation.map(supplier => supplier.allocatedTons)).toEqual([220, 150, 80]);
    expect(allocation.reduce((total, supplier) => total + supplier.subtotal, 0)).toBe(180_200);
  });
  it("moves and expands the rainfall system over ten days", () => {
    const today = getWeatherForecast("rainfall", 0); const last = getWeatherForecast("rainfall", 10);
    expect(last.radius).toBeGreaterThan(today.radius);
    expect(distanceMeters(today.center, last.center)).toBeGreaterThan(0);
  });
  it("identifies Madrid inside Spain and Lisbon outside", () => {
    expect(pointInSpain(40.42, -3.7)).toBe(true);
    expect(pointInSpain(38.72, -9.14)).toBe(false);
  });
});