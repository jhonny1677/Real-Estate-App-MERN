import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./resetPassword.scss";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest.post("/auth/reset-password", {
        token,
        newPassword: password
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="resetPassword">
        <div className="container">
          <div className="error">
            <h1>Invalid Link</h1>
            <p>This password reset link is invalid or has expired.</p>
            <button onClick={() => navigate("/login")} className="btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="resetPassword">
        <div className="container">
          <div className="success">
            <div className="checkmark">✓</div>
            <h1>Password Reset Successful!</h1>
            <p>Your password has been updated successfully.</p>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resetPassword">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="submit" disabled={isLoading} className="btn">
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;