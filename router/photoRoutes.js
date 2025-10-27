import express from "express";
import multer from "multer";
import path from "path";
import {
  createPhoto,
  getPhotos,
  getPhoto,
  updatePhoto,
  deletePhoto,
} from "../controllers/photoController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "/uploads/photos"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

router.post("/create", authMiddleware, upload.single("image"), createPhoto);
router.get("/getall", authMiddleware, getPhotos);
router.get("/:id", authMiddleware, getPhoto);
router.put("/update/:id", authMiddleware, upload.single("image"), updatePhoto);
router.delete("/delete/:id", authMiddleware, deletePhoto);

export default router;