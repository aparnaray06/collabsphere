
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  chatWithGemini,
  explainContent,
  generateDocs,
  generateReadme,
  suggestImprovements,
} from "../controllers/geminiController.js";

const router = Router();

router.use(authMiddleware);

// Existing AI chat
router.post("/chat", chatWithGemini);

// Explain code or content
router.post("/explain", explainContent);

// Generate project documentation
router.post("/docs", generateDocs);

// Generate README.md
router.post("/readme", generateReadme);

router.post("/suggest-improvements", suggestImprovements);

export default router;
