const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();

  for (let template of templates) {
    let content = template.content;

    // 1. Update .terms-title in CSS
    content = content.replace(
      /\.terms-title\s*\{[^}]*\}/g,
      '.terms-title { font-weight: bold; margin-bottom: 20px; font-size: 26px; text-decoration: none; color: #000; }'
    );

    // 2. Remove underline and increase font size to 26px in inline styles
    content = content.replace(
      /style="[^"]*font-size:\s*\d+px;[^"]*text-decoration:\s*underline;[^"]*"/g,
      'style="font-size: 26px; font-weight: bold; text-decoration: none; color: #000;"'
    );

    content = content.replace(
      /<div style="font-size:\s*\d+px;\s*font-weight:\s*bold;\s*text-decoration:\s*underline;[^"]*">\s*Terms &amp; Conditions\s*<\/div>/g,
      '<div style="font-size: 26px; font-weight: bold; text-decoration: none; color: #000;">Terms &amp; Conditions</div>'
    );

    content = content.replace(
      /<div class="terms-title"[^>]*>[\s\S]*?Terms &amp; Conditions[\s\S]*?<\/div>/g,
      '<div class="terms-title" style="font-size: 26px; font-weight: bold; text-decoration: none; color: #000; margin-bottom: 20px;">Terms &amp; Conditions</div>'
    );

    content = content.replace(
      /<div class="terms-title"[^>]*>[\s\S]*?Terms & Conditions[\s\S]*?<\/div>/g,
      '<div class="terms-title" style="font-size: 26px; font-weight: bold; text-decoration: none; color: #000; margin-bottom: 20px;">Terms &amp; Conditions</div>'
    );

    template.content = content;
    await template.save();
  }

  console.log(`Updated ${templates.length} templates: Terms & Conditions heading size increased to 26px and underline removed!`);
  process.exit(0);
}).catch(console.error);
