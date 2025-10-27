import db from "../config/db.js";

export const createPhotoModel = async (meeting_id, image_url) => {
  const sql = `INSERT INTO photos (meeting_id, image_url, uploaded_at) VALUES (?, ?, NOW())`;
  const [result] = await db.execute(sql, [meeting_id, image_url]);
  return result.insertId;
};

export const getPhotosByMeeting = async (meeting_id) => {
  const [rows] = await db.execute(
    `SELECT p.*, ar.total_count, ar.result_json
     FROM photos p
     LEFT JOIN ai_results ar ON p.id = ar.photo_id
     WHERE p.meeting_id = ?
     ORDER BY p.uploaded_at DESC`,
    [meeting_id]
  );
  return rows;
};

export const getPhotoById = async (id) => {
  const [rows] = await db.execute(
    `SELECT p.*, ar.total_count, ar.result_json
     FROM photos p
     LEFT JOIN ai_results ar ON p.id = ar.photo_id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0];
};

export const updatePhotoModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const sql = `UPDATE photos SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const deletePhotoModel = async (id) => {
  const [result] = await db.execute(`DELETE FROM photos WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};