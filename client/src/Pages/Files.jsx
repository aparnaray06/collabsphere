import { useEffect, useState } from "react";

import fileService from "../Services/fileService";
import projectService from "../Services/projectService";

export default function Files(){
    const [files, setFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [project, setProject] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    async function loadData(){
        try{
            setError("");
            const [filesData, projectsData] = await Promise.all([
                fileService.getAll(),
                projectService.getAll(),
            ]);

            setFiles(filesData);
            setProjects(projectsData);
        }catch(err){
            setError(
                err.response?.data?.message || 'Could not load files'
            );
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        loadData();
    }, []);
    async function handleupload(e){
        e.preventDefault();
        setError("");

        if(!selectedFile){
            setError("Please select a file");
            return;
        }

        if(selectedFile.size > 5 * 1024 * 1024){
            setError("File size must be less than 5 MB");
            return;
        }

        try{
            setUploading(true);

            await fileService.upload(selectedFile, project);

            setSelectedFile(null);
            setProject("");
            e.target.reset();

            await loadData();

        }catch(err){
            setError(
                err.response?.data?.message || 'File upload failed'
            );
        }finally{
            setUploading(false);
        }
    }

    async function handledelete(id){
        const confirmed = window.confirm("Are you sure you want to delete this file?");

        if(!confirmed) return;
        try{
            setError("");
            await fileService.remove(id);
            setFiles((previousFiles)=>
            previousFiles.filter((file)=> file._id !== id));
        }catch(err){
            setError(
                err.response?.data?.message || "Could not delete file"
            );
        }
    }

    function formatSize(size){
        if(size<1024) return `${size}B`;
        if(size < 1024*1024){
            return `${(size/1024).toFixed(1)}KB`;
        }
        return `${(size/(1024*1024)).toFixed(2)} MB`;
    }
    if(loading) return <p>Loading files...</p>;
    const API_ORIGIN = (
        import.meta.env.VITE_API_URL || "http://localhost:8000/api"
    ).replace(/\/api\/?$/, "");

    return (
        <section className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">YOUR WORKSPACE</p>
                    <h1>My Files</h1>
                    <p>Upload and manage your project files.</p>
                </div>
            </div>

            {
                error && <p className="error-message">{error}</p>
            }

            <form className="form-card" onSubmit={handleupload}>
                <h2>Upload File</h2>
                <label htmlFor="file">Choose File</label>
 
                <input type="file" 
                id="file"
                accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                onChange={(e)=>setSelectedFile(e.target.files[0] || null)}/>

                <label htmlFor="project">Related Project</label>

                <select id="project"
                value={project}
                onChange={(e)=>setProject(e.target.value)}>
                    <option value="">No project</option>

                    {projects.map((item)=>(
                        <option key={item._id} value={item._id}>{item.title}</option>
                    ))}
                </select>

                <button type="submit" disabled={uploading}>
                    {uploading? "Uploading..." : "Upload File"}
                </button>
            </form>

            <div className="files-list">
                <h2>Upload Files({files.length})</h2>
                {files.length === 0? (
                    <p>No files upload yet.</p>
                ):(
                    files.map((file)=>(
                        <article className="file-card" key={file._id}>
                            <h3>{file.originalName}</h3>
                            <p>Type: {file.mimetype}</p>
                            <p>Size: {formatSize(file.size)}</p>
                            <p>
                                project: {file.project?.title || "No project"}
                            </p>

                            <a href={`${API_ORIGIN}${file.path}`} target="_blank"
                            rel="noopener noreferrer">Open / Download</a>

                            <button type="button" onClick={()=> handledelete(file._id)}>Delete</button>
                        </article>
                    ))
                )}
            </div>
        </section>

    )

}