
import Project from "../models/Project.js";

export async function getProjects(req, res, next) {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Project title is required",
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description || "",
      status: status || "Planning",
      priority: priority || "Medium",
      dueDate: dueDate || null,
      owner: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    }

    if (!project.title.trim()) {
      return res.status(400).json({
        message: "Project title cannot be empty",
      });
    }

    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
}
