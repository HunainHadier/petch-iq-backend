// import db from "../config/db.js";

// export const getDashboardStats = async (company_id = null, owner_id = null, userOnly = false) => {
//   console.log("🟢 getDashboardStats called =>", { company_id, owner_id, userOnly });

//   // ✅ Customers linked to company
//   let total_customers = 0;
//   if (company_id) {
//     const [[customers]] = await db.execute(
//       `SELECT COUNT(*) AS total_customers 
//        FROM customers 
//        WHERE company_id = ?`,
//       [company_id]
//     );
//     total_customers = customers?.total_customers || 0;
//   }

//   // ✅ Exterminators added by this owner
//   let total_exterminators = 0;
//   if (owner_id) {
//     const [[exterminators]] = await db.execute(
//       `SELECT COUNT(*) AS total_exterminators 
//        FROM users 
//        WHERE added_by = ? 
//          AND (is_company_owner = 0 OR is_company_owner IS NULL)`,
//       [owner_id]
//     );
//     total_exterminators = exterminators?.total_exterminators || 0;
//   }

//   // ✅ Meetings linked to company
//   let total_meetings = 0;
//   if (company_id) {
//     const [[meetings]] = await db.execute(
//       `SELECT COUNT(*) AS total_meetings 
//        FROM meetings 
//        WHERE company_id = ?`,
//       [company_id]
//     );
//     total_meetings = meetings?.total_meetings || 0;
//   }

//   // ✅ Photos linked to company
//   let total_photos = 0;
//   if (company_id) {
//     const [[photos]] = await db.execute(
//       `SELECT COUNT(p.id) AS total_photos
//        FROM photos p
//        JOIN users u ON p.exterminator_id = u.id
//        WHERE u.company_id = ? 
//          AND (u.is_company_owner = 0 OR u.is_company_owner IS NULL)`,
//       [company_id]
//     );
//     total_photos = photos?.total_photos || 0;
//   }

//   // ✅ Locations linked to company
//   let total_locations = 0;
//   if (company_id) {
//     const [[locations]] = await db.execute(
//       `SELECT COUNT(*) AS total_locations 
//        FROM locations 
//        WHERE company_id = ?`,
//       [company_id]
//     );
//     total_locations = locations?.total_locations || 0;
//   }

//   const result = {
//     total_customers,
//     total_exterminators,
//     total_meetings,
//     total_photos,
//     total_locations, // ✅ New field added
//   };

//   console.log("📊 Dashboard Stats Result:", result);
//   return result;
// };


import db from "../config/db.js";

export const getDashboardStats = async (company_id = null, owner_id = null, userOnly = false) => {
  console.log("🟢 getDashboardStats called =>", { company_id, owner_id, userOnly });

  // ------------------------------------------------------------
  // ✅ 1. ADMIN → Global Counts (No Filters)
  // ------------------------------------------------------------
  if (!company_id && !owner_id && !userOnly) {
    const [[customers]] = await db.execute(`SELECT COUNT(*) AS total_customers FROM customers`);
    const [[exterminators]] = await db.execute(`SELECT COUNT(*) AS total_exterminators FROM users`);
    const [[meetings]] = await db.execute(`SELECT COUNT(*) AS total_meetings FROM meetings`);
    const [[photos]] = await db.execute(`SELECT COUNT(*) AS total_photos FROM photos`);
    const [[locations]] = await db.execute(`SELECT COUNT(*) AS total_locations FROM locations`);

    return {
      total_customers: customers.total_customers,
      total_exterminators: exterminators.total_exterminators,
      total_meetings: meetings.total_meetings,
      total_photos: photos.total_photos,
      total_locations: locations.total_locations,
    };
  }

  // ------------------------------------------------------------
  // ✅ 2. COMPANY OWNER / USER → Existing Logic
  // ------------------------------------------------------------

  // Customers of specific company
  let total_customers = 0;
  if (company_id) {
    const [[customers]] = await db.execute(
      `SELECT COUNT(*) AS total_customers 
       FROM customers 
       WHERE company_id = ?`,
      [company_id]
    );
    total_customers = customers?.total_customers || 0;
  }

  // Exterminators under company owner
  let total_exterminators = 0;
  if (owner_id) {
    const [[exterminators]] = await db.execute(
      `SELECT COUNT(*) AS total_exterminators 
       FROM users 
       WHERE added_by = ? 
         AND (is_company_owner = 0 OR is_company_owner IS NULL)`,
      [owner_id]
    );
    total_exterminators = exterminators?.total_exterminators || 0;
  }

  // Meetings linked to company
  let total_meetings = 0;
  if (company_id) {
    const [[meetings]] = await db.execute(
      `SELECT COUNT(*) AS total_meetings 
       FROM meetings 
       WHERE company_id = ?`,
      [company_id]
    );
    total_meetings = meetings?.total_meetings || 0;
  }

  // Photos of company
  let total_photos = 0;
  if (company_id) {
    const [[photos]] = await db.execute(
      `SELECT COUNT(p.id) AS total_photos
       FROM photos p
       JOIN users u ON p.exterminator_id = u.id
       WHERE u.company_id = ? 
         AND (u.is_company_owner = 0 OR u.is_company_owner IS NULL)`,
      [company_id]
    );
    total_photos = photos?.total_photos || 0;
  }

  // Locations of company
  let total_locations = 0;
  if (company_id) {
    const [[locations]] = await db.execute(
      `SELECT COUNT(*) AS total_locations 
       FROM locations 
       WHERE company_id = ?`,
      [company_id]
    );
    total_locations = locations?.total_locations || 0;
  }

  const result = {
    total_customers,
    total_exterminators,
    total_meetings,
    total_photos,
    total_locations,
  };

  console.log("📊 Dashboard Stats Result:", result);
  return result;
};
