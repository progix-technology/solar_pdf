const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;
    
    // Remove inline-block to prevent formatting errors
    if (content.includes('display: inline-block !important;')) {
        content = content.replace(/display: inline-block !important;/g, '');
    }

    template.content = content;
    await template.save();
  }
  console.log(`Cleaned inline-block from ${templates.length} templates`);
  process.exit(0);
}).catch(console.error);
