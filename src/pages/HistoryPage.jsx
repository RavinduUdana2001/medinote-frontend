// ✅ HistoryPage.jsx (FULL) — cards stay inside the page area + internal scroll for 50+ records
// Save: src/pages/HistoryPage.jsx

import React, { useMemo, useState } from "react";
import "../styles/history.css";

export default function HistoryPage() {
  // ✅ demo data (simulate many records)
  const records = useMemo(() => {
    const base = [
      {
        id: "r1",
        patientName: "Nimal Perera",
        status: "Completed",
        template: "General Checkup (SOAP)",
        summary: "Fever + Cough (2 days)",
        createdAt: "Feb 24, 10:12 A.M.",
        expiresInDays: 29,
      },
      {
        id: "r2",
        patientName: "No Patient",
        status: "Draft",
        template: "Follow-up",
        summary: "Gastritis Symptoms",
        createdAt: "Feb 20, 08:32 A.M.",
        expiresInDays: 25,
      },
      {
        id: "r3",
        patientName: "Kumari Silva",
        status: "Completed",
        template: "General Checkup (SOAP)",
        summary: "Sore throat, Mild fever",
        createdAt: "Feb 19, 10:08 A.M.",
        expiresInDays: 24,
      },
    ];

    // ✅ create many more (for testing 50+)
    const many = [];
    for (let i = 4; i <= 55; i++) {
      many.push({
        id: `r${i}`,
        patientName: i % 4 === 0 ? "No Patient" : `Patient ${i}`,
        status: i % 3 === 0 ? "Draft" : "Completed",
        template: i % 2 === 0 ? "General Checkup" : "Follow-up",
        summary: i % 2 === 0 ? "Fever + cough" : "Stomach pain + bloating",
        createdAt: `Feb ${Math.max(1, 28 - (i % 15))}, 0${i % 9}:1${i % 6} A.M.`,
        expiresInDays: Math.max(1, 30 - (i % 30)),
      });
    }
    return [...base, ...many];
  }, []);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | expiring

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = records.filter((r) => {
      if (!query) return true;
      const hay = `${r.patientName} ${r.template} ${r.summary} ${r.status}`.toLowerCase();
      return hay.includes(query);
    });

    if (sort === "oldest") list = [...list].reverse();
    if (sort === "expiring") list = [...list].sort((a, b) => a.expiresInDays - b.expiresInDays);
    return list;
  }, [q, sort, records]);

  const onNewConsultation = () => alert("New Consultation (connect later)");
  const onView = (id) => alert(`View record ${id} (load into Consultation later)`);
  const onExport = (id) => alert(`Export record ${id} (PDF later)`);
  const onDelete = (id) => {
    if (window.confirm("Delete this record now?")) alert(`Deleted ${id} (later)`);
  };

  return (
    <div className="his-page">
      {/* ✅ Controls */}
      <div className="his-controls">
        <div className="his-search">
          <i className="bi bi-search" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patient/template, keyword"
          />
        </div>

        <div className="his-sort">
          <button className="his-sort-btn" type="button">
            <i className="bi bi-funnel" />
            <span>Sort</span>
          </button>

          <select
            className="his-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>

        <button className="his-new" type="button" onClick={onNewConsultation}>
          <i className="bi bi-plus-lg" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* ✅ LIST WRAPPER (fixed inside layout area) */}
      <div className="his-list-shell">
        <div className="his-list">
          {filtered.length === 0 ? (
            <div className="his-empty">
              <div className="his-empty-title">No records found</div>
              <div className="his-empty-sub">Try a different keyword.</div>
            </div>
          ) : (
            filtered.map((r) => (
              <div className="his-card" key={r.id}>
                <div className="his-card-left">
                  <div className="his-row1">
                    <div className="his-patient">{r.patientName}</div>
                    <span className={`his-pill ${r.status === "Completed" ? "completed" : "draft"}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="his-meta">
                    <div className="his-meta-line">
                      <span className="his-meta-label">Template :</span>{" "}
                      <span className="his-meta-value">{r.template}</span>
                    </div>
                    <div className="his-meta-line">{r.summary}</div>
                  </div>

                  <div className="his-time">{r.createdAt}</div>
                </div>

                <div className="his-card-right">
                  <div className="his-actions">
                    <button className="his-view" type="button" onClick={() => onView(r.id)}>
                      View
                    </button>

                    <button
                      className="his-ico"
                      type="button"
                      title="Export"
                      onClick={() => onExport(r.id)}
                    >
                      <i className="bi bi-download" />
                    </button>

                    <button
                      className="his-ico danger"
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(r.id)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>

                  <div className="his-expire">Expires on {r.expiresInDays} days</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}