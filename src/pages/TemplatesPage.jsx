import React, { useEffect, useMemo, useState } from "react";
import "../styles/templates.css";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate,
} from "../api/templates.api";
import {
  clearDefaultTemplateSnapshot,
  saveDefaultTemplateSnapshot,
} from "../utils/defaultTemplateStorage";

const SECTION_LIBRARY = [
  { key: "patient_info", label: "Patient Information" },
  { key: "chief_complaint", label: "Chief Complaint" },
  { key: "hpi", label: "History of Present Illness" },
  { key: "pmh", label: "Past Medical History" },
  { key: "psh", label: "Past Surgical History" },
  { key: "medications_allergies", label: "Medications & Allergies" },
  { key: "family_history", label: "Family History" },
  { key: "social_history", label: "Social History" },
  { key: "ros", label: "Review of Systems" },
  { key: "physical_exam", label: "Physical Exam" },
  { key: "vitals", label: "Vitals" },
  { key: "assessment", label: "Assessment" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "plan", label: "Plan" },
  { key: "patient_instructions", label: "Patient Instructions" },
  { key: "follow_up", label: "Follow-Up" },
];

function normalizeTemplate(t, defaultTemplateId) {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug || "",
    description: t.description || "",
    category: t.category || "general",
    visibility: t.visibility,
    ownerUserId: t.ownerUserId ?? null,
    contentJson: t.contentJson || {
      templateType: "custom_template",
      sections: [],
    },
    previewText: t.previewText || "",
    isDefault: t.id === defaultTemplateId || !!t.isDefault,
    sections: Array.isArray(t.contentJson?.sections)
      ? t.contentJson.sections
      : [],
    type: t.visibility === "system" ? "system" : "custom",
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function buildPayloadFromForm(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category.trim() || "general",
    contentJson: {
      templateType: form.templateType || "custom_template",
      sections: form.sections.map((section) => ({
        key: section.key,
        label: section.label,
        enabled: true,
        inputType: "textarea",
      })),
    },
  };
}

