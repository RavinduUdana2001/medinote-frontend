import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/landing.css";

// Images (Vite)
import heroBg from "../../assets/hero.jpg";
import heroCardImg from "../../assets/hero.jpg";
import testiImg from "../../assets/testi1.jpg";
import partner1 from "../../assets/testi1.jpg";
import partner2 from "../../assets/testi1.jpg";
import partner3 from "../../assets/testi1.jpg";
import partner4 from "../../assets/testi1.jpg";
import partner5 from "../../assets/testi1.jpg";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [typeOn, setTypeOn] = useState(false);

  const whyRef = useRef(null);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const testiRef = useRef(null);
  const partnersRef = useRef(null);
  const securityRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  useReveal(whyRef, () => setTypeOn(true));
  useReveal(featuresRef);
  useReveal(howRef);
  useReveal(testiRef);
  useReveal(partnersRef);
  useReveal(securityRef);
  useReveal(faqRef);
  useReveal(ctaRef);

  const whyText = useMemo(
    () =>
      "MediNote helps doctors document faster using voice + templates to generate clean structured SOAP notes — ready to edit and export.",
    []
  );

  return (
    <div className="mn-page">
      {/* ================= NAVBAR + HERO ================= */}
      <section className="mn-hero" id="home">
        <div className="mn-heroBg" style={{ backgroundImage: `url(${heroBg})` }} aria-hidden="true" />
        <div className="mn-heroOverlay" aria-hidden="true" />

        <header className="mn-navBar">
          <div className="container-fluid px-3 px-md-5">
            <div className="mn-navRow">
              <a className="mn-brand" href="#home">
                <span className="mn-brandIcon" aria-hidden="true">
                  <LogoMark />
                </span>
                <span className="mn-brandName">MediNote</span>
              </a>

              <nav className="mn-navLinks d-none d-lg-flex">
                <a className="mn-navLink" href="#features">Features</a>
                <a className="mn-navLink" href="#how">How it works</a>
                <a className="mn-navLink" href="#security">Security</a>
                <a className="mn-navLink" href="#faq">FAQ</a>
              </nav>

              <div className="mn-navActions">
                <Link to="/login" className="btn btn-outline-light mn-navBtn d-none d-sm-inline-flex">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary mn-navBtn mn-btnFix">
                  Get Started
                </Link>

                <details className="mn-mobileMenu d-lg-none">
                  <summary className="mn-burger" aria-label="Open menu">
                    <span />
                    <span />
                    <span />
                  </summary>
                  <div className="mn-mobileSheet">
                    <a className="mn-mobileLink" href="#features">Features</a>
                    <a className="mn-mobileLink" href="#how">How it works</a>
                    <a className="mn-mobileLink" href="#security">Security</a>
                    <a className="mn-mobileLink" href="#faq">FAQ</a>
                    <div className="mn-mobileBtns">
                      <Link to="/login" className="btn btn-outline-primary w-100">Login</Link>
                      <Link to="/signup" className="btn btn-primary w-100 mn-btnFix">Get Started</Link>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </header>

        <div className={`container-fluid px-3 px-md-5 mn-heroContent ${mounted ? "mn-mounted" : ""}`}>
          <div className="mn-heroGrid">
            <div className="mn-heroLeft">
              <div className="mn-miniBadge">
                <span className="mn-miniDot" />
                <span>Email OTP • JWT sessions • Export • Auto-delete 30 days</span>
              </div>

              <h1 className="mn-heroTitle">
                Generate clean medical notes <span className="mn-soft">from voice + text</span>.
              </h1>

              <p className="mn-heroDesc">
                Record or type, pick a template, generate structured SOAP notes, edit, and export.
              </p>

              <div className="mn-heroBtns">
                <Link to="/signup" className="btn btn-primary mn-heroBtn mn-btnFix">Get Started</Link>
                <Link to="/login" className="btn btn-outline-light mn-heroBtn">Login</Link>
              </div>

              <div className="mn-heroFine">
                MediNote is a documentation assistant — not a permanent EMR. Notes auto-delete after 30 days.
              </div>
            </div>

            <div className="mn-heroRight">
              <div className="mn-heroCard">
                <img className="mn-heroCardImg" src={heroCardImg} alt="MediNote preview" />
                <div className="mn-heroCardOverlay">
                  <div className="mn-heroStat">
                    <div className="mn-heroStatNum">30</div>
                    <div className="mn-heroStatTxt">day auto-delete</div>
                  </div>
                  <div className="mn-heroChips">
                    <span className="mn-chip c1">Voice</span>
                    <span className="mn-chip c2">Transcript</span>
                    <span className="mn-chip c3">SOAP</span>
                    <span className="mn-chip c4">Templates</span>
                    <span className="mn-chip c5">Export</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a className="mn-scrollDown" href="#why" aria-label="Scroll down">
            <span className="mn-scrollDot" />
            <span>Scroll</span>
          </a>
        </div>
      </section>

      {/* ================= WHY IT MATTERS ================= */}
      <section className="mn-section" id="why">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-cardCenter mn-reveal" ref={whyRef}>
            <div className="mn-kickerCenter">✦ WHY IT MATTERS</div>

            <p className="mn-statementLine mn-threeLines">
              {typeOn ? (
                <TypewriterText
                  text={whyText}
                  speed={15}
                  highlightWords={["MediNote", "voice", "templates", "SOAP", "export"]}
                />
              ) : (
                <span className="mn-placeholder">{whyText}</span>
              )}
            </p>

            <div className="mn-flowRow">
              <span>Record</span><span className="mn-arrow">→</span>
              <span>Transcribe</span><span className="mn-arrow">→</span>
              <span>Select Template</span><span className="mn-arrow">→</span>
              <span>Generate SOAP</span><span className="mn-arrow">→</span>
              <span>Edit</span><span className="mn-arrow">→</span>
              <span>Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="mn-section" id="features">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-block mn-reveal" ref={featuresRef}>
            <div className="mn-kickerCenter">FEATURES</div>
            <h2 className="mn-h2Center">
              Everything for <span className="mn-h2Strong">fast documentation</span>
            </h2>
            <p className="mn-subCenter">
              Voice + templates → structured SOAP output → quick edits → export before expiry.
            </p>

            <div className="mn-featureGrid">
              <FeatureCard icon={<IconMic />} title="Voice recording + transcript"
                desc="Record voice notes and get a clean transcript ready for note generation." />
              <FeatureCard icon={<IconText />} title="Typed notes + combined input"
                desc="Type notes anytime. MediNote keeps a clean combined input for generation." />
              <FeatureCard icon={<IconTemplate />} title="Template system"
                desc="Use global templates or create your own templates for consistency." />
              <FeatureCard icon={<IconSoap />} title="Structured SOAP output"
                desc="Generate Subjective / Objective / Assessment / Plan sections in one click." />
              <FeatureCard icon={<IconHistory />} title="History + expiry status"
                desc="Search and sort records. Track “expires in X days”." />
              <FeatureCard icon={<IconExport />} title="Export + copy"
                desc="Export PDF / DOCX / Text and copy notes anytime before expiry." />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="mn-section mn-softBg" id="how">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-block mn-reveal" ref={howRef}>
            <div className="mn-kickerCenter">HOW IT WORKS</div>
            <h2 className="mn-h2Center">
              From voice to <span className="mn-h2Strong">structured notes</span> in minutes
            </h2>

            <div className="mn-steps">
              <StepCard num="01" title="Sign up + verify OTP" desc="Secure access with email OTP verification." />
              <StepCard num="02" title="Record or type notes" desc="Voice recording + typed notes, combined cleanly." />
              <StepCard num="03" title="Select template + generate" desc="Choose template and generate SOAP structure." />
              <StepCard num="04" title="Edit + export" desc="Edit section-by-section and export PDF/DOCX/Text." />
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL ================= */}
      <section className="mn-section" id="testimonials">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-block mn-reveal" ref={testiRef}>
            <div className="mn-kickerCenter">TESTIMONIALS</div>
            <h2 className="mn-h2Center">
              Doctors love <span className="mn-h2Strong">MediNote</span>
            </h2>

            <div className="mn-testiLayout">
              <div className="mn-testiLeft">
                <img className="mn-testiImg" src={testiImg} alt="Testimonial" />
              </div>

              <div className="mn-testiRight">
                <div className="mn-stars" aria-hidden="true">★★★★★</div>
                <p className="mn-quote">
                  “MediNote saves time during busy days. I record a quick summary, pick my template, and it generates
                  a clean SOAP note I can edit and export immediately.”
                </p>
                <div className="mn-authorRow">
                  <div className="mn-authorAvatar" />
                  <div>
                    <div className="mn-authorName">Dr. Jessica Perera</div>
                    <div className="mn-authorRole">General Practitioner</div>
                  </div>
                  <div className="mn-quoteMark" aria-hidden="true">”</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PARTNERS ================= */}
      <section className="mn-section" id="partners">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-block mn-reveal" ref={partnersRef}>
            <div className="mn-kickerCenter">OUR PARTNERS</div>
            <h2 className="mn-h2Center">Trusted by <span className="mn-h2Strong">healthcare teams</span></h2>

            <div className="mn-partnersRow">
              <PartnerLogo src={partner1} />
              <PartnerLogo src={partner2} />
              <PartnerLogo src={partner3} />
              <PartnerLogo src={partner4} />
              <PartnerLogo src={partner5} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="mn-section mn-integrationsBg" id="security">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-block mn-reveal" ref={securityRef}>
            <div className="mn-kickerCenter">SECURITY</div>
            <h2 className="mn-h2Center">Privacy-first by <span className="mn-h2Strong">design</span></h2>

            <div className="mn-securityGrid">
              <SecurityItem title="Email OTP verification" desc="Secure access using email OTP verification." />
              <SecurityItem title="JWT protected sessions" desc="Protected routes and secure sessions." />
              <SecurityItem title="Temporary storage" desc="Records are temporary and auto-delete after 30 days." />
              <SecurityItem title="Not a full EMR" desc="MediNote is a documentation assistant, not a permanent EMR." />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mn-section" id="faq">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-block mn-reveal" ref={faqRef}>
            <div className="mn-faqGrid">
              <div className="mn-faqLeft">
                <div className="mn-kicker">F.A.Q</div>
                <h2 className="mn-h2">
                  Got questions? <br />
                  <span className="mn-h2Strong">We’ve got answers.</span>
                </h2>
                <p className="mn-faqSub">Security, templates, export, and temporary records.</p>
                <Link to="/signup" className="btn btn-primary mn-btnFix mn-heroBtn">Get Started</Link>
              </div>

              <div className="mn-faqRight">
                <FaqItem
                  q="Is MediNote a full EMR system?"
                  a="No. It’s a documentation assistant. Notes auto-delete after 30 days."
                  open
                />
                <FaqItem q="Can I export notes?" a="Yes. Export PDF / DOCX / Text anytime before expiry." />
                <FaqItem q="How is my data secured?"
                  a="Email OTP + JWT sessions. Temporary storage auto-deletes after 30 days." />
                <FaqItem q="Can I create my own templates?"
                  a="Yes. Use global templates or create custom templates." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mn-section" id="cta">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-cta mn-reveal" ref={ctaRef}>
            <div>
              <div className="mn-kicker">READY</div>
              <h2 className="mn-ctaTitle">Start documenting faster today.</h2>
              <div className="mn-ctaSub">Generate structured notes, edit quickly, export before expiry.</div>
            </div>

            <div className="mn-ctaBtns">
              <Link to="/signup" className="btn btn-primary mn-btnFix mn-heroBtn">Get Started</Link>
              <Link to="/login" className="btn btn-outline-primary mn-heroBtn">Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mn-footerWide">
        <div className="container-fluid px-3 px-md-5">
          <div className="mn-footerGrid">
            <div className="mn-footerCol">
              <div className="mn-footerBrand">
                <LogoMark />
                <span>MediNote</span>
              </div>
              <div className="mn-footerSmall">
                Documentation assistant — not a permanent EMR. Notes auto-delete after 30 days.
              </div>
            </div>

            <div className="mn-footerCol">
              <div className="mn-footerHead">Links</div>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#security">Security</a>
              <a href="#faq">FAQ</a>
            </div>

            <div className="mn-footerCol">
              <div className="mn-footerHead">Account</div>
              <Link to="/login">Login</Link>
              <Link to="/signup">Get Started</Link>
              <a href="#">Privacy Policy</a>
            </div>
          </div>

          <div className="mn-footerBottom">
            <span>© {new Date().getFullYear()} MediNote</span>
            <span className="mn-footerBottomRight">Email OTP • JWT • Auto-delete 30 days</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Reveal ---------- */
