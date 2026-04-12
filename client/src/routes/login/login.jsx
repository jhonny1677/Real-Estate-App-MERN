import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import OAuthButtons from "../../components/OAuthButtons/OAuthButtons";

function Login() {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const {updateUser} = useContext(AuthContext)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.target);

    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const res = await apiRequest.post("/auth/login", {
        username,
        password,
      });

      updateUser(res.data)

      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      // Check if it's a network error (backend truly unavailable)
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error') || !err.response) {
        console.log("Backend unavailable, using demo login fallback");

        // Fallback demo login when backend is not available
        if (username === "demo" && password === "demo") {
          const demoUser = {
            id: 1,
            username: "demo",
            email: "demo@example.com",
            avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            role: "user"
          };

          updateUser(demoUser);
          navigate("/");
        } else if (username === "admin" && password === "admin123") {
          const adminUser = {
            id: 999,
            username: "admin",
            email: "admin@estateapp.com",
            avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            role: "admin"
          };

          updateUser(adminUser);
          navigate("/admin");
        } else {
          setError("Backend unavailable. Use 'demo'/'demo' for user or 'admin'/'admin123' for admin access.");
        }
      } else {
        // Backend is available but login failed for other reasons
        const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
        setError(errorMessage);
        console.log("Login error response:", err.response?.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>{t('auth.welcomeBack')}</h1>
          <p className="subtitle">{t('auth.signInSubtitle')}</p>

          <div className="demo-toggle">
            <button type="button" className="demo-toggle-btn" onClick={() => setShowDemo(s => !s)}>
              {showDemo ? '▲' : '▼'} Demo Credentials
            </button>
            {showDemo && (
              <div className="demo-info">
                <p><strong>Demo:</strong> username <code>demo</code> / password <code>demo</code></p>
                <p><strong>Admin:</strong> username <code>admin</code> / password <code>admin123</code></p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="username"
              required
              minLength={3}
              maxLength={20}
              type="text"
              placeholder={t('auth.username')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              placeholder={t('auth.password')}
            />
          </div>

          <button disabled={isLoading}>{isLoading ? t('common.loading') : t('auth.signIn')}</button>
          {error && <span className="error-msg">{error}</span>}

          <div className="links">
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
            <Link to="/register">{t('auth.noAccount')}</Link>
          </div>

          <OAuthButtons />
        </form>
      </div>

      <div className="imgContainer">
        <div className="welcome-content">
          <div className="brand-logo">
            <div className="logo-icon">🏠</div>
            <h2>EstateHub</h2>
          </div>
          <p className="tagline">Your gateway to finding the perfect property</p>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">🔍</div>
              <div className="feature-text">
                <strong>Find Your Dream Home</strong>
                <span>Browse thousands of verified listings near you</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <div className="feature-text">
                <strong>Best Market Prices</strong>
                <span>Get fair deals with real-time price data</span>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🏆</div>
              <div className="feature-text">
                <strong>Trusted Platform</strong>
                <span>Verified listings and secure transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
