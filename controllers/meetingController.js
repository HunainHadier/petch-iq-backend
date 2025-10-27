import {
  createMeetingModel,
  getMeetingsByCompany,
  getMeetingById,
  updateMeetingModel,
  deleteMeetingModel,
} from "../models/meetingModel.js";

export const createMeeting = async (req, res) => {
  try {
    const { customer_id, location_id, meeting_date, notes } = req.body;
    const company_id = req.user.company_id;
    const user_id = req.user.id;

    if (!customer_id || !location_id || !meeting_date) {
      return res.status(400).json({ success: false, message: "Customer, location, and meeting date required" });
    }

    const meetingId = await createMeetingModel(company_id, customer_id, location_id, user_id, meeting_date, notes);
    return res.status(201).json({ success: true, message: "Meeting created", meetingId });
  } catch (err) {
    console.error("Create meeting error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const meetings = await getMeetingsByCompany(company_id);
    return res.status(200).json({ success: true, data: meetings });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching meetings", error: err.message });
  }
};

export const getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await getMeetingById(id);
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    return res.status(200).json({ success: true, data: meeting });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching meeting", error: err.message });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const success = await updateMeetingModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "Meeting not found" });
    return res.status(200).json({ success: true, message: "Meeting updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating meeting", error: err.message });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteMeetingModel(id);
    if (!success) return res.status(404).json({ success: false, message: "Meeting not found" });
    return res.status(200).json({ success: true, message: "Meeting deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};