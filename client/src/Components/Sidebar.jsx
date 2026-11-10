
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  StickyNote,
  Files,
  MessageCircle,
  UserRound,
  X,
} from "lucide-react";

const links = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Notes", path: "/notes", icon: StickyNote },
  { name: "Files", path: "/files", icon: Files },
  { name: "AI Chat", path: "/ai-chat", icon: MessageCircle },
  { name: "Profile", path: "/profile", icon: UserRound },
];

export default function Sidebar({ open = true, onClose }) {
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-logo">C</span>
          <span>CollabSphere</span>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p>Your ideas. One workspace.</p>
        </div>
      </aside>
    </>
  );
}

