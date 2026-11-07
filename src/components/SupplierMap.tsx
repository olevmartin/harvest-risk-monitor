import { useEffect } from "react";
import { latLng, latLngBounds } from "leaflet";
import { MapContainer, CircleMarker, Polygon, Polyline, Popup, useMap } from "react-leaflet";
import { type MapSupplier } from "@/lib/climate-forecast";
import { getWeatherForecast, getRiskTimeline, getForecastLabel, SPAIN_OUTLINE, type RiskId } from "@/lib/risk-scenarios";
import { RadarLayer } from "@/components/RadarLayer";
import EnterpriseBasemap from "@/components/EnterpriseBasemap";
import type { IntelligenceAlert } from "@/lib/apetit-intelligence";

function RiskViewport({ riskId, suppliers }: { riskId: RiskId; suppliers: MapSupplier[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = riskId === "economic" ? latLngBounds(SPAIN_OUTLINE) : latLngBounds([]);
    if (riskId !== "economic") for (const day of [0, getRiskTimeline(riskId).max]) {
      const forecast = getWeatherForecast(riskId, day);
      bounds.extend(latLng(forecast.center).toBounds(forecast.radius * 2.4));
    }
    for (const supplier of suppliers) bounds.extend([supplier.lat, supplier.lng]);
    if (riskId === "economic") bounds.extend([48.85, 2.35]);
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6, animate: false });
  }, [map, riskId, suppliers]);
  return null;
}

export default function SupplierMap({ day, riskId, suppliers, alert, onRiskClick }: { day: number; riskId: RiskId; suppliers: MapSupplier[]; alert?: IntelligenceAlert; onRiskClick?: () => void }) {
  const freightIncrease = 24 + day * 3;
  return (
    <MapContainer center={[60.45, 22.27]} zoom={6} zoomAnimation={false} fadeAnimation={false} scrollWheelZoom className="enterprise-map h-full w-full rounded-md">
      <EnterpriseBasemap />
      {alert?.overlay === "farms" ? <FarmViewport location={alert.location} /> : <RiskViewport riskId={riskId} suppliers={suppliers} />}
      {alert?.overlay !== "farms" && <RadarLayer riskId={riskId} day={day} />}
      {riskId === "economic" && alert?.overlay !== "farms" && <>
        <Polygon positions={SPAIN_OUTLINE} pathOptions={{ className: "economic-risk-zone", fillOpacity: 0.16 + day * 0.025, weight: 2 }}><Popup>Spain · Inflation and transport cost exposure</Popup></Polygon>
        <Polyline positions={[[40.42,-3.7],[43.3,-1.98],[48.85,2.35]]} pathOptions={{ className: "disrupted-route", weight: 4 + day * 0.5, dashArray: "10 12" }}><Popup>Madrid → Paris · Disrupted corridor · +{freightIncrease}% freight cost · {getForecastLabel(riskId, day)} (mock)</Popup></Polyline>
        <Polyline positions={[[41.39,2.17],[43.3,5.37],[45.46,9.19]]} pathOptions={{ className: "expensive-route", weight: 4 + day * 0.5, dashArray: "5 8" }}><Popup>Barcelona → Milan · +{freightIncrease}% transport costs · {getForecastLabel(riskId, day)} (mock)</Popup></Polyline>
      </>}
      {alert && <CircleMarker center={alert.location} radius={12} pathOptions={{ className: "affected-farm-marker", fillOpacity: 1, weight: 3 }} eventHandlers={{ click: () => onRiskClick?.() }}>
        <Popup><strong>{alert.title}</strong><br />{alert.region}<br />{alert.farmers} affected partner farms · Simulated</Popup>
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
