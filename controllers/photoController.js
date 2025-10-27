import {
  createPhotoModel,
  getPhotosByMeeting,
  getPhotoById,
  updatePhotoModel,
  deletePhotoModel,
} from "../models/photoModel.js";

export const createPhoto = async (req, res) => {
  try {
    const { meeting_id } = req.body;
    const image_url = req.file ? `/uploads/photos/${req.file.filename}` : null;

    if (!meeting_id || !image_url) {
      return res.status(400).json({ success: false, message: "Meeting ID and image required" });
    }

    const photoId = await createPhotoModel(meeting_id, image_url);
    return res.status(201).json({ success: true, message: "Photo uploaded", photoId });
  } catch (err) {
    console.error("Create photo error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getPhotos = async (req, res) => {
  try {
    const { meeting_id } = req.query;
    if (!meeting_id) return res.status(400).json({ success: false, message: "Meeting ID required" });
    const photos = await getPhotosByMeeting(meeting_id);
    return res.status(200).json({ success: true, data: photos });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching photos", error: err.message });
  }
};

export const getPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await getPhotoById(id);
    if (!photo) return res.status(404).json({ success: false, message: "Photo not found" });
    return res.status(200).json({ success: true, data: photo });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching photo", error: err.message });
  }
};

export const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) updates.image_url = `/uploads/photos/${req.file.filename}`;
    
    const success = await updatePhotoModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "Photo not found" });
    return res.status(200).json({ success: true, message: "Photo updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating photo", error: err.message });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deletePhotoModel(id);
    if (!success) return res.status(404).json({ success: false, message: "Photo not found" });
    return res.status(200).json({ success: true, message: "Photo deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};