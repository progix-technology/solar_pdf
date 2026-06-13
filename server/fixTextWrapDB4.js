const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Aggressively force 40px padding and border-box on everything
    if (!content.includes('.rich-text-content {')) {
        content = content.replace('/* Rich Text Support (ReactQuill) */', 
        `/* Rich Text Support (ReactQuill & Copy-Paste overrides) */
    .rich-text-content { width: 100% !important; max-width: 100% !important; white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; padding: 0 40px !important; box-sizing: border-box !important; }
    .rich-text-content * { white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; max-width: 100% !important; box-sizing: border-box !important; }`
        );
    } else {
        content = content.replace('padding: 0 25px !important;', 'padding: 0 40px !important;');
    }
    
    // Also explicitly force pdf-page-content padding
    content = content.replace(
        '.pdf-page-content {\n      padding: 0 20px 20px 20px;',
        '.pdf-page-content {\n      padding: 0 40px 20px 40px;'
    );

    // Apply rich-text-content wrappers if missing
    if (!content.includes('<div class="rich-text-content">{{{firstPageNotes}}}</div>')) {
        content = content.replace('{{{firstPageNotes}}}', '<div class="rich-text-content">{{{firstPageNotes}}}</div>');
        content = content.replace('{{{termsAndConditions}}}', '<div class="rich-text-content">{{{termsAndConditions}}}</div>');
        content = content.replace(/\{\{\{this\}\}\}/g, '<div class="rich-text-content">{{{this}}}</div>');
    }
    
    // Ensure nested divs don't keep adding rich-text-content wrappers on repeated runs
    content = content.replace(/<div class="rich-text-content"><div class="rich-text-content">/g, '<div class="rich-text-content">');
    content = content.replace(/<\/div><\/div>/g, '</div>');

    template.content = content;
    await template.save();
  }
  console.log(`Updated all ${templates.length} templates with 40px padding`);
  process.exit(0);
}).catch(console.error);
