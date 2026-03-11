import { api } from "./axios";

export async function getTemplates() {
  const res = await api.get("/templates");
  return res.data;
}

export async function getTemplateById(templateId) {
  const res = await api.get(`/templates/${templateId}`);
  return res.data;
}

export async function createTemplate(payload) {
  const res = await api.post("/templates", payload);
  return res.data;
}

export async function updateTemplate(templateId, payload) {
  const res = await api.put(`/templates/${templateId}`, payload);
  return res.data;
}

export async function deleteTemplate(templateId) {
  const res = await api.delete(`/templates/${templateId}`);
  return res.data;
}

export async function setDefaultTemplate(templateId) {
  const res = await api.post(`/templates/${templateId}/set-default`);
  return res.data;
}