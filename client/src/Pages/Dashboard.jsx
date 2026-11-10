
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import projectService from "../Services/projectService";
import noteService from "../Services/noteService";
import fileService from "../Services/fileService";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    projects: 0,
    active: 0,
    completed: 0,
    notes: 0,
    files: 0,
  });

  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [allProjects, notes, files] = await Promise.all([
          projectService.getAll(),
          noteService.getAll(),
          fileService.getAll(),
        ]);

        setProjects(allProjects.slice(0, 5));

        setStats({
          projects: allProjects.length,
          active: allProjects.filter(
            (project) => project.status === "In Progress"
          ).length,
          completed: allProjects.filter(
            (project) => project.status === "Completed"
          ).length,
          notes: notes.length,
          files: files.length,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <section className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Welcome, {user?.name || "there"}!</h1>
          <p>Here's what's happening with your work.</p>
        </div>

        <Link className="primary-link" to="/projects">
          View projects
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="page-loading">Loading dashboard...</p>
      ) : (
        <>
          <div className="stats-grid">
            <article className="stat-card">
              <span>Total projects</span>
              <strong>{stats.projects}</strong>
            </article>
            <article className="stat-card">
              <span>In progress</span>
              <strong>{stats.active}</strong>
            </article>
            <article className="stat-card">
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </article>
            <article className="stat-card">
              <span>Notes</span>
              <strong>{stats.notes}</strong>
            </article>
            <article className="stat-card">
              <span>Files</span>
              <strong>{stats.files}</strong>
            </article>
          </div>

          <div className="section-heading">
            <h2>Recent projects</h2>
            <Link to="/projects">See all</Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>Your workspace starts here</h3>
              <p>Create your first project to organize your work.</p>
              <Link className="primary-link" to="/projects">
                Create a project
              </Link>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <Link
                  className="project-card"
                  key={project._id}
                  to={`/projects/${project._id}`}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description || "No description added."}</p>
                  <span className="status-badge">{project.status}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="quick-links">
            <Link to="/notes">Open notes</Link>
            <Link to="/files">Manage files</Link>
            <Link to="/ai-chat">Ask CollabSphere AI</Link>
          </div>
        </>
      )}
    </section>
  );
}
