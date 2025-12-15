import db from "../config/db.js";

export const uploadPhoto = async (data) => {
  const { meeting_id, exterminator_id, customer_id, image_base64, location_id } = data;

  const [result] = await db.execute(
    `INSERT INTO photos 
      (meeting_id, exterminator_id, customer_id, location_id, image_url, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [meeting_id, exterminator_id, customer_id, location_id, image_base64]
  );

  return result.insertId;
};

export const saveAIResult = async ({ photo_id, detected_pest, confidence }) => {
  await db.execute(
    `INSERT INTO ai_results 
      (photo_id, detected_pest, confidence, created_at)
     VALUES (?, ?, ?, NOW())`,
    [photo_id, detected_pest, confidence]
  );
};

// photomodel.js
export const getPhotosByMeeting = async (meeting_id) => {
  try {
    // FIX GROUP_CONCAT truncate issue
    await db.execute("SET SESSION group_concat_max_len = 1000000");

    const [photos] = await db.execute(
      `SELECT 
        p.id,
        p.meeting_id,
        p.exterminator_id,
        p.customer_id,
        p.location_id,
        p.image_url,
        p.created_at,
        -- Exterminator details
        CONCAT(u.first_name, ' ', u.last_name) AS exterminator_name,
        u.email AS exterminator_email,
        -- Location details
        l.name AS location_name,
        l.address AS location_address,
        l.street AS location_street,
        l.city AS location_city,
        l.state AS location_state,
        l.country AS location_country,
        l.post_code AS location_post_code,
        l.latitude AS location_latitude,
        l.longitude AS location_longitude,
        -- Customer details
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address,
        -- AI results
        GROUP_CONCAT(
          CONCAT(
            '{"species":"', COALESCE(ai.detected_pest, ''), 
            '","confidence":', COALESCE(ai.confidence, 0), 
            ',"id":', COALESCE(ai.id, 0), '}'
          ) 
          ORDER BY ai.confidence DESC
          SEPARATOR '|||'
        ) as ai_results
      FROM photos p
      LEFT JOIN ai_results ai ON ai.photo_id = p.id
      LEFT JOIN users u ON p.exterminator_id = u.id AND u.company_id = 11  -- Assuming company_id filter
      LEFT JOIN locations l ON p.location_id = l.id AND l.company_id = 11
      LEFT JOIN customers c ON p.customer_id = c.id AND c.company_id = 11
      WHERE p.meeting_id = ?
      GROUP BY p.id, p.meeting_id, p.exterminator_id, p.customer_id, 
               p.location_id, p.image_url, p.created_at,
               u.first_name, u.last_name, u.email,
               l.name, l.address, l.street, l.city, l.state, l.country, l.post_code, l.latitude, l.longitude,
               c.name, c.email, c.phone, c.address
      ORDER BY p.created_at DESC`,
      [meeting_id]
    );

    // Process the results to parse ai_results into an array of objects
    const processedPhotos = photos.map(photo => ({
      ...photo,
      image_url: photo.image_url,  // Assuming this is already base64 or a URL
      ai_results: photo.ai_results 
        ? photo.ai_results.split('|||').map(item => {
            try {
              return JSON.parse(item);
            } catch (error) {
              console.error('Error parsing AI result:', item, error);
              return null;  // Return null for invalid JSON
            }
          }).filter(Boolean)  // Remove nulls
        : []
    }));

    return processedPhotos;
  } catch (error) {
    console.error('Error fetching photos by meeting:', error);
    throw new Error('Failed to fetch photos');
  }
};


// Get photos by exterminator with AI results (OPTIMIZED)
export const getPhotosByExterminator = async (exterminator_id) => {
  const [photos] = await db.execute(
    `SELECT 
        p.id AS photo_id,
        p.meeting_id,
        p.exterminator_id,
        p.customer_id,
        p.location_id,
        p.image_url,
        p.created_at,

        -- Exterminator/User
        u.first_name AS exterminator_first_name,
        u.last_name AS exterminator_last_name,
        u.email AS exterminator_email,
        u.mobile AS exterminator_phone,

        -- Company info
        c.name AS company_name,

        -- Customer
        cust.name AS customer_name,
        cust.email AS customer_email,
        cust.phone AS customer_phone,

        -- Location
        l.name AS location_name,
        l.address AS location_address,
        l.city AS location_city,
        l.country AS location_country,

        -- AI Results
        GROUP_CONCAT(
          CONCAT(
            '{"species":"', COALESCE(ai.detected_pest, ''), 
            '","confidence":', COALESCE(ai.confidence, 0), 
            ',"id":', COALESCE(ai.id, 0), '}'
          ) 
          ORDER BY ai.confidence DESC
          SEPARATOR '|||'
        ) as ai_results

      FROM photos p
      JOIN users u ON p.exterminator_id = u.id
      JOIN companies c ON u.company_id = c.id
      LEFT JOIN customers cust ON p.customer_id = cust.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN ai_results ai ON ai.photo_id = p.id

      WHERE p.exterminator_id = ?
      GROUP BY 
          p.id, p.meeting_id, p.exterminator_id, p.customer_id,
          p.location_id, p.image_url, p.created_at,
          u.first_name, u.last_name, u.email, u.mobile,
          c.name, cust.name, cust.email, cust.phone,
          l.name, l.address, l.city, l.country

      ORDER BY p.created_at DESC
      LIMIT 200`,
    [exterminator_id]
  );

  return photos.map(photo => ({
    ...photo,
    image_url: `data:image/jpeg;base64,${photo.image_url}`,
    ai_results: photo.ai_results 
      ? photo.ai_results.split('|||').map(item => {
          try { return JSON.parse(item); } catch { return null; }
        }).filter(Boolean)
      : []
  }));
};


// Get photos by company with AI results & details (OPTIMIZED)
export const getPhotosByCompany = async (company_id) => {
  const [photos] = await db.execute(
    `SELECT 
        p.id AS photo_id,
        p.meeting_id,
        p.image_url,
        p.created_at,

        -- Exterminator/User
        u.first_name AS exterminator_first_name,
        u.last_name AS exterminator_last_name,

        -- Company
        c.name AS company_name,

        -- Customer
        cust.name AS customer_name,
        cust.email AS customer_email,
        cust.phone AS customer_phone,

        -- Location
        l.name AS location_name,
        l.address AS location_address,
        l.city AS location_city,
        l.country AS location_country,

        -- AI Results
        GROUP_CONCAT(
          CONCAT(
            '{"species":"', COALESCE(ai.detected_pest, ''), 
            '","confidence":', COALESCE(ai.confidence, 0), 
            ',"id":', COALESCE(ai.id, 0), '}'
          ) 
          ORDER BY ai.confidence DESC
          SEPARATOR '|||'
        ) as ai_results

     FROM photos p
     JOIN users u ON p.exterminator_id = u.id
     JOIN companies c ON u.company_id = c.id
     JOIN customers cust ON p.customer_id = cust.id
     JOIN locations l ON p.location_id = l.id
     LEFT JOIN ai_results ai ON ai.photo_id = p.id
     
     WHERE u.company_id = ?
     GROUP BY p.id, p.meeting_id, p.image_url, p.created_at,
              u.first_name, u.last_name, c.name, cust.name, cust.email, 
              cust.phone, l.name, l.address, l.city, l.country
     ORDER BY p.created_at DESC`,
    [company_id]
  );

  return photos.map(photo => ({
    ...photo,
    ai_results: photo.ai_results 
      ? photo.ai_results.split('|||').map(item => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        }).filter(Boolean)
      : []
  }));
};

// Get all photos with AI results (ADMIN ONLY)
export const getAllPhotos = async () => {
  const [photos] = await db.execute(
    `SELECT 
      p.id,
      p.meeting_id,
      p.exterminator_id,
      p.customer_id,
      p.location_id,
      p.image_url,
      p.created_at,
      
      -- Company name
      c.name AS company_name,
      
      -- Customer name
      cust.name AS customer_name,
      
      -- Exterminator name
      u.first_name AS exterminator_first_name,
      u.last_name AS exterminator_last_name,
      
      -- AI Results
      GROUP_CONCAT(
        CONCAT(
          '{"species":"', COALESCE(ai.detected_pest, ''), 
          '","confidence":', COALESCE(ai.confidence, 0), 
          ',"id":', COALESCE(ai.id, 0), '}'
        ) 
        ORDER BY ai.confidence DESC
        SEPARATOR '|||'
      ) as ai_results
    FROM photos p
    JOIN users u ON p.exterminator_id = u.id
    JOIN companies c ON u.company_id = c.id
    JOIN customers cust ON p.customer_id = cust.id
    LEFT JOIN ai_results ai ON ai.photo_id = p.id
    GROUP BY p.id, p.meeting_id, p.exterminator_id, p.customer_id, 
             p.location_id, p.image_url, p.created_at, c.name, 
             cust.name, u.first_name, u.last_name
    ORDER BY p.created_at DESC
    LIMIT 200`
  );

  return photos.map(photo => ({
    ...photo,
    ai_results: photo.ai_results 
      ? photo.ai_results.split('|||').map(item => {
          try {
            return JSON.parse(item);
          } catch {
            return null;
          }
        }).filter(Boolean)
      : []
  }));
};