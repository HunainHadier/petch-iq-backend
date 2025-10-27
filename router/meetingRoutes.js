import express from "express";
import {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
} from "../controllers/meetingController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createMeeting);
router.get("/getall", authMiddleware, getMeetings);
router.get("/:id", authMiddleware, getMeeting);
router.put("/update/:id", authMiddleware, updateMeeting);
router.delete("/delete/:id", authMiddleware, deleteMeeting);

export default router;