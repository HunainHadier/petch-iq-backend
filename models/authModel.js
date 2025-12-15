import db from "../config/db.js";
import bcrypt from "bcryptjs";


// ✅ Register normal user (OTP send karega)
export const registerNormalUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const [result] = await db.execute(
    `INSERT INTO users 
      (first_name, last_name, email, password, auth_type, is_company_owner, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'normal', 1, 0, NOW(), NOW())`, // is_active = 0 until OTP verified
    [data.first_name, data.last_name, data.email, hashedPassword]
  );
  return result.insertId;
};

// ✅ Get user by email
export const getUserByEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

// ✅ Get user by ID
export const getUserById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

// ✅ Create user via social login (Google/Facebook/Apple)
export const registerSocialUser = async (data) => {
  console.log('Starting social user registration with data:', data);
  
  const {
    first_name,
    last_name,
    email,
    auth_type,
    google_id = null,
    google_avatar = null,
    facebook_id = null,
    facebook_avatar = null,
    apple_id = null,
    apple_avatar = null,
  } = data;

  try {
    console.log('Executing SQL insert...');
    const [result] = await db.execute(
      `INSERT INTO users 
        (first_name, last_name, email, auth_type, google_id, google_avatar, facebook_id, facebook_avatar, apple_id, apple_avatar, is_active, is_company_owner, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
      [
        first_name,
        last_name,
        email,
        auth_type,
        google_id,
        google_avatar,
        facebook_id,
        facebook_avatar,
        apple_id,
        apple_avatar,
      ]
    );
    
    console.log('User inserted successfully with ID:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('Error in registerSocialUser:', error);
    throw error;
  }
};

// ✅ Update Google user info
export const updateGoogleUser = async (id, google_id, google_avatar) => {
  await db.execute(
    `UPDATE users SET google_id = ?, google_avatar = ? WHERE id = ?`,
    [google_id, google_avatar, id]
  );
};

// ✅ Update Facebook user info
export const updateFacebookUser = async (id, facebook_id, facebook_avatar) => {
  await db.execute(
    `UPDATE users SET facebook_id = ?, facebook_avatar = ? WHERE id = ?`,
    [facebook_id, facebook_avatar, id]
  );
};

// ✅ Update Apple user info
export const updateAppleUser = async (id, apple_id, apple_avatar) => {
  await db.execute(
    `UPDATE users SET apple_id = ?, apple_avatar = ? WHERE id = ?`,
    [apple_id, apple_avatar, id]
  );
};


// ✅ Store OTP in database
export const storeOtp = async (email, otp) => {
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  await db.execute(
    `UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?`,
    [otp, otpExpiry, email]
  );
  
  return otp;
};

// ✅ Verify OTP
export const verifyOtp = async (email, otp) => {
  const [rows] = await db.execute(
    `SELECT otp_code, otp_expiry FROM users WHERE email = ?`,
    [email]
  );
  
  if (rows.length === 0) return false;
  
  const user = rows[0];
  
  // Check if OTP exists and not expired
  if (!user.otp_code || !user.otp_expiry) return false;
  
  const now = new Date();
  const expiry = new Date(user.otp_expiry);
  
  if (now > expiry) return false; // OTP expired
  
  return user.otp_code === otp;
};

// ✅ Clear OTP after successful verification
export const clearOtp = async (email) => {
  await db.execute(
    `UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE email = ?`,
    [email]
  );
};


// ✅ Activate user after OTP verification
export const activateUser = async (email) => {
  await db.execute(
    `UPDATE users SET is_active = 1, otp_code = NULL, otp_expiry = NULL WHERE email = ?`,
    [email]
  );
};

// ✅ Update user profile
export const updateUserProfile = async (userId, data) => {
  // Build dynamic SET clause and values array for the query
  const validFields = ['first_name', 'last_name', 'phone', 'avatar'];
  const updates = [];
  const values = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (validFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updates.length === 0) return null;
  
  values.push(userId); // Add userId for WHERE clause
  
  const [result] = await db.execute(
    `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
    values
  );
  
  if (result.affectedRows > 0) {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
    const user = rows[0];
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
};
