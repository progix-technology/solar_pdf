const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true }, // The Handlebars HTML content
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
