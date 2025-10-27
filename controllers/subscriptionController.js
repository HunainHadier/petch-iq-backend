import {
  createSubscriptionModel,
  getSubscriptionsByCompany,
  getSubscriptionById,
  updateSubscriptionModel,
  cancelSubscriptionModel,
} from "../models/subscriptionModel.js";

export const createSubscription = async (req, res) => {
  try {
    const { plan_name, photos_limit, price, start_date, end_date } = req.body;
    const company_id = req.user.company_id;

    if (!plan_name || !photos_limit || !price || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: "All subscription fields required" });
    }

    const subscriptionId = await createSubscriptionModel(company_id, plan_name, photos_limit, price, start_date, end_date);
    return res.status(201).json({ success: true, message: "Subscription created", subscriptionId });
  } catch (err) {
    console.error("Create subscription error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const subscriptions = await getSubscriptionsByCompany(company_id);
    return res.status(200).json({ success: true, data: subscriptions });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching subscriptions", error: err.message });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await getSubscriptionById(id);
    if (!subscription) return res.status(404).json({ success: false, message: "Subscription not found" });
    return res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching subscription", error: err.message });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const success = await updateSubscriptionModel(id, updates);
    if (!success) return res.status(404).json({ success: false, message: "Subscription not found" });
    return res.status(200).json({ success: true, message: "Subscription updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating subscription", error: err.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await cancelSubscriptionModel(id);
    if (!success) return res.status(404).json({ success: false, message: "Subscription not found" });
    return res.status(200).json({ success: true, message: "Subscription cancelled" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};