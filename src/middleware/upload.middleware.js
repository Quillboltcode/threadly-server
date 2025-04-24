import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4(); // More unique than Date.now()
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF allowed'), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB per file
  files: 4 // Allow up to 4 images per request
};


export const uploadImage = multer({
  storage,
  fileFilter,
  limits
});

// Middleware for multiple images
// Middleware for handling both content and images
export const handlePostImages = uploadImage.fields([
  { name: 'content', maxCount: 1 }, // Allow one 'content' field
  { name: 'images', maxCount: 4 }   // Allow up to 4 images
]);
export const handleCommentImage = uploadImage.single('commentImage');
