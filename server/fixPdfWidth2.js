const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Remove all margins and padding from outer containers
    content = content.replace(
      '.pdf-wrapper { width: 100%; margin: 0 auto; box-sizing: border-box; }',
      '.pdf-wrapper { width: 100%; margin: 0; padding: 0; box-sizing: border-box; }'
    );
    // Also try old version
    content = content.replace(
      '.pdf-wrapper { width: 794px; margin: 0 auto; box-sizing: border-box; }',
      '.pdf-wrapper { width: 100%; margin: 0; padding: 0; box-sizing: border-box; }'
    );

    // Remove border and margin from .pdf-page
    content = content.replace(
      'border: 1px solid #000;\n      background-color: transparent;\n      margin: 0 auto 10px auto;',
      'border: none;\n      background-color: transparent;\n      margin: 0;\n      padding: 0;'
    );

    // Remove padding from pdf-page-content
    content = content.replace(
      'padding: 0 40px 20px 40px;',
      'padding: 0;'
    );
    content = content.replace(
      'padding: 0 20px 20px 20px;',
      'padding: 0;'
    );

    // Add html,body reset at top of style if not there
    if (!content.includes('html, body { margin: 0 !important;')) {
      content = content.replace(
        'body { font-family:',
        'html, body { margin: 0 !important; padding: 0 !important; }\n    body { font-family:'
      );
    }

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates - all padding/margin removed`);
  process.exit(0);
}).catch(console.error);
