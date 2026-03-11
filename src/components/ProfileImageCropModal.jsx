import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

export default function ProfileImageCropModal({
  imageSrc,
  open,
  onClose,
  onDone,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    try {
      setProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });
      await onDone(croppedFile);
    } catch (error) {
      console.error("Crop failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="crop-modal-backdrop">
      <div className="crop-modal-card">
        <div className="crop-modal-head">
          <h3>Adjust Profile Photo</h3>
          <button type="button" className="crop-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="cropper-shell">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-controls">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>

        <div className="crop-actions">
          <button type="button" className="crop-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="crop-btn primary"
            onClick={handleDone}
            disabled={processing}
          >
            {processing ? "Processing..." : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}