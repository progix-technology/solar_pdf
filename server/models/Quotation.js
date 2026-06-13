const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true },
  quotationDate: { type: Date, default: Date.now },
  quotationTitle: { type: String, default: 'Quotation for' },
  customerName: { type: String, required: true },
  customerAddress: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  siteAddress: { type: String, default: '' },
  
  columns: [{ type: String }],
  rows: [mongoose.Schema.Types.Mixed],
  
  subtotal: { type: mongoose.Schema.Types.Mixed, default: 0 },
  gstPercentage: { type: Number, default: 18 },
  gstAmount: { type: mongoose.Schema.Types.Mixed, default: 0 },
  grandTotal: { type: mongoose.Schema.Types.Mixed, default: 0 },
  firstPageNotes: { type: String, default: '' },
  termsAndConditions: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  prePages: [{ type: String }],
  postPages: [{ type: String }],
  
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
