import db from "../config/db.js";

export const createAIResultModel = async (photo_id, total_count, result_json) => {
  const sql = `INSERT INTO ai_results (photo_id, total_count, result_json, created_at) VALUES (?, ?, ?, NOW())`;
  const [result] = await db.execute(sql, [photo_id, total_count, JSON.stringify(result_json)]);
  return result.insertId;
};

export const getAIResultsByPhoto = async (photo_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM ai_results WHERE photo_id = ? ORDER BY created_at DESC`,
    [photo_id]
  );
  return rows;
};

export const getAIResultById = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM ai_results WHERE id = ?`, [id]);
  return rows[0];
};

export const updateAIResultModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'result_json') {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  values.push(id);
  const sql = `UPDATE ai_results SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const deleteAIResultModel = async (id) => {
  const [result] = await db.execute(`DELETE FROM ai_results WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};