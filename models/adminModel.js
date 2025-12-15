import db from "../config/db.js";

export const getAllCompaniesWithOwners = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT
        c.id AS company_id,
        c.name AS company_name,
        c.email AS company_email,
        c.phone AS company_phone,
        c.address AS company_address,
        c.subscription_status,
        c.subscription_expires_at,
        c.created_at AS company_created_at,

        u.id AS owner_id,
        u.first_name AS owner_first_name,
        u.last_name AS owner_last_name,
        u.email AS owner_email,
        u.mobile AS owner_mobile,
        u.city AS owner_city,
        u.country AS owner_country,
        u.created_at AS owner_created_at

      FROM companies c
      LEFT JOIN users u 
        ON u.company_id = c.id 
        AND u.is_company_owner = 1
        AND u.is_deleted = 0

      ORDER BY c.created_at DESC
    `);

    return rows;
  } catch (error) {
    console.error("❌ Error in getAllCompaniesWithOwners:", error);
    throw error;
  }
};
