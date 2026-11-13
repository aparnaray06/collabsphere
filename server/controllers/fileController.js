
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";

import File from "../models/File.js";
import Project from "../models/Project.js";
import { explainContent } from "./geminiController.js";

const uploadDirectory = path.resolve("uploads");

// File types allowed for upload
const allowedExtensions = new Set([
  ".jpg", ".jpeg", ".png", ".webp",
  ".pdf", ".txt", ".md",
  ".js", ".jsx", ".ts", ".tsx",
  ".html", ".css", ".json",
  ".py", ".java", ".c", ".cpp",
  ".php", ".sql", ".sh",
]);

const codeExtensions = new Set([
  ".js", ".jsx", ".ts", ".tsx",
  ".html", ".css", ".json",
  ".py", ".java", ".c", ".cpp",
  ".php", ".sql", ".sh",
]);

const storage = multer.diskStorage({
  destination: async (req, file, callback) => {
    try {
      await fs.mkdir(uploadDirectory, { recursive: true });
      callback(null, uploadDirectory);
    } catch (error) {
      callback(error);
    }
  },

  filename: (req, file, callback) => {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    callback(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new Error(
          "This file type is not allowed. Please upload an image, PDF, text, or supported code file."
        )
      );
    }

    callback(null, true);
  },
});

// Check whether the logged-in user can access a file
async function findAccessibleFile(fileId, userId) {
  const file = await File.findById(fileId).populate("project", "title");

  if (!file) return null;

  const isOwner = file.owner.toString() === userId.toString();

  let isProjectMember = false;

  if (file.project) {
    const project = await Project.findOne({
      _id: file.project._id,
      $or: [
        { owner: userId },
        { members: userId },
      ],
    });

    isProjectMember = Boolean(project);
  }

  return isOwner || isProjectMember ? file : null;
}

// Get files
export async function getFiles(req, res, next) {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    }).select("_id");

    const projectIds = projects.map((project) => project._id);

    const files = await File.find({
      $or: [
        { owner: req.user._id },
        { project: { $in: projectIds } },
      ],
    })
      .populate("project", "title")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    next(error);
  }
}

// Upload file
export async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file",
      });
    }

    const projectId = req.body.project || null;

    if (projectId) {
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { owner: req.user._id },
          { members: req.user._id },
        ],
      });

      if (!project) {
        await fs.unlink(req.file.path).catch(() => {});

        return res.status(404).json({
          message: "Project not found",
        });
      }
    }

    const file = await File.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      owner: req.user._id,
      project: projectId,
    });

    res.status(201).json(file);
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
}

// Preview text and code files
export async function previewFile(req, res, next) {
  try {
    const file = await findAccessibleFile(
      req.params.id,
      req.user._id
    );

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const extension = path.extname(file.originalName).toLowerCase();

    if (
      extension === ".pdf" ||
      extension === ".jpg" ||
      extension === ".jpeg" ||
      extension === ".png" ||
      extension === ".webp"
    ) {
      return res.status(400).json({
        message: "Use the file URL to preview this file",
      });
    }

    const diskPath = path.join(uploadDirectory, file.filename);
    const content = await fs.readFile(diskPath, "utf8");

    res.json({
      content: content.slice(0, 50000),
      truncated: content.length > 50000,
    });
  } catch (error) {
    next(error);
  }
}

// Explain uploaded code using Gemini
export async function explainFile(req, res, next) {
  try {
    const file = await findAccessibleFile(
      req.params.id,
      req.user._id
    );

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const extension = path.extname(file.originalName).toLowerCase();

    if (!codeExtensions.has(extension)) {
      return res.status(400).json({
        message: "Gemini explanation is available for code files only",
      });
    }

    const diskPath = path.join(uploadDirectory, file.filename);
    const content = await fs.readFile(diskPath, "utf8");

    if (!content.trim()) {
      return res.status(400).json({
        message: "This code file is empty",
      });
    }
    req.body = req.body || {};
    req.body.content = `
      Explain this uploaded ${extension} code file.
      File name: ${file.originalName}

      Code:
      ${content.slice(0, 12000)}
    `;

    return explainContent(req, res, next);
  } catch (error) {
    next(error);
  }
}

// Delete file
export async function deleteFile(req, res, next) {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found or you are not the owner",
      });
    }

    const diskPath = path.join(uploadDirectory, file.filename);

    await fs.unlink(diskPath).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });

    await file.deleteOne();

    res.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
