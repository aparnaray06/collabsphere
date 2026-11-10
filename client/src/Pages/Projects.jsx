
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import projectService from "../Services/projectService";

const initialForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Planning",
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProjects() {
    try {
      setProjects(await projectService.getAll());
    } catch (err) {
      setError(err.response?.data?.message || "Could not load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const project = await projectService.create(form);
      setProjects((current) => [project, ...current]);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create project");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id) {
    if (!window.confirm("Delete this project?")) return;

    try {
      await projectService.remove(id);
      setProjects((current) =>
        current.filter((project) => project._id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete project");
    }
  }

  async function changeStatus(project, status) {
    try {
      const updated = await projectService.update(project._id, { status });

      setProjects((current) =>
        current.map((item) =>
          item._id === updated._id ? updated : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  }

  return (
    <section className="page-container">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PLAN AND ORGANIZE</p>
          <h1>Projects</h1>
          <p>Keep your work organized in one place.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Create a project</h2>

        <label htmlFor="project-title">Project title</label>
        <input
          id="project-title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          placeholder="Enter project name"
          required
        />

        <label htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="What is this project about?"
          rows={3}
        />

        <div className="form-row">
          <div>
            <label htmlFor="project-priority">Priority</label>
            <select
              id="project-priority"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label htmlFor="project-status">Status</label>
            <select
              id="project-status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option>Planning</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <button disabled={saving} type="submit">
          {saving ? "Creating..." : "Create project"}
        </button>
      </form>

      <div className="section-heading">
        <h2>All projects ({projects.length})</h2>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project using the form above.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project._id}>
              <div className="project-card-top">
                <span className="status-badge">{project.status}</span>
                <button
                  className="danger-button"
                  onClick={() => deleteProject(project._id)}
                >
                  Delete
                </button>
              </div>

              <h3>{project.title}</h3>
              <p>{project.description || "No description added."}</p>
              <p>Priority: {project.priority}</p>

              <label htmlFor={`status-${project._id}`}>
                Update status
              </label>
              <select
                id={`status-${project._id}`}
                value={project.status}
                onChange={(e) =>
                  changeStatus(project, e.target.value)
                }
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              <Link
                className="primary-link"
                to={`/projects/${project._id}`}
              >
                Open project
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
