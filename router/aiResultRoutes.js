import express from "express";
import {
  createAIResult,
  getAIResults,
  getAIResult,
  updateAIResult,
  deleteAIResult,
} from "../controllers/aiResultController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createAIResult);
router.get("/getall", authMiddleware, getAIResults);
router.get("/:id", authMiddleware, getAIResult);
router.put("/update/:id", authMiddleware, updateAIResult);
router.delete("/delete/:id", authMiddleware, deleteAIResult);

export default router;