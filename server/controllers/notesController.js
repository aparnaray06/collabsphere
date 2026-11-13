
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import mongoose from "mongoose";

// Get notes belonging to projects the user can access
export async function getNotes(req, res, next) {
  try {
    const accessibleProjects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    }).select("_id");

    const projectIds = accessibleProjects.map(
      (project) => project._id
    );

    const filter = {
      project: { $in: projectIds },
    };

    // Optionally filter by a particular project
    if (req.query.projectId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.projectId)) {
        return res.status(400).json({
          message: "Invalid project ID",
        });
      }

      const hasAccess = projectIds.some(
        (id) => id.toString() === req.query.projectId
      );

      if (!hasAccess) {
        return res.status(403).json({
          message: "You do not have access to this project",
        });
      }

      filter.project = req.query.projectId;
    }

    const notes = await Note.find(filter)
      .populate("project", "title")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    next(error);
  }
}

// Create a note inside a project
export async function createNote(req, res, next) {
  try {
    const { title, content, project, tags } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Note title is required",
      });
    }

    if (!project) {
      return res.status(400).json({
        message: "Please select a project for this note",
      });
    }

    const accessibleProject = await Project.findOne({
      _id: project,
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    });

    if (!accessibleProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content || "",
      project: accessibleProject._id,
      tags: Array.isArray(tags) ? tags : [],
      owner: req.user._id,
    });

    await note.populate([
      { path: "project", select: "title" },
      { path: "owner", select: "name email" },
    ]);

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

// Update a note
export async function updateNote(req, res, next) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you are not the owner",
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

    if (content !== undefined) {
      note.content = content;
    }

    // Notes cannot be moved outside an accessible project
    if (project !== undefined) {
      if (!project) {
        return res.status(400).json({
          message: "A project is required for every note",
        });
      }

      const accessibleProject = await Project.findOne({
        _id: project,
        $or: [
          { owner: req.user._id },
          { members: req.user._id },
        ],
      });

      if (!accessibleProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      note.project = accessibleProject._id;
    }

    if (tags !== undefined && Array.isArray(tags)) {
      note.tags = tags;
    }

    await note.save();
    await note.populate([
      { path: "project", select: "title" },
      { path: "owner", select: "name email" },
    ]);

    res.json(note);
  } catch (error) {
    next(error);
  }
}

// Delete a note
export async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        message: "Note not found or you are not the owner",
      });
    }

    res.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
