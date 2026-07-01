import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sendOtp, verifyOtp } from "../utils/otpAuth";
import "../styles/auth.css";

export default function Signup() {
  const [step, setStep] = useState("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }
    setLoading(true);
    try {
      await sendOtp(email);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Could not send the code. Check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(email, code);
      if (!result.verified) {
        setError(result.reason);
        setLoading(false);
        return;
      }
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Could not create that account. The email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <Link to="/" className="auth-brand">Holdr</Link>
      <div className="auth-card">
        {step === "details" ? (
          <>
            <h1>Create your vault</h1>
            <p className="auth-sub">We'll send a code to confirm your email.</p>
            <form onSubmit={handleDetailsSubmit} className="auth-form">
              <label>
                Name
                <input type="text" value={name} required onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label>
                Password
                <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Check your email</h1>
            <p className="auth-sub">Enter the 6-digit code sent to {email}.</p>
            <form onSubmit={handleOtpSubmit} className="auth-form">
              <label>
                Code
                <input type="text" value={code} required maxLength={6} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? "Verifying..." : "Verify and create account"}
              </button>
            </form>
          </>
        )}
        <p className="auth-switch">
          Already have a vault? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}