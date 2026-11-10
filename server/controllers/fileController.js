
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import File from "../models/File.js";
import Project from "../models/Project.js";

const uploadDirectory = path.resolve("uploads");

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

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(
        new Error("Only PDF, TXT, JPG, PNG and WEBP files are allowed")
      );
    }

    callback(null, true);
  },
});

export async function getFiles(req, res, next) {
  try {
    const files = await File.find({ owner: req.user._id })
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    next(error);
  }
}

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
        $or: [{ owner: req.user._id }, { members: req.user._id }],
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

export async function deleteFile(req, res, next) {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const diskPath = path.join(uploadDirectory, file.filename);

    await fs.unlink(diskPath).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });

    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
}
