const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Add left/right border only (no top/bottom) — middle divider via border-right on first TD already exists
    content = content.replace(
      '<table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0; display: block; box-sizing: border-box;">',
      '<table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0; box-sizing: border-box; border-left: 1px solid #000; border-right: 1px solid #000;">'
    );

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates - border-left and border-right added`);
  process.exit(0);
}).catch(console.error);
