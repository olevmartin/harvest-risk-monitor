import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from "react-leaflet";

export interface MapSupplier {
  name: string;
  region: string;
  country: string;
  capacity: number;
  lat: number;
  lng: number;
}

// Turku, Southwest Finland
const CENTER: [number, number] = [60.45, 22.27];
// Heatwave risk zone over Southwest Finland
const RISK_ZONE: [number, number] = [60.8, 22.5];
const RISK_RADIUS_M = 130_000;

export default function SupplierMap({
  showRiskZone,
  suppliers,
}: {
  showRiskZone: boolean;
  suppliers: MapSupplier[];
}) {
  return (
    <MapContainer center={CENTER} zoom={6} scrollWheelZoom className="h-full w-full rounded-md">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showRiskZone && (
        <Circle
          center={RISK_ZONE}
          radius={RISK_RADIUS_M}
          pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.25, weight: 2 }}
        >
          <Popup>Heatwave risk zone — Southwest Finland. Pea yield forecast: −30%.</Popup>
        </Circle>
      )}
      {!showRiskZone &&
        suppliers.map((s) => (
          <CircleMarker
            key={s.name}
            center={[s.lat, s.lng]}
            radius={10}
            pathOptions={{ color: "#15803d", fillColor: "#16a34a", fillOpacity: 0.8, weight: 2 }}
          >
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.region}, {s.country}
              <br />
              Capacity: {s.capacity} t
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
