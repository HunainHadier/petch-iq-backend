import express from "express";
import {
  createSubscription,
  getSubscriptions,
  getSubscription,
  updateSubscription,
  cancelSubscription,
} from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createSubscription);
router.get("/getall", authMiddleware, getSubscriptions);
router.get("/:id", authMiddleware, getSubscription);
router.put("/update/:id", authMiddleware, updateSubscription);
router.put("/cancel/:id", authMiddleware, cancelSubscription);

export default router;