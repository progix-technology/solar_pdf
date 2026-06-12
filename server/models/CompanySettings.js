const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: true, default: 'My Company' },
  logoUrl: { type: String, default: '' },
  address: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  phoneNumbers: { type: String, default: '' },
  email: { type: String, default: '' },
  footer: { type: String, default: '' },
  termsAndConditions: { type: String, default: '1. Subject to jurisdiction.\n2. Goods once sold will not be taken back.' }
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
