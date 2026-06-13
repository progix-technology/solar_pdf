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
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
    }
  });
  uploadCloud = multer({ storage: storage });
}

module.exports = { cloudinary, uploadCloud };
