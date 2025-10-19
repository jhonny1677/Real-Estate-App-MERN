import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import List from "../../components/list/List";
import ScrollAnimations from "../../components/ScrollAnimations/ScrollAnimations";
import MapSearch from "../../components/MapSearch/MapSearch";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import apiRequest from "../../lib/apiRequest";
import { enhancedListData } from "../../lib/enhancedDummyData";

function ListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  // Get filters from URL
  const type = searchParams.get("type") || "";
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const property = searchParams.get("property") || "";
  const bedroom = searchParams.get("bedroom") || "";
  const bathroom = searchParams.get("bathroom") || "";
  const minSize = searchParams.get("minSize") || "";
  const maxSize = searchParams.get("maxSize") || "";
  const utilities = searchParams.get("utilities") || "";
  const pet = searchParams.get("pet") || "";
  const sortBy = searchParams.get("sortBy") || "price-asc";

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [type, city, minPrice, maxPrice, property, bedroom, bathroom, minSize, maxSize, utilities, pet, sortBy]);


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      const queryParams = {
        type, city, minPrice, property, bedroom, bathroom,
        minSize, maxSize, utilities, pet, sortBy, page,
      };

      if (parseInt(maxPrice) > 0) queryParams.maxPrice = maxPrice;
      if (mapBounds) {
        queryParams.latMin = mapBounds.latMin;
        queryParams.latMax = mapBounds.latMax;
        queryParams.lngMin = mapBounds.lngMin;
        queryParams.lngMax = mapBounds.lngMax;
      }

      try {
        const res = await apiRequest.get("/posts", { params: queryParams });
        const data = res.data;

        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts);
          setTotal(data.total || 0);
          setPages(data.pages || 1);
        } else if (Array.isArray(data)) {
          // legacy fallback
          setPosts(data);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching posts from backend, using dummy data:", err);
        
        // Fallback to enhanced dummy data and apply client-side filtering
        let filteredPosts = [...enhancedListData];
        
        // Apply filters to dummy data
        if (city) {
          filteredPosts = filteredPosts.filter(post => 
            post.address.toLowerCase().includes(city.toLowerCase())
          );
        }
        
        if (property) {
          filteredPosts = filteredPosts.filter(post => 
            post.type.toLowerCase() === property.toLowerCase()
          );
        }
        
        if (minPrice) {
          filteredPosts = filteredPosts.filter(post => 
            post.price >= parseInt(minPrice)
          );
        }
        
        if (maxPrice && parseInt(maxPrice) > 0) {
          filteredPosts = filteredPosts.filter(post => 
            post.price <= parseInt(maxPrice)
          );
        }
        
        if (bedroom) {
          filteredPosts = filteredPosts.filter(post => 
            post.bedroom >= parseInt(bedroom)
          );
        }
        
        if (bathroom) {
          filteredPosts = filteredPosts.filter(post => 
            post.bathroom >= parseInt(bathroom)
          );
        }
        
        if (minSize) {
          filteredPosts = filteredPosts.filter(post => 
            post.size >= parseInt(minSize)
          );
        }
        
        if (maxSize) {
          filteredPosts = filteredPosts.filter(post => 
            post.size <= parseInt(maxSize)
          );
        }
        
        if (utilities) {
          filteredPosts = filteredPosts.filter(post => {
            if (utilities === "included") return post.utilities === "included";
            if (utilities === "tenant") return post.utilities === "tenant-pays";
            return true;
          });
        }
        
        if (pet) {
          filteredPosts = filteredPosts.filter(post => {
            if (pet === "allowed") return post.petPolicy === "allowed";
            if (pet === "none") return post.petPolicy === "no-pets";
            return true;
          });
        }
        
        // Apply sorting
        if (sortBy) {
          filteredPosts.sort((a, b) => {
            switch (sortBy) {
              case "price-asc": return a.price - b.price;
              case "price-desc": return b.price - a.price;
              case "size-asc": return a.size - b.size;
              case "size-desc": return b.size - a.size;
              case "newest": return b.yearBuilt - a.yearBuilt;
              case "oldest": return a.yearBuilt - b.yearBuilt;
              default: return 0;
            }
          });
        }
        
        setPosts(filteredPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [type, city, minPrice, maxPrice, property, bedroom, bathroom, minSize, maxSize, utilities, pet, sortBy, page, mapBounds]);

  // Scroll to top whenever page number changes (window is real scroll container)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [page]);

  const goToPage = (newPage) => setPage(newPage);

  return (
    <div className="listPage">
      <ScrollAnimations />
      <div className="listContainer">
        <div className="wrapper">
          <div className="slide-left">
            <Filter />
          </div>

          <div className="sort-section fade-up">
            <button
              onClick={() => { setShowMapSearch(p => !p); if (showMapSearch) setMapBounds(null); }}
              className={`map-search-btn${showMapSearch ? " active" : ""}`}
            >
              🗺️ {showMapSearch ? "Hide Map Search" : "Search on Map"}
            </button>
            <div className="sort-controls">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => {
                  setSorting(true);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sortBy', e.target.value);
                  setSearchParams(newParams);
                  setTimeout(() => setSorting(false), 300);
                }}
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="size-asc">Size: Small to Large</option>
                <option value="size-desc">Size: Large to Small</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="view-toggle">
                <button
                  className={`view-btn${viewMode === "list" ? " active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List view"
                >☰</button>
                <button
                  className={`view-btn${viewMode === "grid" ? " active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                >⊞</button>
              </div>
            </div>
          </div>

          {showMapSearch && (
            <div style={{ marginBottom: "1rem" }}>
              <MapSearch
                onBoundsSelected={(b) => { setMapBounds(b); setPage(1); }}
                onClear={() => setMapBounds(null)}
              />
              {mapBounds && (
                <div style={{ marginTop: "8px", padding: "8px 12px", background: "#e0f2fe", borderRadius: "8px", fontSize: "13px", color: "#0284c7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🗺️ Searching within selected map area</span>
                  <button onClick={() => setMapBounds(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 600 }}>✕ Clear</button>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="loading-state scale-in">
              <div className="loading-spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : sorting ? (
            <div className="sorting-state scale-in">
              <div className="loading-spinner"></div>
              <p>Sorting properties...</p>
            </div>
          ) : Array.isArray(posts) && posts.length > 0 ? (
            <div className="slide-right">
              <List posts={posts} viewMode={viewMode} />
            </div>
          ) : (
            <div className="no-results fade-up" style={{
              gridColumn: "1 / -1", textAlign: "center",
              padding: "4rem 2rem", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "1rem"
            }}>
              <div style={{ fontSize: "4rem", lineHeight: 1 }}>🏚️</div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#1a1a2e", margin: 0 }}>
                No properties found
              </h3>
              <p style={{ color: "#888", fontSize: "0.95rem", margin: 0, maxWidth: "320px" }}>
                No listings match your current filters. Try broadening your search or clearing the filters.
              </p>
              <button
                onClick={() => setSearchParams({})}
                style={{
                  marginTop: "0.5rem", padding: "10px 24px",
                  background: "#1a1a2e", color: "white",
                  border: "none", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 500, cursor: "pointer"
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
          {/* Pagination + count */}
          {!loading && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0", flexWrap: "wrap", gap: "12px", borderTop: "1px solid #eee" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>
                {total} {total === 1 ? "property" : "properties"} found
                {pages > 1 ? ` — page ${page} of ${pages}` : ""}
              </span>
              {pages > 1 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1}
                    style={{ padding: "7px 14px", border: "1px solid #ddd", borderRadius: "7px", background: page === 1 ? "#f5f5f5" : "white", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#aaa" : "#333", fontSize: "13px" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => goToPage(p)}
                      style={{ padding: "7px 12px", border: "1px solid", borderRadius: "7px", cursor: "pointer", background: p === page ? "#1a1a2e" : "white", color: p === page ? "white" : "#333", borderColor: p === page ? "#1a1a2e" : "#ddd", fontWeight: p === page ? 700 : 400, fontSize: "13px" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => goToPage(Math.min(pages, page + 1))} disabled={page === pages}
                    style={{ padding: "7px 14px", border: "1px solid #ddd", borderRadius: "7px", background: page === pages ? "#f5f5f5" : "white", cursor: page === pages ? "not-allowed" : "pointer", color: page === pages ? "#aaa" : "#333", fontSize: "13px" }}>
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListPage;
