import { useState, useRef, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Rectangle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// react-leaflet's useMapEvents registers handlers once (empty dep array internally),
// so any state/prop referenced inside them would be stale after the first render.
// Fix: use refs that are kept in sync with latest values via useEffect.
function DrawHandler({ drawing, onDrawEnd }) {
  const startLatLng = useRef(null);
  const lastLatLng  = useRef(null);
  const [rect, setRect] = useState(null);

  const drawingRef   = useRef(drawing);
  const onDrawEndRef = useRef(onDrawEnd);
  useEffect(() => { drawingRef.current   = drawing;   }, [drawing]);
  useEffect(() => { onDrawEndRef.current = onDrawEnd; }, [onDrawEnd]);

  const map = useMapEvents({
    mousedown(e) {
      if (!drawingRef.current) return;
      startLatLng.current = e.latlng;
      lastLatLng.current  = e.latlng;
      setRect(null);
      map.dragging.disable();
    },
    mousemove(e) {
      if (!drawingRef.current || !startLatLng.current) return;
      lastLatLng.current = e.latlng;
      setRect([startLatLng.current, e.latlng]);
    },
    mouseup(e) {
      if (!drawingRef.current || !startLatLng.current) return;
      map.dragging.enable();
      const start = startLatLng.current;
      const end   = e.latlng;
      startLatLng.current = null; // clear first so the global handler skips
      setRect(null);
      if (Math.abs(start.lat - end.lat) < 0.01 && Math.abs(start.lng - end.lng) < 0.01) return;
      onDrawEndRef.current({
        latMin: Math.min(start.lat, end.lat),
        latMax: Math.max(start.lat, end.lat),
        lngMin: Math.min(start.lng, end.lng),
        lngMax: Math.max(start.lng, end.lng),
      });
    },
  });

  // Fallback: mouse released outside the map container
  useEffect(() => {
    const handleGlobalUp = () => {
      if (!startLatLng.current || !lastLatLng.current) return;
      map.dragging.enable();
      const start = startLatLng.current;
      const end   = lastLatLng.current;
      startLatLng.current = null;
      setRect(null);
      if (Math.abs(start.lat - end.lat) < 0.01 && Math.abs(start.lng - end.lng) < 0.01) return;
      onDrawEndRef.current({
        latMin: Math.min(start.lat, end.lat),
        latMax: Math.max(start.lat, end.lat),
        lngMin: Math.min(start.lng, end.lng),
        lngMax: Math.max(start.lng, end.lng),
      });
    };
    document.addEventListener("mouseup", handleGlobalUp);
    return () => document.removeEventListener("mouseup", handleGlobalUp);
  }, [map]);

  // Sync cursor + clean up when draw mode is cancelled
  useEffect(() => {
    map.getContainer().style.cursor = drawing ? "crosshair" : "";
    if (!drawing) {
      map.dragging.enable();
      startLatLng.current = null;
      lastLatLng.current  = null;
      setRect(null);
    }
  }, [drawing, map]);

  return rect ? (
    <Rectangle
      bounds={rect}
      pathOptions={{ color: "#1a1a2e", weight: 2, fillColor: "#3498db", fillOpacity: 0.15 }}
    />
  ) : null;
}

function MapSearch({ onBoundsSelected, onClear }) {
  const [drawing, setDrawing] = useState(false);

  const handleDrawEnd = useCallback((bounds) => {
    setDrawing(false);
    onBoundsSelected(bounds);
  }, [onBoundsSelected]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        padding: "8px 16px",
        background: "#1a1a2e",
        color: "white",
        fontSize: "13px",
        borderRadius: "8px 8px 0 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
      }}>
        <span style={{ opacity: 0.9 }}>
          {drawing
            ? "Click and drag on the map to draw your search area"
            : "Draw a rectangle on the map to search properties in that area"}
        </span>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          <button
            onClick={() => setDrawing(d => !d)}
            style={{
              background: drawing ? "#e74c3c" : "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "5px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
          >
            {drawing ? "✕ Cancel" : "⬜ Draw Rectangle"}
          </button>
          <button
            onClick={() => { setDrawing(false); onClear(); }}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "white",
              padding: "5px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "380px", borderRadius: "0 0 8px 8px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawHandler drawing={drawing} onDrawEnd={handleDrawEnd} />
      </MapContainer>
    </div>
  );
}

export default MapSearch;
