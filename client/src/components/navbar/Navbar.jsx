import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { ThemeContext } from "../../context/ThemeContext";
import { useFavorites } from "../../context/FavoritesContext";
import CurrencySelector from "../currencySelector/CurrencySelector";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import Avatar from "../Avatar/Avatar";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useVisits } from "../../context/VisitsContext";

function Navbar() {
  const { t } = useTranslation();
  const { currentUser, logout } = useContext(AuthContext);
  const { unseenCount } = useChatContext();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { favorites } = useFavorites();
  const { getUnreadNotifications, viewingHistory } = useRecommendations();
  const { upcomingVisits } = useVisits();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadNotificationCount = getUnreadNotifications().length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <div className={`navbar ${darkMode ? "dark" : "light"}`}>
      <div className="left">
        <Link to="/" className="logo">
          <span className="logo-icon">🏡</span>
          <span className="logo-text">EstateHub</span>
        </Link>
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/about">{t('nav.about')}</Link>
        <Link to="/contact">{t('nav.contact')}</Link>
        <Link to="/agents">{t('nav.agents')}</Link>
        {viewingHistory.length > 0 && (
          <Link to="/recently-viewed" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            🕐 History
          </Link>
        )}
      </div>

      <div className="right">

        {/* ── Left utility group: theme · language · currency ── */}
        <div className="icon-group utility-group">
          <div
            className="toggle-switch"
            onClick={() => setDarkMode((prev) => !prev)}
            data-tooltip="Toggle Theme"
          >
            {darkMode ? "🌙" : "☀️"}
          </div>
          <LanguageSwitcher />
          <CurrencySelector />
        </div>

        {/* ── Divider ── */}
        <div className="group-divider" />

        {/* ── Right actions group: messages · notifications · visits · favorites · add listing · avatar ── */}
        <div className="icon-group actions-group">
          {currentUser ? (
            <>
              <Link to="/chats" className="chat-link">
                <button className="nav-btn chat-btn" data-tooltip="Messages">
                  💬
                  {unseenCount > 0 && <span className="notificationDot" />}
                </button>
              </Link>

              <Link to="/notifications">
                <button className="nav-btn notifications-btn" data-tooltip="Notifications">
                  🔔
                  {unreadNotificationCount > 0 && (
                    <span className="notification-count">{unreadNotificationCount}</span>
                  )}
                </button>
              </Link>

              <Link to="/upcoming-visits">
                <button className="nav-btn" data-tooltip="My Visits">
                  📅
                  {upcomingVisits.filter(v => v.status === "confirmed").length > 0 && (
                    <span className="favorites-count">
                      {upcomingVisits.filter(v => v.status === "confirmed").length}
                    </span>
                  )}
                </button>
              </Link>

              <Link to="/favorites">
                <button className="nav-btn favorites-btn" data-tooltip="Favorites">
                  ❤️
                  {favorites.length > 0 && (
                    <span className="favorites-count">{favorites.length}</span>
                  )}
                </button>
              </Link>

              <Link to="/add" className="add-listing-btn" data-tooltip="Create a new listing">
                <span className="add-icon">+</span>
                <span>Add Listing</span>
              </Link>

              {/* Avatar dropdown */}
              <div className="avatar-menu" ref={dropdownRef}>
                <button
                  className="avatar-trigger"
                  onClick={() => setDropdownOpen((p) => !p)}
                  data-tooltip={currentUser.username}
                >
                  <Avatar src={currentUser.avatar} username={currentUser.username} size={28} />
                  <span className="avatar-username">{currentUser.username}</span>
                  <span className="avatar-chevron">{dropdownOpen ? "▴" : "▾"}</span>
                </button>

                {dropdownOpen && (
                  <div className="avatar-dropdown">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                      <span>👤</span> Profile
                    </Link>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                      <span>🏠</span> My Listings
                    </Link>
                    <Link to="/upcoming-visits" onClick={() => setDropdownOpen(false)}>
                      <span>📅</span> My Visits
                      {upcomingVisits.filter(v => v.status === "confirmed").length > 0 && (
                        <span style={{ marginLeft: "auto", background: "#1a1a2e", color: "white", borderRadius: "10px", padding: "1px 7px", fontSize: "11px" }}>
                          {upcomingVisits.filter(v => v.status === "confirmed").length}
                        </span>
                      )}
                    </Link>
                    <Link to="/notification-settings" onClick={() => setDropdownOpen(false)}>
                      <span>⚙️</span> Settings
                    </Link>
                    <div className="divider" />
                    <button onClick={handleLogout}>
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link">{t('nav.login')}</Link>
              <Link to="/register" className="auth-link">{t('nav.register')}</Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;
