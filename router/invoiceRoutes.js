import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", authMiddleware, createInvoice);
router.get("/getall", authMiddleware, getInvoices);
router.get("/:id", authMiddleware, getInvoice);
router.put("/update/:id", authMiddleware, updateInvoice);
router.delete("/delete/:id", authMiddleware, deleteInvoice);

export default router;