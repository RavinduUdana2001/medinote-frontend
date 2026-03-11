import { api } from "./axios";

export async function changePassword(payload) {
  const res = await api.put("/settings/change-password", payload);
  return res.data;
}

export async function getPrivacyStatus() {
  const res = await api.get("/settings/privacy-status");
  return res.data;
}

export async function contactSupport(payload) {
  const res = await api.post("/settings/contact-support", payload);
  return res.data;
}

export async function deleteAccount(payload) {
  const res = await api.delete("/settings/delete-account", {
    data: payload,
  });
  return res.data;
}