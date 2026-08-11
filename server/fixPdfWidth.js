const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Fix fixed 794px widths to 100%
    content = content.replace(
      '.pdf-wrapper { width: 794px; margin: 0 auto; box-sizing: border-box; }',
      '.pdf-wrapper { width: 100%; margin: 0 auto; box-sizing: border-box; }'
    );
    content = content.replace(/\.pdf-page \{[\s\S]*?width: 794px;/m, (match) => match.replace('width: 794px;', 'width: 100%;'));

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates - width changed to 100%`);
  process.exit(0);
}).catch(console.error);
