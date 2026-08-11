const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // 1. Ensure Company Header Table has full border: 1px solid #000 and 100% width
    content = content.replace(
      /<table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0; [^"]*">/,
      '<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin: 0; padding: 0; box-sizing: border-box;">'
    );
    content = content.replace(
      '<table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0; box-sizing: border-box; border-left: 1px solid #000; border-right: 1px solid #000;">',
      '<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin: 0; padding: 0; box-sizing: border-box;">'
    );
    content = content.replace(
      '<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 0;">',
      '<table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin: 0; padding: 0; box-sizing: border-box;">'
    );

    // 2. Ensure pdf-page and pdf-wrapper have 0 margin, 0 padding, no extra spacing
    content = content.replace(
      /\.pdf-wrapper\s*\{[^}]*\}/g,
      '.pdf-wrapper { width: 794px; max-width: 794px; margin: 0; padding: 0; box-sizing: border-box; }'
    );
    content = content.replace(
      /\.pdf-page\s*\{[^}]*\}/g,
      '.pdf-page { width: 794px; max-width: 794px; box-sizing: border-box; background-color: transparent; margin: 0; padding: 0; border: none; }'
    );

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates with exact full box border on header table and 0 side spacing!`);
  process.exit(0);
}).catch(console.error);
