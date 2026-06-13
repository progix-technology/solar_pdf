const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const template = await Template.findOne({ isDefault: true });
  if (template) {
    let content = template.content;

    // Add padding to rich-text-content
    const cssToInject = 'padding: 0 25px !important;';
    
    // Find .rich-text-content { ... } block
    const blockStart = content.indexOf('.rich-text-content {');
    if (blockStart !== -1) {
      const blockEnd = content.indexOf('}', blockStart);
      const existingBlock = content.substring(blockStart, blockEnd + 1);
      if (!existingBlock.includes('padding:')) {
        const newBlock = existingBlock.replace('}', `  ${cssToInject}\n    }`);
        content = content.replace(existingBlock, newBlock);
      }
    }

    // Also increase padding on terms-container to be safe
    if (content.includes('.terms-container {')) {
       content = content.replace('.terms-container {\n      padding: 30px 20px;', '.terms-container {\n      padding: 30px 40px;');
    }

    template.content = content;
    await template.save();
    console.log('Added left and right padding to rich text elements in MongoDB template');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);
