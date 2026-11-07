import { latLng } from "leaflet";
import { SVGOverlay } from "react-leaflet";
import { getHeatwaveForecast } from "@/lib/climate-forecast";

/** Organic, fractal heat-radar shape (feTurbulence + feDisplacementMap), time-bound and moving with the slider. */
export function HeatwaveOverlay({ day }: { day: number }) {
  const forecast = getHeatwaveForecast(day);
  if (!forecast.active) return null;
  const bounds = latLng(forecast.center).toBounds(forecast.radius * 2);
  const hot = forecast.intensity;
  const seed = Math.round(day * 3) % 97;
  return (
    <SVGOverlay key={day} bounds={bounds} opacity={0.35 + hot * 0.55} attributes={{ viewBox: "0 0 400 400", preserveAspectRatio: "none", class: "heatwave-overlay" }}>
      <defs>
        <filter id="heat-organic" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed={seed} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" result="warped" />
          <feTurbulence type="turbulence" baseFrequency="0.09" numOctaves="2" seed={seed + 7} result="speckle" />
          <feColorMatrix in="speckle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="speckleMask" />
          <feComposite in="warped" in2="speckleMask" operator="in" result="scattered" />
          <feMerge><feMergeNode in="scattered" /><feMergeNode in="warped" /></feMerge>
        </filter>
        <radialGradient id="heat-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: hot > 0.7 ? "var(--radar-heat-high)" : "var(--radar-heat-mid)" }} />
          <stop offset={`${25 + (1 - hot) * 15}%`} style={{ stopColor: "var(--radar-heat-mid)" }} />
          <stop offset="62%" style={{ stopColor: "var(--radar-heat-low)" }} />
          <stop offset="85%" style={{ stopColor: "var(--radar-heat-fringe)", stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: "var(--radar-heat-fringe)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <g filter="url(#heat-organic)">
        <ellipse cx="190" cy="205" rx="150" ry="120" fill="url(#heat-core)" />
        <ellipse cx="250" cy="160" rx="85" ry="70" fill="url(#heat-core)" opacity={0.8} />
        <ellipse cx="135" cy="250" rx="70" ry="55" fill="url(#heat-core)" opacity={0.7} />
      </g>
    </SVGOverlay>
  );
}
