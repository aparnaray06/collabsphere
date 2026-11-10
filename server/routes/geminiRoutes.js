
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { chatWithGemini } from "../controllers/geminiController.js";

const router = Router();

router.use(authMiddleware);
router.post("/chat", chatWithGemini);

export default router;
