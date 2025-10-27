import db from "../config/db.js";

// ✅ CREATE USER
export const createUser = async (
  companyId,
  firstName,
  lastName,
  email,
  hashedPassword,
  role = "exterminator",
  profileImage = null,
  isActive = 1
) => {
  const sql = `
    INSERT INTO users (
      company_id, first_name, last_name, role,
      profile_image, email, password, is_active, is_deleted,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
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
  ]);
  return result.insertId;
};

// ✅ GET USER BY EMAIL
export const getUserByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT id, company_id, first_name, last_name, role, profile_image,
            email, password, is_active, is_deleted
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0];
};

// ✅ GET USER BY ID
export const getUserById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, company_id, first_name, last_name, role, profile_image,
            email, is_active, is_deleted, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
};

// ✅ GET ALL USERS
export const getAllUsersModel = async (companyId) => {
  let sql = `
    SELECT id, company_id, first_name, last_name, role,
           profile_image, email, is_active, is_deleted, created_at
    FROM users
  `;
  const params = [];
  if (companyId) {
    sql += " WHERE company_id = ?";
    params.push(companyId);
  }
  sql += " ORDER BY id DESC";
  const [rows] = await db.execute(sql, params);
  return rows;
};

// ✅ UPDATE USER
export const updateUserModel = async (userId, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  if (fields.length === 0) throw new Error("No fields provided to update.");
  values.push(userId);
  const sql = `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

// ✅ SOFT DELETE USER
export const softDeleteUser = async (userId) => {
  const [result] = await db.execute(
    `UPDATE users
     SET is_deleted = 1, is_active = 0, updated_at = NOW()
     WHERE id = ?`,
    [userId]
  );
  return result.affectedRows > 0;
};
