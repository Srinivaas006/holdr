import { useRef, useState } from "react";
import { uploadFile } from "../utils/storageHelpers";
import { useAuth } from "../context/AuthContext";

export default function FileUpload() {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    setError("");
    for (const file of files) {
      try {
        setProgress(0);
        await uploadFile(user.uid, file, (pct) => setProgress(pct));
      } catch (err) {
        setError("Upload failed. Try a smaller file or check your connection.");
      } finally {
        setProgress(null);
      }
    }
  };

  return (
    <div
      className={`upload-zone ${dragging ? "upload-zone--active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="upload-dial" />
      <p className="upload-title">Drop files to lock them away</p>
      <p className="upload-sub">or click to choose from your device</p>
      {progress !== null && (
        <div className="upload-progress">
          <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
