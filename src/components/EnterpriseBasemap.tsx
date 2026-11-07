import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

// Vite cannot resolve maplibre's worker by itself; without this the GL canvas stays blank.
setWorkerUrl(maplibreWorker);

const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

export const MAP_ATTRIBUTION =
  '&copy; Copernicus Earth Observation | Weather Data: FMI (Finnish Meteorological Institute) | Basemap &copy; OpenFreeMap / OpenStreetMap contributors';

export default function EnterpriseBasemap() {
  const map = useMap();
  useEffect(() => {
    const layer = maplibreGL({
      style: DARK_STYLE,
      attributionControl: { customAttribution: MAP_ATTRIBUTION },
    });
    layer.addTo(map);
    map.attributionControl?.setPrefix(false);
    map.attributionControl?.addAttribution(MAP_ATTRIBUTION);
    return () => {
      layer.remove();
    };
  }, [map]);
  return null;
}
