import { useNavigate } from "react-router-dom";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Link } from "react-router-dom";

function RecentlyViewedPage() {
  const { viewingHistory } = useRecommendations();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1px solid #e5e5e5", borderRadius: "8px", padding: "8px 14px", fontSize: "14px", color: "#555", cursor: "pointer", marginBottom: "1.5rem" }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.4rem" }}>
        Recently Viewed
      </h1>
      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "2rem" }}>
        Properties you've viewed in this session
      </p>

      {viewingHistory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#888" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏠</div>
          <p style={{ fontSize: "1rem" }}>You haven't viewed any properties yet.</p>
          <Link
            to="/list"
            style={{ display: "inline-block", marginTop: "1rem", padding: "10px 24px", background: "#1a1a2e", color: "white", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.2rem" }}>
          {viewingHistory.map((item) => (
            <Link
              key={item.id}
              to={`/property/${item.id}`}
              style={{ textDecoration: "none", color: "inherit", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "block", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)"; }}
            >
              <img
                src={item.images?.[0] || "/noimage.jpg"}
                alt={item.title}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
                onError={e => { e.target.src = "/noimage.jpg"; }}
              />
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.title}
                </p>
                <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: "1rem", margin: "0 0 4px" }}>
                  {formatPrice(item.price)}
                </p>
                <p style={{ color: "#888", fontSize: "0.78rem", margin: 0 }}>
                  📍 {item.city}
                </p>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.78rem", color: "#666" }}>
                  <span>🛏 {item.bedroom} bed</span>
                  <span>🚿 {item.bathroom} bath</span>
                  <span style={{ marginLeft: "auto", background: item.type === "buy" ? "#dcfce7" : "#e0f2fe", color: item.type === "buy" ? "#16a34a" : "#0284c7", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>
                    {item.type === "buy" ? "Buy" : "Rent"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentlyViewedPage;
