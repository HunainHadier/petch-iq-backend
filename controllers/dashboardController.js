import jwt from "jsonwebtoken";
import { getDashboardStats } from "../models/dashboardModel.js";

export const fetchDashboardStats = async (req, res) => {
  try {
    // ✅ Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - Token missing" });
    }

    // ✅ Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: user_id, company_id, role } = decoded;

    console.log("Dashboard request:", user_id, company_id, role);

    if (!company_id && role !== "admin") {
      return res.status(400).json({ success: false, message: "Invalid token: company_id missing" });
    }

    let stats;

    if (role === "admin") {
      // ✅ Admin → all data
      stats = await getDashboardStats();
    } 
    else if (role === "company_owner") {
      // ✅ Company owner → own company stats
      stats = await getDashboardStats(company_id, user_id);
    } 
    else if (role === "user") {
      // ✅ Regular user → only stats relevant to self
      stats = await getDashboardStats(company_id, user_id, true); // `true` = filter by user only
    } 
    else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: stats,
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

