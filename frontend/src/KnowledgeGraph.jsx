import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// ── Demo data shown before any index is built ──────────────────────
const DEMO_NODES = [
  "Machine Learning", "Neural Network", "Deep Learning", "Transformer",
  "Attention", "BERT", "GPT", "Embeddings", "RAG", "Vector DB",
  "Pinecone", "Knowledge Graph", "Entity", "Relation", "LLM",
  "Ollama", "Retrieval", "Document", "Chunk", "Inference",
];
const DEMO_LINKS = [
  ["Machine Learning", "Neural Network"], ["Neural Network", "Deep Learning"],
  ["Deep Learning", "Transformer"], ["Transformer", "Attention"],
  ["Transformer", "BERT"], ["Transformer", "GPT"],
  ["BERT", "Embeddings"], ["GPT", "LLM"],
  ["Embeddings", "Vector DB"], ["Vector DB", "Pinecone"],
  ["RAG", "Vector DB"], ["RAG", "Retrieval"],
  ["Retrieval", "Document"], ["Document", "Chunk"],
  ["Knowledge Graph", "Entity"], ["Knowledge Graph", "Relation"],
  ["Entity", "Machine Learning"], ["LLM", "Ollama"],
  ["RAG", "LLM"], ["Chunk", "Embeddings"], ["LLM", "Inference"],
];

// ── Color palette ──────────────────────────────────────────────────
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#3b82f6", "#84cc16", "#f97316",
];

// ── Force simulation hook ──────────────────────────────────────────
function useForceSimulation(nodes, links, width, height) {
  const [positions, setPositions] = useState({});
  const animRef = useRef(null);
  const posRef = useRef({});

  useEffect(() => {
    if (!nodes.length) return;
    cancelAnimationFrame(animRef.current);

    const pos = {};
    nodes.forEach((n) => {
      pos[n.id] = {
        x: width / 2 + (Math.random() - 0.5) * width * 0.6,
        y: height / 2 + (Math.random() - 0.5) * height * 0.6,
        vx: 0, vy: 0,
      };
    });
    posRef.current = pos;

    let tick = 0;
    const MAX = 180;

    const simulate = () => {
      if (tick++ > MAX) return;
      const p = posRef.current;

      // Repulsion
      nodes.forEach((a) => {
        nodes.forEach((b) => {
          if (a.id === b.id) return;
          const dx = p[a.id].x - p[b.id].x;
          const dy = p[a.id].y - p[b.id].y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = 900 / (d * d);
          p[a.id].vx += (dx / d) * f;
          p[a.id].vy += (dy / d) * f;
        });
      });

      // Attraction
      links.forEach((l) => {
        const src = p[l.source]; const tgt = p[l.target];
        if (!src || !tgt) return;
        const dx = tgt.x - src.x; const dy = tgt.y - src.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 130) * 0.04;
        const fx = (dx / d) * f; const fy = (dy / d) * f;
        src.vx += fx; src.vy += fy;
        tgt.vx -= fx; tgt.vy -= fy;
      });

      // Center gravity + damping + bounds
      nodes.forEach((n) => {
        p[n.id].vx += (width / 2 - p[n.id].x) * 0.01;
        p[n.id].vy += (height / 2 - p[n.id].y) * 0.01;
        p[n.id].vx *= 0.85; p[n.id].vy *= 0.85;
        p[n.id].x = Math.max(50, Math.min(width - 50, p[n.id].x + p[n.id].vx));
        p[n.id].y = Math.max(40, Math.min(height - 40, p[n.id].y + p[n.id].vy));
      });

      posRef.current = { ...p };
      if (tick % 8 === 0 || tick >= MAX) setPositions({ ...p });
      if (tick < MAX) animRef.current = requestAnimationFrame(simulate);
    };

    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes, links, width, height]);

  return positions;
}

