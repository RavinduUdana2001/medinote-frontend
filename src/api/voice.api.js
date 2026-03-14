import { api } from "./axios";

export async function transcribeVoice(audioFile, options = {}) {
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("mode", options.mode || "translate");
  if (options.captureMode) {
    formData.append("captureMode", options.captureMode);
  }
  if (options.preferredLanguageCode) {
    formData.append("preferredLanguageCode", options.preferredLanguageCode);
  }
  if (options.durationSeconds) {
    formData.append("durationSeconds", String(options.durationSeconds));
  }
  if (options.enableDiarization) {
    formData.append("enableDiarization", "true");
  }
  if (options.numSpeakers) {
    formData.append("numSpeakers", String(options.numSpeakers));
  }

  const res = await api.post("/voice/transcribe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 900000,
  });

  return res.data;
}
