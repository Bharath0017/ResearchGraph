import { Bell, Search, GitBranch, Wifi, WifiOff } from "lucide-react";
import "./Header.css";

export default function Header({ backendStatus }) {
  return (
    <header className="hdr" role="banner">
      <div className="hdr__left">
        <div className="hdr__breadcrumb">
          <span className="hdr__breadcrumb-item">ResearchGraph</span>
          <span className="hdr__breadcrumb-sep">/</span>
          <span className="hdr__breadcrumb-item hdr__breadcrumb-item--active">Research Chat</span>
        </div>
      </div>

      <div className="hdr__center">
        <div className="hdr__search-wrap">
          <Search size={14} className="hdr__search-icon" />
          <input
            id="global-search"
            className="hdr__search"
            placeholder="Search knowledge base… (⌘K)"
            readOnly
          />
          <kbd className="hdr__kbd">⌘K</kbd>
        </div>
      </div>

      <div className="hdr__right">
        {/* Backend Status */}
        <div
          className={`hdr__status-badge ${backendStatus === "online" ? "hdr__status-badge--online" : "hdr__status-badge--offline"}`}
          title={`Backend: ${backendStatus}`}
        >
          {backendStatus === "online" ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span>{backendStatus === "online" ? "API Online" : "API Offline"}</span>
        </div>

        {/* Notifications */}
        <button className="hdr__icon-btn" id="notifications-btn" title="Notifications">
          <Bell size={16} strokeWidth={1.5} />
          <span className="hdr__notif-dot" />
        </button>

        {/* GitHub */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hdr__icon-btn"
          id="github-link"
          title="GitHub"
        >
          <GitBranch size={16} strokeWidth={1.5} />
        </a>

        {/* Avatar */}
        <div className="hdr__avatar" title="User profile">
          <span>R</span>
        </div>
      </div>
    </header>
  );
}
