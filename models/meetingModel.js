import db from "../config/db.js";

export const createMeetingModel = async (company_id, customer_id, location_id, user_id, meeting_date, notes) => {
  const sql = `INSERT INTO meetings (company_id, customer_id, location_id, user_id, meeting_date, notes, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
  const [result] = await db.execute(sql, [company_id, customer_id, location_id, user_id, meeting_date, notes]);
  return result.insertId;
};

export const getMeetingsByCompany = async (company_id) => {
  const [rows] = await db.execute(
    `SELECT m.*, c.name as customer_name, l.name as location_name, u.first_name, u.last_name
     FROM meetings m
     LEFT JOIN customers c ON m.customer_id = c.id
     LEFT JOIN locations l ON m.location_id = l.id
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.company_id = ?
     ORDER BY m.meeting_date DESC`,
    [company_id]
  );
  return rows;
};

export const getMeetingById = async (id) => {
  const [rows] = await db.execute(
    `SELECT m.*, c.name as customer_name, l.name as location_name, u.first_name, u.last_name
     FROM meetings m
     LEFT JOIN customers c ON m.customer_id = c.id
     LEFT JOIN locations l ON m.location_id = l.id
     LEFT JOIN users u ON m.user_id = u.id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0];
};

export const updateMeetingModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const sql = `UPDATE meetings SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const deleteMeetingModel = async (id) => {
  const [result] = await db.execute(`DELETE FROM meetings WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};