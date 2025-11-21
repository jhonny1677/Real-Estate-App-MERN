import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./NearbyPlaces.scss";

// ── Constants ─────────────────────────────────────────────────────────────────
const RADIUS = 2000; // metres

const CATEGORY_META = {
  school:      { label: "Schools",      emoji: "🏫" },
  hospital:    { label: "Healthcare",   emoji: "🏥" },
  supermarket: { label: "Supermarkets", emoji: "🛒" },
  restaurant:  { label: "Restaurants", emoji: "🍽️" },
  bus_stop:    { label: "Bus Stops",    emoji: "🚌" },
  pharmacy:    { label: "Pharmacies",   emoji: "💊" },
};

const CATEGORY_COLORS = {
  school:      "#2196f3",
  hospital:    "#f44336",
  supermarket: "#4caf50",
  restaurant:  "#ff9800",
  bus_stop:    "#9c27b0",
  pharmacy:    "#e91e63",
};

// Single shared canvas renderer instance — reused for all vector layers
const CANVAS_RENDERER = L.canvas({ padding: 0.5 });

// ── Leaflet icon helpers ──────────────────────────────────────────────────────
const HOME_ICON = L.divIcon({
  className: "",
  html: '<span style="font-size:28px;line-height:1;display:block;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.55))">📍</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

function placeIcon(color, active) {
  const size = active ? 18 : 13;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:${active ? "3px" : "2px"} solid white;
      box-shadow:0 1px 5px rgba(0,0,0,${active ? 0.55 : 0.35});
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
}

// ── Pure utility helpers ──────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classify(tags) {
  if (!tags) return null;
  const { amenity, shop, highway } = tags;
  if (amenity === "school" || amenity === "kindergarten") return "school";
  if (amenity === "hospital" || amenity === "clinic" || amenity === "doctors") return "hospital";
  if (shop === "supermarket") return "supermarket";
  if (amenity === "restaurant") return "restaurant";
  if (highway === "bus_stop" || amenity === "bus_stop") return "bus_stop";
  if (amenity === "pharmacy" || amenity === "chemist") return "pharmacy";
  return null;
}

// ── MapCleanupTracker — removes all listeners + destroys map on unmount ───────
// Must be a child of MapContainer so it can call useMap().
// Leaflet guards map.remove() against double-calls, so it's safe even though
// react-leaflet's MapContainer also calls it in its own cleanup.
function MapCleanupTracker() {
  const map = useMap();
  useEffect(() => {
    return () => {
      map.off();    // detach all event listeners
      map.remove(); // destroy the Leaflet map instance
    };
  }, [map]);
  return null;
}

// ── MapFitter — fits bounds once after places load ────────────────────────────
function MapFitter({ positions }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || positions.length < 2) return;
    done.current = true;
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
  }, [map, positions]);
  return null;
}

