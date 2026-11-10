
import Note from "../models/Note.js";
import Project from "../models/Project.js";

export async function getNotes(req, res, next) {
  try {
    const notes = await Note.find({ owner: req.user._id })
      .populate("project", "title")
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    next(error);
  }
}

export async function createNote(req, res, next) {
  try {
    const { title, content, project, tags } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Note title is required",
      });
    }

    if (project) {
      const accessibleProject = await Project.findOne({
        _id: project,
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      });

      if (!accessibleProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      project: project || null,
      tags: Array.isArray(tags) ? tags : [],
      owner: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const { title, content, project, tags } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Note title cannot be empty",
        });
      }
      note.title = title.trim();
    }

    if (content !== undefined) note.content = content;

    if (project !== undefined) {
      if (project) {
        const accessibleProject = await Project.findOne({
          _id: project,
          $or: [{ owner: req.user._id }, { members: req.user._id }],
        });

        if (!accessibleProject) {
          return res.status(404).json({
            message: "Project not found",
          });
        }
      }

      note.project = project || null;
    }

    if (tags !== undefined && Array.isArray(tags)) {
      note.tags = tags;
    }

    await note.save();
    res.json(note);
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
}
