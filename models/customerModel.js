import db from "../config/db.js";

export const createCustomerModel = async (company_id, name, contact_person, phone, email) => {
  const sql = `INSERT INTO customers (company_id, name, contact_person, phone, email, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
  const [result] = await db.execute(sql, [company_id, name, contact_person, phone, email]);
  return result.insertId;
};

export const getCustomersByCompany = async (company_id) => {
  const [rows] = await db.execute(
    `SELECT id, name, contact_person, phone, email, is_active, created_at 
     FROM customers 
     WHERE company_id = ? AND is_active = TRUE 
     ORDER BY id DESC`,
    [company_id]
  );
  return rows;
};

export const getCustomerById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, company_id, name, contact_person, phone, email, is_active, created_at 
     FROM customers 
     WHERE id = ? AND is_active = TRUE`,
    [id]
  );
  return rows[0];
};

export const updateCustomerModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const sql = `UPDATE customers SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const softDeleteCustomerModel = async (id) => {
  const [result] = await db.execute(
    `UPDATE customers SET is_active = FALSE, updated_at = NOW() WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};