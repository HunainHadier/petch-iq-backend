import db from "../config/db.js";

export const createLocationModel = async (customer_id, name, address, city, zip) => {
  const sql = `INSERT INTO locations (customer_id, name, address, city, zip, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
  const [result] = await db.execute(sql, [customer_id, name, address, city, zip]);
  return result.insertId;
};

export const getLocationsByCustomer = async (customer_id) => {
  const [rows] = await db.execute(
    `SELECT id, name, address, city, zip, is_active, created_at 
     FROM locations 
     WHERE customer_id = ? AND is_active = TRUE 
     ORDER BY id DESC`,
    [customer_id]
  );
  return rows;
};

export const getLocationById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, customer_id, name, address, city, zip, is_active, created_at 
     FROM locations 
     WHERE id = ? AND is_active = TRUE`,
    [id]
  );
  return rows[0];
};

export const updateLocationModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const sql = `UPDATE locations SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const softDeleteLocationModel = async (id) => {
  const [result] = await db.execute(
    `UPDATE locations SET is_active = FALSE, updated_at = NOW() WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};