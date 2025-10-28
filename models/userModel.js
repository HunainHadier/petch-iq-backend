import db from "../config/db.js";

// ✅ CREATE USER WITH OTP
export const createUser = async (
  companyId,
  firstName,
  lastName,
  email,
  hashedPassword,
  role = "exterminator",
  profileImage = null,
  isActive = 0, // Default to inactive until verified
  otpCode = null,
  otpExpiry = null
) => {
  const sql = `
    INSERT INTO users (
      company_id, first_name, last_name, role,
      profile_image, email, password, is_active, is_deleted,
      otp_code, otp_expiry, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW(), NOW())
  `;
  const [result] = await db.execute(sql, [
    companyId,
    firstName,
    lastName,
    role,
    profileImage,
    email,
    hashedPassword,
    isActive,
    otpCode,
    otpExpiry
  ]);
  return result.insertId;
};

// ✅ GET USER BY EMAIL
export const getUserByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT id, company_id, first_name, last_name, role, profile_image,
            email, password, is_active, is_deleted, otp_code, otp_expiry
     FROM users WHERE email = ? AND is_deleted = 0 LIMIT 1`,
    [email]
  );
  return rows[0];
};

// ✅ GET USER BY ID
export const getUserById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, company_id, first_name, last_name, role, profile_image,
            email, is_active, is_deleted, created_at, updated_at
     FROM users WHERE id = ? AND is_deleted = 0 LIMIT 1`,
    [id]
  );
  return rows[0];
};

// ✅ GET ALL USERS
export const getAllUsersModel = async (companyId) => {
  let sql = `
    SELECT id, company_id, first_name, last_name, role,
           profile_image, email, is_active, is_deleted, created_at
    FROM users WHERE is_deleted = 0
  `;
  const params = [];
  if (companyId) {
    sql += " AND company_id = ?";
    params.push(companyId);
  }
  sql += " ORDER BY id DESC";
  const [rows] = await db.execute(sql, params);
  return rows;
};

// ✅ UPDATE USER
export const updateUserModel = async (userId, updates) => {
  const allowedFields = ['first_name', 'last_name', 'profile_image', 'is_active', 'role'];
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) throw new Error("No valid fields provided to update.");
  values.push(userId);
  
  const sql = `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ? AND is_deleted = 0`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

// ✅ SOFT DELETE USER
export const softDeleteUser = async (userId) => {
  const [result] = await db.execute(
    `UPDATE users SET is_deleted = 1, is_active = 0, updated_at = NOW() WHERE id = ?`,
    [userId]
  );
  return result.affectedRows > 0;
};

// ✅ UPDATE USER PASSWORD
export const updateUserPassword = async (email, hashedPassword) => {
  const [result] = await db.execute(
    "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?",
    [hashedPassword, email]
  );
  return result.affectedRows > 0;
};

// ✅ SAVE OTP TO DATABASE
export const saveOtpToDatabase = async (email, otp, expiry) => {
  const [result] = await db.execute(
    "UPDATE users SET otp_code = ?, otp_expiry = ?, updated_at = NOW() WHERE email = ?",
    [otp, expiry, email]
  );
  return result.affectedRows > 0;
};

// ✅ VERIFY OTP FROM DATABASE
export const verifyOtpFromDatabase = async (email, otp) => {
  const [rows] = await db.execute(
    "SELECT otp_code, otp_expiry FROM users WHERE email = ?",
    [email]
  );
  
  if (rows.length === 0) return false;
  
  const { otp_code, otp_expiry } = rows[0];
  const now = new Date();
  
  if (otp_code !== otp) return false;
  if (now > new Date(otp_expiry)) return false;
  
  return true;
};

// ✅ CLEAR OTP FROM DATABASE
export const clearOtpFromDatabase = async (email) => {
  const [result] = await db.execute(
    "UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE email = ?",
    [email]
  );
  return result.affectedRows > 0;
};