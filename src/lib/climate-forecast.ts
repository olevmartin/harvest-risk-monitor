export interface MapSupplier {
  name: string;
  region: string;
  country: string;
  capacity: number;
  lat: number;
  lng: number;
}

export const HEATWAVE_LAST_MONTH = 6;

export function getHeatwaveForecast(month: number) {
  const forecastMonth = Math.max(0, Math.min(HEATWAVE_LAST_MONTH, month));
  return {
    center: [60.8 + forecastMonth * 0.12, 22.5 + forecastMonth * 0.14] as [number, number],
    radius: 180_000 + forecastMonth * 12_000,
  };
}

export function distanceMeters(a: [number, number], b: [number, number]) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(b[0] - a[0]);
  const longitudeDelta = radians(b[1] - a[1]);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(a[0])) * Math.cos(radians(b[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export const initialSuppliers = [
  { name: "AgroBalt Sp. z o.o.", country: "Poland", region: "Greater Poland", capacity: 220, pricePerTon: 385, leadTime: "4 days", lat: 52.4, lng: 16.9 },
  { name: "Vidzemes Graudi SIA", country: "Latvia", region: "Vidzeme", capacity: 150, pricePerTon: 410, leadTime: "3 days", lat: 57.42, lng: 25.3 },
  { name: "Saaremaa Agro OÜ", country: "Estonia", region: "Saaremaa", capacity: 120, pricePerTon: 425, leadTime: "2 days", lat: 58.35, lng: 22.5 },
];

export const replacementSuppliers = [
  { name: "Podlasie Zboża Sp. z o.o.", country: "Poland", region: "Podlaskie", capacity: 180, pricePerTon: 398, leadTime: "5 days", lat: 53.13, lng: 23.16 },
  { name: "Zemgale Agro SIA", country: "Latvia", region: "Zemgale", capacity: 160, pricePerTon: 405, leadTime: "3 days", lat: 56.65, lng: 23.71 },
  { name: "Tartu Teravilja OÜ", country: "Estonia", region: "Tartumaa", capacity: 140, pricePerTon: 418, leadTime: "2 days", lat: 58.38, lng: 26.72 },
];