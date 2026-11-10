
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
