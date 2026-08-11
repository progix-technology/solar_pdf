const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();

  for (let template of templates) {
    let content = template.content;

    // Totals Table markup
    const totalsTableHtml = `<!-- Totals Section Table Inside Box -->
          <table style="width: 100%; margin-top: 25px; margin-bottom: 5px; border-collapse: collapse;">
            <tr>
              <td align="center">
                <table class="totals-table avoid-break" style="width: 60%; border-collapse: collapse; border: 1px solid #38761d; text-align: left;">
                  <tr>
                    <th style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold; width: 60%;">Total Amount</th>
                    <td style="border: 1px solid #38761d; padding: 6px 10px; width: 40%;">{{formatCurrency subtotal}} /-</td>
                  </tr>
                  <tr>
                    <th style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold;">GST</th>
                    <td style="border: 1px solid #38761d; padding: 6px 10px;">Inc/-</td>
                  </tr>
                  <tr>
                    <th class="highlight-yellow" style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold;">Grand Total</th>
                    <td class="highlight-yellow" style="border: 1px solid #38761d; padding: 6px 10px;">{{formatCurrency grandTotal}} /-</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>`;

    // 1. Remove any standalone Totals Section Table
    content = content.replace(
      /<!-- Totals Section Table[\s\S]*?<\/table>\s*<\/td>\s*<\/tr>\s*<\/table>/g,
      ''
    );

    // 2. Insert Totals Table INSIDE firstPageNotes box, and fallback for no firstPageNotes
    const targetNotesBox = '{{{firstPageNotes}}}</div>\n        </div>';
    const replacementNotesBox = `{{{firstPageNotes}}}</div>\n          ${totalsTableHtml}\n        </div>`;

    if (content.includes(targetNotesBox)) {
      content = content.replace(targetNotesBox, replacementNotesBox);
    } else {
      // Alternate target
      content = content.replace(
        '{{{firstPageNotes}}}</div>',
        `{{{firstPageNotes}}}</div>\n          ${totalsTableHtml}`
      );
    }

    // Fallback if no firstPageNotes
    content = content.replace(
      '{{/if}}\n      </div>\n    </div>',
      `{{/if}}\n      {{^firstPageNotes}}\n      ${totalsTableHtml}\n      {{/firstPageNotes}}\n      </div>\n    </div>`
    );

    template.content = content;
    await template.save();
  }

  console.log(`Updated ${templates.length} templates: Amount Table is now 100% inside the notes box!`);
  process.exit(0);
}).catch(console.error);
