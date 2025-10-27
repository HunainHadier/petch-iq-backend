import db from "../config/db.js";

export const createInvoiceModel = async (company_id, invoice_number, amount, currency, payment_status, issued_date, due_date, subscription_id) => {
  const sql = `INSERT INTO invoices (company_id, invoice_number, amount, currency, payment_status, issued_date, due_date, subscription_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await db.execute(sql, [company_id, invoice_number, amount, currency, payment_status, issued_date, due_date, subscription_id]);
  return result.insertId;
};

export const getInvoicesByCompany = async (company_id) => {
  const [rows] = await db.execute(
    `SELECT i.*, s.plan_name 
     FROM invoices i
     LEFT JOIN subscriptions s ON i.subscription_id = s.id
     WHERE i.company_id = ?
     ORDER BY i.issued_date DESC`,
    [company_id]
  );
  return rows;
};

export const getInvoiceById = async (id) => {
  const [rows] = await db.execute(
    `SELECT i.*, s.plan_name 
     FROM invoices i
     LEFT JOIN subscriptions s ON i.subscription_id = s.id
     WHERE i.id = ?`,
    [id]
  );
  return rows[0];
};

export const updateInvoiceModel = async (id, updates) => {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  const sql = `UPDATE invoices SET ${fields.join(", ")} WHERE id = ?`;
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
};

export const deleteInvoiceModel = async (id) => {
  const [result] = await db.execute(`DELETE FROM invoices WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};