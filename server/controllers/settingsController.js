const CompanySettings = require('../models/CompanySettings');

// @desc    Get company settings for authenticated user
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await CompanySettings.create({
        userId: req.user._id,
        companyName: '',
        logoUrl: ''
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update company settings for authenticated user
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      companyName,
      address,
      gstNumber,
      phoneNumbers,
      state,
      email,
      footer,
      termsAndConditions,
      themeColor,
    } = req.body;

    let settings = await CompanySettings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = new CompanySettings({ userId: req.user._id });
    }

    if (companyName !== undefined) settings.companyName = companyName;
    if (address !== undefined) settings.address = address;
    if (gstNumber !== undefined) settings.gstNumber = gstNumber;
    if (phoneNumbers !== undefined) settings.phoneNumbers = phoneNumbers;
    if (state !== undefined) settings.state = state;
    if (email !== undefined) settings.email = email;
    if (footer !== undefined) settings.footer = footer;
    if (termsAndConditions !== undefined) settings.termsAndConditions = termsAndConditions;
    if (themeColor !== undefined) settings.themeColor = themeColor;

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

module.exports = {
  getSettings,
  updateSettings,
};
