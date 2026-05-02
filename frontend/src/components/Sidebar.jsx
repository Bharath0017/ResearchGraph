import { useState } from "react";
import {
  Brain, FileText, History, Settings, ChevronLeft,
  ChevronRight, Zap, BookOpen, GitBranch, BarChart2,
  Network, Database, Cpu, Activity
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
  { id: "chat",    icon: Brain,     label: "Research Chat",  badge: null },
  { id: "docs",    icon: FileText,  label: "Documents",      badge: null },
  { id: "graph",   icon: Network,   label: "Knowledge Graph",badge: "Beta" },
  { id: "history", icon: History,   label: "History",        badge: null },
  { id: "insights",icon: BarChart2, label: "Insights",       badge: null },
];

const systemStats = [
  { icon: Database, label: "Vector Store", value: "Active", color: "var(--success)" },
  { icon: Cpu,      label: "LLM Engine",   value: "Llama3",  color: "var(--accent-cyan)" },
  { icon: Activity, label: "RAG Pipeline", value: "Ready",   color: "var(--accent-emerald)" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Brain size={22} strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">ResearchGraph</span>
            <span className="sidebar__logo-sub">AI Assistant</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className="sidebar__toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {!collapsed && (
          <span className="sidebar__section-label">Navigation</span>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar__nav-item ${activeTab === item.id ? "sidebar__nav-item--active" : ""}`}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar__nav-icon">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              {!collapsed && (
                <>
                  <span className="sidebar__nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar__badge">{item.badge}</span>
                  )}
                </>
              )}
              {activeTab === item.id && (
                <span className="sidebar__nav-active-bar" />
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="sidebar__status">
        {!collapsed && (
          <span className="sidebar__section-label">System</span>
        )}
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="sidebar__stat" title={collapsed ? `${stat.label}: ${stat.value}` : undefined}>
              <span className="sidebar__stat-dot" style={{ background: stat.color }} />
              {!collapsed && (
                <>
                  <span className="sidebar__stat-label">{stat.label}</span>
                  <span className="sidebar__stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Settings */}
      <div className="sidebar__footer">
        <button className="sidebar__nav-item" title={collapsed ? "Settings" : undefined}>
          <span className="sidebar__nav-icon"><Settings size={18} strokeWidth={1.5} /></span>
          {!collapsed && <span className="sidebar__nav-label">Settings</span>}
        </button>
        {!collapsed && (
          <div className="sidebar__version">
            <Zap size={10} />
            <span>v2.0.0 — LLM Powered</span>
          </div>
        )}
      </div>
    </aside>
  );
}
