import { useEffect } from "react";
import { latLng, latLngBounds } from "leaflet";
import { MapContainer, CircleMarker, Polygon, Polyline, Popup, useMap } from "react-leaflet";
import { type MapSupplier, HEATWAVE_WINDOW } from "@/lib/climate-forecast";
import { HeatwaveOverlay } from "@/components/HeatwaveOverlay";
import { getWeatherForecast, getRiskTimeline, getForecastLabel, SPAIN_OUTLINE, type RiskId } from "@/lib/risk-scenarios";
import { RadarLayer } from "@/components/RadarLayer";
import EnterpriseBasemap from "@/components/EnterpriseBasemap";
import { APETIT_BASELINE } from "@/lib/apetit-baseline";
import type { IntelligenceAlert } from "@/lib/apetit-intelligence";

function RiskViewport({ riskId, suppliers }: { riskId: RiskId; suppliers: MapSupplier[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = riskId === "economic" ? latLngBounds(SPAIN_OUTLINE) : latLngBounds([]);
    const sampleDays = riskId === "heatwave" ? [HEATWAVE_WINDOW.start, HEATWAVE_WINDOW.end] : [0, getRiskTimeline(riskId).max];
    if (riskId !== "economic") for (const day of sampleDays) {
      const forecast = getWeatherForecast(riskId, day);
      bounds.extend(latLng(forecast.center).toBounds(Math.max(forecast.radius, 100_000) * 2.4));
    }
    for (const supplier of suppliers) bounds.extend([supplier.lat, supplier.lng]);
    if (riskId === "economic") bounds.extend([48.85, 2.35]);
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 7, animate: false });
  }, [map, riskId, suppliers]);
  return null;
}

export default function SupplierMap({ day, riskId, suppliers, alert, onRiskClick }: { day: number; riskId: RiskId; suppliers: MapSupplier[]; alert?: IntelligenceAlert; onRiskClick?: () => void }) {
  const freightIncrease = 24 + day * 3;
  return (
    <MapContainer center={APETIT_BASELINE.headquarters} zoom={6} zoomAnimation={false} fadeAnimation={false} scrollWheelZoom className="enterprise-map h-full w-full rounded-md">
      <EnterpriseBasemap />
      {alert?.overlay === "farms" ? <FarmViewport location={alert.location} /> : <RiskViewport riskId={riskId} suppliers={suppliers} />}
      {alert?.overlay !== "farms" && (riskId === "heatwave" ? <HeatwaveOverlay day={day} /> : <RadarLayer riskId={riskId} day={day} />)}
      {riskId === "economic" && alert?.overlay !== "farms" && <>
        <Polygon positions={SPAIN_OUTLINE} pathOptions={{ className: "economic-risk-zone", fillOpacity: 0.16 + day * 0.025, weight: 2 }}><Popup>Spain · Inflation and transport cost exposure</Popup></Polygon>
        <Polyline positions={[[40.42,-3.7],[43.3,-1.98],[48.85,2.35]]} pathOptions={{ className: "disrupted-route", weight: 4 + day * 0.5, dashArray: "10 12" }}><Popup>Madrid → Paris · Disrupted corridor · +{freightIncrease}% freight cost · {getForecastLabel(riskId, day)} (mock)</Popup></Polyline>
        <Polyline positions={[[41.39,2.17],[43.3,5.37],[45.46,9.19]]} pathOptions={{ className: "expensive-route", weight: 4 + day * 0.5, dashArray: "5 8" }}><Popup>Barcelona → Milan · +{freightIncrease}% transport costs · {getForecastLabel(riskId, day)} (mock)</Popup></Polyline>
      </>}
      {alert?.id === "finland-drought" && <CircleMarker center={APETIT_BASELINE.headquarters} radius={7} pathOptions={{ className: "safe-supplier-marker", fillOpacity: 1, weight: 3 }}><Popup><strong>Apetit Factory / HQ · Säkylä</strong><br />61.078744, 22.253773<br />User-supplied site coordinates · Not a replacement supplier</Popup></CircleMarker>}
      {alert && <CircleMarker center={alert.location} radius={12} pathOptions={{ className: "affected-farm-marker", fillOpacity: 1, weight: 3 }} eventHandlers={{ click: () => onRiskClick?.() }}>
        <Popup><strong>{alert.title}</strong><br />{alert.region}<br />Contract Farming Peas (Finland)<br />6,000,000 kg · 2,000 ha<br />61.098457, 22.335535 · User supplied</Popup>
      </CircleMarker>}
      {suppliers.map(s => <CircleMarker key={s.name} center={[s.lat,s.lng]} radius={9} pathOptions={{ className: "safe-supplier-marker", fillOpacity: 0.95, weight: 3 }}>
        <Popup><strong>{s.name}</strong><br />{s.region}, {s.country}<br />Capacity: {s.capacity} t<br />Outside selected risk area · {getRiskTimeline(riskId).horizon}</Popup>
      </CircleMarker>)}
    </MapContainer>
  );
}

function FarmViewport({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); map.setView(location, 7, { animate: false }); }, [map, location]);
  return null;
}
