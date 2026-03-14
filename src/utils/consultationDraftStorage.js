const DRAFT_KEY = "medinote_consultation_draft";

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function titleCase(value = "") {
  return String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function joinList(items = []) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatContent(lines, format) {
  const cleanLines = lines.filter(Boolean);

  if (!cleanLines.length) return "";

  if (format === "bullet") {
    return cleanLines.map((line) => `- ${line}`).join("\n");
  }

  if (format === "summary") {
    return cleanLines.join(" ");
  }

  return cleanLines.join("\n");
}

function buildPatientSummary(patient) {
  if (!patient) return "Patient demographics were not added yet.";

  const parts = [
    patient.name && `Name: ${patient.name}`,
    patient.age && `Age: ${patient.age}`,
    patient.gender && `Gender: ${patient.gender}`,
    patient.phone && `Phone: ${patient.phone}`,
    patient.nic && `Identifier: ${patient.nic}`,
  ].filter(Boolean);

  return parts.length
    ? parts.join(" | ")
    : "Patient demographics were not added yet.";
}

function buildSectionContent({
  sectionKey,
  sectionLabel,
  patient,
  selectedSymptoms,
  doctorNote,
  transcriptText,
  templateName,
  toneLead,
  focusLabel,
  outputFormat,
}) {
  const symptomText = selectedSymptoms.length
    ? joinList(selectedSymptoms)
    : "general review symptoms";

  const normalizedKey = String(sectionKey || "")
    .trim()
    .toLowerCase();

  switch (normalizedKey) {
    case "patient_info":
      return formatContent(
        [
          buildPatientSummary(patient),
          patient?.allergies ? `Allergies: ${patient.allergies}` : "Allergies not provided in this consultation draft.",
        ],
        outputFormat
      );
    case "chief_complaint":
      return formatContent(
        [
          `Primary concerns discussed: ${symptomText}.`,
          doctorNote.trim() || "Chief complaint summary can be refined after final review.",
        ],
        outputFormat
      );
    case "hpi":
    case "history_of_present_illness":
      return formatContent(
        [
          `Visit type: ${focusLabel}.`,
          transcriptText,
        ],
        outputFormat
      );
    case "pmh":
      return formatContent(
        [
          "Past medical history was not specifically captured in the current intake.",
          "Add chronic conditions or major diagnoses during final review if needed.",
        ],
        outputFormat
      );
    case "psh":
      return formatContent(
        [
          "Past surgical history was not specifically captured in the current intake.",
        ],
        outputFormat
      );
    case "medications_allergies":
      return formatContent(
        [
          patient?.allergies ? `Documented allergies: ${patient.allergies}.` : "No allergy details provided.",
          "Medication list can be added during final clinical review.",
        ],
        outputFormat
      );
    case "family_history":
      return formatContent(
        [
          "Family history was not specifically discussed in this consultation draft.",
        ],
        outputFormat
      );
    case "social_history":
      return formatContent(
        [
          "Social history details were not specifically captured in the current intake.",
        ],
        outputFormat
      );
    case "ros":
      return formatContent(
        [
          `Review centered around: ${symptomText}.`,
          "Additional systems can be expanded during final documentation.",
        ],
        outputFormat
      );
    case "physical_exam":
      return formatContent(
        [
          "Physical examination findings are pending clinician confirmation.",
        ],
        outputFormat
      );
    case "vitals":
      return formatContent(
        [
          "Vital signs were not entered in this draft.",
        ],
        outputFormat
      );
    case "assessment":
      return formatContent(
        [
          `Current picture is most consistent with a working assessment based on ${symptomText}.`,
          toneLead,
        ],
        outputFormat
      );
    case "diagnosis":
      return formatContent(
        [
          "Final diagnosis should be confirmed after clinical review.",
        ],
        outputFormat
      );
    case "plan":
      return formatContent(
        [
          "Review transcript, confirm exam details, and finalize medication or follow-up instructions.",
          "Adjust wording to reflect the final diagnosis and management plan.",
        ],
        outputFormat
      );
    case "patient_instructions":
      return formatContent(
        [
          "Add home-care, medication, and warning-sign instructions before finalizing.",
        ],
        outputFormat
      );
    case "follow_up":
      return formatContent(
        [
          "Confirm review timeline and return precautions before completing the note.",
        ],
        outputFormat
      );
    default:
      return formatContent(
        [
          `${sectionLabel || "Section"} prepared from template ${templateName}.`,
          transcriptText,
        ],
        outputFormat
      );
  }
}

export function saveConsultationDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function getConsultationDraft() {
  return safeParse(sessionStorage.getItem(DRAFT_KEY));
}

export function clearConsultationDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function buildGeneratedConsultationDraft({
  patient,
  selectedSymptoms = [],
  doctorNote = "",
  transcript = "",
  speakerEntries = [],
  selectedTemplate = null,
  tone = "professional",
  outputFormat = "paragraph",
  visitFocus = "follow_up",
}) {
  const templateName = selectedTemplate?.name || "General SOAP Template";
  const patientName = patient?.name?.trim() || "Walk-in Patient";
  const agePart = patient?.age ? `${patient.age}-year-old` : "Adult";
  const genderPart = patient?.gender ? patient.gender.toLowerCase() : "patient";
  const symptomText = selectedSymptoms.length
    ? joinList(selectedSymptoms)
    : "general review symptoms";
  const transcriptText =
    transcript.trim() ||
    `Patient discussed ${symptomText}. ${doctorNote.trim() || "Clinician requested a concise chart-ready note."}`;

  const focusLabel = titleCase(visitFocus);
  const toneLead =
    tone === "casual"
      ? "Keep wording approachable while preserving clinical meaning."
      : tone === "formal"
      ? "Use polished clinical language suitable for formal documentation."
      : "Maintain a clear professional clinical tone.";

  const templateSections = Array.isArray(selectedTemplate?.sections)
    ? selectedTemplate.sections.filter((section) => section?.key && section?.label && section.enabled !== false)
    : [];

  const sections = (templateSections.length
    ? templateSections
    : [
        { key: "subjective", label: "Subjective" },
        { key: "objective", label: "Objective" },
        { key: "assessment", label: "Assessment" },
        { key: "plan", label: "Plan" },
      ]
  ).map((section) => ({
    key: section.key,
    label: section.label,
    content: buildSectionContent({
      sectionKey: section.key,
      sectionLabel: section.label,
      patient,
      selectedSymptoms,
      doctorNote,
      transcriptText,
      templateName,
      toneLead,
      focusLabel,
      outputFormat,
    }),
  }));

  return {
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
    patient: patient || null,
    selectedSymptoms,
    doctorNote,
    transcript: transcriptText,
    speakerEntries,
    selectedTemplate,
    tone,
    outputFormat,
    visitFocus,
    title: "Generated Consultation Note",
    summary: `${patientName} • ${focusLabel} • ${templateName}`,
    sections,
  };
}
