import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

// Clerk redirects here after OAuth. This component finalises the Clerk session
// and then redirects to /sync-user which syncs the Clerk user to our own DB.
function SSOCallback() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: "2rem" }}>🔐</div>
      <p style={{ color: "#555" }}>Completing sign-in…</p>
      <AuthenticateWithRedirectCallback fallbackRedirectUrl="/sync-user" />
    </div>
  );
}

export default SSOCallback;
