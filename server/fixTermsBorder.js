const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Add border to terms-container
    content = content.replace(
      /\.terms-container\s*\{[^}]*\}/g,
      '.terms-container { border: 1px solid #38761d; border-radius: 6px; padding: 24px; margin: 20px; background: #ffffff; box-sizing: border-box; word-wrap: break-word; overflow-wrap: break-word; }'
    );

    // Also ensure the HTML markup wraps terms cleanly
    content = content.replace(
      '<div class="terms-container">\n      <div class="terms-title"',
      '<div style="padding: 20px;">\n    <div class="terms-container avoid-break">\n      <div class="terms-title"'
    );
    content = content.replace(
      '<div class="terms-container">\n      <div class="terms-title" style="font-size: 20px; text-decoration: underline; margin-bottom: 20px;"><strong><b>Terms & Conditions</b></strong></div>\n      <div style="text-align: left;">\n        <div class="rich-text-content">{{{termsAndConditions}}}</div>\n      </div>\n    </div>',
      '<div style="padding: 20px;">\n    <div class="terms-container avoid-break" style="border: 1px solid #38761d; border-radius: 6px; padding: 24px; background: #ffffff; box-sizing: border-box;">\n      <div class="terms-title" style="font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 20px; color: #000;"><strong>Terms &amp; Conditions</strong></div>\n      <div class="rich-text-content">{{{termsAndConditions}}}</div>\n    </div>\n  </div>'
    );

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates: Border added to Terms and Conditions page!`);
  process.exit(0);
}).catch(console.error);
