import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Brain, User, Copy, ThumbsUp, ThumbsDown, Share2,
  Bookmark, ChevronDown, Loader2, Sparkles, Clock,
  CheckCircle, XCircle
} from "lucide-react";
import "./ChatPanel.css";

function TypingIndicator() {
  return (
    <div className="chat__message chat__message--ai">
      <div className="chat__avatar chat__avatar--ai">
        <Brain size={14} strokeWidth={1.5} />
      </div>
      <div className="chat__bubble chat__bubble--ai">
        <div className="chat__typing">
          <span className="chat__dot" style={{ animationDelay: "0s" }} />
          <span className="chat__dot" style={{ animationDelay: "0.2s" }} />
          <span className="chat__dot" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onCopy, onLike, onDislike, onBookmark }) {
  const isAI = msg.role === "ai";

  return (
    <div className={`chat__message chat__message--${isAI ? "ai" : "user"} animate-fade-in`}>
      <div className={`chat__avatar chat__avatar--${isAI ? "ai" : "user"}`}>
        {isAI ? <Brain size={14} strokeWidth={1.5} /> : <User size={14} strokeWidth={1.5} />}
      </div>

      <div className={`chat__bubble chat__bubble--${isAI ? "ai" : "user"}`}>
        {/* Header */}
        <div className="chat__bubble-header">
          <span className="chat__role-label">
            {isAI ? "ResearchGraph AI" : "You"}
          </span>
          <span className="chat__timestamp">
            <Clock size={10} />
            {msg.timestamp}
          </span>
        </div>

        {/* Content */}
        <div className="chat__content">
          {isAI ? (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="chat__code-block">
                      <div className="chat__code-header">
                        <span className="chat__code-lang">{match[1]}</span>
                        <button
                          className="chat__code-copy"
                          onClick={() => onCopy(String(children))}
                        >
                          <Copy size={11} /> Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: "0 0 8px 8px", fontSize: "12.5px" }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="chat__inline-code" {...props}>{children}</code>
                  );
                },
                p: ({ children }) => <p className="chat__para">{children}</p>,
                ul: ({ children }) => <ul className="chat__list">{children}</ul>,
                ol: ({ children }) => <ol className="chat__list chat__list--ordered">{children}</ol>,
                li: ({ children }) => <li className="chat__list-item">{children}</li>,
                h1: ({ children }) => <h3 className="chat__heading chat__heading--1">{children}</h3>,
                h2: ({ children }) => <h4 className="chat__heading chat__heading--2">{children}</h4>,
                h3: ({ children }) => <h5 className="chat__heading chat__heading--3">{children}</h5>,
                blockquote: ({ children }) => <blockquote className="chat__blockquote">{children}</blockquote>,
                strong: ({ children }) => <strong className="chat__strong">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} className="chat__link" target="_blank" rel="noopener noreferrer">{children}</a>
                ),
              }}
            >
              {msg.content}
            </ReactMarkdown>
          ) : (
            <p className="chat__para">{msg.content}</p>
          )}
        </div>

        {/* Sources / Confidence */}
        {isAI && msg.sources && (
          <div className="chat__sources">
            <span className="chat__sources-label">
              <Sparkles size={10} /> Sources
            </span>
            {msg.sources.map((src, i) => (
              <span key={i} className="chat__source-chip">{src}</span>
            ))}
          </div>
        )}

        {isAI && msg.confidence && (
          <div className="chat__confidence">
            <div className="chat__confidence-bar">
              <div
                className="chat__confidence-fill"
                style={{ width: `${msg.confidence}%` }}
              />
            </div>
            <span className="chat__confidence-label">
              {msg.confidence}% confidence
            </span>
          </div>
        )}

        {/* Actions */}
        {isAI && (
          <div className="chat__actions">
            <button className="chat__action-btn" onClick={() => onCopy(msg.content)} title="Copy">
              <Copy size={12} />
            </button>
            <button className="chat__action-btn" onClick={() => onLike(msg.id)} title="Good response">
              <ThumbsUp size={12} />
            </button>
            <button className="chat__action-btn" onClick={() => onDislike(msg.id)} title="Bad response">
              <ThumbsDown size={12} />
            </button>
            <button className="chat__action-btn" onClick={() => onBookmark(msg.id)} title="Bookmark">
              <Bookmark size={12} />
            </button>
            <button className="chat__action-btn" title="Share">
              <Share2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="chat" id="chat-panel">
      {messages.length === 0 ? (
        <div className="chat__empty">
          <div className="chat__empty-orb">
            <Brain size={32} strokeWidth={1.2} />
          </div>
          <h2 className="chat__empty-title">Ready to explore your research</h2>
          <p className="chat__empty-sub">
            Upload PDFs, ask questions, and uncover insights from your research papers using AI-powered RAG with knowledge graph reasoning.
          </p>
          <div className="chat__empty-features">
            {[
              { icon: "🔍", label: "Semantic Search" },
              { icon: "🧠", label: "Knowledge Graph" },
              { icon: "📊", label: "Data Extraction" },
              { icon: "🌐", label: "Multi-Modal" },
            ].map(f => (
              <div key={f.label} className="chat__empty-feature">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat__messages" id="chat-messages">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onCopy={copyToClipboard}
              onLike={() => {}}
              onDislike={() => {}}
              onBookmark={() => {}}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
