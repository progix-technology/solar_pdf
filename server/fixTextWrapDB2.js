const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    let content = template.content;

    // Replace the old CSS with the new one including box-sizing: border-box
    const oldCss = '.rich-text-content * { white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; max-width: 100% !important; }';
    const newCss = '.rich-text-content * { white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; max-width: 100% !important; box-sizing: border-box !important; }';
    
    if (content.includes(oldCss)) {
        content = content.replace(oldCss, newCss);
    } else if (!content.includes('box-sizing: border-box !important;')) {
        // Fallback replacement if exact match fails
        content = content.replace('max-width: 100% !important; }', 'max-width: 100% !important; box-sizing: border-box !important; }');
    }

    template.content = content;
    await template.save();
    console.log('Added box-sizing: border-box to rich text elements in MongoDB template');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
