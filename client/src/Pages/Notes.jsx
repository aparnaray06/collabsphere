
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";

import noteService from "../Services/noteService";
import projectService from "../Services/projectService";
import geminiService from "../Services/geminiService";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [projects, setProjects] = useState([]);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const contentHistory = useRef([""]);
    const historyIndex = useRef(0);
    const [project, setProject] = useState("");
    const [tags, setTags] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState("");
    const [aiResult, setAiResult] = useState("");
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    const filteredNotes = notes.filter(
        (note) =>
            note.title?.toLowerCase().includes(searchQuery) ||
            note.content?.toLowerCase().includes(searchQuery)
    );

    async function loadData() {
        try {
            setError("");

            const [notesData, projectsData] = await Promise.all([
                noteService.getAll(),
                projectService.getAll(),
            ]);

            setNotes(notesData);
            setProjects(projectsData);
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not load notes"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function handleContentChange(value) {
        const newContent = value || "";

        const history = contentHistory.current;
        const currentIndex = historyIndex.current;

        if (history[currentIndex] === newContent) return;

        const updatedHistory = history.slice(0, currentIndex + 1);
        updatedHistory.push(newContent);

        // Keep only the latest 100 changes
        if (updatedHistory.length > 100) {
            updatedHistory.shift();
        }

        contentHistory.current = updatedHistory;
        historyIndex.current = updatedHistory.length - 1;

        setContent(newContent);
    }

    function handleUndo() {
        if (historyIndex.current === 0) return;

        historyIndex.current -= 1;
        setContent(contentHistory.current[historyIndex.current]);
    }

    function resetForm() {
        setTitle("");
        setContent("");
        contentHistory.current = [""];
        historyIndex.current = 0;
        setProject("");
        setTags("");
        setEditingId(null);
        setAiResult("");
    }

    function handleEdit(note) {
        setEditingId(note._id);
        setTitle(note.title || "");
        setContent(note.content || "");
        contentHistory.current = [note.content || ""];
        historyIndex.current = 0;
        setProject(note.project?._id || "");
        setTags((note.tags || []).join(", "));
        setAiResult("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Note title is required");
            return;
        }

        const noteData = {
            title: title.trim(),
            content,
            project: project || null,
            tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        try {
            setSaving(true);

            if (editingId) {
                await noteService.update(editingId, noteData);
            } else {
                await noteService.create(noteData);
            }

            resetForm();
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not save note"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleExplain() {
        if (!content.trim()) {
            setError("Please write some note content first");
            return;
        }

        try {
            setError("");
            setAiLoading("explain");
            setAiResult("");

            const data = await geminiService.explain(content);
            setAiResult(data.explanation);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not explain this note"
            );
        } finally {
            setAiLoading("");
        }
    }

    async function handleSuggestImprovements() {
        if (!content.trim()) {
            setError("Please write some note content first");
            return;
        }

        try {
            setError("");
            setAiLoading("improve");
            setAiResult("");

            const data = await geminiService.suggestImprovements(content);
            setAiResult(data.reply);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not suggest improvements"
            );
        } finally {
            setAiLoading("");
        }
    }

    async function handleDelete(id) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) return;

        try {
            setError("");
            await noteService.remove(id);

            setNotes((previousNotes) =>
                previousNotes.filter((note) => note._id !== id)
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Could not delete note"
            );
        }
    }

    if (loading) return <p>Loading notes...</p>;

    return (
        <section className="page-container">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">YOUR WORKSPACE</p>
                    <h1>My Notes</h1>
                    <p>Create and manage your project notes.</p>
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <form className="form-card" onSubmit={handleSubmit}>
                <h2>{editingId ? "Edit Note" : "Create Note"}</h2>

                <label htmlFor="note-title">Title</label>
                <input
                    type="text"
                    id="note-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title"
                    required
                />

                <label htmlFor="note-content">Content (Markdown supported)</label>

                <div data-color-mode="light">
                    <MDEditor
                        value={content}
                        onChange={handleContentChange}
                        preview="edit"
                        height={300}
                        textareaProps={{
                            placeholder:
                                "Write your note using Markdown...",
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleUndo}
                        disabled={historyIndex.current === 0}
                    >
                        Undo
                    </button>
                </div>

                <div className="button-group">
                    <button
                        type="button"
                        onClick={handleExplain}
                        disabled={Boolean(aiLoading) || !content.trim()}
                    >
                        {aiLoading === "explain"
                            ? "Explaining..."
                            : "Explain this note"}
                    </button>

                    <button
                        type="button"
                        onClick={handleSuggestImprovements}
                        disabled={Boolean(aiLoading) || !content.trim()}
                    >
                        {aiLoading === "improve"
                            ? "Getting suggestions..."
                            : "Suggest improvements"}
                    </button>
                </div>

                {aiResult && (
                    <div className="form-card">
                        <h3>Gemini AI Response</h3>
                        <div data-color-mode="light">
                            <MDEditor.Markdown source={aiResult} />
                        </div>
                    </div>
                )}

                <label htmlFor="note-project">Related Project</label>
                <select
                    id="note-project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    required
                >
                    <option value="">Select a project</option>

                    {projects.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.title}
                        </option>
                    ))}
                </select>

                <label htmlFor="note-tags">Tags</label>
                <input
                    type="text"
                    id="note-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="React, JavaScript, Backend"
                />

                <button type="submit" disabled={saving}>
                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Note"
                            : "Create Note"}
                </button>

                {editingId && (
                    <button type="button" onClick={resetForm}>
                        Cancel Edit
                    </button>
                )}
            </form>

            <div className="note-list">
                <h2>All Notes ({filteredNotes.length})</h2>

                {filteredNotes.length === 0 ? (
                    <p>
                        {searchQuery
                            ? "No matching notes found."
                            : "No notes found. Create your first note!"}
                    </p>
                ) : (
                    filteredNotes.map((note) => (
                        <article className="note-card" key={note._id}>
                            <h3>{note.title}</h3>

                            <div data-color-mode="light">
                                {note.content ? (
                                    <MDEditor.Markdown
                                        source={note.content}
                                    />
                                ) : (
                                    <p>No content added.</p>
                                )}
                            </div>

                            <p>
                                Project: {note.project?.title || "No project"}
                            </p>

                            <p>
                                Tags: {(note.tags || []).join(", ") || "No tags"}
                            </p>

                            <button
                                type="button"
                                onClick={() => handleEdit(note)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(note._id)}
                            >
                                Delete
                            </button>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
