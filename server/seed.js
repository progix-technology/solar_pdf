const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Template = require('./models/Template');

dotenv.config();

const defaultTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
    body { font-family: 'Arial', 'Helvetica', sans-serif; margin: 0; padding: 0; color: #000; font-size: 13px; }
    .company-header-container {
      display: flex;
      border: 1px solid #000;
      margin-bottom: 0px;
    }
    .company-header-left {
      width: 75%;
      padding: 15px;
      border-right: 1px solid #000;
    }
    .company-header-line {
      margin-bottom: 5px;
      font-size: 16px;
    }
    .company-header-right {
      width: 25%;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
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

    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 0 40px; }
    .info-left { width: 60%; }
    .info-right { width: 35%; padding-top: 50px; }
    
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
    
    .totals-container { display: flex; justify-content: center; padding: 0 20px; margin-bottom: 30px; }
    .totals-table { width: 80%; border-collapse: collapse; border: 2px solid #000; }
    .totals-table th, .totals-table td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
    .totals-table th { font-weight: bold; width: 60%; }
    .totals-table td { width: 40%; }
    
    .highlight-yellow { background-color: #ffff00 !important; font-weight: bold; }
    
    .terms-page {
      page-break-before: always;
      padding: 40px;
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

  <!-- Company Header -->
  <div class="company-header-container">
    <div class="company-header-left">
      <div class="company-header-line"><b>CompanyName: SOLAR CIRCLE</b></div>
      <div class="company-header-line">Address: 159/19, Rakabganj, Lko-226018</div>
      <div class="company-header-line">Phone No.: +91-8564964786/ +91-8299204171</div>
      <div class="company-header-line"><b><span class="highlight-yellow">GSTIN: 09GXKPK4906A1ZH</span></b></div>
      <div class="company-header-line">State: UP</div>
    </div>
    <div class="company-header-right">
      {{#if company.logoUrl}}
        <img src="http://localhost:5001{{company.logoUrl}}" alt="Logo" class="company-logo" />
      {{/if}}
    </div>
  </div>

  <!-- Quotation Banner -->
  <div class="quotation-banner">
    <div class="quotation-title">{{quotationTitle}}</div>
  </div>

  <!-- Customer Info -->
  <div class="info-section">
    <div class="info-left">
      <table class="info-table">
        <tr><td class="info-label" colspan="2">To:</td></tr>
        <tr><td class="info-label">Name:</td><td>{{customerName}}</td></tr>
        <tr><td class="info-label">Address:</td><td>{{customerAddress}}</td></tr>
        <tr><td class="info-label">Contact No.:</td><td>{{contactNumber}}</td></tr>
        <tr><td class="info-label">Site Address.</td><td>{{siteAddress}}</td></tr>
      </table>
    </div>
    <div class="info-right">
      <table class="info-table">
        <tr><td class="info-label">Quotation No.:</td><td>{{quotationNumber}}</td></tr>
        <tr><td class="info-label">Quotation Date:</td><td>{{quotationDate}}</td></tr>
      </table>
    </div>
  </div>

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
  <div style="padding: 0 40px; margin-bottom: 20px;">
    {{{firstPageNotes}}}
  </div>
  {{/if}}

  <!-- Totals Section -->
  <div class="totals-container">
    <table class="totals-table">
      <tr>
        <th>Total Amount</th>
        <td>{{formatCurrency subtotal}} /-</td>
      </tr>
      <tr>
        <th>GST</th>
        <td>Inc/-</td>
      </tr>
      <tr>
        <th class="highlight-yellow">Grand Total</th>
        <td class="highlight-yellow">{{formatCurrency grandTotal}} /-</td>
      </tr>
    </table>
  </div>

  <!-- Page 2: Terms and Conditions -->
  {{#if termsAndConditions}}
  <div class="terms-page">
    <div class="terms-title">Terms & Conditions</div>
    <div>
      {{{termsAndConditions}}}
    </div>
  </div>
  {{/if}}

</body>
</html>
`;

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Seed User
    await User.deleteMany();
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Seed Template
    await Template.deleteMany();
    await Template.create({
      name: 'Modern Professional Default',
      content: defaultTemplate,
      isDefault: true
    });

    console.log('Data Seeded!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
