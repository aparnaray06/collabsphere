
import { useEffect, useState } from "react";

import fileService from "../Services/fileService";
import projectService from "../Services/projectService";

const codeExtensions = [
    "js", "jsx", "ts", "tsx", "html", "css",
    "json", "py", "java", "c", "cpp", "php",
    "sql", "sh",
];

export default function Files() {
    const [files, setFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [explanationFileId, setExplanationFileId] = useState("");

    const [project, setProject] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const [explanation, setExplanation] = useState("");
    const [explainingId, setExplainingId] = useState("");

    async function loadData() {
        try {
            setError("");

            const [filesData, projectsData] = await Promise.all([
                fileService.getAll(),
                projectService.getAll(),
            ]);

            setFiles(filesData);
            setProjects(projectsData);
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not load files"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const API_ORIGIN = (
        import.meta.env.VITE_API_URL || "http://localhost:8000/api"
    ).replace(/\/api\/?$/, "");

    function getExtension(file) {
        return file.originalName
            ?.split(".")
            .pop()
            .toLowerCase();
    }

    function isCodeFile(file) {
        return codeExtensions.includes(getExtension(file));
    }

    function isImage(file) {
        return file.mimetype?.startsWith("image/");
    }

    function isPDF(file) {
        return file.mimetype === "application/pdf" ||
            getExtension(file) === "pdf";
    }

    async function handleUpload(e) {
        e.preventDefault();
        setError("");

        if (!selectedFile) {
            setError("Please select a file");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5 MB");
            return;
        }

        try {
            setUploading(true);

            await fileService.upload(selectedFile, project);

            setSelectedFile(null);
            setProject("");
            e.target.reset();

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message || "File upload failed"
            );
        } finally {
            setUploading(false);
        }
    }

    async function handlePreview(file) {
        setError("");
        setExplanation("");
        setExplanationFileId("");

        const fileUrl = `${API_ORIGIN}${file.path}`;

        if (isImage(file)) {
            setPreview({
                id: file._id,
                type: "image",
                url: fileUrl,
            });
            return;
        }

        if (isPDF(file)) {
            setPreview({
                id: file._id,
                type: "pdf",
                url: fileUrl,
            });
            return;
        }

        try {
            setPreviewLoading(true);

            const data = await fileService.preview(file._id);

            setPreview({
                id: file._id,
                type: "text",
                content: data.content,
                truncated: data.truncated,
            });
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not preview file"
            );
        } finally {
            setPreviewLoading(false);
        }
    }

    async function handleExplain(file) {
        try {
            setError("");
            setExplanation("");
            setExplanationFileId(file._id);
            setExplainingId(file._id);


            const data = await fileService.explain(file._id);

            setExplanation(data.explanation);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not explain this code"
            );
        } finally {
            setExplainingId("");
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this file?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await fileService.remove(id);

            setFiles((previousFiles) =>
                previousFiles.filter((file) => file._id !== id)
            );

            if (preview?.id === id) {
                setPreview(null);
            }

            setExplanation("");
            setExplanationFileId("");
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not delete file"
            );
        }
    }

    function formatSize(size) {
        if (size < 1024) return `${size} B`;

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    if (loading) return <p>Loading files...</p>;

    return (
        <section className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">YOUR WORKSPACE</p>
                    <h1>My Files</h1>
                    <p>Upload, preview and manage your project files.</p>
                </div>
            </div>

            {error && (
                <p className="error-message">{error}</p>
            )}

            <form className="form-card" onSubmit={handleUpload}>
                <h2>Upload File</h2>

                <label htmlFor="file">Choose File</label>

                <input
                    type="file"
                    id="file"
                    accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.webp,.js,.jsx,.ts,.tsx,.html,.css,.json,.py,.java,.c,.cpp,.php,.sql,.sh"
                    onChange={(e) =>
                        setSelectedFile(e.target.files[0] || null)
                    }
                />

                <label htmlFor="project">Related Project</label>

                <select
                    id="project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                >
                    <option value="">No project</option>

                    {projects.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.title}
                        </option>
                    ))}
                </select>

                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload File"}
                </button>
            </form>

            <div className="files-list">
                <h2>Uploaded Files ({files.length})</h2>

                {files.length === 0 ? (
                    <p>No files uploaded yet.</p>
                ) : (
                    files.map((file) => (
                        <article className="file-card" key={file._id}>
                            <h3>{file.originalName}</h3>

                            <p>Type: {file.mimetype}</p>
                            <p>Size: {formatSize(file.size)}</p>

                            <p>
                                Project: {file.project?.title || "No project"}
                            </p>

                            <div className="button-group">
                                <button
                                    type="button"
                                    onClick={() => handlePreview(file)}
                                >
                                    Preview
                                </button>

                                {isCodeFile(file) && (
                                    <button
                                        type="button"
                                        disabled={Boolean(explainingId)}
                                        onClick={() => handleExplain(file)}
                                    >
                                        {explainingId === file._id
                                            ? "Explaining..."
                                            : "Explain this code"}
                                    </button>
                                )}

                                <a
                                    href={`${API_ORIGIN}${file.path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open / Download
                                </a>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(file._id)}
                                >
                                    Delete
                                </button>
                            </div>

                            {explanation && explanationFileId === file._id && (
                                <div className="form-card">
                                    <h3>Gemini Explanation</h3>
                                    <p>{explanation}</p>
                                </div>
                            )}
                        </article>
                    ))
                )}
            </div>

            {previewLoading && <p>Loading preview...</p>}

            {preview && (
                <div className="form-card">
                    <div className="page-heading">
                        <h2>File Preview</h2>

                        <button
                            type="button"
                            onClick={() => {
                                setPreview(null);
                                setExplanation("");
                                setExplanationFileId("");
                            }}
                        >
                            Close Preview
                        </button>
                    </div>

                    {preview.type === "image" && (
                        <img
                            src={preview.url}
                            alt="Uploaded file preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "500px",
                                objectFit: "contain",
                            }}
                        />
                    )}

                    {preview.type === "pdf" && (
                        <iframe
                            src={preview.url}
                            title="PDF Preview"
                            width="100%"
                            height="500px"
                        />
                    )}

                    {preview.type === "text" && (
                        <>
                            <pre
                                style={{
                                    whiteSpace: "pre-wrap",
                                    overflowX: "auto",
                                    padding: "16px",
                                    borderRadius: "8px",
                                }}
                            >
                                {preview.content}
                            </pre>

                            {preview.truncated && (
                                <p>
                                    Preview shortened to the first 50,000
                                    characters.
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
