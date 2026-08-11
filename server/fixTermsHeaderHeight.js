const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();

  for (let template of templates) {
    let content = template.content;

    // Reduce padding from 15px 20px to 6px 15px to reduce height of Terms & Conditions header box
    content = content.replace(
      'padding: 15px 20px; box-sizing: border-box; background: #fdfdfd;',
      'padding: 6px 15px; box-sizing: border-box; background: #fdfdfd;'
    );
    content = content.replace(
      'padding: 15px 20px;',
      'padding: 6px 15px;'
    );

    // If there is any height on the green bar or margin
    content = content.replace(
      '<div style="height: 12px; background-color: #38761d; width: 100%; margin: 0; padding: 0;"></div>',
      '<div style="height: 10px; background-color: #38761d; width: 100%; margin: 0; padding: 0;"></div>'
    );

    template.content = content;
    await template.save();
  }

  console.log(`Updated ${templates.length} templates: Terms & Conditions header height reduced and green line moved up!`);
  process.exit(0);
}).catch(console.error);
