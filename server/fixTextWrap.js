const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    let content = template.content;
    
    // Add word wrap to terms-container
    if (content.includes('.terms-container {')) {
      content = content.replace(
        '.terms-container {\n      padding: 30px 20px;\n    }', 
        '.terms-container {\n      padding: 30px 20px;\n      word-wrap: break-word;\n      overflow-wrap: break-word;\n    }'
      );
    }
    
    // Add word wrap to pdf-page-content
    if (content.includes('.pdf-page-content {') && !content.includes('word-wrap: break-word;')) {
      content = content.replace(
        '.pdf-page-content {\n      padding: 0 20px 20px 20px;\n      width: 100%;\n      box-sizing: border-box;\n    }',
        '.pdf-page-content {\n      padding: 0 20px 20px 20px;\n      width: 100%;\n      box-sizing: border-box;\n      word-wrap: break-word;\n      overflow-wrap: break-word;\n    }'
      );
    }

    // Add generic rich text CSS before @media print
    if (content.includes('@media print {') && !content.includes('Rich Text Support')) {
      content = content.replace(
        '@media print {',
        `/* Rich Text Support (ReactQuill) */\n    p, li, div { word-wrap: break-word; overflow-wrap: break-word; white-space: normal; }\n    ol, ul { padding-left: 20px; }\n    strong { font-weight: bold; }\n    em { font-style: italic; }\n    u { text-decoration: underline; }\n    \n    @media print {`
      );
    }

    template.content = content;
    await template.save();
    console.log('Added text wrapping fixes to MongoDB template');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
