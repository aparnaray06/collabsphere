import { useEffect, useState } from
    "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import projectService from "../Services/projectService"

export default function ProjectDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [updatingVisibility, setUpdatingVisibility] = useState(false);

    const [memberEmail, setMemberEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);

    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    useEffect(() => {
        async function loadProject() {
            try {
                const data = await projectService.getById(id);
                setProject(data);
            } catch (error) {
                setError(
                    error.response?.data?.message || "Could not load project"
                )
            } finally {
                setLoading(false);
            }
        }
        loadProject()
    }, [id]);

    useEffect(() => {
        async function loadAnalytics() {
            try {
                const data = await projectService.getAnalytics(id);
                setAnalytics(data);
            } catch (err) {
                setError(
                    err.response?.data?.message || "Could not load analytics"
                );
            } finally {
                setAnalyticsLoading(false);
            }
        }

        loadAnalytics();
    }, [id]);

    function handleChange(e) {

        setProject({
            ...project,
            [e.target.name]: e.target.value,
        });
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const updated = await projectService.update(id, {
                title: project.title,
                description: project.description,
                priority: project.priority,
                status: project.status,
                dueDate: project.dueDate || null,
            });
            setProject(updated);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Could not update project'
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleAddMember(e) {
        e.preventDefault();
        setError("");
        setAddingMember(true);

        try {
            const response = await projectService.addMember(id, memberEmail);

            setProject(response.project);
            setMemberEmail("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not add member"
            );
        } finally {
            setAddingMember(false);
        }
    }

    async function handleVisibilityChange() {
        setError("");
        setUpdatingVisibility(true);

        try {
            const response = await projectService.updateVisibility(
                id,
                !project.isPublic
            );

            setProject((prev) => ({
                ...prev,
                isPublic: response.isPublic,
                shareToken: response.shareToken,
            }));
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not update project visibility"
            );
        } finally {
            setUpdatingVisibility(false);
        }
    }

    async function handleDelete() {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this project?'
        );

        if (!confirmDelete) return;

        try {
            await projectService.remove(id);
            navigate("/projects");
        } catch (err) {
            setError(
                err.response?.data?.message || 'Could not delete project'
            );
        }
    }


    if (loading) return <p>Loading project...</p>

    if (!project) {
        return (
            <section className="page-container">
                <p className="error-message">{error || 'Project not found'}</p>
                <Link to="/projects">Back to projects</Link>
            </section>
        );
    }
    return (
        <section className="page-container">
            <Link to="/projects">Back to project</Link>

            <div className="page-heading">
                <div>
                    <p className="eyebrow">PROJECT DETAILS</p>
                    <h1>{project.title}</h1>
                    <p>View and manage your project.</p>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="form-card">
                <h2>Project Members</h2>

                <div>
                    <p>
                        <strong>Owner:</strong>{" "}
                        {project.owner?.name || "Project Owner"}
                    </p>
                    <p>
                        <strong>Email:</strong>{" "}
                        {project.owner?.email || ""}
                    </p>
                </div>

                <h3>Members</h3>

                {project.members?.length > 0 ? (
                    project.members.map((member) => (
                        <div key={member._id}>
                            <p>
                                {member.name} — {member.email}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No members added yet.</p>
                )}

                <form onSubmit={handleAddMember}>
                    <label htmlFor="memberEmail">Invite member by email</label>

                    <input
                        type="email"
                        id="memberEmail"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="Enter registered user's email"
                        required
                    />

                    <button type="submit" disabled={addingMember}>
                        {addingMember ? "Adding..." : "Add Member"}
                    </button>
                </form>
            </div>


            <div className="form-card">
                <h2>Public Project Sharing</h2>

                <p>
                    Project Status:{" "}
                    <strong>{project.isPublic ? "Public" : "Private"}</strong>
                </p>

                <button
                    type="button"
                    onClick={handleVisibilityChange}
                    disabled={updatingVisibility}
                >
                    {updatingVisibility
                        ? "Updating..."
                        : project.isPublic
                            ? "Make Private"
                            : "Make Public"}
                </button>

                {project.isPublic && project.shareToken && (
                    <div>
                        <p>Share this project using the link:</p>

                        <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/public/projects/${project.shareToken}`}
                        />
                    </div>
                )}
            </div>

            <div className="form-card">
                <h2>Contribution Analytics</h2>
                <p>Track contributions made by project members.</p>

                {analyticsLoading ? (
                    <p>Loading analytics...</p>
                ) : analytics ? (
                    <>
                        <div className="analytics-summary">
                            <div>
                                <h3>{analytics.totalNotes}</h3>
                                <p>Total Notes</p>
                            </div>

                            <div>
                                <h3>{analytics.totalFiles}</h3>
                                <p>Total Files</p>
                            </div>
                        </div>

                        <h3>Member Contributions</h3>

                        {analytics.contributors.map((contributor) => (
                            <div key={contributor.user._id}>
                                <h4>{contributor.user.name}</h4>
                                <p>{contributor.user.email}</p>

                                <p>Notes Created: {contributor.notesCreated}</p>
                                <p>Files Uploaded: {contributor.filesUploaded}</p>
                                <p>
                                    Total Contributions:{" "}
                                    {contributor.totalContributions}
                                </p>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>Analytics are not available.</p>
                )}
            </div>
            <form className="form-card" onSubmit={handleSubmit}>
                <label htmlFor="title">Project title</label>
                <input type="text"
                    id="title"
                    name="title"
                    value={project.title}
                    onChange={handleChange}
                    required />

                <label htmlFor="description">Description</label>

                <textarea id="description"
                    name="description"
                    value={project.description || ""}
                    onChange={handleChange}
                    rows={4}></textarea>

                <label htmlFor="priority"
                >Priority</label>

                <select name="priority" id="priority"
                    value={project.priority}

                    onChange={handleChange}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>

                <label htmlFor="status">Status</label>

                <select name="status" id="status"
                    value={project.status}
                    onChange={handleChange}>
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                </select>

                <label htmlFor="dueDate">Due Date</label>
                <input type="date"
                    name="dueDate"
                    id="dueDate"
                    value={project.dueDate ? project.dueDate.slice(0, 10) : ""}
                    onChange={handleChange} />

                <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>

                <button type="button" onClick={handleDelete}>Delete project</button>
            </form>
        </section>
    );
} 