const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const templates = await Template.find();
  for (let template of templates) {
    let content = template.content;

    // Totals Table snippet
    const totalsTableSnippet = `<!-- Totals Section Table -->
          <table style="width: 100%; margin-top: 20px; margin-bottom: 5px; border-collapse: collapse;">
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

    // Replace firstPageNotes block to include totalsTable inside notes-box
    const oldNotesAndTotalsRegex = /\{\{#if firstPageNotes\}\}[\s\S]*?<!-- Totals Section Table[^>]*>[\s\S]*?<\/table>\s*<\/td>\s*<\/tr>\s*<\/table>/;
    
    const newNotesAndTotals = `{{#if firstPageNotes}}
      <div style="padding: 0; margin-bottom: 20px; text-align: left;">
        <div class="notes-box avoid-break" style="border: 1px solid #38761d; padding: 16px; border-radius: 6px; background: #ffffff; box-sizing: border-box; page-break-inside: avoid !important; break-inside: avoid !important;">
          <div class="rich-text-content" style="margin-bottom: 15px;">{{{firstPageNotes}}}</div>
          ${totalsTableSnippet}
        </div>
      </div>
      {{else}}
      ${totalsTableSnippet}
      {{/if}}`;

    if (oldNotesAndTotalsRegex.test(content)) {
      content = content.replace(oldNotesAndTotalsRegex, newNotesAndTotals);
    }

    template.content = content;
    await template.save();
  }
  console.log(`Updated ${templates.length} templates: Amount Table is now INSIDE the notes box on the same page!`);
  process.exit(0);
}).catch(console.error);
