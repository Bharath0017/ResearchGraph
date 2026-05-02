import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import MultiModalInput from "./components/MultiModalInput";
import InsightsPanel from "./components/InsightsPanel";
import KnowledgeGraph from "./KnowledgeGraph";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function makeId() {
  return Math.random().toString(36).slice(2);
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [query, setQuery]               = useState("");
  const [messages, setMessages]         = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState("chat");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [showInsights, setShowInsights] = useState(true);
  const [backendStats, setBackendStats] = useState({ documents_indexed: 0, vector_count: 0, index_ready: false });
  const [documentList, setDocumentList] = useState([]);

  // ─── Check backend health + stats ────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        await axios.get(`${API_URL}/`, { timeout: 3000 });
        setBackendStatus("online");
        // Fetch stats
        const statsRes = await axios.get(`${API_URL}/stats`);
        setBackendStats(statsRes.data);
        // Fetch document list
        const docsRes = await axios.get(`${API_URL}/documents`);
        setDocumentList(docsRes.data.documents || []);
      } catch {
        setBackendStatus("offline");
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  // ─── Ask question ──────────────────────────────────────────────
  const askQuestion = useCallback(async () => {
    if (!query.trim()) {
      toast.error("Please enter a question first.");
      return;
    }

    const userMsg = {
      id:        makeId(),
      role:      "user",
      content:   query,
      timestamp: nowTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/query`, { query: userMsg.content });
      const data = res.data;
      const aiMsg = {
        id:         makeId(),
        role:       "ai",
        content:    data.answer || "No answer returned.",
        timestamp:  nowTime(),
        confidence: Math.min(98, 70 + (data.chunks_used || 0) * 5),
        sources:    data.sources || [],
        latency_ms: data.latency_ms,
      };
      setMessages(prev => [...prev, aiMsg]);
      // Refresh stats after query
      try {
        const statsRes = await axios.get(`${API_URL}/stats`);
        setBackendStats(statsRes.data);
      } catch {}
    } catch (err) {
      const detail = err.response?.data?.detail || "Backend unreachable. Check the server.";
      const errMsg = {
        id:        makeId(),
        role:      "ai",
        content:   `**Error:** ${detail}\n\nMake sure the FastAPI server is running:\n\`\`\`bash\npython -m uvicorn app.main:app --reload\n\`\`\``,
        timestamp: nowTime(),
      };
      setMessages(prev => [...prev, errMsg]);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ─── Upload files ──────────────────────────────────────────────
  const uploadFiles = useCallback(async () => {
    const pending = uploadedFiles.filter(f => f.status === "pending");
    if (pending.length === 0) {
      toast.error("No files to upload.");
      return;
    }

    setLoading(true);
    let successCount = 0;

    for (const item of pending) {
      setUploadedFiles(prev =>
        prev.map(f => f.id === item.id ? { ...f, status: "uploading" } : f)
      );
      try {
        const form = new FormData();
        form.append("file", item.file);
        await axios.post(`${API_URL}/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setUploadedFiles(prev =>
          prev.map(f => f.id === item.id ? { ...f, status: "success" } : f)
        );
        successCount++;
      } catch (err) {
        const detail = err.response?.data?.detail || "Upload failed";
        setUploadedFiles(prev =>
          prev.map(f => f.id === item.id ? { ...f, status: "error" } : f)
        );
        toast.error(detail);
      }
    }

    setLoading(false);
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully!`);
      // Refresh document list
      try {
        const docsRes = await axios.get(`${API_URL}/documents`);
        setDocumentList(docsRes.data.documents || []);
      } catch {}
    }
  }, [uploadedFiles]);

  // ─── Build index ───────────────────────────────────────────────
  const buildIndex = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/build-index`);
      const data = res.data;
      toast.success(`Index built! ${data.chunks_indexed} chunks from ${(data.documents || []).length} document(s).`);
      // Refresh stats
      const statsRes = await axios.get(`${API_URL}/stats`);
      setBackendStats(statsRes.data);
    } catch (err) {
      const detail = err.response?.data?.detail || "Index build failed.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Clear chat ────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([]);
    toast("Conversation cleared.", { icon: "🗑️" });
  };

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            fontSize: "13px",
            borderRadius: "var(--radius-md)",
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="app__main">
        {/* Header */}
        <Header backendStatus={backendStatus} />

        {/* Body */}
        <div className="app__body">

          {/* ── CHAT TAB ── */}
          {activeTab === "chat" && (
            <div className="app__workspace">
              {/* Center Column: Chat + Input */}
              <div className="app__center">
                {/* Chat messages */}
                <div className="app__chat-area">
                  <ChatPanel messages={messages} loading={loading} />
                </div>

                {/* Input Section */}
                <div className="app__input-section glass-card">
                  <div className="app__input-header">
                    <span className="app__input-label">Query Interface</span>
                    <div className="app__input-actions">
                      {messages.length > 0 && (
                        <button
                          className="app__clear-btn"
                          onClick={clearChat}
                          disabled={loading}
                        >
                          Clear Chat
                        </button>
                      )}
                      <button
                        className={`app__insights-toggle ${showInsights ? "app__insights-toggle--active" : ""}`}
                        onClick={() => setShowInsights(v => !v)}
                      >
                        {showInsights ? "Hide Insights" : "Show Insights"}
                      </button>
                    </div>
                  </div>

                  <MultiModalInput
                    query={query}
                    setQuery={setQuery}
                    onAsk={askQuestion}
                    onUpload={uploadFiles}
                    onBuildIndex={buildIndex}
                    loading={loading}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={setUploadedFiles}
                  />
                </div>
              </div>

              {/* Right Column: Insights */}
              {showInsights && (
                <div className="app__right glass-card">
                  <InsightsPanel
                    messages={messages}
                    uploadedFiles={uploadedFiles}
                    backendStats={backendStats}
                    documentList={documentList}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === "docs" && (
            <div className="app__placeholder animate-fade-in">
              <div className="app__placeholder-icon">📁</div>
              <h2>Document Library</h2>
              <p>Indexed research papers in your knowledge base.</p>
              {documentList.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No documents indexed yet. Upload PDFs first.</p>
              ) : (
                <div className="app__history-list">
                  {documentList.map(doc => (
                    <div key={doc.name} className="app__history-item">
                      <span className="app__history-time">{doc.size_kb} KB</span>
                      <span className="app__history-query">{doc.name}</span>
                      <span className="app__history-time">{doc.modified}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── GRAPH TAB ── */}
          {activeTab === "graph" && (
            <div className="animate-fade-in" style={{ flex: 1, overflow: "hidden", padding: "0 8px" }}>
              <KnowledgeGraph />
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div className="app__placeholder animate-fade-in">
              <div className="app__placeholder-icon">🕐</div>
              <h2>Query History</h2>
              <p>Review all your past research queries and answers.</p>
              {messages.filter(m => m.role === "user").length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No queries yet in this session.</p>
              ) : (
                <div className="app__history-list">
                  {messages.filter(m => m.role === "user").map(msg => (
                    <div key={msg.id} className="app__history-item">
                      <span className="app__history-time">{msg.timestamp}</span>
                      <span className="app__history-query">{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── INSIGHTS TAB ── */}
          {activeTab === "insights" && (
            <div className="app__full-insights animate-fade-in">
              <InsightsPanel
                messages={messages}
                uploadedFiles={uploadedFiles}
                backendStats={backendStats}
                documentList={documentList}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}