const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    template.content = template.content.replace(
      '<div class="terms-title">Terms &amp; Conditions</div>',
      '<div class="terms-title" style="font-size: 20px; text-decoration: underline; margin-bottom: 20px;"><strong><b>Terms &amp; Conditions</b></strong></div>'
    );
    template.content = template.content.replace(
      '<div class="terms-title">Terms & Conditions</div>',
      '<div class="terms-title" style="font-size: 20px; text-decoration: underline; margin-bottom: 20px;"><strong><b>Terms & Conditions</b></strong></div>'
    );
    await template.save();
    console.log('Updated Terms & Conditions heading strictly bold in MongoDB');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
