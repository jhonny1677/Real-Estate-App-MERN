import "./navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../context/AuthContext";
import { useChatContext } from "../../context/ChatContext";
import { ThemeContext } from "../../context/ThemeContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useRecommendations } from "../../context/RecommendationsContext";
import { useVisits } from "../../context/VisitsContext";
import CurrencySelector from "../currencySelector/CurrencySelector";
import Notifications from "../notifications/Notifications";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";

function Navbar() {
  const { t } = useTranslation();
  const { currentUser, logout } = useContext(AuthContext);
  const { unseenCount } = useChatContext();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { favorites, compareList } = useFavorites();
  const { getUnreadNotifications } = useRecommendations();
  const { upcomingVisits } = useVisits();
  const navigate = useNavigate();

  const unreadNotifications = getUnreadNotifications();
  const unreadNotificationCount = unreadNotifications.length;

  const handleLogout = () => {
    logout();
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
      </div>

      <div className="right">
        <LanguageSwitcher />
        <CurrencySelector />

        <div
          className="toggle-switch"
          onClick={() => setDarkMode((prev) => !prev)}
          title={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? "🌙" : "☀️"}
        </div>

        {currentUser && <Notifications />}

        {currentUser ? (
          <>
            {/* Primary action buttons */}
            <Link to="/add">
              <button className="nav-btn">+</button>
            </Link>

            <Link to="/chats" className="chat-link">
              <button className="nav-btn chat-btn">
                💬
                {unseenCount > 0 && <span className="notificationDot" />}
              </button>
            </Link>

            <Link to="/notifications" className="notifications-link">
              <button className="nav-btn notifications-btn">
                🔔
                {unreadNotificationCount > 0 && <span className="notification-count">{unreadNotificationCount}</span>}
              </button>
            </Link>

            <Link to="/favorites" className="favorites-link">
              <button className="nav-btn favorites-btn">
                ❤️
                {favorites.length > 0 && <span className="favorites-count">{favorites.length}</span>}
              </button>
            </Link>

            <Link to="/compare" className="compare-link">
              <button className="nav-btn compare-btn">
                ⚖️
                {compareList.length > 0 && <span className="compare-count">{compareList.length}</span>}
              </button>
            </Link>

            <button className="nav-btn logout" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-link">{t('nav.login')}</Link>
            <Link to="/register" className="auth-link">{t('nav.register')}</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
