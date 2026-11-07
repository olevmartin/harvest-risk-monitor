import { useEffect } from "react";
import { latLng, latLngBounds } from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Polygon, Polyline, Popup, useMap } from "react-leaflet";
import { type MapSupplier } from "@/lib/climate-forecast";
import { getWeatherForecast, SPAIN_OUTLINE, type RiskId } from "@/lib/risk-scenarios";
import { RadarLayer } from "@/components/RadarLayer";

function RiskViewport({ riskId, suppliers }: { riskId: RiskId; suppliers: MapSupplier[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = riskId === "economic" ? latLngBounds(SPAIN_OUTLINE) : latLngBounds([]);
    if (riskId !== "economic") for (const day of [0, 10]) {
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

export default function SupplierMap({ day, riskId, suppliers }: { day: number; riskId: RiskId; suppliers: MapSupplier[] }) {
  return (
    <MapContainer center={[60.45, 22.27]} zoom={6} zoomAnimation={false} fadeAnimation={false} scrollWheelZoom className="h-full w-full rounded-md">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RiskViewport riskId={riskId} suppliers={suppliers} />
      <RadarLayer riskId={riskId} day={day} />
      {riskId === "economic" && <>
        <Polygon positions={SPAIN_OUTLINE} pathOptions={{ className: "economic-risk-zone", fillOpacity: 0.22, weight: 2 }}><Popup>Spain · Inflation and transport cost exposure</Popup></Polygon>
        <Polyline positions={[[40.42,-3.7],[43.3,-1.98],[48.85,2.35]]} pathOptions={{ className: "disrupted-route", weight: 4, dashArray: "10 12" }}><Popup>Madrid → Paris · Disrupted corridor · +24% freight cost (mock)</Popup></Polyline>
        <Polyline positions={[[41.39,2.17],[43.3,5.37],[45.46,9.19]]} pathOptions={{ className: "expensive-route", weight: 4, dashArray: "5 8" }}><Popup>Barcelona → Milan · Elevated transport costs (mock)</Popup></Polyline>
      </>}
      {suppliers.map(s => <CircleMarker key={s.name} center={[s.lat,s.lng]} radius={9} pathOptions={{ className: "safe-supplier-marker", fillOpacity: 0.95, weight: 3 }}>
        <Popup><strong>{s.name}</strong><br />{s.region}, {s.country}<br />Capacity: {s.capacity} t<br />Outside selected risk area · Today–Day 10</Popup>
      </CircleMarker>)}
    </MapContainer>
  );
}
