const DEFAULT_TEMPLATE_KEY = "medinote_default_template";

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getDefaultTemplateSnapshot() {
  return safeParse(localStorage.getItem(DEFAULT_TEMPLATE_KEY));
}

export function saveDefaultTemplateSnapshot(template) {
  if (!template) return;
  localStorage.setItem(DEFAULT_TEMPLATE_KEY, JSON.stringify(template));
}

export function clearDefaultTemplateSnapshot() {
  localStorage.removeItem(DEFAULT_TEMPLATE_KEY);
}
