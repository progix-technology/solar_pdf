const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const { uploadCloud } = require('../config/cloudinary');

router.route('/')
  .get(protect, getSettings)
  .put(protect, uploadCloud.single('logo'), updateSettings);

module.exports = router;
