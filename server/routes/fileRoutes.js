
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getFiles,
  uploadFile,
  deleteFile,
  upload,
} from "../controllers/fileController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getFiles);
router.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
      next();
    });
  },
  uploadFile
);
router.delete("/:id", deleteFile);

export default router;
