import multer from "multer";
import fs from "fs";
import path from "path";

// Define the base upload directory
const uploadBaseDir = path.join(__dirname, "../../public/uploads/");

// Ensure the base directory exists
if (!fs.existsSync(uploadBaseDir)) {
  fs.mkdirSync(uploadBaseDir, { recursive: true });
}

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the subfolder based on some criteria
    let subfolder = "general"; // Default subfolder

    // For example, you can use file field or some other logic to set subfolder
    if (file.fieldname === "profile_image") {
      subfolder = "profile";
    } else if (file.fieldname === "productImage") {
      subfolder = "product";
    }

    const uploadDir = path.join(uploadBaseDir, subfolder);

    // Ensure the subdirectory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
