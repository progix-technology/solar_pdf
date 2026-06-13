const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    template.content = template.content.replace('class="company-logo"', 'style="width: 100%; max-width: 200px; max-height: 120px; object-fit: contain;" class="company-logo"');
    await template.save();
    console.log('Updated logo style in MongoDB template');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
