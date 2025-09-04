import { useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./forgotPassword.scss";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await apiRequest.post("/auth/request-password-reset", { email });
      setMessage(res.data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgotPassword">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Forgot Password</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
          
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          
          <Link to="/login">Back to Login</Link>
        </form>
      </div>
      
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default ForgotPassword;