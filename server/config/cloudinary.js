const multer = require('multer');
const path = require('path');
const fs = require('fs');

let uploadCloud;
let cloudinary;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'solar_pdf_logos',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
  });
  uploadCloud = multer({ storage: storage });
} else {
  // Use memory storage so we can convert the image to Base64 and save it in MongoDB.
  // This ensures the logo is saved permanently even on Vercel/Render ephemeral disks.
  const storage = multer.memoryStorage();
  uploadCloud = multer({ storage: storage });
}

module.exports = { cloudinary, uploadCloud };
