
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import {
  Search,
  Bell,
  ChevronDown,
  CircleUserRound,
  FolderKanban,
  StickyNote,
} from "lucide-react";

import projectService from "../Services/projectService";
import noteService from "../Services/noteService";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    async function loadSearchData() {
      try {
        const [projectData, noteData] = await Promise.all([
          projectService.getAll(),
          noteService.getAll(),
        ]);

        setProjects(projectData);
        setNotes(noteData);
      } catch (err) {
        console.error("Could not load search data", err);
      }
    }

    loadSearchData();
  }, []);

  const query = search.trim().toLowerCase();

  const filteredProjects = projects.filter(
    (item) =>
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
  );

  const filteredNotes = notes.filter(
    (item) =>
      item.title?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query)
  );

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate("/login", { replace: true });
  }

  function openProject(id) {
    setSearch("");
    navigate(`/projects/${id}`);
  }

  function openNote(title) {
    setSearch("");
    navigate(`/notes?search=${encodeURIComponent(title)}`);
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="nrand-logo">C</div>
        <span>CollabSphere</span>
      </div>

      <div className="navbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search Projects, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <kbd>Ctrl K</kbd>

        {query && (
          <div className="search-results">
            {filteredProjects.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => openProject(item._id)}
              >
                <FolderKanban size={17} />
                <span>
                  <strong>{item.title}</strong>
                  <small>Project</small>
                </span>
              </button>
            ))}

            {filteredNotes.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => openNote(item.title)}
              >
                <StickyNote size={17} />
                <span>
                  <strong>{item.title}</strong>
                  <small>Note</small>
                </span>
              </button>
            ))}

            {filteredProjects.length === 0 &&
              filteredNotes.length === 0 && (
                <p className="search-empty">No matching results found.</p>
              )}
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={21} />
          <span className="notification-dot" />
        </button>

        <div className="profile-wrapper">
          <button
            className="profile-button"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="profile-info">
              <span className="profile-name">
                {user?.name || "My Account"}
              </span>
              <span className="profile-role">Workspace Member</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
              >
                <CircleUserRound size={16} />
                My Profile
              </button>

              <button onClick={() => setProfileOpen(false)}>
                Settings
              </button>

              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
