import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, Image, Mic, Link2, X, CheckCircle,
  AlertCircle, Loader2, Play, Square, Pause, FileAudio
} from "lucide-react";
import "./MultiModalInput.css";

const INPUT_TABS = [
  { id: "text",  icon: FileText, label: "Text Query" },
  { id: "file",  icon: Upload,   label: "Upload PDF" },
  { id: "image", icon: Image,    label: "Upload Image" },
  { id: "audio", icon: Mic,      label: "Audio Input" },
  { id: "url",   icon: Link2,    label: "URL / DOI" },
];

export default function MultiModalInput({
  query, setQuery, onAsk, onUpload, onBuildIndex,
  loading, uploadedFiles, setUploadedFiles
}) {
  const [activeInputTab, setActiveInputTab] = useState("text");
  const [imageFile, setImageFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  /* ── PDF Dropzone ── */
  const onDropPdf = useCallback((accepted) => {
    const pdfs = accepted.filter(f => f.type === "application/pdf");
    setUploadedFiles(prev => [...prev, ...pdfs.map(f => ({
      file: f, status: "pending", id: Math.random().toString(36).slice(2)
    }))]);
  }, [setUploadedFiles]);

  const { getRootProps: getPdfProps, getInputProps: getPdfInput, isDragActive: isPdfDrag } =
    useDropzone({ onDrop: onDropPdf, accept: { "application/pdf": [".pdf"] }, multiple: true });

  /* ── Image Dropzone ── */
  const onDropImg = useCallback((accepted) => {
    if (accepted[0]) setImageFile(accepted[0]);
  }, []);

  const { getRootProps: getImgProps, getInputProps: getImgInput, isDragActive: isImgDrag } =
    useDropzone({ onDrop: onDropImg, accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] }, multiple: false });

  /* ── Audio Dropzone ── */
  const onDropAudio = useCallback((accepted) => {
    if (accepted[0]) setAudioFile(accepted[0]);
  }, []);

  const { getRootProps: getAudioProps, getInputProps: getAudioInput, isDragActive: isAudioDrag } =
    useDropzone({ onDrop: onDropAudio, accept: { "audio/*": [".mp3", ".wav", ".ogg", ".m4a"] }, multiple: false });

  const removeFile = (id) =>
    setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onAsk();
  };



  return (
    <div className="mmi">
      {/* Input Mode Tabs */}
      <div className="mmi__tabs" role="tablist" aria-label="Input modes">
        {INPUT_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeInputTab === tab.id}
              className={`mmi__tab ${activeInputTab === tab.id ? "mmi__tab--active" : ""}`}
              onClick={() => setActiveInputTab(tab.id)}
            >
              <Icon size={14} strokeWidth={1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TEXT QUERY ── */}
      {activeInputTab === "text" && (
        <div className="mmi__panel animate-fade-in">
          <div className="mmi__textarea-wrap">
            <textarea
              id="text-query-input"
              className="mmi__textarea"
              rows={4}
              placeholder="Ask anything about your research papers… (Ctrl+Enter to send)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <div className="mmi__textarea-meta">
              <span className="mmi__char-count">{query.length} chars</span>
              <span className="mmi__hint">Ctrl + Enter to send</span>
            </div>
          </div>

          {/* Quick prompt chips */}
          <div className="mmi__chips">
            {[
              "Summarize methodology",
              "List key findings",
              "Compare results across papers",
              "Explain limitations",
              "What datasets were used?"
            ].map(chip => (
              <button
                key={chip}
                className="mmi__chip"
                onClick={() => setQuery(chip)}
                disabled={loading}
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            id="ask-question-btn"
            className={`mmi__send-btn ${loading ? "mmi__send-btn--loading" : ""}`}
            onClick={onAsk}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <><Loader2 size={16} className="spin" /> Processing…</>
            ) : (
              <><Play size={16} /> Ask ResearchGraph</>
            )}
          </button>
        </div>
      )}

      {/* ── PDF UPLOAD ── */}
      {activeInputTab === "file" && (
        <div className="mmi__panel animate-fade-in">
          <div
            {...getPdfProps()}
            className={`mmi__dropzone ${isPdfDrag ? "mmi__dropzone--active" : ""}`}
            id="pdf-dropzone"
          >
            <input {...getPdfInput()} id="pdf-file-input" />
            <div className="mmi__dropzone-inner">
              <div className="mmi__dropzone-icon">
                <Upload size={28} strokeWidth={1.5} />
              </div>
              <p className="mmi__dropzone-title">
                {isPdfDrag ? "Release to upload" : "Drop PDFs here or click to browse"}
              </p>
              <p className="mmi__dropzone-sub">Supports PDF research papers · Multiple files allowed</p>
            </div>
          </div>

          {/* File list */}
          {uploadedFiles.length > 0 && (
            <div className="mmi__file-list">
              {uploadedFiles.map(({ file, status, id }) => (
                <div key={id} className="mmi__file-item">
                  <FileText size={14} className="mmi__file-icon" />
                  <span className="mmi__file-name">{file.name}</span>
                  <span className="mmi__file-size">{(file.size / 1024).toFixed(0)} KB</span>
                  <div className="mmi__file-status">
                    {status === "pending"   && <span className="mmi__status mmi__status--pending">Pending</span>}
                    {status === "uploading" && <Loader2 size={12} className="spin" />}
                    {status === "success"   && <CheckCircle size={14} color="var(--success)" />}
                    {status === "error"     && <AlertCircle size={14} color="var(--error)" />}
                  </div>
                  <button className="mmi__file-remove" onClick={() => removeFile(id)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mmi__action-row">
            <button
              id="upload-files-btn"
              className="mmi__action-btn mmi__action-btn--primary"
              onClick={onUpload}
              disabled={loading || uploadedFiles.length === 0}
            >
              {loading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
              Upload Files
            </button>
            <button
              id="build-index-btn"
              className="mmi__action-btn mmi__action-btn--secondary"
              onClick={onBuildIndex}
              disabled={loading}
            >
              Build Knowledge Index
            </button>
          </div>
        </div>
      )}

      {/* ── IMAGE UPLOAD ── */}
      {activeInputTab === "image" && (
        <div className="mmi__panel animate-fade-in">
          <div
            {...getImgProps()}
            className={`mmi__dropzone mmi__dropzone--image ${isImgDrag ? "mmi__dropzone--active" : ""}`}
            id="image-dropzone"
          >
            <input {...getImgInput()} id="image-file-input" />
            {imageFile ? (
              <div className="mmi__img-preview">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="mmi__img-thumb"
                />
                <div className="mmi__img-overlay">
                  <p>{imageFile.name}</p>
                  <span>{(imageFile.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            ) : (
              <div className="mmi__dropzone-inner">
                <div className="mmi__dropzone-icon mmi__dropzone-icon--image">
                  <Image size={28} strokeWidth={1.5} />
                </div>
                <p className="mmi__dropzone-title">Upload a figure or chart</p>
                <p className="mmi__dropzone-sub">PNG, JPG, WebP · Ask questions about it</p>
              </div>
            )}
          </div>
          {imageFile && (
            <div className="mmi__action-row">
              <input
                className="mmi__url-input"
                placeholder="Ask about this image…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button className="mmi__action-btn mmi__action-btn--primary" onClick={onAsk} disabled={loading}>
                {loading ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
                Analyze
              </button>
              <button className="mmi__action-btn mmi__action-btn--ghost" onClick={() => setImageFile(null)}>
                <X size={14} /> Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── AUDIO INPUT ── */}
      {activeInputTab === "audio" && (
        <div className="mmi__panel animate-fade-in">
          <div
            {...getAudioProps()}
            className={`mmi__dropzone mmi__dropzone--audio ${isAudioDrag ? "mmi__dropzone--active" : ""}`}
            id="audio-dropzone"
          >
            <input {...getAudioInput()} id="audio-file-input" />
            {audioFile ? (
              <div className="mmi__audio-preview">
                <FileAudio size={48} className="mmi__audio-icon" />
                <div className="mmi__audio-overlay">
                  <p>{audioFile.name}</p>
                  <span>{(audioFile.size / 1024).toFixed(0)} KB</span>
                </div>
              </div>
            ) : (
              <div className="mmi__dropzone-inner">
                <div className="mmi__dropzone-icon mmi__dropzone-icon--audio">
                  <FileAudio size={28} strokeWidth={1.5} />
                </div>
                <p className="mmi__dropzone-title">Upload an audio file</p>
                <p className="mmi__dropzone-sub">MP3, WAV, OGG · Voice query will be transcribed</p>
              </div>
            )}
          </div>
          {audioFile && (
            <div className="mmi__action-row">
              <button className="mmi__action-btn mmi__action-btn--primary" onClick={onAsk} disabled={loading}>
                {loading ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
                Transcribe & Analyze
              </button>
              <button className="mmi__action-btn mmi__action-btn--ghost" onClick={() => setAudioFile(null)}>
                <X size={14} /> Remove
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── URL / DOI ── */}
      {activeInputTab === "url" && (
        <div className="mmi__panel animate-fade-in">
          <div className="mmi__url-wrap">
            <div className="mmi__url-icon"><Link2 size={16} /></div>
            <input
              id="url-doi-input"
              className="mmi__url-input mmi__url-input--full"
              placeholder="Paste arXiv URL, DOI, or paper link…"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
            />
          </div>
          <div className="mmi__url-examples">
            {[
              "https://arxiv.org/abs/2310.01541",
              "10.1145/3292500.3330660",
              "https://papers.nips.cc/..."
            ].map(ex => (
              <button key={ex} className="mmi__chip" onClick={() => setUrlInput(ex)}>{ex}</button>
            ))}
          </div>
          <button
            id="fetch-url-btn"
            className="mmi__action-btn mmi__action-btn--primary"
            disabled={!urlInput.trim() || loading}
          >
            {loading ? <Loader2 size={14} className="spin" /> : <Link2 size={14} />}
            Fetch & Index Paper
          </button>
        </div>
      )}
    </div>
  );
}
