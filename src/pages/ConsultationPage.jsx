import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ✅ FULL UPDATED ConsultationPage.jsx
 * - Right side output matches your screenshot style:
 *   Header (Medical Report + patient) + 3 icon buttons
 *   4 section cards (Subjective/Objective/Assessment/Plan)
 *   Each section has Pencil + Copy (and Save/Cancel while editing)
 *   Footer buttons: Save and Complete / draft / Delete
 * - Mobile: Output panel becomes a real "output box" with internal scroll
 * - Keeps your previous section icon colors by using these classes:
 *   .rep-sec-icon.subjective / .objective / .assessment / .plan
 *
 * REQUIRE: Bootstrap Icons loaded in index.html:
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
 */

export default function ConsultationPage() {
  // ---------------------------
  // Patient + Modal
  // ---------------------------
  const [patient, setPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    nic: "",
    allergies: "",
    notes: "",
  });

  // ---------------------------
  // Symptoms
  // ---------------------------
  const symptoms = useMemo(
    () => [
      "Fever",
      "Cough",
      "Headache",
      "Sore throat",
      "Body pain",
      "Vomiting",
      "Diarrhea",
      "Dizziness",
    ],
    []
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState(["Fever", "Cough"]);

  // ---------------------------
  // Template preview (optional)
  // ---------------------------
  const selectedTemplate = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedTemplate") || "null");
    } catch {
      return null;
    }
  }, []);

  // ---------------------------
  // Doctor note
  // ---------------------------
  const [doctorNote, setDoctorNote] = useState(
    "Please keep the note short and clear. Patient is a university student."
  );

  // ---------------------------
  // Recorder swipe
  // ---------------------------
  const [recSlide, setRecSlide] = useState(0);
  const touch = useRef({ x0: 0, dx: 0, dragging: false });

  const onTouchStart = (e) => {
    const x = e.touches?.[0]?.clientX ?? 0;
    touch.current = { x0: x, dx: 0, dragging: true };
  };
  const onTouchMove = (e) => {
    if (!touch.current.dragging) return;
    const x = e.touches?.[0]?.clientX ?? 0;
    touch.current.dx = x - touch.current.x0;
  };
  const onTouchEnd = () => {
    if (!touch.current.dragging) return;
    const dx = touch.current.dx;
    const threshold = 40;
    if (dx < -threshold) setRecSlide(1);
    if (dx > threshold) setRecSlide(0);
    touch.current.dragging = false;
    touch.current.dx = 0;
  };

  // ---------------------------
  // Output report (NO tabs)
  // ---------------------------
  const [report, setReport] = useState({
    title: "Medical Report",
    subjective:
      "Symptoms : Fever, cough. Patient reports fever and cough for 2 days. Mild sore throat and headache.",
    objective:
      "Temp 38.2°C. Throat mildly erythematous. Chest clear. No signs of dehydration.",
    assessment:
      "Likely viral URTI. Consider testing if persistent fever or worsening throat pain.",
    plan:
      "Rest, hydration, paracetamol PRN, warm saline gargles. Follow-up if not improved in 48–72 hours.",
  });

  // Section editing (one section at a time)
  const [editingKey, setEditingKey] = useState(null);
  const [editText, setEditText] = useState("");

  // lock body scroll when patient modal open
  useEffect(() => {
    if (showPatientModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [showPatientModal]);

  // ---------------------------
  // Helpers
  // ---------------------------
  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const openPatientModal = () => {
    if (patient) setPatientForm({ ...patient });
    setShowPatientModal(true);
  };
  const closePatientModal = () => setShowPatientModal(false);

  const savePatient = () => {
    setPatient({ ...patientForm });
    setShowPatientModal(false);
  };

  const generateOutput = () => {
    // sample generation only (connect API later)
    const sym = selectedSymptoms.length ? selectedSymptoms.join(", ") : "N/A";
    setReport((r) => ({
      ...r,
      title: "Medical Report",
      subjective: `Symptoms : ${sym}. Patient reports fever and cough for 2 days. Mild sore throat and headache.`,
    }));
    setEditingKey(null);
    setEditText("");
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const startEdit = (key) => {
    setEditingKey(key);
    setEditText(report?.[key] || "");
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditText("");
  };

  const saveEdit = () => {
    if (!editingKey) return;
    setReport((prev) => ({ ...prev, [editingKey]: editText }));
    setEditingKey(null);
    setEditText("");
  };

  const exportPDF = () => alert("Export PDF (connect later)");
  const shareReport = () => alert("Share (connect later)");

  const saveAndComplete = () => alert("Save and Complete (connect later)");
  const saveDraft = () => alert("Save Draft (connect later)");
  const deleteReport = () => {
    if (window.confirm("Delete this report?")) alert("Deleted (connect later)");
  };

  const sections = useMemo(
    () => [
      { key: "subjective", label: "Subjective", icon: "bi-chat-left-text" },
      { key: "objective", label: "Objective", icon: "bi-clipboard2-pulse" },
      { key: "assessment", label: "Assessment", icon: "bi-activity" },
      { key: "plan", label: "Plan", icon: "bi-list-check" },
    ],
    []
  );

  return (
    <div className="consult-page">
      <div className="consult-body-grid">
        {/* ===================== LEFT SIDE (Inputs) ===================== */}
        <div className="consult-col consult-left">
          {/* Patient details */}
          <div className="ui-card consult-card">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Patient Details</div>
                <div className="consult-sub">Optional – add / edit patient</div>
              </div>

              <button
                className="btn btn-primary btn-sm consult-add-btn"
                type="button"
                onClick={openPatientModal}
              >
                <i className="bi bi-person-plus me-2" />
                {patient ? "Edit" : "Add"}
              </button>
            </div>

            {patient ? (
              <div className="patient-mini">
                <div className="patient-mini-row">
                  <span>Name</span>
                  <b>{patient.name || "-"}</b>
                </div>
                <div className="patient-mini-row">
                  <span>Age</span>
                  <b>{patient.age || "-"}</b>
                </div>
                <div className="patient-mini-row">
                  <span>Gender</span>
                  <b>{patient.gender || "-"}</b>
                </div>
                <div className="patient-mini-row">
                  <span>Phone</span>
                  <b>{patient.phone || "-"}</b>
                </div>
              </div>
            ) : (
              <div className="consult-empty">
                No patient added yet. Click <b>Add</b> to enter details.
              </div>
            )}
          </div>

          {/* Recording */}
          <div className="ui-card consult-card">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Recording</div>
                <div className="consult-sub">Swipe Dictate ↔ Transcript</div>
              </div>
            </div>

            <div
              className="rec-swipe-shell"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="rec-swipe-track"
                style={{ transform: `translateX(-${recSlide * 50}%)` }}
              >
                <div className="rec-swipe-slide">
                  <div className="rec-panel">
                    <div className="rec-center">
                      <button className="rec-mic-btn" type="button">
                        <i className="bi bi-mic-fill" />
                      </button>
                      <div className="rec-hint">Tap to start recording</div>
                      <div className="rec-meta">Swipe ← → to switch</div>
                    </div>
                  </div>
                </div>

                <div className="rec-swipe-slide">
                  <div className="rec-panel">
                    <div className="rec-transcript">
                      <div className="rec-transcript-title">Live Transcript</div>
                      <div className="rec-transcript-box">
                        fever… cough… sore throat… (sample transcript)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rec-switch">
              <button
                type="button"
                className={`rec-switch-btn ${recSlide === 0 ? "active" : ""}`}
                onClick={() => setRecSlide(0)}
              >
                <i className="bi bi-mic me-2" />
                Dictate
              </button>
              <button
                type="button"
                className={`rec-switch-btn ${recSlide === 1 ? "active" : ""}`}
                onClick={() => setRecSlide(1)}
              >
                <i className="bi bi-card-text me-2" />
                Transcript
              </button>
            </div>

            <div className="rec-dots">
              <span className={`rec-dot ${recSlide === 0 ? "active" : ""}`} />
              <span className={`rec-dot ${recSlide === 1 ? "active" : ""}`} />
            </div>
          </div>

          {/* Symptoms */}
          <div className="ui-card consult-card">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Symptoms</div>
                <div className="consult-sub">Tap to select</div>
              </div>
            </div>

            <div className="symptom-chips">
              {symptoms.map((s) => {
                const active = selectedSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`sym-chip ${active ? "active" : ""}`}
                    onClick={() => toggleSymptom(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template (simple preview) */}
          <div className="ui-card consult-card">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Template</div>
                <div className="consult-sub">Selected template preview</div>
              </div>
            </div>

            {selectedTemplate ? (
              <div className="template-mini">
                <div className="template-mini-title">{selectedTemplate.name}</div>
                <div className="template-mini-desc">
                  {selectedTemplate.description || "Template preview..."}
                </div>
              </div>
            ) : (
              <div className="consult-empty">No template selected yet.</div>
            )}
          </div>

          {/* Doctor note */}
          <div className="ui-card consult-card">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Doctor Note</div>
                <div className="consult-sub">Extra note to send to AI</div>
              </div>
            </div>

            <textarea
              className="form-control consult-textarea"
              rows={4}
              value={doctorNote}
              onChange={(e) => setDoctorNote(e.target.value)}
            />
          </div>

          {/* Generate */}
          <div className="consult-actions">
            <button className="btn btn-primary w-100" onClick={generateOutput}>
              Generate Output →
            </button>
          </div>
        </div>

        {/* ===================== RIGHT SIDE (Medical Report Output) ===================== */}
        <div className="consult-col consult-right">
          <div className="ui-card consult-card consult-output rep-shell">
            {/* Header (blue focus border like screenshot) */}
            <div className="rep-header rep-header-focus">
              <div className="rep-title-wrap">
                <div className="rep-title">{report?.title || "Medical Report"}</div>
                <div className="rep-sub">
                  {patient?.name
                    ? `Sample patient : ${patient.name}`
                    : "Sample patient : Nimal Perera"}
                </div>
              </div>

              <div className="rep-head-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title="Edit full report"
                  onClick={() => alert("Full report edit (optional)")}
                >
                  <i className="bi bi-pencil-fill" />
                </button>

                <button type="button" className="icon-btn" title="Export PDF" onClick={exportPDF}>
                  <i className="bi bi-download" />
                </button>

                <button type="button" className="icon-btn" title="Share" onClick={shareReport}>
                  <i className="bi bi-share" />
                </button>
              </div>
            </div>

            {/* Body (scroll inside output on mobile) */}
            <div className="rep-scroll rep-scroll-bg">
              {sections.map((s) => {
                const value = report?.[s.key] || "";
                const isEditing = editingKey === s.key;

                return (
                  <div className="rep-section" key={s.key}>
                    <div className="rep-sec-head">
                      <div className="rep-sec-left">
                        {/* ✅ keeps your previous icon colors */}
                        <span className={`rep-sec-icon ${s.key}`}>
                          <i className={`bi ${s.icon}`} />
                        </span>
                        <div className="rep-sec-title">{s.label}</div>
                      </div>

                      <div className="rep-sec-actions">
                        {!isEditing ? (
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            onClick={() => startEdit(s.key)}
                          >
                            <i className="bi bi-pencil-fill" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Save"
                              onClick={saveEdit}
                            >
                              <i className="bi bi-check2" />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Cancel"
                              onClick={cancelEdit}
                            >
                              <i className="bi bi-x-lg" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="icon-btn"
                          title="Copy"
                          onClick={() => copyText(value)}
                        >
                          <i className="bi bi-copy" />
                        </button>
                      </div>
                    </div>

                    {!isEditing ? (
                      <div className="rep-sec-body">{value}</div>
                    ) : (
                      <textarea
                        className="form-control rep-editbox"
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer (like screenshot) */}
            <div className="rep-footer rep-footer-fixed">
              <button className="btn btn-light rep-btn" type="button" onClick={saveAndComplete}>
                Save and Complete
              </button>

              <button className="btn btn-light rep-btn" type="button" onClick={saveDraft}>
                draft
              </button>

              <button className="btn btn-danger rep-btn px-4" type="button" onClick={deleteReport}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Patient Modal ===================== */}
      {showPatientModal &&
        createPortal(
          <div className="rmodal-overlay" onMouseDown={closePatientModal}>
            <div className="rmodal-card" onMouseDown={(e) => e.stopPropagation()}>
              <div className="rmodal-header">
                <div>
                  <div className="rmodal-title">Patient Details</div>
                  <div className="rmodal-sub">Fill details and save</div>
                </div>

                <button className="rmodal-x" type="button" onClick={closePatientModal}>
                  ✕
                </button>
              </div>

              <div className="rmodal-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      value={patientForm.name}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label">Age</label>
                    <input
                      className="form-control"
                      value={patientForm.age}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, age: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-6 col-md-3">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={patientForm.gender}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, gender: e.target.value }))
                      }
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={patientForm.phone}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">NIC / ID</label>
                    <input
                      className="form-control"
                      value={patientForm.nic}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, nic: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Allergies</label>
                    <input
                      className="form-control"
                      value={patientForm.allergies}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, allergies: e.target.value }))
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={patientForm.notes}
                      onChange={(e) =>
                        setPatientForm((p) => ({ ...p, notes: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rmodal-footer">
                <button className="btn btn-light" type="button" onClick={closePatientModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="button" onClick={savePatient}>
                  Save Patient
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}