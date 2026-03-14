import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import { login, forgotPassword, resendResetOtp, resetPassword } from "../../api/auth.api";
import { setSession } from "../../utils/authStorage";
import doctorsImg from "../../assets/doctors.jpg";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Forgot Password modal
  const [fpOpen, setFpOpen] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1=email, 2=otp+password, 3=success
  const [fpLoading, setFpLoading] = useState(false);
  const [fpErr, setFpErr] = useState("");
  const [fpMsg, setFpMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [fp, setFp] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fpEmailInputRef = useRef(null);
  const fpCodeInputRef = useRef(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.email.trim()) return "Please enter your email.";
    if (!form.password) return "Please enter your password.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const v = validate();
    if (v) return setErr(v);

    try {
      setLoading(true);

      const data = await login({
        email: form.email.trim(),
        password: form.password,
      });

      // store token + user
      setSession({ token: data.token, user: data.user, remember: form.remember });
      navigate("/app");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  // ------- Forgot Password open/close (NO outside click close)
  const openForgot = () => {
    const prefillEmail = form.email.trim();
    setFpOpen(true);
    setFpStep(1);
    setFpErr("");
    setFpMsg("");
    setCooldown(0);
    setFp({
      email: prefillEmail || "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const closeForgot = () => {
    setFpOpen(false);
    setFpErr("");
    setFpMsg("");
    setFpLoading(false);
    setCooldown(0);
  };

  // Prevent body scroll while modal open
  useEffect(() => {
    if (!fpOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fpOpen]);

  // Focus inside modal
  useEffect(() => {
    if (!fpOpen) return;
    const t = setTimeout(() => {
      if (fpStep === 1) fpEmailInputRef.current?.focus();
      if (fpStep === 2) fpCodeInputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [fpOpen, fpStep]);

  // ESC closes modal
  useEffect(() => {
    if (!fpOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeForgot();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fpOpen]);

  // resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const fpOnChange = (e) => {
    const { name, value } = e.target;
    setFp((p) => ({ ...p, [name]: value }));
  };

  const fpEmailValid = useMemo(() => {
    const v = fp.email.trim();
    return v.includes("@") && v.includes(".");
  }, [fp.email]);

  const sendOtp = async () => {
    setFpErr("");
    setFpMsg("");

    if (!fp.email.trim()) return setFpErr("Please enter your email.");
    if (!fpEmailValid) return setFpErr("Please enter a valid email.");

    try {
      setFpLoading(true);
      const res = await forgotPassword({ email: fp.email.trim().toLowerCase() });

      setFpMsg(res?.message || "If an account exists, an OTP was sent to your email.");
      setFpStep(2);
      setCooldown(45);
    } catch (e) {
      setFpErr(e.message || "Failed to send OTP.");
    } finally {
      setFpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;

    setFpErr("");
    setFpMsg("");

    try {
      setFpLoading(true);
      const res = await resendResetOtp({ email: fp.email.trim().toLowerCase() });

      setFpMsg(res?.message || "If an account exists, an OTP was sent to your email.");
      setCooldown(45);
    } catch (e) {
      setFpErr(e.message || "Failed to resend OTP.");
    } finally {
      setFpLoading(false);
    }
  };

  const submitReset = async () => {
    setFpErr("");
    setFpMsg("");

    const email = fp.email.trim().toLowerCase();
    const code = fp.code.trim();
    const newPassword = fp.newPassword;

    if (!email) return setFpErr("Email is required.");
    if (!code) return setFpErr("Please enter the OTP code.");
    if (!newPassword || newPassword.length < 8)
      return setFpErr("Password must be at least 8 characters. Use letters and numbers.");
    if (fp.confirmPassword !== newPassword) return setFpErr("Passwords do not match.");

    try {
      setFpLoading(true);
      await resetPassword({ email, code, newPassword });

      // Best UX: return to login (no auto-login)
      setFpStep(3);
      setForm((p) => ({ ...p, email, password: "" }));
    } catch (e) {
      setFpErr(e.message || "Password reset failed.");
    } finally {
      setFpLoading(false);
    }
  };

  const goToLogin = () => {
    setForm((p) => ({ ...p, email: fp.email.trim().toLowerCase(), password: "" }));
    closeForgot();
  };

  return (
    <div className="auth auth--fit">
      <div className="auth__bg" />

      <div className="auth__container auth__container--fit">
        {/* FORM (left) */}
        <div className="auth__panel auth__panel--form auth__panel--fit">
          <div className="auth__brand">
            <span className="auth__dot" />
            <span className="auth__brandText">MediNote</span>
          </div>

          <h1 className="auth__title auth__title--fit">Welcome back</h1>
          <p className="auth__subtitle auth__subtitle--fit">
            Log in to generate structured notes and export before records expire.
          </p>

          {err ? <div className="auth__alert">{err}</div> : null}

          <form className="auth__form auth__form--fit" onSubmit={onSubmit}>
            <div className="auth__field auth__field--fit">
              <label className="auth__label">Email</label>
              <div className="auth__inputWrap auth__inputWrap--fit">
                <span className="auth__icon" aria-hidden="true">
                  <i className="bi bi-envelope" />
                </span>
                <input
                  className="auth__input"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="doctor@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth__field auth__field--fit">
              <label className="auth__label">Password</label>
              <div className="auth__inputWrap auth__inputWrap--fit">
                <span className="auth__icon" aria-hidden="true">
                  <i className="bi bi-lock" />
                </span>
                <input
                  className="auth__input"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth__ghostBtn auth__ghostBtn--fit"
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="auth__row">
              <label className="auth__check auth__check--fit">
                <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} />
                <span>Remember me</span>
              </label>

              <button type="button" className="auth__linkBtn" onClick={openForgot}>
                Forgot password?
              </button>
            </div>

            <button className="auth__btn auth__btn--primary auth__btn--fit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="auth__divider">
              <span>New to MediNote?</span>
            </div>

            <Link className="auth__btn auth__btn--outline auth__btn--fit" to="/signup">
              Create an account
            </Link>

            <p className="auth__tiny auth__tiny--fit">Secure access with email OTP verification.</p>
          </form>
        </div>

        {/* HERO (right) -- SAME STRUCTURE as Signup */}
        <div className="auth__panel auth__panel--hero auth__panel--fit">
          <div className="auth__heroCard auth__heroCard--fit">
            <div className="auth__heroTop auth__heroTop--fit">
              <div className="auth__heroKicker">For Doctors</div>
              <div className="auth__heroTitle">AI Documentation Assistant</div>
              <div className="auth__heroSub">
                Convert voice + typed notes into clean SOAP sections. Edit and export in minutes.
              </div>
            </div>

            <div className="auth__heroImgWrap auth__heroImgWrap--fit">
              <img className="auth__heroImg" src={doctorsImg} alt="Doctors" />
            </div>

            <div className="auth__pillRow auth__pillRow--fit">
              <span className="auth__pill">Voice + Typed Notes</span>
              <span className="auth__pill">Templates</span>
              <span className="auth__pill">Export PDF / DOCX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {fpOpen ? (
        <div className="mn-modal" role="dialog" aria-modal="true">
          <div className="mn-modal__backdrop" />
          <div className="mn-modal__panel" onClick={(e) => e.stopPropagation()}>
            <button className="mn-modal__close" type="button" onClick={closeForgot} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>

            <div className="mn-modal__header">
              <div className="mn-modal__title">
                {fpStep === 1
                  ? "Reset your password"
                  : fpStep === 2
                  ? "Enter OTP + new password"
                  : "Password updated"}
              </div>
              <div className="mn-modal__sub">
                {fpStep === 1
                  ? "We'll send a 6-digit OTP to your email."
                  : fpStep === 2
                  ? `We sent a code to ${fp.email.trim() || "your email"}.`
                  : "Now you can login using your new password."}
              </div>
            </div>

            {fpErr ? <div className="mn-modal__alert">{fpErr}</div> : null}
            {fpMsg ? <div className="mn-modal__info">{fpMsg}</div> : null}

            {fpStep === 1 ? (
              <div className="mn-modal__body">
                <label className="mn-modal__label">Email</label>
                <input
                  ref={fpEmailInputRef}
                  className="mn-modal__input"
                  name="email"
                  value={fp.email}
                  onChange={fpOnChange}
                  placeholder="doctor@example.com"
                  autoComplete="email"
                />

                <button className="mn-modal__btn mn-modal__btn--primary" onClick={sendOtp} disabled={fpLoading}>
                  {fpLoading ? "Sending..." : "Send OTP"}
                </button>

                <button className="mn-modal__btn mn-modal__btn--ghost" onClick={closeForgot} type="button">
                  Cancel
                </button>
              </div>
            ) : fpStep === 2 ? (
              <div className="mn-modal__body">
                <label className="mn-modal__label">OTP Code</label>
                <input
                  ref={fpCodeInputRef}
                  className="mn-modal__input"
                  name="code"
                  value={fp.code}
                  onChange={fpOnChange}
                  placeholder="123456"
                  inputMode="numeric"
                />

                <div className="mn-modal__row">
                  <button
                    className="mn-modal__link"
                    type="button"
                    onClick={resendOtp}
                    disabled={fpLoading || cooldown > 0}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                  </button>

                  <button className="mn-modal__link" type="button" onClick={() => setFpStep(1)} disabled={fpLoading}>
                    Change email
                  </button>
                </div>

                <label className="mn-modal__label">New Password</label>
                <input
                  className="mn-modal__input"
                  name="newPassword"
                  value={fp.newPassword}
                  onChange={fpOnChange}
                  placeholder="At least 8 characters"
                  type="password"
                  autoComplete="new-password"
                />

                <label className="mn-modal__label">Confirm Password</label>
                <input
                  className="mn-modal__input"
                  name="confirmPassword"
                  value={fp.confirmPassword}
                  onChange={fpOnChange}
                  placeholder="Re-enter new password"
                  type="password"
                  autoComplete="new-password"
                />

                <button className="mn-modal__btn mn-modal__btn--primary" onClick={submitReset} disabled={fpLoading}>
                  {fpLoading ? "Updating..." : "Update password"}
                </button>

                <button className="mn-modal__btn mn-modal__btn--ghost" onClick={closeForgot} type="button">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mn-modal__body">
                <div className="mn-modal__success">
                  <i className="bi bi-check-circle-fill" /> Password updated successfully.
                </div>

                <button className="mn-modal__btn mn-modal__btn--primary" onClick={goToLogin}>
                  Go to login
                </button>

                <button className="mn-modal__btn mn-modal__btn--ghost" onClick={closeForgot} type="button">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
