const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // 1. Remove the injected padding override at the bottom
    content = content.replace(
      /<!-- Injected padding override[\s\S]*?<\/style>/g,
      ''
    );

    // 2. Ensure .pdf-page-content has 0 padding so the banner touches the edges
    content = content.replace(
      /\.pdf-page-content\s*\{[^}]*\}/g,
      '.pdf-page-content { padding: 0 !important; margin: 0 !important; width: 100% !important; box-sizing: border-box !important; }'
    );

    // 3. Ensure the green bar and quotation banner are explicitly 100% width and 0 margin
    content = content.replace(
      '<div style="height: 18px; background-color: #38761d; width: 100%;"></div>',
      '<div style="height: 18px; background-color: #38761d; width: 100%; margin: 0; padding: 0; box-sizing: border-box;"></div>'
    );

    content = content.replace(
      '<div style="background-color: #e8eedb; padding: 8px 0; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #000;">',
      '<div style="background-color: #e8eedb; width: 100%; padding: 8px 0; margin: 0 0 20px 0; text-align: center; border-bottom: 1px solid #000; box-sizing: border-box;">'
    );

    // 4. Clean any trailing injected style tags
    content = content.replace(/<style>\s*\.pdf-page\s*\{[\s\S]*?<\/style>\s*<\/body>/, '</body>');

    template.content = content;
    await template.save();
  }
  console.log(`Successfully updated ${templates.length} templates: quotation block is now 100% full width with 0 spacing on sides!`);
  process.exit(0);
}).catch(console.error);
