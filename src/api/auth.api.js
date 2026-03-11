import { api } from "./axios";

export async function signup(payload) {
  const res = await api.post("/auth/signup", payload);
  return res.data;
}

export async function verifyEmail(payload) {
  const res = await api.post("/auth/verify-email", payload);
  return res.data;
}

export async function resendOtp(payload) {
  const res = await api.post("/auth/resend-otp", payload);
  return res.data;
}

export async function login(payload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function forgotPassword(payload) {
  const res = await api.post("/auth/forgot-password", payload);
  return res.data;
}

export async function resendResetOtp(payload) {
  const res = await api.post("/auth/resend-reset-otp", payload);
  return res.data;
}

export async function resetPassword(payload) {
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
}