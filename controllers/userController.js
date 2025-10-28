import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import db from "../config/db.js";

import {
  createUser,
  getUserByEmail,
  getAllUsersModel,
  updateUserModel,
  getUserById,
  softDeleteUser,
  updateUserPassword,
  saveOtpToDatabase,
  verifyOtpFromDatabase,
  clearOtpFromDatabase
} from "../models/userModel.js";

import { sendOtpEmail, sendResetEmail } from "../utils/mailer.js";

dotenv.config();

// ✅ GENERATE OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ REGISTER USER WITH OTP VERIFICATION
export const registerUser = async (req, res) => {
  try {
    const { company_id, first_name, last_name, email, password, role, is_active } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

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

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with is_active = 0 (unverified)
    const userId = await createUser(
      finalCompanyId,
      first_name,
      last_name,
      email,
      hashed,
      finalRole,
      profileImage,
      0, // is_active = 0 until verified
      otp,
      otpExpiry
    );

    // Send OTP email
    await sendOtpEmail(email, otp, first_name);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email with OTP.",
      userId,
      role: finalRole,
      requiresVerification: true
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration", error: err.message });
  }
};

// ✅ VERIFY REGISTRATION OTP
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.is_active === 1) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    // Verify OTP
    const isOtpValid = await verifyOtpFromDatabase(email, otp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Activate user account
    await db.execute(
      "UPDATE users SET is_active = 1, otp_code = NULL, otp_expiry = NULL WHERE email = ?",
      [email]
    );

    return res.status(200).json({ 
      success: true, 
      message: "Email verified successfully. Your account is now active." 
    });
  } catch (err) {
    console.error("Verify Registration OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ RESEND OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.is_active === 1) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await saveOtpToDatabase(email, otp, otpExpiry);

    // Send OTP email
    await sendOtpEmail(email, otp, user.first_name);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ LOGIN USER (Check if verified)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.is_deleted === 1) {
      return res.status(403).json({ success: false, message: "Account has been deleted." });
    }

    // Check if account is verified
    if (user.is_active === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Account not verified. Please verify your email first.",
        requiresVerification: true
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

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

// ✅ REQUEST PASSWORD RESET WITH OTP
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      // Security: Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset OTP has been sent."
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await saveOtpToDatabase(email, otp, otpExpiry);

    // Send OTP email
    await sendOtpEmail(email, otp, user.first_name);

    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset OTP has been sent."
    });
  } catch (err) {
    console.error("RequestReset Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ VERIFY PASSWORD RESET OTP
export const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify OTP
    const isOtpValid = await verifyOtpFromDatabase(email, otp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Generate reset token for password change
    const resetToken = jwt.sign(
      { email, purpose: 'password_reset' },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: '15m' }
    );

    // Clear OTP after successful verification
    await clearOtpFromDatabase(email);

    return res.status(200).json({ 
      success: true, 
      message: "OTP verified successfully",
      resetToken 
    });
  } catch (err) {
    console.error("Verify Password Reset OTP Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ RESET PASSWORD WITH TOKEN
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: "Reset token and new password required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "secretkey");
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ success: false, message: "Invalid token purpose" });
    }

    const { email } = decoded;

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await updateUserPassword(email, hashed);

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("ResetPassword Error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersModel(req.user?.company_id);
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

    if (req.file) {
      updates.profile_image = `/uploads/profile_pictures/${req.file.filename}`;
    }

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

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting user" });
  }
};

// ✅ UPDATE OWN PROFILE
export const updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name } = req.body;
    const updates = { first_name, last_name };

    if (req.file) {
      updates.profile_image = `/uploads/profile_pictures/${req.file.filename}`;
    }

    const success = await updateUserModel(userId, updates);
    if (!success) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};