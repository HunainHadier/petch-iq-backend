import {
  createCustomerModel,
  getCustomersByCompany,
  getCustomerById,
  updateCustomerModel,
  softDeleteCustomerModel,
} from "../models/customerModel.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, contact_person, phone, email } = req.body;
    const company_id = req.user.company_id;

    if (!name) {
      return res.status(400).json({ success: false, message: "Customer name required" });
    }

    const customerId = await createCustomerModel(company_id, name, contact_person, phone, email);
    return res.status(201).json({ success: true, message: "Customer created", customerId });
  } catch (err) {
    console.error("Create customer error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const customers = await getCustomersByCompany(company_id);
    return res.status(200).json({ success: true, data: customers });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching customers", error: err.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getCustomerById(id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching customer", error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const success = await updateCustomerModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "Customer not found" });
    return res.status(200).json({ success: true, message: "Customer updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating customer", error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await softDeleteCustomerModel(id);
    if (!success) return res.status(404).json({ success: false, message: "Customer not found" });
    return res.status(200).json({ success: true, message: "Customer deleted (soft)" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};