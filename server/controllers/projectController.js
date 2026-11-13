import Project from "../models/Project.js";
import User from "../models/User.js";

import Note from "../models/Note.js";
import File from "../models/File.js";

import { randomBytes } from "crypto";

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

export async function addProjectMember(req, res, next) {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Member email is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        message: "No registered user found with this email",
      });
    }

    if (user._id.equals(project.owner)) {
      return res.status(400).json({
        message: "Project owner is already a member",
      });
    }

    if (project.members.some((memberId) => memberId.equals(user._id))) {
      return res.status(400).json({
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);

    await project.save();

    await project.populate("members", "name email");

    res.status(200).json({
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
}


export async function getProjectAnalytics(req, res, next) {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate("owner members", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const notes = await Note.find({
      project: project._id,
    }).populate("owner", "name email");

    const files = await File.find({
      project: project._id,
    }).populate("owner", "name email");

    const contributors = [
      project.owner,
      ...project.members,
    ];

    const analytics = contributors.map((member) => {
      const memberNotes = notes.filter(
        (note) => note.owner?._id.toString() === member._id.toString()
      );

      const memberFiles = files.filter(
        (file) => file.owner?._id.toString() === member._id.toString()
      );

      return {
        user: {
          _id: member._id,
          name: member.name,
          email: member.email,
        },
        notesCreated: memberNotes.length,
        filesUploaded: memberFiles.length,
        totalContributions: memberNotes.length + memberFiles.length,
      };
    });

    res.status(200).json({
      projectId: project._id,
      projectTitle: project.title,
      totalNotes: notes.length,
      totalFiles: files.length,
      contributors: analytics,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectVisibility(req, res, next) {
  try {
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({
        message: "isPublic must be true or false",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you are not the owner",
      });
    }

    project.isPublic = isPublic;

    if (isPublic) {
      if (!project.shareToken) {
        project.shareToken = randomBytes(24).toString("hex");
      }
    } else {
      project.shareToken = undefined;
    }

    await project.save();

    res.status(200).json({
      message: isPublic
        ? "Project is now public"
        : "Project is now private",
      isPublic: project.isPublic,
      shareToken: project.shareToken || null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProject(req, res, next) {
  try {
    const project = await Project.findOne({
      shareToken: req.params.token,
      isPublic: true,
    }).populate("owner", "name");

    if (!project) {
      return res.status(404).json({
        message: "Public project not found",
      });
    }

    res.status(200).json({
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        dueDate: project.dueDate,
        owner: project.owner,
        createdAt: project.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}