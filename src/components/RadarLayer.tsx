import { useEffect } from "react";
import { GridLayer, point, type Coords } from "leaflet";
import { useMap } from "react-leaflet";
import { getWeatherForecast, type RiskId } from "@/lib/risk-scenarios";

export function RadarLayer({ riskId, day }: { riskId: RiskId; day: number }) {
  const map = useMap();
  useEffect(() => {
    if (riskId === "economic") return;
    const forecast = getWeatherForecast(riskId, day);
    const style = getComputedStyle(document.documentElement);
    const swatch = document.createElement("canvas");
    swatch.width = 1; swatch.height = 1;
    const swatchContext = swatch.getContext("2d");
    if (!swatchContext) return;
    const palette = (riskId === "heatwave" ? ["--radar-heat-low", "--radar-heat-mid", "--radar-heat-high"] : ["--radar-rain-low", "--radar-rain-mid", "--radar-rain-high"]).map(token => {
      swatchContext.clearRect(0, 0, 1, 1);
      swatchContext.fillStyle = style.getPropertyValue(token).trim();
      swatchContext.fillRect(0, 0, 1, 1);
      return swatchContext.getImageData(0, 0, 1, 1).data;
    });
    class ForecastGridLayer extends GridLayer {
    override createTile(coords: Coords) {
      const tile = document.createElement("canvas");
      tile.width = 128; tile.height = 128;
      tile.style.width = "256px"; tile.style.height = "256px";
      const ctx = tile.getContext("2d");
      if (!ctx) return tile;
      const image = ctx.createImageData(128, 128);
      for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
        const coordinate = map.unproject(point(coords.x * 256 + x * 2, coords.y * 256 + y * 2), coords.z);
        const dx = (coordinate.lng - forecast.center[1]) * 111_195 * Math.cos(forecast.center[0] * Math.PI / 180) / forecast.radius;
        const dy = (coordinate.lat - forecast.center[0]) * 111_195 / forecast.radius;
        const distance = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const edge = 0.82 + Math.sin(angle * 3 + 0.8) * 0.07 + Math.cos(angle * 5) * 0.035;
        if (distance >= edge) continue;
        const texture = Math.sin(dx * 18 + dy * 9) * Math.cos(dy * 20 - dx * 7) * 0.07 + Math.sin(dx * 38 + dy * 32) * 0.025;
        const field = riskId === "heatwave"
          ? Math.exp(-((dx + 0.18) ** 2 * 3 + (dy - 0.12) ** 2 * 2)) * 0.75 + Math.exp(-((dx - 0.32) ** 2 * 9 + (dy + 0.24) ** 2 * 7)) * 0.5 + texture
          : Math.exp(-((dx + 0.35) ** 2 * 13 + (dy - 0.18) ** 2 * 20)) * 0.95 + Math.exp(-((dx - 0.3) ** 2 * 16 + (dy + 0.25) ** 2 * 12)) + Math.exp(-(dx * dx * 4 + dy * dy * 4)) * 0.28 + texture;
        const fade = Math.min(1, Math.max(0, (edge - distance) / 0.16));
        if (field < 0.12) continue;
        const level = Math.min(1.99, Math.max(0, field * 2));
        const low = palette[Math.floor(level)]; const high = palette[Math.min(2, Math.floor(level) + 1)];
        if (!low || !high) continue;
        const mix = level % 1; const index = (y * 128 + x) * 4;
        for (let channel = 0; channel < 3; channel++) image.data[index + channel] = (low[channel] ?? 0) * (1 - mix) + (high[channel] ?? 0) * mix;
        image.data[index + 3] = 210 * fade * Math.min(1, field * 2);
      }
      ctx.putImageData(image, 0, 0);
      return tile;
    }
    }
    const layer = new ForecastGridLayer({ tileSize: 256, opacity: 0.72, zIndex: 300, className: `radar-tiles radar-${riskId}`, attribution: "Simulated forecast" });
    layer.addTo(map);
    return () => { layer.remove(); };
  }, [map, riskId, day]);
  return null;
}