import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCurrency } from "../../context/CurrencyContext";
import apiRequest from "../../lib/apiRequest";

const CustomTooltip = ({ active, payload, label, formatPrice }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{formatPrice(payload[0].value)}</p>
    </div>
  );
};

function PriceHistoryChart({ postId, currentPrice }) {
  const { formatPrice } = useCurrency();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest.get(`/posts/${postId}/price-history`)
      .then(res => {
        const points = (res.data || []).map(p => ({
          price: p.price,
          date: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }));
        setData(points);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <div style={{ padding: "1rem", color: "#888", fontSize: 14 }}>Loading price history…</div>;

  const hasChange = data.length > 1 && data[0].price !== data[data.length - 1].price;
  const priceDiff = data.length > 1 ? data[data.length - 1].price - data[0].price : 0;
  const pctChange = data.length > 1 ? ((priceDiff / data[0].price) * 100).toFixed(1) : 0;

  return (
    <div className="price-history-chart">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Price History</h4>
        {hasChange && (
          <span style={{
            fontSize: 13, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
            background: priceDiff < 0 ? "#f0fdf4" : "#fef2f2",
            color: priceDiff < 0 ? "#16a34a" : "#dc2626",
          }}>
            {priceDiff < 0 ? "▼" : "▲"} {Math.abs(pctChange)}% since listing
          </span>
        )}
        {!hasChange && data.length === 1 && (
          <span style={{ fontSize: 12, color: "#aaa" }}>No price changes recorded yet</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#aaa" }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#aaa" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            width={45}
          />
          <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#667eea"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={{ fill: "#667eea", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceHistoryChart;
