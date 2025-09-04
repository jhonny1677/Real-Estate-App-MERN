import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest";
import "./verifyEmail.scss";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await apiRequest.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(res.data.message);
        
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verifyEmail">
      <div className="container">
        {status === "verifying" && (
          <div className="verifying">
            <div className="spinner"></div>
            <h1>Verifying your email...</h1>
          </div>
        )}

        {status === "success" && (
          <div className="success">
            <div className="checkmark">✓</div>
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <p>Redirecting to login page...</p>
          </div>
        )}

        {status === "error" && (
          <div className="error">
            <div className="error-icon">✗</div>
            <h1>Verification Failed</h1>
            <p>{message}</p>
            <button onClick={() => navigate("/login")} className="btn">
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;