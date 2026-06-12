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
  
  subtotal: { type: Number, default: 0 },
  gstPercentage: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  firstPageNotes: { type: String, default: '' },
  termsAndConditions: { type: String, default: '' },
  
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
