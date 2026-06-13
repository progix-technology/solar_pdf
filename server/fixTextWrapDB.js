const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    let content = template.content;

    // Apply rich-text-content wrappers to Handlebars variables
    content = content.replace('{{{firstPageNotes}}}', '<div class="rich-text-content">{{{firstPageNotes}}}</div>');
    content = content.replace('{{{termsAndConditions}}}', '<div class="rich-text-content">{{{termsAndConditions}}}</div>');
    content = content.replace(/\{\{\{this\}\}\}/g, '<div class="rich-text-content">{{{this}}}</div>');

    // Add CSS definitions for rich-text-content if missing
    if (!content.includes('.rich-text-content {')) {
        content = content.replace('/* Rich Text Support (ReactQuill) */', 
        `/* Rich Text Support (ReactQuill & Copy-Paste overrides) */
    .rich-text-content { width: 100% !important; max-width: 100% !important; white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; }
    .rich-text-content * { white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; max-width: 100% !important; }`
        );
    }
    
    // Ensure nested divs don't keep adding rich-text-content wrappers on repeated runs
    content = content.replace(/<div class="rich-text-content"><div class="rich-text-content">/g, '<div class="rich-text-content">');
    content = content.replace(/<\/div><\/div>/g, '</div>');

    template.content = content;
    await template.save();
    console.log('Force-wrap applied successfully to MongoDB template');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
