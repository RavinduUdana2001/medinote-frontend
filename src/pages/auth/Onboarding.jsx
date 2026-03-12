import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css"; // reuse your auth style
import { getUser, updateStoredUser } from "../../utils/authStorage";
import { getMyProfile, updateOnboarding } from "../../api/profile.api";

export default function Onboarding() {
  const navigate = useNavigate();
  const user = getUser();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    agree: !!user?.privacy_accepted,
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        if (ignore) return;

        const profile = res.user || {};
        updateStoredUser(profile);

        if (profile.onboarding_completed) {
          navigate("/app");
          return;
        }

        setForm((p) => ({
          ...p,
          name: profile.name || p.name || "",
          phone: profile.phone || p.phone || "",
          agree: !!profile.privacy_accepted,
        }));
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Failed to load your profile.");
        }
      } finally {
        if (!ignore) setLoadingProfile(false);
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  const onContinue = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.name.trim()) return setErr("Please enter your name.");
    if (!form.agree) return setErr("Please accept Privacy Policy.");

    try {
      setLoading(true);
      const res = await updateOnboarding({
        name: form.name.trim(),
        phone: form.phone.trim(),
        agree: form.agree,
      });

      updateStoredUser(res.user);
      navigate("/app");
    } catch (error) {
      setErr(error.message || "Failed to save onboarding details.");
    } finally {
      setLoading(false);
    }
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
          <p className="auth__subtitle">Confirm your details to continue.</p>

          {err ? <div className="auth__alert">{err}</div> : null}

          <form className="auth__form" onSubmit={onContinue}>
            <div className="auth__field">
              <label className="auth__label">Full name</label>
              <div className="auth__inputWrap">
                <span className="auth__icon" aria-hidden="true">
                  <i className="bi bi-person" />
                </span>
                <input className="auth__input" name="name" value={form.name} onChange={onChange} />
              </div>
            </div>

            <div className="auth__field">
              <label className="auth__label">Phone</label>
              <div className="auth__inputWrap">
                <span className="auth__icon" aria-hidden="true">
                  <i className="bi bi-telephone" />
                </span>
                <input
                  className="auth__input"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <label className="auth__check auth__check--terms">
              <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} />
              <span>I accept the Privacy Policy (required)</span>
            </label>

            <button className="auth__btn auth__btn--primary" disabled={loading || loadingProfile}>
              {loading || loadingProfile ? "Saving..." : "Continue to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
