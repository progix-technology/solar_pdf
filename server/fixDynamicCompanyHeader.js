const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Template = require('./models/Template');
  const CompanySettings = require('./models/CompanySettings');
  
  // Ensure default company settings exist
  let settings = await CompanySettings.findOne();
  if (!settings) {
    settings = await CompanySettings.create({
      companyName: 'SOLAR CIRCLE',
      address: '159/19, Rakabganj, Lko-226018',
      phoneNumbers: '+91-8564964786/ +91-8299204171',
      gstNumber: '09GXKPK4906A1ZH',
      state: 'UP'
    });
  } else {
    if (!settings.state) settings.state = 'UP';
    if (!settings.companyName || settings.companyName === 'My Company') settings.companyName = 'SOLAR CIRCLE';
    if (!settings.address) settings.address = '159/19, Rakabganj, Lko-226018';
    if (!settings.phoneNumbers) settings.phoneNumbers = '+91-8564964786/ +91-8299204171';
    if (!settings.gstNumber) settings.gstNumber = '09GXKPK4906A1ZH';
    await settings.save();
  }

  const templates = await Template.find();

  for (let template of templates) {
    let content = template.content;

    // Replace hardcoded company details with dynamic handlebars expressions
    content = content.replace(
      '<b>CompanyName: SOLAR CIRCLE</b>',
      '<b>CompanyName: {{company.companyName}}</b>'
    );
    content = content.replace(
      'Address: 159/19, Rakabganj, Lko-226018',
      'Address: {{company.address}}'
    );
    content = content.replace(
      'Phone No.: +91-8564964786/ +91-8299204171',
      'Phone No.: {{company.phoneNumbers}}'
    );
    content = content.replace(
      'GSTIN: 09GXKPK4906A1ZH',
      'GSTIN: {{company.gstNumber}}'
    );
    content = content.replace(
      'State: UP',
      'State: {{company.state}}'
    );

    template.content = content;
    await template.save();
  }

  console.log(`Updated ${templates.length} templates: Header Company details are now fully DYNAMIC!`);
  process.exit(0);
}).catch(console.error);
