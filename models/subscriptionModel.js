import db from "../config/db.js";

export const createSubscriptionModel = async (company_id, plan_name, photos_limit, price, start_date, end_date) => {
  const sql = `INSERT INTO subscriptions (company_id, plan_name, photos_limit, price, start_date, end_date, is_active)
               VALUES (?, ?, ?, ?, ?, ?, TRUE)`;
  const [result] = await db.execute(sql, [company_id, plan_name, photos_limit, price, start_date, end_date]);
  return result.insertId;
};

export const getSubscriptionsByCompany = async (company_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM subscriptions WHERE company_id = ? ORDER BY start_date DESC`,
    [company_id]
  );
  return rows;
};

export const getSubscriptionById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM subscriptions WHERE id = ?`, [id]);
  return rows[0];
};

export const updateSubscriptionModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const sql = `UPDATE subscriptions SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const cancelSubscriptionModel = async (id) => {
  const [result] = await db.execute(
    `UPDATE subscriptions SET is_active = FALSE WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};