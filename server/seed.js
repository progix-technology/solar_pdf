const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('./models/Template');

dotenv.config();

const defaultTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
    body { font-family: 'Arial', 'Helvetica', sans-serif; margin: 0; padding: 0; color: #000; font-size: 13px; background-color: #fff; }
    .pdf-wrapper { width: 794px; margin: 0 auto; box-sizing: border-box; padding: 15px; }
    .company-logo {
      max-width: 100%;
      max-height: 160px;
      object-fit: contain;
    }
    .quotation-banner {
      background-color: #38761d;
      padding: 10px 0;
      margin-top: 0px;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .quotation-title {
      background-color: #ffff00;
      display: inline-block;
      padding: 5px 30px;
      font-size: 22px;
      font-weight: bold;
      color: #000;
      margin-left: 0;
    }
    
    .info-table td { border: none; padding: 3px 5px 3px 0; vertical-align: top; }
    .info-label { font-weight: bold; white-space: nowrap; }
    
    .main-table-container { padding: 0 20px; }
    .main-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .main-table th, .main-table td { 
      border: 1px solid #38761d; 
      padding: 8px; 
      text-align: left; 
    }
    .main-table th { 
      background-color: #fce5cd; /* Light orange/beige from image */
      color: #990000; /* Dark red/brown text */
      font-weight: normal;
    }
    
    .totals-table { width: 80%; border-collapse: collapse; border: 2px solid #000; }
    .totals-table th, .totals-table td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
    .totals-table th { font-weight: bold; width: 60%; }
    .totals-table td { width: 40%; }
    
    .highlight-yellow { background-color: #ffff00 !important; font-weight: bold; }
    
    .terms-page {
      page-break-before: always;
      padding: 40px 20px;
    }
    .terms-title { font-weight: bold; margin-bottom: 15px; font-size: 16px; text-decoration: underline; }

    @media print {
      .quotation-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .quotation-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .main-table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .highlight-yellow { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .pdf-page-break {
        page-break-before: always !important;
        border: none !important;
        color: transparent !important;
        margin: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    }
  </style>
</head>
<body>
<div class="pdf-wrapper">

  <!-- Company Header Table (Replacer for display: flex) -->
  <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="width: 75%; padding: 15px; border-right: 1px solid #000; vertical-align: top; text-align: left;">
        <div style="margin-bottom: 5px; font-size: 16px;"><b>CompanyName: SOLAR CIRCLE</b></div>
        <div style="margin-bottom: 5px; font-size: 16px;">Address: 159/19, Rakabganj, Lko-226018</div>
        <div style="margin-bottom: 5px; font-size: 16px;">Phone No.: +91-8564964786/ +91-8299204171</div>
        <div style="margin-bottom: 5px; font-size: 16px;"><b><span class="highlight-yellow">GSTIN: 09GXKPK4906A1ZH</span></b></div>
        <div style="margin-bottom: 5px; font-size: 16px;">State: UP</div>
      </td>
      <td style="width: 25%; padding: 5px; vertical-align: middle; text-align: center;">
        {{#if company.logoUrl}}
          <img src="{{company.logoUrl}}" alt="Logo" class="company-logo" crossorigin="anonymous" />
        {{/if}}
      </td>
    </tr>
  </table>

  <!-- Quotation Banner -->
  <div class="quotation-banner">
    <div class="quotation-title">{{quotationTitle}}</div>
  </div>

  <!-- Customer Info Table (Replacer for display: flex) -->
  <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
    <tr>
      <td style="width: 60%; vertical-align: top; padding: 0 20px 0 10px; text-align: left;">
        <table class="info-table" style="width: 100%; border-collapse: collapse;">
          <tr><td class="info-label" colspan="2" style="font-weight: bold; padding: 3px 5px 3px 0;">To:</td></tr>
          <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 100px;">Name:</td><td style="padding: 3px 5px;">{{customerName}}</td></tr>
          <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 100px;">Address:</td><td style="padding: 3px 5px;">{{customerAddress}}</td></tr>
          <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 100px;">Contact No.:</td><td style="padding: 3px 5px;">{{contactNumber}}</td></tr>
          <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 100px;">Site Address:</td><td style="padding: 3px 5px;">{{siteAddress}}</td></tr>
        </table>
      </td>
      <td style="width: 40%; vertical-align: top; padding: 25px 10px 0 20px; text-align: left;">
        <table class="info-table" style="width: 100%; border-collapse: collapse;">
          <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 120px;">Quotation No.:</td><td style="padding: 3px 5px;">{{quotationNumber}}</td></tr>
          <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 120px;">Quotation Date:</td><td style="padding: 3px 5px;">{{quotationDate}}</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Dynamic Table -->
  <div class="main-table-container">
    <table class="main-table">
      <thead>
        <tr>
          {{#each columns}}
            <th>{{this}}</th>
          {{/each}}
        </tr>
      </thead>
      <tbody>
        {{#each rows}}
        <tr>
          {{#each ../columns}}
            <td>{{lookup .. this}}</td>
          {{/each}}
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  {{#if firstPageNotes}}
  <div style="padding: 0 20px; margin-bottom: 20px; text-align: left;">
    {{{firstPageNotes}}}
  </div>
  {{/if}}

  <!-- Totals Section Table (Replacer for display: flex) -->
  <table style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
    <tr>
      <td align="center">
        <table class="totals-table" style="width: 80%; border-collapse: collapse; border: 2px solid #000; text-align: left;">
          <tr>
            <th style="border: 1px solid #000; padding: 6px 10px; font-weight: bold; width: 60%;">Total Amount</th>
            <td style="border: 1px solid #000; padding: 6px 10px; width: 40%;">{{formatCurrency subtotal}} /-</td>
          </tr>
          <tr>
            <th style="border: 1px solid #000; padding: 6px 10px; font-weight: bold;">GST</th>
            <td style="border: 1px solid #000; padding: 6px 10px;">Inc/-</td>
          </tr>
          <tr>
            <th class="highlight-yellow" style="border: 1px solid #000; padding: 6px 10px; font-weight: bold;">Grand Total</th>
            <td class="highlight-yellow" style="border: 1px solid #000; padding: 6px 10px;">{{formatCurrency grandTotal}} /-</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Page 2: Terms and Conditions -->
  {{#if termsAndConditions}}
  <div class="terms-page">
    <div class="terms-title">Terms & Conditions</div>
    <div style="text-align: left;">
      {{{termsAndConditions}}}
    </div>
  </div>
  {{/if}}

</div>
</body>
</html>
`;

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Seed Template ONLY
    await Template.deleteMany();
    await Template.create({
      name: 'Modern Professional Default',
      content: defaultTemplate,
      isDefault: true
    });

    console.log('Template Seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
