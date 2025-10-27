import {
  createAIResultModel,
  getAIResultsByPhoto,
  getAIResultById,
  updateAIResultModel,
  deleteAIResultModel,
} from "../models/aiResultModel.js";

export const createAIResult = async (req, res) => {
  try {
    const { photo_id, total_count, result_json } = req.body;

    if (!photo_id || total_count === undefined || !result_json) {
      return res.status(400).json({ success: false, message: "Photo ID, total count, and result JSON required" });
    }

    const resultId = await createAIResultModel(photo_id, total_count, result_json);
    return res.status(201).json({ success: true, message: "AI result saved", resultId });
  } catch (err) {
    console.error("Create AI result error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getAIResults = async (req, res) => {
  try {
    const { photo_id } = req.query;
    if (!photo_id) return res.status(400).json({ success: false, message: "Photo ID required" });
    const results = await getAIResultsByPhoto(photo_id);
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching AI results", error: err.message });
  }
};

export const getAIResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getAIResultById(id);
    if (!result) return res.status(404).json({ success: false, message: "AI result not found" });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching AI result", error: err.message });
  }
};

export const updateAIResult = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const success = await updateAIResultModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "AI result not found" });
    return res.status(200).json({ success: true, message: "AI result updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating AI result", error: err.message });
  }
};

export const deleteAIResult = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteAIResultModel(id);
    if (!success) return res.status(404).json({ success: false, message: "AI result not found" });
    return res.status(200).json({ success: true, message: "AI result deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};