import {
  uploadPhoto,
  getPhotosByMeeting,
  getPhotosByExterminator,
  getPhotosByCompany,
  getAllPhotos,
  saveAIResult
} from "../models/photosModel.js";


export const addPhoto = async (req, res) => {
  try {
    const { meeting_id, customer_id, location_id, summary, processed_image } = req.body;
    const exterminator_id = req.user?.id;

    if (!meeting_id || !customer_id || !summary || !processed_image) {
      return res.status(400).json({
        success: false,
        message: "Missing fields (meeting_id, customer_id, summary, processed_image)",
      });
    }

    // summary already JSON object hai (react se object aa raha hoga)
    const topSpecies = summary.top5_species;

    // ================================================================
    // STEP 1: Save Photo (base64)
    // ================================================================
    const photoId = await uploadPhoto({
      meeting_id,
      exterminator_id,
      customer_id,
      image_base64: processed_image,
      location_id,
    });

    // ================================================================
    // STEP 2: Save AI Results (top 5 species)
    // ================================================================
    for (const sp of topSpecies) {
      await saveAIResult({
        photo_id: photoId,
        detected_pest: sp.species,
        confidence: sp.count,
      });
    }

    res.status(201).json({
      success: true,
      message: "AI result saved successfully",
      photo_id: photoId,
    });

  } catch (err) {
    console.error("Error in addPhoto:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export const getPhotosByMeetingId = async (req, res) => {
  try {
    const { meeting_id } = req.params;
    
    if (!meeting_id || isNaN(meeting_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid meeting ID" 
      });
    }

    const photos = await getPhotosByMeeting(meeting_id);
    
    res.json({ 
      success: true, 
      data: photos,
      count: photos.length
    });
  } catch (err) {
    console.error("Error fetching photos by meeting:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

// ✅ Get photos by exterminator (from token)
export const getPhotosByExterminatorId = async (req, res) => {
  try {
    const exterminator_id = req.user?.id;
    
    if (!exterminator_id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Exterminator ID not found in token" 
      });
    }

    const photos = await getPhotosByExterminator(exterminator_id);
    
    res.json({ 
      success: true, 
      data: photos,
      count: photos.length
    });
  } catch (err) {
    console.error("Error fetching photos by exterminator:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};

// ✅ Get photos by company (role-based access)
export const getPhotosByCompanyId = async (req, res) => {
  try {
    const { company_id, role } = req.user; // token se data

    let photos;

    // 🟢 Admin → fetch ALL photos
    if (role === "admin") {
      photos = await getAllPhotos();
    } 
    // 🔵 Normal user → only their company photos
    else {
      if (!company_id) {
        return res.status(400).json({ 
          success: false, 
          message: "Company ID missing for user" 
        });
      }
      photos = await getPhotosByCompany(company_id);
    }

    res.json({ 
      success: true, 
      data: photos,
      count: photos.length
    });

  } catch (err) {
    console.error("Error fetching company photos:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: err.message 
    });
  }
};


