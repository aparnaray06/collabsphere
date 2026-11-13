
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FolderKanban, User, CalendarDays, Flag } from "lucide-react";
import projectService from "../Services/projectService";

export default function PublicProject() {
  const { token } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectService.getPublicProject(token);
        setProject(response.project);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load public project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [token]);

  if (loading) return <div className="public-loading">Loading project...</div>;

  if (error) return <div className="public-error">{error}</div>;

  if (!project) return <div className="public-error">Project not found</div>;

  return (
    <div className="public-project-page">
      <header className="public-project-header">
        <div className="public-brand">
          <FolderKanban size={25} />
          <span>CollabSphere</span>
        </div>
        <span className="public-label">Public Project</span>
      </header>

      <main className="public-project-content">
        <div className="public-project-card">
          <div className="public-project-top">
            <div className="public-project-icon">
              <FolderKanban size={30} />
            </div>
            <span className="public-status">
              {project.status || "Active"}
            </span>
          </div>

          <h1>{project.title}</h1>

          <p className="public-description">
            {project.description || "No project description available."}
          </p>

          <div className="public-project-divider" />

          <h3>Project Information</h3>

          <div className="public-info-grid">
            <div className="public-info-item">
              <User size={19} />
              <div>
                <small>Project Owner</small>
                <strong>{project.owner?.name || "Unknown"}</strong>
              </div>
            </div>

            <div className="public-info-item">
              <Flag size={19} />
              <div>
                <small>Priority</small>
                <strong>{project.priority || "Not specified"}</strong>
              </div>
            </div>

            <div className="public-info-item">
              <CalendarDays size={19} />
              <div>
                <small>Due Date</small>
                <strong>
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>
            </div>
          </div>

          <div className="public-project-footer">
            Shared securely through CollabSphere
          </div>
        </div>
      </main>
    </div>
  );
}
