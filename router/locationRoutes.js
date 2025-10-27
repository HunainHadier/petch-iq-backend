import express from "express";
import {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createLocation);
router.get("/getall", authMiddleware, getLocations);
router.get("/:id", authMiddleware, getLocation);
router.put("/update/:id", authMiddleware, updateLocation);
router.delete("/delete/:id", authMiddleware, deleteLocation);

export default router;