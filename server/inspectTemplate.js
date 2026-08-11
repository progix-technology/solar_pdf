const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  console.log('=== TEMPLATE CONTENT START ===');
  console.log(template.content);
  console.log('=== TEMPLATE CONTENT END ===');
  process.exit(0);
}).catch(console.error);
