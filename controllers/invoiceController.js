import {
  createInvoiceModel,
  getInvoicesByCompany,
  getInvoiceById,
  updateInvoiceModel,
  deleteInvoiceModel,
} from "../models/invoiceModel.js";

export const createInvoice = async (req, res) => {
  try {
    const { invoice_number, amount, currency, payment_status, issued_date, due_date, subscription_id } = req.body;
    const company_id = req.user.company_id;

    if (!invoice_number || !amount || !currency || !payment_status || !issued_date || !due_date) {
      return res.status(400).json({ success: false, message: "All invoice fields required" });
    }

    const invoiceId = await createInvoiceModel(company_id, invoice_number, amount, currency, payment_status, issued_date, due_date, subscription_id);
    return res.status(201).json({ success: true, message: "Invoice created", invoiceId });
  } catch (err) {
    console.error("Create invoice error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const invoices = await getInvoicesByCompany(company_id);
    return res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching invoices", error: err.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await getInvoiceById(id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    return res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching invoice", error: err.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const success = await updateInvoiceModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "Invoice not found" });
    return res.status(200).json({ success: true, message: "Invoice updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating invoice", error: err.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteInvoiceModel(id);
    if (!success) return res.status(404).json({ success: false, message: "Invoice not found" });
    return res.status(200).json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};