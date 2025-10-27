import {
  createLocationModel,
  getLocationsByCustomer,
  getLocationById,
  updateLocationModel,
  softDeleteLocationModel,
} from "../models/locationModel.js";

export const createLocation = async (req, res) => {
  try {
    const { customer_id, name, address, city, zip } = req.body;
    if (!customer_id || !name) {
      return res.status(400).json({ success: false, message: "Customer ID and name required" });
    }
    const locationId = await createLocationModel(customer_id, name, address, city, zip);
    return res.status(201).json({ success: true, message: "Location created", locationId });
  } catch (err) {
    console.error("Create location error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getLocations = async (req, res) => {
  try {
    const { customer_id } = req.query;
    if (!customer_id) return res.status(400).json({ success: false, message: "Customer ID required" });
    const locations = await getLocationsByCustomer(customer_id);
    return res.status(200).json({ success: true, data: locations });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching locations", error: err.message });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await getLocationById(id);
    if (!location) return res.status(404).json({ success: false, message: "Location not found" });
    return res.status(200).json({ success: true, data: location });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching location", error: err.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const success = await updateLocationModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "Location not found" });
    return res.status(200).json({ success: true, message: "Location updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating location", error: err.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await softDeleteLocationModel(id);
    if (!success) return res.status(404).json({ success: false, message: "Location not found" });
    return res.status(200).json({ success: true, message: "Location deleted (soft)" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};