import express from "express";
import { getAllCompanies } from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin → Get all companies with owners
router.get("/companies", getAllCompanies);

export default router;
