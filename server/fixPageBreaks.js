const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    let content = template.content;
    content = content.replace('min-height: 1115px; /* Allows growth for page breaks */', '');
    content = content.replace('page-break-after: always;', '');
    template.content = content;
    await template.save();
    console.log('Removed min-height and page-break from MongoDB template');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
