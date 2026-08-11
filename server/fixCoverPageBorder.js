const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();

  for (let template of templates) {
    let content = template.content;

    // 1. Update prePages (Cover Page) with green border
    const oldPrePages = `  {{#each prePages}}
    <div class="pdf-page">
      <div class="pdf-page-content" style="padding: 40px;">
        <div class="rich-text-content">{{{this}}}</div>
      </div>
    </div>
    <div class="html2pdf__page-break"></div>
  {{/each}}`;

    const newPrePages = `  {{#each prePages}}
    <div class="pdf-page">
      <div class="pdf-page-content" style="padding: 20px; margin: 0; width: 100%; box-sizing: border-box;">
        <div class="cover-container avoid-break" style="border: 1px solid #38761d; border-radius: 6px; padding: 25px; background: #ffffff; box-sizing: border-box; page-break-inside: avoid !important; break-inside: avoid !important;">
          <div class="rich-text-content" style="padding: 0 !important;">{{{this}}}</div>
        </div>
      </div>
    </div>
    <div class="html2pdf__page-break"></div>
  {{/each}}`;

    // 2. Update postPages (Annexures/Extra pages) with green border too
    const oldPostPages = `  {{#each postPages}}
  <div class="pdf-page">
    <div class="pdf-page-content" style="padding: 40px;">
      <div class="rich-text-content">{{{this}}}</div>
    </div>
  </div>
  <div class="html2pdf__page-break"></div>
  {{/each}}`;

    const newPostPages = `  {{#each postPages}}
  <div class="pdf-page">
    <div class="pdf-page-content" style="padding: 20px; margin: 0; width: 100%; box-sizing: border-box;">
      <div class="annexure-container avoid-break" style="border: 1px solid #38761d; border-radius: 6px; padding: 25px; background: #ffffff; box-sizing: border-box; page-break-inside: avoid !important; break-inside: avoid !important;">
        <div class="rich-text-content" style="padding: 0 !important;">{{{this}}}</div>
      </div>
    </div>
  </div>
  <div class="html2pdf__page-break"></div>
  {{/each}}`;

    // Replace prePages
    if (content.includes(oldPrePages)) {
      content = content.replace(oldPrePages, newPrePages);
    } else {
      content = content.replace(
        /\{\{#each prePages\}\}[\s\S]*?\{\{\/each\}\}/,
        newPrePages.trim()
      );
    }

    // Replace postPages
    if (content.includes(oldPostPages)) {
      content = content.replace(oldPostPages, newPostPages);
    } else {
      content = content.replace(
        /\{\{#each postPages\}\}[\s\S]*?\{\{\/each\}\}/,
        newPostPages.trim()
      );
    }

    template.content = content;
    await template.save();
  }

  console.log(`Updated ${templates.length} templates: Green border added to Cover Page (prePages) and Annexures (postPages)!`);
  process.exit(0);
}).catch(console.error);
