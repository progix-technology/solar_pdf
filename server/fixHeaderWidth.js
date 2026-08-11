const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Force the header table to be truly full width with no gaps
    content = content.replace(
      '<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 0;">',
      '<table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0; display: block; box-sizing: border-box;">'
    );

    // Remove border from @media print on .pdf-page so it doesn't add spacing
    content = content.replace(
      '.pdf-page {\n        margin: 0;\n        border: 1px solid #000 !important;\n      }',
      '.pdf-page {\n        margin: 0;\n        border: none !important;\n      }'
    );

    // Make the pdf-page truly full width with no border
    if (content.includes('.pdf-page {')) {
      content = content.replace(
        /\.pdf-page \{[\s\S]*?border: 1px solid #000;[\s\S]*?\}/,
        match => match.replace('border: 1px solid #000;', 'border: none;')
      );
    }

    template.content = content;
    await template.save();
    console.log('Header table updated to full width');
  }
  console.log(`Updated ${templates.length} templates`);
  process.exit(0);
}).catch(console.error);
