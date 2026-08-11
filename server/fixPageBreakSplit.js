const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // 1. Add page-break-inside: avoid CSS to prevent elements and borders from splitting across pages
    if (!content.includes('/* PAGE BREAK RULES */')) {
      content = content.replace('</style>', `
    /* PAGE BREAK RULES */
    .avoid-break, .notes-box, .rich-text-content, .terms-container, .main-table, .totals-table {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    </style>`);
    }

    // 2. Ensure firstPageNotes box has avoid-break class and styles
    content = content.replace(
      '<div style="border:1px solid #38761d; padding:16px; border-radius:6px; background:#ffffff; box-sizing:border-box;">',
      '<div class="notes-box avoid-break" style="border:1px solid #38761d; padding:16px; border-radius:6px; background:#ffffff; box-sizing:border-box; page-break-inside: avoid !important; break-inside: avoid !important;">'
    );

    // 3. Ensure totals table and notes container have avoid-break
    content = content.replace(
      '<table class="totals-table"',
      '<table class="totals-table avoid-break"'
    );

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates with clean page-break avoidance!`);
  process.exit(0);
}).catch(console.error);
