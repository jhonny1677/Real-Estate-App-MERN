import { useState } from "react";

const COLORS = ["#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#10b981","#3b82f6","#ef4444"];

function Avatar({ src, username, size = 32, style = {} }) {
  const [imgError, setImgError] = useState(false);

  const initial = username ? username[0].toUpperCase() : "?";
  const color = COLORS[(username?.charCodeAt(0) || 0) % COLORS.length];

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={username || "avatar"}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, ...style }}
      />
    );
  }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color, color: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.42, fontWeight: 700,
        flexShrink: 0, userSelect: "none", ...style
      }}
    >
      {initial}
    </div>
  );
}

export default Avatar;