// ── NearbyMap subcomponent ────────────────────────────────────────────────────
function NearbyMap({ lat, lng, places, activePlace, routeCoords, onMarkerClick }) {
  const allPositions = [[lat, lng], ...places.map((p) => [p.elLat, p.elLng])];

  return (
    <div className="nearby-map-wrap">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        preferCanvas={true}
        zoomAnimation={true}
        fadeAnimation={true}
        className="nearby-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCleanupTracker />
        <MapFitter positions={allPositions} />

        {/* Property marker */}
        <Marker position={[lat, lng]} icon={HOME_ICON} zIndexOffset={1000}>
          <Popup>
            <div className="nearby-popup">
              <strong>📍 This Property</strong>
            </div>
          </Popup>
        </Marker>

        {/* Place markers */}
        {places.map((place, i) => {
          const color = CATEGORY_COLORS[place.category] || "#666";
          const isActive = activePlace === place;
          return (
            <Marker
              key={i}
              position={[place.elLat, place.elLng]}
              icon={placeIcon(color, isActive)}
              eventHandlers={{ click: () => onMarkerClick(place) }}
            >
              <Popup>
                <div className="nearby-popup">
                  <strong>{CATEGORY_META[place.category]?.emoji} {place.name}</strong>
                  <span>📏 {place.roadKm} km &nbsp;·&nbsp; 🚶 {place.walkMin} min walk</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Walking route polyline — uses shared canvas renderer */}
        {routeCoords && (
          <Polyline
            positions={routeCoords}
            color="#3498db"
            weight={4}
            opacity={0.85}
            dashArray="9 5"
            renderer={CANVAS_RENDERER}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="nearby-legend">
        <span className="nearby-legend-home">📍 Property</span>
        {Object.entries(CATEGORY_META).map(([cat, { label, emoji }]) => (
          <span key={cat} className="nearby-legend-item">
            <span className="nearby-legend-dot" style={{ background: CATEGORY_COLORS[cat] }} />
            {emoji} {label}
          </span>
        ))}
      </div>

      {/* Route hint */}
      <p className={`nearby-route-hint${activePlace ? "" : " muted"}`}>
        {activePlace
          ? <>Route to: <strong>{activePlace.name}</strong> — click another marker to change.</>
          : "Click any marker to draw the walking route."}
      </p>
    </div>
  );
}

// ── Main NearbyPlaces component ───────────────────────────────────────────────
function NearbyPlaces({ latitude, longitude }) {
  const [places, setPlaces]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activePlace, setActivePlace] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const routeTimeoutRef = useRef(null);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  useEffect(() => {
    if (isNaN(lat) || isNaN(lng)) {
      setError("Location coordinates are not available for this property.");
      setLoading(false);
      return;
    }
    fetchAll();
    return () => {
      // Cancel any pending debounced route fetch on unmount
      if (routeTimeoutRef.current) clearTimeout(routeTimeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Overpass + OSRM initial fetch ─────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const body = `[out:json][timeout:25];
(
  node["amenity"~"^(school|kindergarten|hospital|clinic|doctors|restaurant|pharmacy)$"](around:${RADIUS},${lat},${lng});
  node["shop"="supermarket"](around:${RADIUS},${lat},${lng});
  node["highway"="bus_stop"](around:${RADIUS},${lat},${lng});
  way["amenity"~"^(school|kindergarten|hospital|clinic|doctors|restaurant|pharmacy)$"](around:${RADIUS},${lat},${lng});
  way["shop"="supermarket"](around:${RADIUS},${lat},${lng});
);
out center;`;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error("Overpass API error");

      const data = await res.json();
      const elements = data.elements || [];

      const buckets = {};
      for (const el of elements) {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) continue;
        const name = el.tags?.name || el.tags?.["name:en"];
        if (!name) continue;
        const cat = classify(el.tags);
        if (!cat) continue;
        const dist = haversine(lat, lng, elLat, elLng);
        if (!buckets[cat]) buckets[cat] = [];
        buckets[cat].push({ name, elLat, elLng, dist });
      }

      const candidates = [];
      for (const [cat, items] of Object.entries(buckets)) {
        items.sort((a, b) => a.dist - b.dist);
        candidates.push(...items.slice(0, 3).map((p) => ({ ...p, category: cat })));
      }

      const withRoutes = await Promise.all(
        candidates.map(async (place) => {
          try {
            const r = await fetch(
              `https://router.project-osrm.org/route/v1/foot/${lng},${lat};${place.elLng},${place.elLat}?overview=false`
            );
            const d = await r.json();
            const route = d.routes?.[0];
            if (route) {
              return {
                ...place,
                roadKm: (route.distance / 1000).toFixed(1),
                walkMin: Math.ceil(route.duration / 60),
              };
            }
          } catch (_) {}
          return {
            ...place,
            roadKm: (place.dist / 1000).toFixed(1),
            walkMin: Math.ceil(place.dist / 80),
          };
        })
      );

      setPlaces(withRoutes.filter(Boolean));
    } catch (err) {
      console.error("NearbyPlaces fetch error:", err);
      setError("Could not load nearby places. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ── Route geometry fetch on marker click — debounced 300 ms ─────────────
  const handleMarkerClick = (place) => {
    setActivePlace(place);
    // Cancel any in-flight debounce from rapid clicks
    if (routeTimeoutRef.current) clearTimeout(routeTimeoutRef.current);
    routeTimeoutRef.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${lng},${lat};${place.elLng},${place.elLat}?overview=full&geometries=geojson`
        );
        const d = await r.json();
        const coords = d.routes?.[0]?.geometry?.coordinates;
        setRouteCoords(coords ? coords.map(([lo, la]) => [la, lo]) : null);
      } catch (_) {
        setRouteCoords(null);
      }
    }, 300);
  };

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="nearby-loading">
        <div className="nearby-spinner" />
        <p>Finding nearby places…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nearby-empty">
        <div className="nearby-empty-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!places || places.length === 0) {
    return (
      <div className="nearby-empty">
        <div className="nearby-empty-icon">📍</div>
        <p>No nearby places found within 2 km.</p>
        <small>This area may have limited OpenStreetMap coverage.</small>
      </div>
    );
  }

  const grouped = {};
  for (const p of places) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  return (
    <div className="nearby-places">
      {/* ── Interactive map ── */}
      <NearbyMap
        lat={lat}
        lng={lng}
        places={places}
        activePlace={activePlace}
        routeCoords={routeCoords}
        onMarkerClick={handleMarkerClick}
      />

      {/* ── Category cards ── */}
      <p className="nearby-subtitle">
        Nearest places within 2 km · Road distance &amp; walk time via OpenStreetMap
      </p>

      {Object.entries(CATEGORY_META).map(([cat, { label, emoji }]) => {
        const items = grouped[cat];
        if (!items?.length) return null;
        return (
          <div key={cat} className="nearby-group">
            <h4 className="nearby-group-title">{emoji} {label}</h4>
            <div className="nearby-cards">
              {items.map((place, i) => (
                <div key={i} className="nearby-card">
                  <span className="nearby-card-icon" aria-hidden="true">{emoji}</span>
                  <div className="nearby-card-body">
                    <span className="nearby-card-name">{place.name}</span>
                    <div className="nearby-card-meta">
                      <span className="nearby-card-dist">📏 {place.roadKm} km</span>
                      <span className="nearby-card-walk">🚶 {place.walkMin} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NearbyPlaces;
