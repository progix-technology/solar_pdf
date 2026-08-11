const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: true, default: 'SOLAR CIRCLE' },
  logoUrl: { type: String, default: '' },
  address: { type: String, default: '159/19, Rakabganj, Lko-226018' },
  gstNumber: { type: String, default: '09GXKPK4906A1ZH' },
  phoneNumbers: { type: String, default: '+91-8564964786/ +91-8299204171' },
  state: { type: String, default: 'UP' },
  email: { type: String, default: '' },
  footer: { type: String, default: '' },
  termsAndConditions: { type: String, default: '1. Subject to jurisdiction.\n2. Goods once sold will not be taken back.' }
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
