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
    .pdf-wrapper { width: 794px; margin: 0 auto; box-sizing: border-box; }
    
    .pdf-page {
      width: 794px;
      box-sizing: border-box;
      border: 1px solid #000;
      background-color: transparent;
      margin: 0 auto 10px auto;
    }
    
    body::before {
      content: "";
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: url('{{company.logoUrl}}');
      background-repeat: repeat-y;
      background-position: center top;
      background-size: 794px 1115px;
      opacity: 0.1; /* Faint watermark full page */
      z-index: -1;
      pointer-events: none;
    }
    
    .pdf-page-content {
      padding: 0 40px 20px 40px;
      width: 100%;
      box-sizing: border-box;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .company-logo {
      max-width: 100%;
      max-height: 120px;
      object-fit: contain;
    }
    .quotation-banner {
      background-color: #38761d;
      padding: 10px 0;
      margin-top: 0px;
      margin-bottom: 20px;
      text-align: center;
      color: white;
    }
    
    .quotation-title {
      display: inline-block;
      font-size: 22px;
      font-weight: bold;
      color: white;
      margin-left: 0;
    }
    
    .info-table td { border: none; padding: 3px 5px 3px 0; vertical-align: top; }
    .info-label { font-weight: bold; white-space: nowrap; }
    
    .main-table-container { 
      padding: 0; 
      width: 100%; 
      display: flex; 
      justify-content: center; 
    }
    .main-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 0 auto 10px auto; 
    }
    .main-table th, .main-table td { 
      border: 1px solid #38761d; 
      padding: 8px; 
      text-align: left; 
    }
    .main-table th { 
      background-color: #38761d; 
      color: white; 
      font-weight: bold;
    }
    
    /* Column styling */
    .col-0, .col-1, .col-3, .col-4 {
      background-color: #f5fdf3 !important; /* subtle green background */
    }
    
    /* Column widths and alignments */
    .col-0 { width: 6%; text-align: center; }      /* S.No */
    .col-1 { width: 26%; text-align: left; }       /* Particular */
    .col-2 { width: 8%; text-align: center; }      /* Qty */
    .col-3 { width: 8%; text-align: center; }      /* UOM */
    .col-4 { width: 20%; text-align: left; }       /* Make */
    .col-5 { width: 14%; text-align: right; }      /* Price */
    .col-6 { width: 18%; text-align: right; }      /* Amount */
    
    .totals-table { width: 100%; border-collapse: collapse; border: 1px solid #38761d; margin: 0 auto; }
    .totals-table th, .totals-table td { border: 1px solid #38761d; padding: 6px 10px; text-align: left; }
    .totals-table th { font-weight: bold; width: 60%; }
    .totals-table td { width: 40%; }
    
    .highlight-yellow { background-color: #ffff00 !important; font-weight: bold; color: black; }
    
    .terms-container {
      padding: 30px 20px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .terms-title { font-weight: bold; margin-bottom: 15px; font-size: 16px; text-decoration: underline; }

    /* Rich Text Support (ReactQuill & Copy-Paste overrides) */
    .rich-text-content {
      width: 100% !important;
      max-width: 100% !important;
      white-space: normal !important;
      word-wrap: break-word !important;
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      padding: 0 40px !important;
    }
    .rich-text-content * {
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      word-break: break-all !important;
      overflow-wrap: break-word !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    ol, ul { padding-left: 20px; }
    strong { font-weight: bold; }
    em { font-style: italic; }
    u { text-decoration: underline; }

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

    @media print {
      .pdf-page {
        margin: 0;
        border: 1px solid #000 !important;
      }
      .quotation-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: white !important; }
      .quotation-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #38761d !important; }
      .main-table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #38761d !important; color: white !important; }
      .main-table td.col-0, .main-table td.col-1, .main-table td.col-3, .main-table td.col-4 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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

  {{#each prePages}}
    <div class="pdf-page">
      <div class="pdf-page-content" style="padding: 40px;">
        <div class="rich-text-content">{{{this}}}</div>
      </div>
    </div>
    <div class="html2pdf__page-break"></div>
  {{/each}}

  <!-- Page 1 -->
  <div class="pdf-page">
    <!-- Company Header Table (Replacer for display: flex) -->
    <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 0;">
      <tr>
        <td style="width: 70%; padding: 15px; vertical-align: top; text-align: left; border-right: 1px solid #000;">
          <div style="margin-bottom: 5px; font-size: 16px; color: #000;"><b>CompanyName: SOLAR CIRCLE</b></div>
          <div style="margin-bottom: 5px; font-size: 16px;">Address: 159/19, Rakabganj, Lko-226018</div>
          <div style="margin-bottom: 5px; font-size: 16px;">Phone No.: +91-8564964786/ +91-8299204171</div>
          <div style="margin-bottom: 5px; font-size: 16px;"><b><span class="highlight-yellow">GSTIN: 09GXKPK4906A1ZH</span></b></div>
          <div style="margin-bottom: 5px; font-size: 16px;">State: UP</div>
        </td>
        <td style="width: 30%; padding: 5px; vertical-align: middle; text-align: center;">
          {{#if company.logoUrl}}
            <img src="{{company.logoUrl}}" alt="Logo" style="width: 100%; max-width: 200px; max-height: 120px; object-fit: contain;" class="company-logo" crossorigin="anonymous" />
          {{/if}}
        </td>
      </tr>
    </table>

    <div class="pdf-page-content" style="padding: 0;">
      <!-- Thin Dark Green Bar -->
      <div style="height: 18px; background-color: #38761d; width: 100%;"></div>
      
      <!-- Quotation Banner -->
      <div style="background-color: #e8eedb; padding: 8px 0; margin-bottom: 20px; text-align: center; border-bottom: 1px solid #000;">
        <span style="display: inline-block; background-color: #ffff00; font-size: 24px; font-weight: bold; color: #000; padding: 2px 30px;">{{quotationTitle}}</span>
      </div>

      <div style="padding: 0 20px;">
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
              <tr><td class="info-label" style="font-weight: bold; padding: 3px 5px 3px 0; white-space: nowrap; width: 120px;">Quotation Date:</td><td style="padding: 3px 5px;">{{formatDate quotationDate}}</td></tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Decorative Dark Green Bar above Table -->
      <div style="height: 12px; background-color: #38761d; margin-bottom: 0;"></div>

      <!-- Dynamic Table -->
      <div style="width: 100%; margin-bottom: 20px;">
        <table class="main-table" style="width: 100%; border-collapse: collapse; table-layout: fixed; word-wrap: break-word;">
          <thead>
            <tr>
              {{#each columns}}
                <th class="col-{{@index}}" style="border: 1px solid #38761d; background-color: #38761d; color: white; padding: 8px; font-weight: bold;">{{this}}</th>
              {{/each}}
            </tr>
          </thead>
          <tbody>
            {{#each rows}}
            <tr>
              {{#each ../columns}}
                <td class="col-{{@index}}" style="border: 1px solid #38761d; padding: 8px;">{{lookup .. this}}</td>
              {{/each}}
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>

      {{#if firstPageNotes}}
      <div style="padding: 0; margin-bottom: 20px; text-align: left;">
        <div class="rich-text-content">{{{firstPageNotes}}}</div>
      </div>
      {{/if}}

      <!-- Totals Section Table (Replacer for display: flex) -->
      <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
        <tr>
          <td align="center">
            <table class="totals-table" style="width: 60%; border-collapse: collapse; border: 1px solid #38761d; text-align: left;">
              <tr>
                <th style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold; width: 60%;">Total Amount</th>
                <td style="border: 1px solid #38761d; padding: 6px 10px; width: 40%;">{{formatCurrency subtotal}} /-</td>
              </tr>
              <tr>
                <th style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold;">GST ({{gstPercentage}}%)</th>
                <td style="border: 1px solid #38761d; padding: 6px 10px;">{{formatCurrency gstAmount}} /-</td>
              </tr>
              <tr>
                <th style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold;">Grand Total</th>
                <td style="border: 1px solid #38761d; padding: 6px 10px; font-weight: bold; background-color: #e8eedb;">{{formatCurrency grandTotal}} /-</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      </div>
    </div>
  </div>

  <div class="html2pdf__page-break"></div>

  <!-- Page 2: Terms and Conditions -->
  {{#if termsAndConditions}}
  <div class="pdf-page">
    <div class="terms-container">
      <div class="terms-title" style="font-size: 20px; text-decoration: underline; margin-bottom: 20px;"><strong><b>Terms &amp; Conditions</b></strong></div>
      <div class="rich-text-content">{{{termsAndConditions}}}</div>
    </div>
  </div>
  <div class="html2pdf__page-break"></div>
  {{/if}}

  <!-- Post Pages / Annexures -->
  {{#each postPages}}
  <div class="pdf-page">
    <div class="pdf-page-content" style="padding: 40px;">
      <div class="rich-text-content">{{{this}}}</div>
    </div>
  </div>
  <div class="html2pdf__page-break"></div>
  {{/each}}

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
