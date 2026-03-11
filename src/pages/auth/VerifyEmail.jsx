import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import doctorsImg from "../../assets/doctors.jpg";
import { resendOtp, verifyEmail } from "../../api/auth.api";
import { setSession } from "../../utils/authStorage";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location?.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    if (!emailFromState) {
      // If user refreshes /verify, we still allow manual email entry.
      // (no redirect, just keep form)
    }
  }, [emailFromState]);

  const onVerify = async (e) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!email.trim()) return setErr("Please enter your email.");
    if (code.trim().length !== 6) return setErr("Enter the 6-digit code.");

    try {
      setLoading(true);
      const data = await verifyEmail({ email: email.trim(), code: code.trim() });

      // verified => token returned => login
      setSession({ token: data.token, user: data.user, remember: true });
      navigate("/onboarding");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setErr("");
    setOkMsg("");

    if (!email.trim()) return setErr("Enter your email to resend OTP.");

    try {
      setResending(true);
      const data = await resendOtp({ email: email.trim() });
      setOkMsg(data?.message || "OTP resent.");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setResending(false);
    }
  };

  // only digits, max 6
  const handleCode = (v) => {
    const only = v.replace(/\D/g, "").slice(0, 6);
    setCode(only);
  };

  return (
    <div className="auth">
      <div className="auth__bg" />

      <div className="auth__container">
        {/* LEFT */}
        <div className="auth__panel auth__panel--form">
          <div className="auth__brand">
            <span className="auth__dot" />
            <span className="auth__brandText">MediNote</span>
          </div>

          <h1 className="auth__title">Verify your email</h1>
          <p className="auth__subtitle">
            Enter the 6-digit code we sent to your email.
          </p>

          {err ? <div className="auth__alert">{err}</div> : null}
          {okMsg ? (
            <div
              className="auth__alert"
              style={{
                borderColor: "rgba(22,163,74,.25)",
                background: "rgba(22,163,74,.08)",
                color: "#166534",
              }}
            >
              {okMsg}
            </div>
          ) : null}

          <form className="auth__form" onSubmit={onVerify}>
            <div className="auth__field">
              <label className="auth__label">Email</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">✉️</span>
                <input
                  className="auth__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">6-digit code</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">🔢</span>
                <input
                  className="auth__input"
                  value={code}
                  onChange={(e) => handleCode(e.target.value)}
                  inputMode="numeric"
                  placeholder="123456"
                />
                <button
                  type="button"
                  className="auth__ghostBtn"
                  onClick={onResend}
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Resend"}
                </button>
              </div>
            </div>

            <button className="auth__btn auth__btn--primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <p className="auth__tiny">
              Back to <Link to="/login">Login</Link>
            </p>
          </form>
        </div>

        {/* RIGHT */}
        <div className="auth__panel auth__panel--hero">
          <div className="auth__heroCard">
            <div className="auth__heroTop">
              <div className="auth__heroTitle">Secure Access</div>
              <div className="auth__heroSub">
                Verification keeps your clinical notes protected.
              </div>
            </div>

            <div className="auth__heroImgWrap">
              <img className="auth__heroImg" src={doctorsImg} alt="Doctors" />
            </div>

            <div className="auth__pillRow">
              <span className="auth__pill">Email OTP</span>
              <span className="auth__pill">JWT Auth</span>
              <span className="auth__pill">30-day records</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}