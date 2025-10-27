import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createCustomer);
router.get("/getall", authMiddleware, getCustomers);
router.get("/:id", authMiddleware, getCustomer);
router.put("/update/:id", authMiddleware, updateCustomer);
router.delete("/delete/:id", authMiddleware, deleteCustomer);

export default router;