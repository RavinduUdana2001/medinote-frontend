import { api } from "./axios";

export async function getMyProfile() {
  const res = await api.get("/profile/me");
  return res.data;
}

export async function updateMyProfile(payload) {
  const res = await api.put("/profile/update", payload);
  return res.data;
}

export async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post("/profile/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function updateOnboarding(payload) {
  const res = await api.put("/profile/onboarding", payload);
  return res.data;
}
