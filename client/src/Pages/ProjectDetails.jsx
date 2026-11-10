import { useEffect, useState } from 
"react"
import { Link, useNavigate, useParams } from "react-router-dom"

import projectService from "../Services/projectService"

export default function ProjectDetails(){

    const {id} = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading , setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(()=>{
        async function loadProject() 
            {
                try{
                    const data = await projectService.getById(id);
                    setProject(data);
                }catch(error){
                    setError(
                        error.response?.data?.message || "Could not load project"
                    )
                }finally{
                    setLoading(false);
                }
        }
        loadProject()
    }, [id]);
    function handleChange(e){
        
        setProject({
            ...project,
            [e.target.name]:e.target.value,
        });
    }
    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setSaving(true);

        try{
            const updated = await projectService.update(id, {
                title: project.title,
                description: project.description,
                priority: project.priority,
                status: project.status,
                dueDate: project.dueDate || null,
            });
            setProject(updated);
        }catch(err){
            setError(
                err.response?.data?.message || 'Could not update project'
            );
        }finally{
            setSaving(false);
        }
    }

    async function  handleDelete(){
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this project?'
        );

        if(!confirmDelete) return;

        try{
            await projectService.remove(id);
            navigate("/projects");
        }catch(err){
            setError(
                err.response?.data?.message || 'Could not delete project'
            );
        }
    }


    if(loading) return <p>Loading project...</p>

    if(!project){
        return(
            <section className="page-container">
                <p className="error-message">{error || 'Project not found'}</p>
                <Link to="/projects">Back to projects</Link>
            </section>
        );
    }
    return(
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
                value={project.dueDate ? project.dueDate.slice(0, 10):""}
                onChange={handleChange} />

                <button type="submit" disabled={saving}>{saving? "Saving...":"Save Changes"}</button>

                <button type="button" onClick={handleDelete}>Delete project</button>
            </form>
        </section>
    );
} 