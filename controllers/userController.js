import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import {
  createUser,
  getUserByEmail,
  getAllUsersModel,
  updateUserModel,
  getUserById,
  softDeleteUser,
} from "../models/userModel.js";

// ✅ REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { company_id, first_name, last_name, email, password, role, is_active } = req.body;

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await getUserByEmail(email);
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const profileImage = req.file ? `/uploads/profile_pictures/${req.file.filename}` : null;

    let finalRole = "exterminator";
    if (req.user && (req.user.role === "super_admin" || req.user.role === "company_admin") && role) {
      finalRole = role;
    }

    let finalCompanyId = company_id || null;
    if (!finalCompanyId && req.user && req.user.company_id) {
      finalCompanyId = req.user.company_id;
    }

    const userId = await createUser(
      finalCompanyId,
      first_name,
      last_name,
      email,
      hashed,
      finalRole,
      profileImage,
      is_active === 0 ? 0 : 1
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId,
      role: finalRole,
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration", error: err.message });
  }
};

// ✅ LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await getUserByEmail(email);
    if (!user)
      return res.status(404).json({ success: false, message: "Invalid credentials" });

    if (user.is_deleted === 1 || user.is_active === 0)
      return res.status(403).json({ success: false, message: "Account inactive or deleted." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id ?? null,
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        company_id: user.company_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersModel(req.user.company_id);
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching users", error: err.message });
  }
};

// ✅ GET USER BY ID
export const getUserByIds = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error fetching user", error: err.message });
  }
};

// ✅ UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (req.file) updates.profile_image = `/uploads/profile_pictures/${req.file.filename}`;
    const success = await updateUserModel(userId, updates);

    if (!success) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating user", error: err.message });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "User ID required" });

    const ok = await softDeleteUser(id);
    if (!ok) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, message: "User deleted successfully (soft delete)" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting user" });
  }
};

// ✅ UPDATE OWN PROFILE
export const updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    if (req.file) updates.profile_image = `/uploads/profile_pictures/${req.file.filename}`;

    const success = await updateUserModel(userId, updates);
    if (!success) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};