// ── Main Component ─────────────────────────────────────────────────
export default function KnowledgeGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 900, height: 480 });

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ width: Math.max(400, width), height: Math.max(300, height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Fetch graph data from backend (fallback to demo)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/graph`, { timeout: 4000 });
        const raw = res.data;

        if (raw.nodes && raw.nodes.length > 0) {
          setGraphData({
            nodes: raw.nodes.map((n) => ({ id: n })),
            links: raw.edges.map((e) => ({ source: e.source, target: e.target })),
          });
          setIsDemo(false);
        } else {
          // No real data — show demo
          setGraphData({
            nodes: DEMO_NODES.map((id) => ({ id })),
            links: DEMO_LINKS.map(([source, target]) => ({ source, target })),
          });
          setIsDemo(true);
        }
      } catch {
        // Backend unavailable — still show demo
        setGraphData({
          nodes: DEMO_NODES.map((id) => ({ id })),
          links: DEMO_LINKS.map(([source, target]) => ({ source, target })),
        });
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const positions = useForceSimulation(graphData.nodes, graphData.links, dims.width, dims.height);

  const nodeColor = useCallback(
    (id) => COLORS[Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % COLORS.length],
    []
  );

  if (loading) {
    return (
      <div className="kg-wrapper" ref={containerRef}>
        <div className="kg-state">
          <div className="kg-spinner" />
          <p>Loading Knowledge Graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kg-wrapper" ref={containerRef}>
      {/* Header */}
      <div className="kg-header">
        <h2 className="kg-title">Knowledge Graph</h2>
        <div className="kg-meta">
          {isDemo ? (
            <span className="kg-badge kg-badge--demo">
              Demo Preview — Build Index to see your data
            </span>
          ) : (
            <>
              <span className="kg-badge">{graphData.nodes.length} Entities</span>
              <span className="kg-badge">{graphData.links.length} Relations</span>
            </>
          )}
        </div>
      </div>

      {/* Graph SVG */}
      <svg className="kg-svg" width={dims.width} height={dims.height}>
        <defs>
          <marker id="kg-arrow" markerWidth="8" markerHeight="8" refX="16" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(139,92,246,0.6)" />
          </marker>
          <filter id="kg-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Links */}
        {graphData.links.map((link, i) => {
          const src = positions[link.source];
          const tgt = positions[link.target];
          if (!src || !tgt) return null;
          const active = selected === link.source || selected === link.target;
          return (
            <line key={i}
              x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              stroke={active ? "rgba(139,92,246,0.85)" : "rgba(139,92,246,0.18)"}
              strokeWidth={active ? 2 : 1}
              markerEnd="url(#kg-arrow)"
            />
          );
        })}

        {/* Nodes */}
        {graphData.nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          const color = nodeColor(node.id);
          const isSel = selected === node.id;
          const isHov = hovered === node.id;
          const r = isSel ? 18 : isHov ? 15 : 11;
          const label = node.id.length > 14 ? node.id.slice(0, 13) + "…" : node.id;

          return (
            <g key={node.id}
              transform={`translate(${pos.x},${pos.y})`}
              onClick={() => setSelected(isSel ? null : node.id)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              {isSel && <circle r={r + 9} fill="none" stroke={color} strokeWidth={2} opacity={0.25} filter="url(#kg-glow)" />}
              <circle r={r} fill={color} stroke={isSel ? "#fff" : "rgba(255,255,255,0.08)"} strokeWidth={isSel ? 2 : 1} opacity={0.88} />
              <text textAnchor="middle" dy={r + 13} fontSize={isSel ? 11 : 9.5}
                fill={isSel ? "#fff" : "rgba(255,255,255,0.72)"}
                style={{ pointerEvents: "none", userSelect: "none" }}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Info panel for selected node */}
      {selected && (
        <div className="kg-info-panel">
          <strong>{selected}</strong>
          <span style={{ opacity: 0.6, fontSize: 12 }}>
            Connected to:{" "}
            {graphData.links
              .filter((l) => l.source === selected || l.target === selected)
              .map((l) => (l.source === selected ? l.target : l.source))
              .slice(0, 8).join(", ") || "none"}
          </span>
        </div>
      )}
    </div>
  );
}
