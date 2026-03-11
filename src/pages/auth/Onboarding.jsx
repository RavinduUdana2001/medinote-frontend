import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css"; // reuse your auth style
import { getUser, setSession } from "../../utils/authStorage";

export default function Onboarding() {
  const navigate = useNavigate();
  const user = getUser();

  const [form, setForm] = useState({
    name: user?.name || "Dr. XYZ",
    clinic: "",
    specialty: "",
    phone: user?.phone || "",
    city: "",
    agree: false,
  });

  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const onContinue = (e) => {
    e.preventDefault();
    setErr("");

    if (!form.name.trim()) return setErr("Please enter your name.");
    if (!form.clinic.trim()) return setErr("Please enter clinic/hospital name.");
    if (!form.specialty.trim()) return setErr("Please enter specialty.");
    if (!form.agree) return setErr("Please accept Privacy Policy.");

    // ✅ UI-only save (frontend)
    // You can later call backend: PUT /me or /profile
    const existingToken =
      localStorage.getItem("medinote_token") || sessionStorage.getItem("medinote_token");

    const updatedUser = {
      ...(user || {}),
      name: form.name.trim(),
      phone: form.phone.trim(),
      clinic: form.clinic.trim(),
      specialty: form.specialty.trim(),
      city: form.city.trim(),
      onboardingDone: true,
    };

    // keep token as-is
    setSession({ token: existingToken, user: updatedUser, remember: true });

    navigate("/app");
  };

  return (
    <div className="auth">
      <div className="auth__bg" />

      <div className="auth__container" style={{ gridTemplateColumns: "1fr" }}>
        <div className="auth__panel auth__panel--form">
          <div className="auth__brand">
            <span className="auth__dot" />
            <span className="auth__brandText">MediNote</span>
          </div>

          <h1 className="auth__title">Complete your profile</h1>
          <p className="auth__subtitle">
            Add a few details to personalize your documentation workspace.
          </p>

          {err ? <div className="auth__alert">{err}</div> : null}

          <form className="auth__form" onSubmit={onContinue}>
            <div className="auth__field">
              <label className="auth__label">Full name</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">👤</span>
                <input className="auth__input" name="name" value={form.name} onChange={onChange} />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Clinic / Hospital</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">🏥</span>
                <input
                  className="auth__input"
                  name="clinic"
                  value={form.clinic}
                  onChange={onChange}
                  placeholder="City Medical Center"
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Specialty</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">🩺</span>
                <input
                  className="auth__input"
                  name="specialty"
                  value={form.specialty}
                  onChange={onChange}
                  placeholder="General Practitioner"
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Phone</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">📞</span>
                <input
                  className="auth__input"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">City</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">📍</span>
                <input
                  className="auth__input"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="Colombo"
                />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Signature (upload later)</label>
              <div className="auth__inputWrap">
                <span className="auth__icon">✍️</span>
                <input className="auth__input" value="Upload placeholder (UI only)" readOnly />
              </div>
            </div>

            <label className="auth__check auth__check--terms">
              <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
              <span>I accept the Privacy Policy (required)</span>
            </label>

            <button className="auth__btn auth__btn--primary">Continue to Dashboard</button>
          </form>
        </div>
      </div>
    </div>
  );
}