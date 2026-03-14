import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getTemplates } from "../api/templates.api";
import { transcribeVoice } from "../api/voice.api";
import {
  clearDefaultTemplateSnapshot,
  getDefaultTemplateSnapshot,
  saveDefaultTemplateSnapshot,
} from "../utils/defaultTemplateStorage";
import {
  buildGeneratedConsultationDraft,
  saveConsultationDraft,
} from "../utils/consultationDraftStorage";

const CAPTURE_MODES = [
  {
    key: "dictate",
    label: "Dictate",
    description: "Capture a solo clinician dictation locally in the browser.",
  },
  {
    key: "transcribe",
    label: "Transcribe",
    description:
      "Capture a longer consultation conversation locally in the browser.",
  },
];

const TONE_OPTIONS = [
  { key: "professional", label: "Professional" },
  { key: "formal", label: "Formal" },
  { key: "casual", label: "Casual" },
];

const FORMAT_OPTIONS = [
  { key: "paragraph", label: "Paragraph" },
  { key: "bullet", label: "Bullet Point" },
  { key: "summary", label: "Summary" },
];

const FOCUS_OPTIONS = [
  { key: "follow_up", label: "Follow-Up" },
  { key: "new_case", label: "New Case" },
  { key: "review", label: "Clinical Review" },
];

const SYMPTOM_TOPICS = [
  {
    key: "constitutional",
    label: "Constitutional",
    symptoms: [
      "Fever",
      "Chills",
      "Fatigue",
      "Weight changes",
      "Night sweats",
      "Appetite loss",
      "Insomnia",
    ],
  },
  {
    key: "eyes",
    label: "Eyes",
    symptoms: [
      "Blurry vision",
      "Eye pain",
      "Redness",
      "Discharge",
      "Floaters",
      "Dryness",
    ],
  },
  {
    key: "ent",
    label: "ENT",
    symptoms: [
      "Hearing loss",
      "Ear pain",
      "Nasal congestion",
      "Sore throat",
      "Nosebleeds",
      "Sinus pain",
    ],
  },
  {
    key: "cardiovascular",
    label: "Cardiovascular",
    symptoms: [
      "Chest pain",
      "Palpitations",
      "Edema",
      "Shortness of breath",
      "Orthopnea",
      "Claudication",
    ],
  },
  {
    key: "respiratory",
    label: "Respiratory",
    symptoms: [
      "Cough",
      "Wheezing",
      "Shortness of breath",
      "Hemoptysis",
      "Chest tightness",
      "Pleuritic pain",
    ],
  },
  {
    key: "gastrointestinal",
    label: "Gastrointestinal",
    symptoms: [
      "Nausea/vomiting",
      "Abdominal pain",
      "Diarrhea",
      "Constipation",
      "Rectal bleeding",
      "Heartburn",
      "Difficulty swallowing",
    ],
  },
  {
    key: "genitourinary",
    label: "Genitourinary",
    symptoms: [
      "Dysuria",
      "Frequency",
      "Urgency",
      "Hematuria",
      "Incontinence",
      "Weak stream",
    ],
  },
  {
    key: "musculoskeletal",
    label: "Musculoskeletal",
    symptoms: [
      "Joint pain",
      "Muscle aches",
      "Stiffness",
      "Back pain",
      "Swelling",
      "Weakness",
    ],
  },
  {
    key: "skin",
    label: "Skin",
    symptoms: [
      "Rash",
      "Itching",
      "Lumps",
      "Dryness",
      "Color changes",
      "Bruising",
    ],
  },
  {
    key: "neurological",
    label: "Neurological",
    symptoms: [
      "Headache",
      "Dizziness",
      "Numbness",
      "Tingling",
      "Weakness",
      "Fainting",
    ],
  },
  {
    key: "psychiatric",
    label: "Psychiatric",
    symptoms: [
      "Depression",
      "Anxiety",
      "Insomnia",
      "Memory loss",
      "Irritability",
      "Hallucinations",
    ],
  },
  {
    key: "endocrine",
    label: "Endocrine",
    symptoms: [
      "Heat intolerance",
      "Cold intolerance",
      "Thirst",
      "Frequent urination",
      "Sweating",
      "Hair loss",
    ],
  },
  {
    key: "hematologic_lymphatic",
    label: "Hematologic/Lymphatic",
    symptoms: [
      "Easy bruising",
      "Bleeding",
      "Lymph swelling",
      "Anemia symptoms",
      "Fatigue",
      "Infections",
    ],
  },
  {
    key: "allergic_immunologic",
    label: "Allergic/Immunologic",
    symptoms: ["Hives", "Itching", "Swelling", "Runny nose", "Sneezing"],
  },
];

function formatRecordingTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function mergeFloat32Chunks(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function downsampleToRate(samples, sourceRate, targetRate) {
  if (!samples.length || sourceRate === targetRate) {
    return samples;
  }

  const sampleRateRatio = sourceRate / targetRate;
  const newLength = Math.max(1, Math.round(samples.length / sampleRateRatio));
  const result = new Float32Array(newLength);

  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.min(
      samples.length,
      Math.round((offsetResult + 1) * sampleRateRatio),
    );

    let accumulated = 0;
    let count = 0;

    for (let i = offsetBuffer; i < nextOffsetBuffer; i += 1) {
      accumulated += samples[i];
      count += 1;
    }

    result[offsetResult] = count > 0 ? accumulated / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function encodeWav(samples, sampleRate) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  function writeString(offset, value) {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(
      offset,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function normalizeSamples(samples, targetPeak = 0.92) {
  if (!samples.length) return samples;

  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const amplitude = Math.abs(samples[index]);
    if (amplitude > peak) peak = amplitude;
  }

  if (!peak || peak >= targetPeak) return samples;

  const scale = targetPeak / peak;
  const normalized = new Float32Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    normalized[index] = Math.max(
      -1,
      Math.min(1, samples[index] * scale),
    );
  }

  return normalized;
}

export default function ConsultationPage() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    nic: "",
    allergies: "",
    notes: "",
  });

  const [selectedTopic, setSelectedTopic] = useState(SYMPTOM_TOPICS[0].key);
  const [selectedSymptoms, setSelectedSymptoms] = useState(["Fever", "Cough"]);
  const [tone, setTone] = useState("professional");
  const [outputFormat, setOutputFormat] = useState("paragraph");
  const [visitFocus, setVisitFocus] = useState("follow_up");
  const [doctorNote, setDoctorNote] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    getDefaultTemplateSnapshot(),
  );
  const [templateLoading, setTemplateLoading] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [captureMode, setCaptureMode] = useState("dictate");
  const [recordingSupported, setRecordingSupported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.AudioContext || window.webkitAudioContext) &&
      !!navigator.mediaDevices?.getUserMedia,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState(
    "Ready to record. Stop anytime and the audio will be translated to English.",
  );
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const processorNodeRef = useRef(null);
  const silentGainRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingPausedRef = useRef(false);
  const sourceSampleRateRef = useRef(16000);
  const recordingIntervalRef = useRef(null);
  const recordingStartedAtRef = useRef(null);
  const accumulatedRecordingMsRef = useRef(0);

  const currentTopic = useMemo(
    () =>
      SYMPTOM_TOPICS.find((topic) => topic.key === selectedTopic) ||
      SYMPTOM_TOPICS[0],
    [selectedTopic],
  );

  const selectedCaptureMode = useMemo(
    () =>
      CAPTURE_MODES.find((mode) => mode.key === captureMode) ||
      CAPTURE_MODES[0],
    [captureMode],
  );
  const showTranscriptPanel = Boolean(transcript.trim());

  const stopRecordingTicker = () => {
    if (recordingIntervalRef.current) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const getLiveRecordingMs = () => {
    const elapsedSinceResume = recordingStartedAtRef.current
      ? Date.now() - recordingStartedAtRef.current
      : 0;

    return accumulatedRecordingMsRef.current + elapsedSinceResume;
  };

  const syncRecordingClock = () => {
    setRecordingSeconds(Math.max(0, Math.floor(getLiveRecordingMs() / 1000)));
  };

  const startRecordingTicker = () => {
    stopRecordingTicker();
    recordingIntervalRef.current = window.setInterval(syncRecordingClock, 250);
  };

  const cleanupMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  useEffect(() => {
    if (showPatientModal) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [showPatientModal]);

  useEffect(() => {
    const loadDefaultTemplate = async () => {
      try {
        setTemplateLoading(true);
        const data = await getTemplates();
        const allTemplates = [
          ...(data.systemTemplates || []),
          ...(data.customTemplates || []),
        ];
        const defaultTemplate =
          allTemplates.find(
            (template) => template.id === data.defaultTemplateId,
          ) || null;

        if (defaultTemplate) {
          const normalizedTemplate = {
            id: defaultTemplate.id,
            name: defaultTemplate.name,
            description: defaultTemplate.description || "",
            category: defaultTemplate.category || "general",
            visibility: defaultTemplate.visibility,
            contentJson: defaultTemplate.contentJson || { sections: [] },
            sections: Array.isArray(defaultTemplate.contentJson?.sections)
              ? defaultTemplate.contentJson.sections
              : [],
            isDefault: true,
          };

          setSelectedTemplate(normalizedTemplate);
          saveDefaultTemplateSnapshot(normalizedTemplate);
        } else {
          setSelectedTemplate(null);
          clearDefaultTemplateSnapshot();
        }
      } catch (error) {
        console.error("[consultation] Failed to load default template:", error);
      } finally {
        setTemplateLoading(false);
      }
    };

    loadDefaultTemplate();
  }, []);

  useEffect(() => {
    setRecordingSupported(
      typeof window !== "undefined" &&
        !!(window.AudioContext || window.webkitAudioContext) &&
        !!navigator.mediaDevices?.getUserMedia,
    );
  }, []);

  const cleanupAudioProcessing = async () => {
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current.onaudioprocess = null;
      processorNodeRef.current = null;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (silentGainRef.current) {
      silentGainRef.current.disconnect();
      silentGainRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch (error) {
        console.error("[voice][frontend] Failed to close AudioContext", error);
      }
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopRecordingTicker();
      cleanupMediaStream();
      cleanupAudioProcessing();
    };
  }, []);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom],
    );
  };

  const openPatientModal = () => {
    if (patient) setPatientForm({ ...patient });
    setShowPatientModal(true);
  };

  const closePatientModal = () => setShowPatientModal(false);

  const savePatient = () => {
    setPatient({ ...patientForm });
    setShowPatientModal(false);
  };

  const startRecording = async () => {
    if (
      !recordingSupported ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setRecordingStatus(
        "Microphone recording is not supported in this browser.",
      );
      return;
    }

    try {
      console.log("[voice][frontend] startRecording called", {
        captureMode,
      });

      await cleanupAudioProcessing();
      cleanupMediaStream();
      recordedChunksRef.current = [];
      recordingPausedRef.current = false;
      accumulatedRecordingMsRef.current = 0;
      recordingStartedAtRef.current = Date.now();
      sourceSampleRateRef.current = 16000;
      setTranscript("");
      setRecordingSeconds(0);
      setIsPaused(false);
      setIsTranscribing(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      mediaStreamRef.current = stream;
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      sourceSampleRateRef.current = audioContext.sampleRate;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const audioSource = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      processor.onaudioprocess = (event) => {
        if (recordingPausedRef.current) return;

        const inputChannel = event.inputBuffer.getChannelData(0);
        recordedChunksRef.current.push(new Float32Array(inputChannel));
      };

      audioSource.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);

      audioSourceRef.current = audioSource;
      processorNodeRef.current = processor;
      silentGainRef.current = silentGain;

      console.log("[voice][frontend] PCM recorder created", {
        sampleRate: audioContext.sampleRate,
        bufferSize: 4096,
      });

      setIsRecording(true);
      setRecordingStatus(
        captureMode === "dictate"
          ? "Dictation recording started. You can pause, resume, or stop at any time."
          : "Conversation recording started. Pause or stop whenever the consultation is complete.",
      );
      startRecordingTicker();
    } catch (error) {
      console.error("[voice][frontend] Failed to start recording:", error);
      await cleanupAudioProcessing();
      cleanupMediaStream();
      stopRecordingTicker();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingStatus(
        "Microphone access was blocked or unavailable. Please allow access and try again.",
      );
    }
  };

  const pauseRecording = () => {
    if (!isRecording || isPaused) return;

    if (recordingStartedAtRef.current) {
      accumulatedRecordingMsRef.current +=
        Date.now() - recordingStartedAtRef.current;
      recordingStartedAtRef.current = null;
    }

    recordingPausedRef.current = true;
    syncRecordingClock();
    stopRecordingTicker();
    setIsPaused(true);
    setRecordingStatus(
      "Recording paused. Resume when you are ready to continue.",
    );

    console.log("[voice][frontend] recording paused");
  };

  const resumeRecording = async () => {
    if (!isRecording || !isPaused) return;

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    recordingPausedRef.current = false;
    recordingStartedAtRef.current = Date.now();
    startRecordingTicker();
    setIsPaused(false);
    setRecordingStatus(
      captureMode === "dictate"
        ? "Dictation recording resumed."
        : "Conversation recording resumed.",
    );

    console.log("[voice][frontend] recording resumed");
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    console.log("[voice][frontend] stopRecording called", {
      chunksSoFar: recordedChunksRef.current.length,
    });

    setRecordingStatus("Stopping recording and preparing audio...");

    try {
      if (recordingStartedAtRef.current) {
        accumulatedRecordingMsRef.current +=
          Date.now() - recordingStartedAtRef.current;
        recordingStartedAtRef.current = null;
      }

      recordingPausedRef.current = true;
      stopRecordingTicker();
      syncRecordingClock();

      const mergedSamples = mergeFloat32Chunks(recordedChunksRef.current);
      const downsampledSamples = downsampleToRate(
        mergedSamples,
        sourceSampleRateRef.current,
        16000,
      );
      const normalizedSamples = normalizeSamples(downsampledSamples);

      console.log("[voice][frontend] final PCM audio", {
        sourceSampleRate: sourceSampleRateRef.current,
        outputSampleRate: 16000,
        originalSampleCount: mergedSamples.length,
        downsampledSampleCount: downsampledSamples.length,
        sampleCount: normalizedSamples.length,
        chunks: recordedChunksRef.current.length,
      });

      await cleanupAudioProcessing();
      cleanupMediaStream();

      if (!normalizedSamples.length) {
        setRecordingStatus(
          "Recording stopped, but no audio samples were captured. Please try again.",
        );
        return;
      }

      const audioBlob = encodeWav(normalizedSamples, 16000);
      const durationSeconds = Number(
        (normalizedSamples.length / 16000).toFixed(2),
      );

      console.log("[voice][frontend] final WAV blob", {
        size: audioBlob.size,
        type: audioBlob.type,
        durationSeconds,
      });

      if (!audioBlob.size || audioBlob.size <= 0) {
        setRecordingStatus(
          "Recording produced an empty WAV file. Please record again.",
        );
        return;
      }

      setRecordingStatus(
        durationSeconds > 30
          ? "Long recording detected. Processing the audio now. This can take a little longer."
          : "Uploading audio for transcription...",
      );
      setIsTranscribing(true);

      const audioFile = new File(
        [audioBlob],
        `consultation-${Date.now()}.wav`,
        {
          type: "audio/wav",
        },
      );
      const transcription = await transcribeVoice(audioFile, {
        mode: "translate",
        captureMode,
        preferredLanguageCode: captureMode === "dictate" ? "en-IN" : "unknown",
        durationSeconds,
        enableDiarization: captureMode === "transcribe",
        numSpeakers: captureMode === "transcribe" ? 2 : undefined,
      });

      setTranscript(transcription.transcript || "");
      setRecordingStatus(
        captureMode === "transcribe"
          ? "Conversation transcript ready. Review the full text on the right."
          : "Transcription complete. Review and edit the text on the right.",
      );
    } catch (error) {
      console.error("[voice][frontend] stopRecording failed", error);
      setRecordingStatus(
        error?.message?.includes("could not detect clear speech")
          ? "Speech was not detected clearly. Try speaking a bit closer to the mic. English dictation mode now retries automatically."
          : error?.message ||
          "Recording was saved, but transcription failed. Please try again.",
      );
    } finally {
      setIsTranscribing(false);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const generateNote = () => {
    const draft = buildGeneratedConsultationDraft({
      patient,
      selectedSymptoms,
      doctorNote,
      transcript,
      selectedTemplate,
      tone,
      outputFormat,
      visitFocus,
    });

    setIsGenerating(true);

    window.setTimeout(() => {
      saveConsultationDraft(draft);
      setTranscript("");
      setRecordingStatus(
        "Ready to record. Stop anytime and the audio will be translated to English.",
      );
      navigate("/app/consultation/output");
    }, 650);
  };

  return (
    <div className="consult-page consult-page-single">
      <div className="consult-single-column">
        <div className="ui-card consult-card consult-card-elevated">
          <div className="consult-card-head">
            <div>
              <div className="consult-title">Patient Details</div>
              <div className="consult-sub">
                Start by entering the patient profile
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm consult-add-btn"
              type="button"
              onClick={openPatientModal}
            >
              <i className="bi bi-person-plus me-2" />
              {patient ? "Edit" : "Add"}
            </button>
          </div>

          {patient ? (
            <div className="patient-mini patient-mini-grid">
              <div className="patient-mini-row">
                <span>Name</span>
                <b>{patient.name || "-"}</b>
              </div>
              <div className="patient-mini-row">
                <span>Age</span>
                <b>{patient.age || "-"}</b>
              </div>
              <div className="patient-mini-row">
                <span>Gender</span>
                <b>{patient.gender || "-"}</b>
              </div>
              <div className="patient-mini-row">
                <span>Phone</span>
                <b>{patient.phone || "-"}</b>
              </div>
            </div>
          ) : (
            <div className="consult-empty">
              No patient added yet. Use the add button to create the patient
              profile.
            </div>
          )}
        </div>

        <div className="consult-compact-grid">
          <div className="ui-card consult-card consult-card-elevated">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Template</div>
                <div className="consult-sub">
                  Default template used for generation
                </div>
              </div>
            </div>

            {templateLoading ? (
              <div className="consult-empty">Loading default template...</div>
            ) : selectedTemplate ? (
              <div className="consult-template-compact">
                <div>
                  <div className="template-mini-title">
                    {selectedTemplate.name}
                  </div>
                  <div className="template-mini-desc">
                    {selectedTemplate.description ||
                      "Default structure ready for this note."}
                  </div>
                </div>

                <button
                  type="button"
                  className="consult-template-link"
                  onClick={() => navigate("/app/templates")}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="consult-template-empty">
                <div className="consult-empty">
                  No default template selected yet.
                </div>
                <button
                  type="button"
                  className="consult-template-link"
                  onClick={() => navigate("/app/templates")}
                >
                  Go to Templates
                </button>
              </div>
            )}
          </div>

          <div className="ui-card consult-card consult-card-elevated">
            <div className="consult-card-head">
              <div>
                <div className="consult-title">Note Preferences</div>
                <div className="consult-sub">
                  Choose the output style before generation
                </div>
              </div>
            </div>

            <PreferenceGroup
              label="Tone"
              options={TONE_OPTIONS}
              value={tone}
              onChange={setTone}
            />
            <PreferenceGroup
              label="Format"
              options={FORMAT_OPTIONS}
              value={outputFormat}
              onChange={setOutputFormat}
            />
            <PreferenceGroup
              label="Visit Type"
              options={FOCUS_OPTIONS}
              value={visitFocus}
              onChange={setVisitFocus}
            />
          </div>
        </div>

        <div className="ui-card consult-card consult-card-elevated">
          <div className="consult-card-head">
            <div>
              <div className="consult-title">Symptoms</div>
              <div className="consult-sub">
                Pick a topic first, then choose one or more symptoms
              </div>
            </div>
          </div>

          <div className="consult-symptom-topicbar">
            <label htmlFor="symptom-topic">Symptom Topic</label>
            <select
              id="symptom-topic"
              className="consult-topic-select"
              value={selectedTopic}
              onChange={(event) => setSelectedTopic(event.target.value)}
            >
              {SYMPTOM_TOPICS.map((topic) => (
                <option key={topic.key} value={topic.key}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>

          <div className="consult-symptom-layout">
            <div>
              <div className="consult-symptom-heading">
                {currentTopic.label} Symptoms
              </div>
              <div className="symptom-chips symptom-chips-large">
                {currentTopic.symptoms.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);

                  return (
                    <button
                      key={symptom}
                      type="button"
                      className={`sym-chip ${active ? "active" : ""}`}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="consult-selected-panel">
              <div className="consult-symptom-heading">Selected Symptoms</div>
              <div className="consult-selected-wrap">
                {selectedSymptoms.length ? (
                  selectedSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      type="button"
                      className="consult-selected-chip"
                      onClick={() => toggleSymptom(symptom)}
                    >
                      <span>{symptom}</span>
                      <i className="bi bi-x-lg" />
                    </button>
                  ))
                ) : (
                  <div className="consult-empty">No symptoms selected yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="ui-card consult-card consult-card-elevated">
          <div className="consult-card-head">
            <div>
              <div className="consult-title">Voice Capture</div>
              <div className="consult-sub">
                Record, process, and review the transcript in one clean workspace
              </div>
            </div>
          </div>

          <div
            className="consult-mode-toggle"
            role="tablist"
            aria-label="Voice capture mode"
          >
            {CAPTURE_MODES.map((mode) => (
              <button
                key={mode.key}
                type="button"
                className={`consult-mode-btn ${captureMode === mode.key ? "active" : ""}`}
                onClick={() => setCaptureMode(mode.key)}
                disabled={isRecording || isTranscribing}
              >
                <i
                  className={`bi ${mode.key === "dictate" ? "bi-mic-fill" : "bi-people-fill"}`}
                />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <div
            className={`consult-voice-workspace ${
              showTranscriptPanel ? "has-transcript" : "full-recorder"
            }`}
          >
            <div className="consult-recorder-panel">
              <div className="consult-recorder-state">
                <div className={`consult-recorder-badge ${captureMode}`}>
                  {captureMode === "dictate"
                    ? "Dictate Mode"
                    : "Transcribe Mode"}
                </div>

                <div className="consult-transcript-note consult-voice-mode-note">
                  {selectedCaptureMode.description}
                </div>

                <div className="consult-recorder-summary">
                  {captureMode === "dictate"
                    ? "Best for solo voice notes. Stop recording to generate editable English text."
                    : "Best for longer consultations. Stop recording to generate the full conversation transcript."}
                </div>

                <div className="consult-voice-timer">
                  {formatRecordingTime(recordingSeconds)}
                </div>

                <button
                  className={`rec-mic-btn consult-record-btn ${isRecording && !isPaused ? "recording" : ""}`}
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!recordingSupported || isTranscribing}
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                >
                  <i
                    className={`bi ${isRecording ? "bi-stop-fill" : "bi-mic-fill"}`}
                  />
                </button>

                <div className="rec-hint">
                  {isRecording
                    ? isPaused
                      ? "Recording paused"
                      : captureMode === "dictate"
                        ? "Dictation recording in progress"
                        : "Conversation recording in progress"
                    : captureMode === "dictate"
                      ? "Tap to start a local clinician dictation"
                      : "Tap to start a local consultation recording"}
                </div>

                <div className="rec-meta">
                  {isRecording
                    ? "You can pause, resume, or stop whenever needed."
                    : isTranscribing
                      ? "Your recording is being converted into text now."
                      : "Audio is uploaded only after you stop, then discarded after transcription completes."}
                </div>

                <div className="consult-voice-actions">
                  {isRecording ? (
                    isPaused ? (
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        onClick={resumeRecording}
                      >
                        <i className="bi bi-play-fill" />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        className="btn btn-light btn-sm"
                        type="button"
                        onClick={pauseRecording}
                      >
                        <i className="bi bi-pause-fill" />
                        <span>Pause</span>
                      </button>
                    )
                  ) : null}

                  <button
                    className="btn btn-light btn-sm"
                    type="button"
                    onClick={stopRecording}
                    disabled={!isRecording || isTranscribing}
                  >
                    <i className="bi bi-stop-fill" />
                    <span>Stop</span>
                  </button>

                  <button
                    className="btn btn-light btn-sm"
                    type="button"
                    onClick={startRecording}
                    disabled={isRecording || !recordingSupported || isTranscribing}
                  >
                    <i className="bi bi-arrow-repeat" />
                    <span>New Take</span>
                  </button>
                </div>

                <div
                  className={`consult-process-banner ${
                    isTranscribing
                      ? "loading"
                      : isRecording
                        ? "recording"
                        : "idle"
                  }`}
                >
                  <div className="consult-process-banner-head">
                    <div className="consult-title consult-title-small">
                      {isTranscribing
                        ? "Transcribing"
                        : isRecording
                          ? "Recording Live"
                          : "Recorder Ready"}
                    </div>
                    <span className="consult-processing-pill">
                      {isTranscribing
                        ? "Working"
                        : isRecording
                          ? "Live"
                          : recordingSupported
                            ? "Mic Ready"
                            : "Unsupported"}
                    </span>
                  </div>

                  {isTranscribing ? (
                    <div className="consult-processing-state">
                      <span className="consult-processing-spinner" />
                      <div className="consult-processing-copy">
                        <strong>
                          {captureMode === "transcribe"
                            ? "Processing conversation"
                            : "Processing recording"}
                        </strong>
                        <span>
                          {recordingStatus}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="consult-status-message">
                      {recordingStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showTranscriptPanel ? (
              <div className="consult-transcript-panel">
                <div className="consult-recording-statushead">
                  <div className="consult-transcript-headcopy">
                    <div className="consult-title consult-title-small">
                      {captureMode === "transcribe"
                        ? "Conversation Transcript"
                        : "Transcript"}
                    </div>
                    <div className="consult-transcript-note">
                      {captureMode === "transcribe"
                        ? "Review the complete conversation here, then refine anything before generating the note."
                        : "Review the captured text here, then refine it before generating the note."}
                    </div>
                  </div>
                  <span
                    className={`consult-processing-pill ${
                      isTranscribing ? "loading" : "ready"
                    }`}
                  >
                    {isTranscribing ? "Transcribing" : "Ready"}
                  </span>
                </div>

                <div className="consult-transcript-editor consult-transcript-editor-embedded">
                  <div className="rec-transcript-title consult-transcript-sectiontitle">
                    {captureMode === "transcribe"
                      ? "Full Conversation"
                      : "Consultation Text"}
                  </div>
                  <textarea
                    className="rec-transcript-input"
                    rows={captureMode === "transcribe" ? 18 : 14}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder={
                      captureMode === "transcribe"
                        ? "The full conversation transcript will appear here after processing."
                        : "Your captured transcript will appear here after processing."
                    }
                  />
                  <div className="consult-transcript-note">
                    Make any quick edits here before generating the final note.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="ui-card consult-card consult-card-elevated">
          <div className="consult-card-head">
            <div>
              <div className="consult-title">Doctor Note</div>
              <div className="consult-sub">
                Extra guidance for the generated note
              </div>
            </div>
          </div>

          <textarea
            className="form-control consult-textarea"
            rows={5}
            value={doctorNote}
            onChange={(event) => setDoctorNote(event.target.value)}
            placeholder="Add any extra note or instruction for generation..."
          />
        </div>

        <div className="consult-actions consult-actions-static">
          <button
            className="consult-generate-btn"
            type="button"
            onClick={generateNote}
            disabled={isGenerating || isTranscribing}
          >
            {isGenerating ? (
              <>
                <span className="consult-btn-spinner" />
                <span>Generating Note...</span>
              </>
            ) : (
              <>
                <span>Generate Note</span>
                <i className="bi bi-arrow-right" />
              </>
            )}
          </button>
        </div>
      </div>

      {showPatientModal
        ? createPortal(
            <div className="rmodal-overlay" onMouseDown={closePatientModal}>
              <div
                className="rmodal-card"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="rmodal-header">
                  <div>
                    <div className="rmodal-title">Patient Details</div>
                    <div className="rmodal-sub">Fill details and save</div>
                  </div>

                  <button
                    className="rmodal-x"
                    type="button"
                    onClick={closePatientModal}
                  >
                    x
                  </button>
                </div>

                <div className="rmodal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={patientForm.name}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label">Age</label>
                      <input
                        className="form-control"
                        value={patientForm.age}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            age: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={patientForm.gender}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            gender: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-control"
                        value={patientForm.phone}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">NIC / ID</label>
                      <input
                        className="form-control"
                        value={patientForm.nic}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            nic: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Allergies</label>
                      <input
                        className="form-control"
                        value={patientForm.allergies}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            allergies: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={patientForm.notes}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            notes: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rmodal-footer">
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={closePatientModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={savePatient}
                  >
                    Save Patient
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function PreferenceGroup({ label, options, value, onChange }) {
  return (
    <div className="consult-preference-group">
      <label>{label}</label>
      <div className="consult-pill-row">
        {options.map((option) => (
          <button
            type="button"
            key={option.key}
            className={`consult-pill ${value === option.key ? "active" : ""}`}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
