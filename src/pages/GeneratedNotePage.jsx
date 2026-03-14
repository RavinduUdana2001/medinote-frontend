import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearConsultationDraft,
  getConsultationDraft,
  saveConsultationDraft,
} from "../utils/consultationDraftStorage";

const SECTION_ICONS = {
  subjective: "bi-chat-left-text",
  objective: "bi-clipboard2-pulse",
  assessment: "bi-activity",
  plan: "bi-list-check",
};

function formatDate(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function GeneratedNotePage() {
  const navigate = useNavigate();
  const initialDraft = useMemo(() => getConsultationDraft(), []);
  const [draft, setDraft] = useState(initialDraft);
  const [editingKey, setEditingKey] = useState(null);
  const [editText, setEditText] = useState("");
  const [copiedState, setCopiedState] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  const noteText = useMemo(() => {
    if (!draft?.sections?.length) return "";

    return draft.sections
      .map((section) => `${section.label}\n${section.content}`)
      .join("\n\n");
  }, [draft]);

  const copyText = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(label);
      window.setTimeout(() => setCopiedState(""), 1500);
    } catch {
      setCopiedState("");
    }
  };

  const startEdit = (section) => {
    setEditingKey(section.key);
    setEditText(section.content);
  };

  const saveEdit = () => {
    if (!draft || !editingKey) return;

    const nextDraft = {
      ...draft,
      sections: draft.sections.map((section) =>
        section.key === editingKey ? { ...section, content: editText } : section
      ),
    };

    setDraft(nextDraft);
    saveConsultationDraft(nextDraft);
    setEditingKey(null);
    setEditText("");
  };

  const deleteDraft = () => {
    clearConsultationDraft();
    setDraft(null);
    navigate("/app");
  };

  if (!draft) {
    return (
      <div className="generated-note-shell">
        <div className="generated-empty-state">
          <div>
            <div className="generated-empty-icon">
              <i className="bi bi-journal-richtext" />
            </div>
            <h2>No generated note yet</h2>
            <p>Start a consultation, add details, and generate the note from there.</p>
            <button
              type="button"
              className="generated-primary-btn generated-primary-btn-dark"
              onClick={() => navigate("/app")}
            >
              Back to Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`generated-note-shell ${mounted ? "mounted" : ""}`}>
      <div className="generated-note-hero">
        <div>
          <div className="generated-kicker">Generated Note</div>
          <h1>{draft.title}</h1>
          <p>{draft.summary}</p>
        </div>

        <div className="generated-hero-actions">
          <button
            type="button"
            className="generated-secondary-btn"
            onClick={() => navigate("/app")}
          >
            <i className="bi bi-arrow-left" />
            <span>Back to Consultation</span>
          </button>
          <button
            type="button"
            className="generated-primary-btn"
            onClick={() => copyText("full-note", noteText)}
          >
            <i className="bi bi-copy" />
            <span>{copiedState === "full-note" ? "Copied" : "Copy Full Note"}</span>
          </button>
        </div>
      </div>

      <div className="generated-meta-grid">
        <InfoCard
          label="Patient"
          value={draft.patient?.name || "Walk-in Patient"}
          subValue={
            draft.patient?.age || draft.patient?.gender
              ? [draft.patient?.age && `${draft.patient.age} yrs`, draft.patient?.gender]
                  .filter(Boolean)
                  .join(" • ")
              : "Patient profile can still be refined"
          }
          icon="bi-person-badge"
        />
        <InfoCard
          label="Template"
          value={draft.selectedTemplate?.name || "General SOAP Template"}
          subValue={`Tone: ${draft.tone} • Format: ${draft.outputFormat}`}
          icon="bi-file-earmark-medical"
        />
        <InfoCard
          label="Transcript"
          value={`${draft.selectedSymptoms?.length || 0} symptom tags`}
          subValue={draft.transcript}
          icon="bi-soundwave"
        />
        <InfoCard
          label="Created"
          value={formatDate(draft.createdAt)}
          subValue="Ready for review, edit, and export"
          icon="bi-clock-history"
        />
      </div>

      <div className="generated-layout-grid">
        <div className="generated-main-column">
          {draft.sections.map((section) => {
            const isEditing = editingKey === section.key;

            return (
              <section className="generated-section-card" key={section.key}>
                <div className="generated-section-head">
                  <div className="generated-section-titlewrap">
                    <span className={`generated-section-icon ${section.key}`}>
                      <i className={`bi ${SECTION_ICONS[section.key] || "bi-file-text"}`} />
                    </span>
                    <div>
                      <h3>{section.label}</h3>
                      <p>Editable clinical content</p>
                    </div>
                  </div>

                  <div className="generated-section-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="generated-icon-btn save"
                          onClick={saveEdit}
                          title="Save"
                        >
                          <i className="bi bi-check2" />
                        </button>
                        <button
                          type="button"
                          className="generated-icon-btn"
                          onClick={() => {
                            setEditingKey(null);
                            setEditText("");
                          }}
                          title="Cancel"
                        >
                          <i className="bi bi-x-lg" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="generated-icon-btn"
                        onClick={() => startEdit(section)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square" />
                      </button>
                    )}

                    <button
                      type="button"
                      className="generated-icon-btn"
                      onClick={() => copyText(section.key, section.content)}
                      title="Copy"
                    >
                      <i className="bi bi-copy" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    className="generated-editbox"
                    rows={6}
                    value={editText}
                    onChange={(event) => setEditText(event.target.value)}
                  />
                ) : (
                  <div className="generated-section-body">{section.content}</div>
                )}
              </section>
            );
          })}
        </div>

        <aside className="generated-side-column">
          <div className="generated-side-card">
            <div className="generated-side-head">
              <h3>Transcript Snapshot</h3>
              <span>Source input</span>
            </div>
            <p>{draft.transcript}</p>
          </div>

          <div className="generated-side-card">
            <div className="generated-side-head">
              <h3>Symptoms</h3>
              <span>Quick check</span>
            </div>
            <div className="generated-chip-row">
              {(draft.selectedSymptoms || []).length ? (
                draft.selectedSymptoms.map((symptom) => (
                  <span className="generated-chip" key={symptom}>
                    {symptom}
                  </span>
                ))
              ) : (
                <span className="generated-chip subtle">No symptom tags selected</span>
              )}
            </div>
          </div>

          <div className="generated-side-card">
            <div className="generated-side-head">
              <h3>Next Actions</h3>
              <span>Suggested</span>
            </div>
            <ul className="generated-checklist">
              <li>Confirm the objective findings before finalizing.</li>
              <li>Replace placeholder language with diagnosis-specific wording.</li>
              <li>Export or copy after the final clinical review.</li>
            </ul>
          </div>

          <div className="generated-side-actions">
            <button type="button" className="generated-primary-btn generated-primary-btn-dark" onClick={saveEdit}>
              Save Changes
            </button>
            <button type="button" className="generated-danger-btn" onClick={deleteDraft}>
              Delete Draft
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ label, value, subValue, icon }) {
  return (
    <div className="generated-info-card">
      <div className="generated-info-icon">
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div className="generated-info-label">{label}</div>
        <div className="generated-info-value">{value}</div>
        <div className="generated-info-subvalue">{subValue}</div>
      </div>
    </div>
  );
}
