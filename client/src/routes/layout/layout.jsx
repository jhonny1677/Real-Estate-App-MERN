import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import Chat from "../../components/chat/Chat";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { Toaster } from "react-hot-toast";

function BaseLayout() {
  const { chat } = useContext(ChatContext);
  const { i18n } = useTranslation();
  const location = useLocation();

  return (
    <div className="layout content-safe-area" key={i18n.language}>
      <ScrollToTop />
      <Navbar />
      <div className="content">
        {/* key forces remount + fade-in animation on every route change */}
        <div className="page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </div>

      {chat && <Chat />}

      <Toaster
        position="bottom-right"
        containerStyle={{ bottom: 24, right: 24 }}
        toastOptions={{
          duration: 3000,
          style: { fontFamily: "Inter, sans-serif", fontSize: "14px", borderRadius: "8px" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </div>
  );
}

function RequireAuth() {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return <Navigate to="/login" />;
  return <BaseLayout />;
}

function RequireAdmin() {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== "admin") return <Navigate to="/" />;
  return <BaseLayout />;
}

export { BaseLayout as Layout, RequireAuth, RequireAdmin };
