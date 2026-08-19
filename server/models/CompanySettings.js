const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyName: { type: String, required: true, default: '' },
  logoUrl: { type: String, default: '' },
  address: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  phoneNumbers: { type: String, default: '' },
  state: { type: String, default: '' },
  email: { type: String, default: '' },
  footer: { type: String, default: '' },
  termsAndConditions: { type: String, default: '' },
  themeColor: { type: String, default: '#38761d' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
