import { useState, useEffect } from "react";
import {
  TrendingUp, FileText, Brain, Clock, Zap,
  BarChart2, Search, BookOpen, Network, RefreshCw,
  ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import "./InsightsPanel.css";

const MOCK_TOPICS = [
  { label: "Transformer Architectures", count: 34, trend: +12 },
  { label: "Attention Mechanisms", count: 28, trend: +8 },
  { label: "Knowledge Graphs", count: 22, trend: +19 },
  { label: "RAG Pipelines", count: 19, trend: +4 },
  { label: "Multimodal Learning", count: 17, trend: -2 },
  { label: "Contrastive Learning", count: 14, trend: +6 },
  { label: "Federated Learning", count: 11, trend: -3 },
  { label: "NeRF / 3D Vision", count: 9, trend: +15 },
];

const MOCK_STATS = [
  { icon: FileText,  label: "Indexed Papers",    value: "0",   sub: "Ready to upload",   color: "var(--accent-cyan)" },
  { icon: Search,    label: "Total Queries",      value: "0",   sub: "This session",      color: "var(--primary-light)" },
  { icon: Network,   label: "Graph Nodes",        value: "0",   sub: "Knowledge graph",   color: "var(--accent-violet)" },
  { icon: Zap,       label: "Avg Response",       value: "—",   sub: "ms latency",        color: "var(--accent-emerald)" },
];

const RECENT_QUERIES = [
  "What are the limitations of GPT-4?",
  "Compare BERT and RoBERTa architectures",
  "Explain contrastive loss in SimCLR",
];

export default function InsightsPanel({ messages, uploadedFiles, backendStats = {}, documentList = [] }) {
  const [animating, setAnimating] = useState(false);

  const queryCount   = messages.filter(m => m.role === "user").length;
  const docCount     = backendStats.documents_indexed ?? 0;
  const vectorCount  = backendStats.vector_count ?? 0;
  const indexReady   = backendStats.index_ready ?? false;

  const lastLatency  = [...messages].reverse().find(m => m.latency_ms)?.latency_ms;

  const liveStats = [
    { icon: FileText,  label: "Indexed Papers",  value: docCount,                     sub: indexReady ? "Index ready" : "Upload & build index", color: "var(--accent-cyan)"    },
    { icon: Search,    label: "Total Queries",    value: queryCount,                   sub: "This session",                                       color: "var(--primary-light)" },
    { icon: Network,   label: "Vector Chunks",    value: vectorCount,                  sub: "FAISS index",                                        color: "var(--accent-violet)" },
    { icon: Zap,       label: "Last Latency",     value: lastLatency ? `${lastLatency}ms` : "—", sub: "LLM response time",                        color: "var(--accent-emerald)"},
  ];

  const refresh = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 800);
  };

  return (
    <div className="insights">
      {/* Header */}
      <div className="insights__header">
        <div className="insights__header-left">
          <BarChart2 size={16} color="var(--primary-light)" strokeWidth={1.5} />
          <span className="insights__title">Session Insights</span>
        </div>
        <button className={`insights__refresh ${animating ? "insights__refresh--spin" : ""}`} onClick={refresh}>
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="insights__stats-grid">
        {liveStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="insights__stat-card" style={{ "--stat-color": stat.color }}>
              <div className="insights__stat-icon">
                <Icon size={14} strokeWidth={1.5} />
              </div>
              <div className="insights__stat-value">{stat.value}</div>
              <div className="insights__stat-label">{stat.label}</div>
              <div className="insights__stat-sub">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Topic Distribution */}
      <div className="insights__section">
        <div className="insights__section-title">
          <TrendingUp size={12} />
          Research Topic Distribution
        </div>
        <div className="insights__topics">
          {MOCK_TOPICS.map((topic, i) => {
            const pct = Math.round((topic.count / MOCK_TOPICS[0].count) * 100);
            const isUp = topic.trend >= 0;
            return (
              <div key={topic.label} className="insights__topic-row">
                <div className="insights__topic-info">
                  <span className="insights__topic-rank">#{i + 1}</span>
                  <span className="insights__topic-label">{topic.label}</span>
                </div>
                <div className="insights__topic-bar-wrap">
                  <div className="insights__topic-bar">
                    <div
                      className="insights__topic-bar-fill"
                      style={{ width: `${pct}%`, animationDelay: `${i * 0.06}s` }}
                    />
                  </div>
                  <span className="insights__topic-count">{topic.count}</span>
                </div>
                <span className={`insights__topic-trend ${isUp ? "insights__topic-trend--up" : "insights__topic-trend--down"}`}>
                  {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(topic.trend)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Queries */}
      {messages.filter(m => m.role === "user").length > 0 && (
        <div className="insights__section">
          <div className="insights__section-title">
            <Clock size={12} />
            Recent Queries
          </div>
          <div className="insights__recent">
            {messages.filter(m => m.role === "user").slice(-5).reverse().map((msg, i) => (
              <div key={i} className="insights__query-item">
                <Search size={10} className="insights__query-icon" />
                <span className="insights__query-text">{msg.content}</span>
                <span className="insights__query-time">{msg.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Status */}
      <div className="insights__section">
        <div className="insights__section-title">
          <Activity size={12} />
          Pipeline Health
        </div>
        <div className="insights__pipeline">
          {[
            { label: "Document Parser",  status: "ready",  pct: 100 },
            { label: "Embedding Model",  status: "ready",  pct: 100 },
            { label: "Vector Store",     status: "ready",  pct: 100 },
            { label: "LLM (Llama 3)",    status: "ready",  pct: 100 },
            { label: "Graph Builder",    status: "idle",   pct: 0   },
          ].map(step => (
            <div key={step.label} className="insights__pipeline-step">
              <div className="insights__pipeline-info">
                <div
                  className="insights__pipeline-dot"
                  style={{ background: step.status === "ready" ? "var(--success)" : step.status === "busy" ? "var(--warning)" : "var(--text-muted)" }}
                />
                <span className="insights__pipeline-label">{step.label}</span>
              </div>
              <span className={`insights__pipeline-status insights__pipeline-status--${step.status}`}>
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
