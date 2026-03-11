import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import doctorsImg from "../../assets/doctors.jpg";
import { signup } from "../../api/auth.api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    agree: false,
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim()) return "Please enter your email.";
    if (!form.phone.trim()) return "Please enter your phone.";
    if (!form.password || form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (!form.agree) return "Please accept Privacy Policy and Terms.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) return setErr(msg);

    try {
      setLoading(true);

      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      // ✅ Go to verify page ONLY
      navigate("/verify", { state: { email: form.email.trim() } });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth auth--fit">
      <div className="auth__bg" />

      <div className="auth__container auth__container--fit">
        {/* LEFT: form */}
        <div className="auth__panel auth__panel--form auth__panel--fit">
          <div className="auth__brand">
            <span className="auth__dot" />
            <span className="auth__brandText">MediNote</span>
          </div>

          <h1 className="auth__title auth__title--fit">Create your account</h1>
          <p className="auth__subtitle auth__subtitle--fit">
            Set up your profile and start documenting faster.
          </p>

          {err ? <div className="auth__alert">{err}</div> : null}

          <form className="auth__form auth__form--fit" onSubmit={onSubmit}>
            <div className="auth__field auth__field--fit">
              <label className="auth__label">Full name</label>
              <div className="auth__inputWrap auth__inputWrap--fit">
                <span className="auth__icon">👤</span>
                <input
                  className="auth__input"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Dr. Jane Doe"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth__field auth__field--fit">
              <label className="auth__label">Email</label>
              <div className="auth__inputWrap auth__inputWrap--fit">
                <span className="auth__icon">✉️</span>
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
              <label className="auth__label">Phone</label>
              <div className="auth__inputWrap auth__inputWrap--fit">
                <span className="auth__icon">📞</span>
                <input
                  className="auth__input"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+94 77 123 4567"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="auth__field auth__field--fit">
              <label className="auth__label">Password</label>
              <div className="auth__inputWrap auth__inputWrap--fit">
                <span className="auth__icon">🔒</span>
                <input
                  className="auth__input"
                  name="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
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

            <label className="auth__check auth__check--terms auth__check--fit">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={onChange}
              />
              <span>
                I agree to the{" "}
                <button type="button" className="auth__linkBtn">
                  Privacy Policy
                </button>{" "}
                and{" "}
                <button type="button" className="auth__linkBtn">
                  Terms
                </button>
              </span>
            </label>

            <button
              className="auth__btn auth__btn--primary auth__btn--fit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Sign up"}
            </button>

            <p className="auth__tiny auth__tiny--fit">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>

        {/* RIGHT: hero */}
        <div className="auth__panel auth__panel--hero auth__panel--fit">
          <div className="auth__heroCard auth__heroCard--fit">
            <div className="auth__heroTop auth__heroTop--fit">
              <div className="auth__heroTitle">Professional, Clean UI</div>
              <div className="auth__heroSub">
                Designed for doctors. Fast, simple, and modern.
              </div>
            </div>

            <div className="auth__heroImgWrap auth__heroImgWrap--fit">
              <img className="auth__heroImg" src={doctorsImg} alt="Doctors" />
            </div>

            <div className="auth__pillRow auth__pillRow--fit">
              <span className="auth__pill">Voice + Typed Notes</span>
              <span className="auth__pill">Templates</span>
              <span className="auth__pill">History (30 days)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
