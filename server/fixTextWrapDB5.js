const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Aggressively force break-all and pre-wrap
    const oldCss1 = '.rich-text-content { width: 100% !important; max-width: 100% !important; white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; padding: 0 40px !important; box-sizing: border-box !important; }';
    const oldCss2 = '.rich-text-content * { white-space: normal !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important; max-width: 100% !important; box-sizing: border-box !important; }';
    
    const newCss1 = '.rich-text-content { width: 100% !important; max-width: 100% !important; white-space: pre-wrap !important; word-wrap: break-word !important; word-break: break-all !important; overflow-wrap: break-word !important; padding: 0 40px !important; box-sizing: border-box !important; display: block !important; }';
    const newCss2 = '.rich-text-content * { white-space: pre-wrap !important; word-wrap: break-word !important; word-break: break-all !important; overflow-wrap: break-word !important; max-width: 100% !important; box-sizing: border-box !important; display: inline-block !important; }';

    if (content.includes(oldCss1)) {
        content = content.replace(oldCss1, newCss1);
    }
    if (content.includes(oldCss2)) {
        content = content.replace(oldCss2, newCss2);
    }
    
    // Fallback: Just inject a global aggressive override at the end of the <style> block
    if (!content.includes('/* AGGRESSIVE WRAP */')) {
        content = content.replace('</style>', `
    /* AGGRESSIVE WRAP */
    .rich-text-content, .rich-text-content * {
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      word-break: break-all !important;
      overflow-wrap: break-word !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    </style>`);
    }

    template.content = content;
    await template.save();
  }
  console.log(`Updated all ${templates.length} templates with break-all`);
  process.exit(0);
}).catch(console.error);