function useReveal(ref, onEnter) {
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("mn-inview");
            if (onEnter) onEnter();
          }
        });
      },
      { threshold: 0.22 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, onEnter]);
}

/* ---------- Typewriter ---------- */
function TypewriterText({ text, speed = 15, highlightWords = [] }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let raf;
    let last = performance.now();

    const tick = (now) => {
      if (now - last >= speed) {
        last = now;
        setCount((c) => (c < text.length ? c + 1 : c));
      }
      if (count < text.length) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const visible = text.slice(0, count);
  const parts = visible.split(/(\s+)/);
  const hl = highlightWords.map((w) => w.toLowerCase());

  return (
    <span className="mn-type">
      {parts.map((p, i) => {
        const clean = p.replace(/[^\w+]/g, "").toLowerCase();
        const isHL = hl.includes(clean);
        return (
          <span key={i} className={isHL ? "mn-hl" : ""}>
            {p}
          </span>
        );
      })}
      <span className={count < text.length ? "mn-caret" : "mn-caret done"} />
    </span>
  );
}

/* ---------- Small UI components ---------- */
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="mn-featureCard">
      <div className="mn-featureIcon">{icon}</div>
      <div className="mn-featureTitle">{title}</div>
      <div className="mn-featureDesc">{desc}</div>
    </div>
  );
}
function StepCard({ num, title, desc }) {
  return (
    <div className="mn-stepCard">
      <div className="mn-stepNum">{num}</div>
      <div className="mn-stepTitle">{title}</div>
      <div className="mn-stepDesc">{desc}</div>
    </div>
  );
}
function PartnerLogo({ src }) {
  return (
    <div className="mn-partnerCard">
      <img src={src} alt="Partner logo" />
    </div>
  );
}
function SecurityItem({ title, desc }) {
  return (
    <div className="mn-securityItem">
      <div className="mn-securityTitle">{title}</div>
      <div className="mn-securityDesc">{desc}</div>
    </div>
  );
}
function FaqItem({ q, a, open = false }) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div className="mn-faqItem">
      <button className="mn-faqQ" onClick={() => setIsOpen((s) => !s)} type="button">
        <span>{q}</span>
        <span className="mn-faqPlus">{isOpen ? "−" : "+"}</span>
      </button>
      <div className="mn-faqA" style={{ maxHeight: isOpen ? 180 : 0 }}>
        <div className="mn-faqAText">{a}</div>
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */
function IconMic() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z" stroke="#2563EB" strokeWidth="2" />
      <path d="M19 11a7 7 0 0 1-14 0" stroke="#16A34A" strokeWidth="2" />
      <path d="M12 18v3" stroke="#0F172A" strokeWidth="2" />
    </svg>
  );
}
function IconText() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16" stroke="#2563EB" strokeWidth="2" />
      <path d="M4 12h12" stroke="#7C3AED" strokeWidth="2" />
      <path d="M4 18h10" stroke="#0F172A" strokeWidth="2" />
    </svg>
  );
}
function IconTemplate() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="#2563EB" strokeWidth="2" />
      <path d="M8 9h8" stroke="#16A34A" strokeWidth="2" />
      <path d="M8 13h6" stroke="#7C3AED" strokeWidth="2" />
    </svg>
  );
}
function IconSoap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 4h12v16H6V4Z" stroke="#2563EB" strokeWidth="2" />
      <path d="M9 8h6" stroke="#16A34A" strokeWidth="2" />
      <path d="M9 12h6" stroke="#7C3AED" strokeWidth="2" />
      <path d="M9 16h4" stroke="#0F172A" strokeWidth="2" />
    </svg>
  );
}
function IconHistory() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 8v5l3 2" stroke="#2563EB" strokeWidth="2" />
      <path d="M21 12a9 9 0 1 1-3-6.7" stroke="#16A34A" strokeWidth="2" />
    </svg>
  );
}
function IconExport() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v10" stroke="#2563EB" strokeWidth="2" />
      <path d="M8 9l4 4 4-4" stroke="#7C3AED" strokeWidth="2" />
      <path d="M5 21h14" stroke="#0F172A" strokeWidth="2" />
    </svg>
  );
}
function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mnG" x1="2" y1="2" x2="26" y2="26">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="24" height="24" rx="8" fill="url(#mnG)" />
      <path d="M13.1 9.6h1.8v3.3h3.3v1.8h-3.3v3.3h-1.8v-3.3H9.8v-1.8h3.3V9.6Z" fill="#fff" />
    </svg>
  );
}