import "./layout.scss";
import Navbar from "../../components/navbar/Navbar";
import Chat from "../../components/chat/Chat";
import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

function BaseLayout() {
  const { chat } = useContext(ChatContext);
  const { i18n } = useTranslation();

  return (
    <div className="layout content-safe-area" key={i18n.language}>
      <Navbar />
      <div className="content">
        <Outlet />
      </div>

      {/* Float the chat box directly */}
      {chat && <Chat />}
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
