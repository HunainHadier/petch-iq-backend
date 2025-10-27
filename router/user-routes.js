import express from "express";
import multer from "multer";
import path from "path";
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  getUserByIds,
  deleteUser,
  updateOwnProfile,
} from "../controllers/userController.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// 📁 Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "/uploads/profile_pictures"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// 🌍 Routes
router.post("/login", loginUser);
router.post("/register", upload.single("profile_image"), registerUser);
router.get("/getall", authMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserByIds);
router.put("/update/:userId", authMiddleware, upload.single("profile_image"), updateUser);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteUser);
router.put("/profile/update", authMiddleware, upload.single("profile_image"), updateOwnProfile);

export default router;
