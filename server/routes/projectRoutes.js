
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getPublicProject } from "../controllers/projectController.js";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  getProjectAnalytics,
  updateProjectVisibility,
} from "../controllers/projectController.js";

const router = Router();

router.get("/public/:token", getPublicProject);
router.use(authMiddleware);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.get("/:id/analytics", getProjectAnalytics);
router.post("/:id/members", addProjectMember);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.patch("/:id/visibility", updateProjectVisibility);

export default router;
