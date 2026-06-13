const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Apply global max-width lock to prevent canvas crop
    if (!content.includes('/* GLOBAL WIDTH LOCK */')) {
        content = content.replace('</style>', `
    /* GLOBAL WIDTH LOCK */
    .pdf-wrapper * {
      max-width: 100% !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    table {
      table-layout: fixed !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    </style>`);
    }

    template.content = content;
    await template.save();
  }
  console.log(`Updated all ${templates.length} templates with global width lock`);
  process.exit(0);
}).catch(console.error);