function groupSystemTemplates(templates) {
  return {
    general: templates.filter((t) => t.category === "general"),
    hospital: templates.filter((t) =>
      ["hospital", "opd"].includes((t.category || "").toLowerCase())
    ),
    emergency: templates.filter((t) =>
      ["emergency", "procedure", "prescription"].includes(
        (t.category || "").toLowerCase()
      )
    ),
    specialty: templates.filter((t) => t.category === "specialty"),
    others: templates.filter(
      (t) =>
        ![
          "general",
          "hospital",
          "opd",
          "emergency",
          "procedure",
          "prescription",
          "specialty",
        ].includes((t.category || "").toLowerCase())
    ),
  };
}

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");

  const [defaultTemplateId, setDefaultTemplateIdState] = useState(null);
  const [systemTemplates, setSystemTemplates] = useState([]);
  const [customTemplates, setCustomTemplates] = useState([]);

  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "general",
    templateType: "custom_template",
    sections: [],
  });

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await getTemplates();
      const nextDefaultId = data.defaultTemplateId || null;
      const nextSystemTemplates = (data.systemTemplates || []).map((t) =>
        normalizeTemplate(t, nextDefaultId)
      );
      const nextCustomTemplates = (data.customTemplates || []).map((t) =>
        normalizeTemplate(t, nextDefaultId)
      );
      const nextDefaultTemplate = [...nextSystemTemplates, ...nextCustomTemplates].find(
        (template) => template.id === nextDefaultId
      );

      setDefaultTemplateIdState(nextDefaultId);
      setSystemTemplates(nextSystemTemplates);
      setCustomTemplates(nextCustomTemplates);

      if (nextDefaultTemplate) {
        saveDefaultTemplateSnapshot(nextDefaultTemplate);
      } else {
        clearDefaultTemplateSnapshot();
      }
    } catch (err) {
      setPageError(err.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const allTemplates = useMemo(
    () => [...systemTemplates, ...customTemplates],
    [systemTemplates, customTemplates]
  );

  const defaultTemplate = useMemo(
    () => allTemplates.find((t) => t.id === defaultTemplateId) || null,
    [allTemplates, defaultTemplateId]
  );

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTemplates;

    return allTemplates.filter((template) => {
      const text = [
        template.name,
        template.description,
        template.category,
        template.visibility,
        ...(template.sections || []).map((s) => s.label),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [allTemplates, search]);

  const filteredSystem = useMemo(
    () => filteredTemplates.filter((t) => t.type === "system"),
    [filteredTemplates]
  );

  const filteredCustom = useMemo(
    () => filteredTemplates.filter((t) => t.type === "custom"),
    [filteredTemplates]
  );

  const groupedSystem = useMemo(
    () => groupSystemTemplates(filteredSystem),
    [filteredSystem]
  );

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormError("");
    setForm({
      name: "",
      description: "",
      category: "general",
      templateType: "custom_template",
      sections: [
        { key: "patient_info", label: "Patient Information" },
        { key: "chief_complaint", label: "Chief Complaint" },
        { key: "assessment", label: "Assessment" },
        { key: "plan", label: "Plan" },
      ],
    });
    setFormOpen(true);
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormError("");
    setForm({
      name: template.name || "",
      description: template.description || "",
      category: template.category || "general",
      templateType: template.contentJson?.templateType || "custom_template",
      sections: (template.sections || []).map((s) => ({
        key: s.key,
        label: s.label,
      })),
    });
    setFormOpen(true);
  };

  const handleView = async (templateId) => {
    try {
      const data = await getTemplateById(templateId);
      setViewingTemplate(normalizeTemplate(data, defaultTemplateId));
    } catch (err) {
      setPageError(err.message || "Failed to load template details.");
    }
  };

  const handleSetDefault = async (templateId) => {
    try {
      await setDefaultTemplate(templateId);
      setDefaultTemplateIdState(templateId);
      const nextDefaultTemplate =
        [...systemTemplates, ...customTemplates].find((template) => template.id === templateId) ||
        null;

      setSystemTemplates((prev) =>
        prev.map((t) => ({ ...t, isDefault: t.id === templateId }))
      );
      setCustomTemplates((prev) =>
        prev.map((t) => ({ ...t, isDefault: t.id === templateId }))
      );

      setViewingTemplate((prev) =>
        prev ? { ...prev, isDefault: prev.id === templateId } : prev
      );

      if (nextDefaultTemplate) {
        saveDefaultTemplateSnapshot({ ...nextDefaultTemplate, isDefault: true });
      }
    } catch (err) {
      setPageError(err.message || "Failed to set default template.");
    }
  };

  const handleDelete = async (template) => {
    const confirmed = window.confirm(`Delete "${template.name}"?`);
    if (!confirmed) return;

    try {
      await deleteTemplate(template.id);
      setCustomTemplates((prev) =>
        prev.filter((item) => item.id !== template.id)
      );

      if (defaultTemplateId === template.id) {
        setDefaultTemplateIdState(null);
        clearDefaultTemplateSnapshot();
      }
    } catch (err) {
      setPageError(err.message || "Failed to delete template.");
    }
  };

  const addSection = (section) => {
    const exists = form.sections.some((item) => item.key === section.key);
    if (exists) return;

    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          key: section.key,
          label: section.label,
        },
      ],
    }));
  };

  const removeSection = (key) => {
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((item) => item.key !== key),
    }));
  };

  const moveSection = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.sections.length) return;

    const nextSections = [...form.sections];
    const temp = nextSections[index];
    nextSections[index] = nextSections[nextIndex];
    nextSections[nextIndex] = temp;

    setForm((prev) => ({
      ...prev,
      sections: nextSections,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Template name is required.");
      return;
    }

    if (!form.sections.length) {
      setFormError("Please add at least one section.");
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayloadFromForm(form);

      if (editingTemplate) {
        const res = await updateTemplate(editingTemplate.id, payload);
        const updated = normalizeTemplate(res.template, defaultTemplateId);

        setCustomTemplates((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );

        if (updated.id === defaultTemplateId) {
          saveDefaultTemplateSnapshot({ ...updated, isDefault: true });
        }

        setViewingTemplate((prev) =>
          prev && prev.id === updated.id ? updated : prev
        );
      } else {
        const res = await createTemplate(payload);
        const created = normalizeTemplate(res.template, defaultTemplateId);
        setCustomTemplates((prev) => [created, ...prev]);
      }

      setFormOpen(false);
      setEditingTemplate(null);
    } catch (err) {
      setFormError(err.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="templates-page">
      <div className="templates-toolbar templates-toolbar-single">
        <div className="templates-search-wrap">
          <div className="templates-search">
            <i className="bi bi-search" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or section"
            />
          </div>
        </div>
      </div>

      {pageError ? (
        <div className="templates-alert">
          <i className="bi bi-exclamation-circle" />
          <span>{pageError}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="templates-loading">
          <div className="templates-spinner" />
          <div className="templates-loading-text">Loading templates...</div>
        </div>
      ) : (
        <>
          <section className="templates-section">
            <div className="templates-section-head">
              <div>
                <h3>Default Template</h3>
                <p>Used as the main starting template for this user.</p>
              </div>
            </div>

            <div className="templates-default-wrap">
              {defaultTemplate ? (
                <TemplateCard
                  template={defaultTemplate}
                  featured
                  onView={() => handleView(defaultTemplate.id)}
                  onSetDefault={() => handleSetDefault(defaultTemplate.id)}
                />
              ) : (
                <div className="templates-empty">
                  <div className="templates-empty-title">
                    No default template selected
                  </div>
                  <div className="templates-empty-text">
                    Choose any template below and set it as default.
                  </div>
                </div>
              )}
            </div>
          </section>

          <TemplateGroupSection
            title="General Templates"
            subtitle="SOAP notes, comprehensive notes, follow-up notes, physical exam, clinic notes, and common templates."
            templates={groupedSystem.general}
            onView={handleView}
            onSetDefault={handleSetDefault}
          />

          <TemplateGroupSection
            title="Hospital / OPD Templates"
            subtitle="Hospital notes, admission notes, discharge templates, and outpatient visit templates."
            templates={groupedSystem.hospital}
            onView={handleView}
            onSetDefault={handleSetDefault}
          />

          <TemplateGroupSection
            title="Emergency / Procedure Templates"
            subtitle="Emergency notes, procedure notes, post-procedure instructions, and prescription templates."
            templates={groupedSystem.emergency}
            onView={handleView}
            onSetDefault={handleSetDefault}
          />

          <TemplateGroupSection
            title="Specialty Templates"
            subtitle="Cardiology, neurology, dermatology, rheumatology, endocrinology, pulmonary, and more."
            templates={groupedSystem.specialty}
            onView={handleView}
            onSetDefault={handleSetDefault}
          />

          {groupedSystem.others.length ? (
            <TemplateGroupSection
              title="Other Templates"
              subtitle="Additional templates that do not fall into the main grouped categories."
              templates={groupedSystem.others}
              onView={handleView}
              onSetDefault={handleSetDefault}
            />
          ) : null}

          <section className="templates-section">
            <div className="templates-section-head templates-section-head-row">
              <div>
                <h3>Custom Templates</h3>
                <p>Private templates visible only to the logged-in user.</p>
              </div>

              <button
                className="templates-secondary-btn"
                type="button"
                onClick={openCreateModal}
              >
                <i className="bi bi-plus-lg" />
                <span>Create Template</span>
              </button>
            </div>

            <div className="templates-grid">
              {filteredCustom.length ? (
                filteredCustom.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    custom
                    onView={() => handleView(template.id)}
                    onEdit={() => openEditModal(template)}
                    onDelete={() => handleDelete(template)}
                    onSetDefault={() => handleSetDefault(template.id)}
                  />
                ))
              ) : (
                <div className="templates-empty">
                  <div className="templates-empty-title">
                    No custom templates yet
                  </div>
                  <div className="templates-empty-text">
                    Create your first private template for your workflow.
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="templates-note">
            <i className="bi bi-shield-lock" />
            <span>
              System templates are shared. Custom templates are private to each
              user.
            </span>
          </div>
        </>
      )}

      {viewingTemplate ? (
        <Modal
          title="Template Preview"
          size="md"
          onClose={() => setViewingTemplate(null)}
        >
          <div className="template-view-head">
            <div>
              <div className="template-view-name">{viewingTemplate.name}</div>
              <div className="template-view-badges">
                <span
                  className={`template-chip ${
                    viewingTemplate.type === "system" ? "system" : "custom"
                  }`}
                >
                  {viewingTemplate.type === "system" ? "System" : "Custom"}
                </span>
                <span className="template-chip subtle">
                  {viewingTemplate.category}
                </span>
                {viewingTemplate.isDefault ? (
                  <span className="template-chip default">Default</span>
                ) : null}
              </div>
            </div>
          </div>

          {viewingTemplate.description ? (
            <p className="template-view-description">
              {viewingTemplate.description}
            </p>
          ) : null}

          <div className="template-view-sections">
            {viewingTemplate.sections.length ? (
              viewingTemplate.sections.map((section, index) => (
                <div
                  className="template-view-section-row"
                  key={`${section.key}-${index}`}
                >
                  <span>{section.label}</span>
                </div>
              ))
            ) : (
              <div className="templates-empty-text">No sections available.</div>
            )}
          </div>

          <div className="template-modal-actions">
            <button
              className="templates-btn ghost"
              onClick={() => setViewingTemplate(null)}
            >
              Close
            </button>

            {!viewingTemplate.isDefault ? (
              <button
                className="templates-btn primary"
                onClick={async () => {
                  await handleSetDefault(viewingTemplate.id);
                  setViewingTemplate((prev) =>
                    prev ? { ...prev, isDefault: true } : prev
                  );
                }}
              >
                Set as Default
              </button>
            ) : null}
          </div>
        </Modal>
      ) : null}

      {formOpen ? (
        <Modal
          title={editingTemplate ? "Edit Template" : "Create Template"}
          size="lg"
          onClose={() => {
            if (!saving) {
              setFormOpen(false);
              setEditingTemplate(null);
              setFormError("");
            }
          }}
        >
          <form className="template-form" onSubmit={handleSubmit}>
            {formError ? (
              <div className="template-form-error">{formError}</div>
            ) : null}

            <div className="template-form-grid">
              <div className="template-field">
                <label>Template Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter template name"
                />
              </div>

              <div className="template-field">
                <label>Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="general"
                />
              </div>
            </div>

            <div className="template-field">
              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Add a short description"
              />
            </div>

            <div className="template-builder">
              <div className="template-builder-column">
                <div className="template-builder-title">Available Sections</div>
                <div className="template-library-list">
                  {SECTION_LIBRARY.map((section) => {
                    const exists = form.sections.some(
                      (item) => item.key === section.key
                    );

                    return (
                      <button
                        type="button"
                        key={section.key}
                        className={`template-library-item ${
                          exists ? "disabled" : ""
                        }`}
                        onClick={() => addSection(section)}
                        disabled={exists}
                      >
                        <span>{section.label}</span>
                        <i className="bi bi-plus-lg" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="template-builder-column selected">
                <div className="template-builder-title">Selected Sections</div>

                {!form.sections.length ? (
                  <div className="template-builder-empty">
                    No sections selected yet.
                  </div>
                ) : (
                  <div className="template-selected-list">
                    {form.sections.map((section, index) => (
                      <div
                        className="template-selected-item"
                        key={`${section.key}-${index}`}
                      >
                        <div className="template-selected-info">
                          <div className="template-selected-name">
                            {section.label}
                          </div>
                        </div>

                        <div className="template-selected-actions">
                          <button
                            type="button"
                            className="template-icon-btn"
                            onClick={() => moveSection(index, -1)}
                            title="Move up"
                          >
                            <i className="bi bi-arrow-up" />
                          </button>
                          <button
                            type="button"
                            className="template-icon-btn"
                            onClick={() => moveSection(index, 1)}
                            title="Move down"
                          >
                            <i className="bi bi-arrow-down" />
                          </button>
                          <button
                            type="button"
                            className="template-icon-btn danger"
                            onClick={() => removeSection(section.key)}
                            title="Remove"
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="template-modal-actions">
              <button
                type="button"
                className="templates-btn ghost"
                onClick={() => {
                  if (!saving) {
                    setFormOpen(false);
                    setEditingTemplate(null);
                    setFormError("");
                  }
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="templates-btn primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingTemplate
                  ? "Update Template"
                  : "Create Template"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function TemplateGroupSection({
  title,
  subtitle,
  templates,
  onView,
  onSetDefault,
}) {
  return (
    <section className="templates-section">
      <div className="templates-section-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="templates-grid">
        {templates.length ? (
          templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onView={() => onView(template.id)}
              onSetDefault={() => onSetDefault(template.id)}
            />
          ))
        ) : (
          <div className="templates-empty">
            <div className="templates-empty-title">No templates found</div>
            <div className="templates-empty-text">
              No matching templates in this group.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TemplateCard({
  template,
  featured = false,
  custom = false,
  onView,
  onEdit,
  onDelete,
  onSetDefault,
}) {
  return (
    <div className={`template-card ${featured ? "featured" : ""}`}>
      <div className="template-card-top">
        <div className="template-card-top-left">
          <div className="template-card-title-row">
            <h4 className="template-card-title">{template.name}</h4>
            {template.isDefault ? (
              <span className="template-chip default">Default</span>
            ) : null}
          </div>

          <div className="template-card-badges">
            <span
              className={`template-chip ${
                template.type === "system" ? "system" : "custom"
              }`}
            >
              {template.type === "system" ? "System" : "Custom"}
            </span>
            <span className="template-chip subtle">{template.category}</span>
          </div>
        </div>

        <div className="template-card-icon">
          <i className="bi bi-file-earmark-medical" />
        </div>
      </div>

      <div className="template-card-description">
        {template.description || "Structured medical template."}
      </div>

      <div className="template-card-actions">
        <div className="template-card-actions-left">
          <button className="templates-btn ghost" onClick={onView}>
            View
          </button>

          {!template.isDefault ? (
            <button className="templates-btn soft" onClick={onSetDefault}>
              Set Default
            </button>
          ) : null}
        </div>

        {custom ? (
          <div className="template-card-actions-right">
            <button className="template-icon-btn" onClick={onEdit} title="Edit">
              <i className="bi bi-pencil-square" />
            </button>
            <button
              className="template-icon-btn danger"
              onClick={onDelete}
              title="Delete"
            >
              <i className="bi bi-trash3" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose, size = "md" }) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div
        className={`template-modal ${size === "lg" ? "large" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="template-modal-header">
          <div className="template-modal-title">{title}</div>
          <button
            className="template-close-btn"
            type="button"
            onClick={onClose}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="template-modal-body">{children}</div>
      </div>
    </div>
  );
}
