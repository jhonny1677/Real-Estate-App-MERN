import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";

// After Clerk finalises the session, this page syncs the Clerk user into our
// own DB (creating an account if needed), then logs the user in via our JWT.
function SyncUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { navigate("/login"); return; }

    (async () => {
      try {
        const token = await getToken();
        const res = await apiRequest.post("/auth/clerk-sync", { token });
        updateUser(res.data);
        navigate("/");
      } catch {
        navigate("/login?error=sync_failed");
      }
    })();
  }, [isLoaded, isSignedIn]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: "2rem" }}>🔐</div>
      <p style={{ color: "#555" }}>Setting up your account…</p>
    </div>
  );
}

export default SyncUser;
