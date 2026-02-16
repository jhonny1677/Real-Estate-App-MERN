import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

function OAuthCallback() {
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      navigate("/login?error=oauth_failed");
      return;
    }

    apiRequest.get("/auth/me")
      .then(res => {
        updateUser(res.data);
        navigate("/");
      })
      .catch(() => navigate("/login?error=oauth_failed"));
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: "16px"
    }}>
      <div style={{ fontSize: "2rem" }}>🔐</div>
      <p style={{ color: "#555", fontSize: "16px" }}>Signing you in…</p>
    </div>
  );
}

export default OAuthCallback;
