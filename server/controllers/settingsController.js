const CompanySettings = require('../models/CompanySettings');

// @desc    Get company settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update company settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      companyName,
      address,
      gstNumber,
      phoneNumbers,
      email,
      footer,
      termsAndConditions,
    } = req.body;

    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = new CompanySettings();
    }

    settings.companyName = companyName || settings.companyName;
    settings.address = address || settings.address;
    settings.gstNumber = gstNumber || settings.gstNumber;
    settings.phoneNumbers = phoneNumbers || settings.phoneNumbers;
    settings.email = email || settings.email;
    settings.footer = footer || settings.footer;
    settings.termsAndConditions = termsAndConditions || settings.termsAndConditions;

    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        settings.logoUrl = req.file.path;
      } else if (req.file.buffer) {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const mimeType = req.file.mimetype;
        settings.logoUrl = `data:${mimeType};base64,${b64}`;
      } else {
        // Fallback for disk storage
        settings.logoUrl = `/uploads/${req.file.filename}`;
      }
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
