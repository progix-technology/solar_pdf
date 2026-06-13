const Quotation = require('../models/Quotation');
const Template = require('../models/Template');
const CompanySettings = require('../models/CompanySettings');
const { generateQuotationNumber } = require('../utils/counterUtil');
const { generatePDFBuffer } = require('../services/pdfService');

const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (quotation) {
      res.json(quotation);
    } else {
      res.status(404).json({ message: 'Quotation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  const createQuotation = async (req, res) => {
  try {
    const {
      customerName,
      customerAddress,
      contactNumber,
      siteAddress,
      quotationTitle,
      columns,
      rows,
      subtotal,
      gstPercentage,
      gstAmount,
      grandTotal,
      firstPageNotes,
      termsAndConditions,
      templateId,
      quotationDate,
      prePages,
      postPages
    } = req.body;

    const quotationNumber = await generateQuotationNumber();

    const quotation = new Quotation({
      quotationNumber,
      quotationDate: quotationDate || Date.now(),
      quotationTitle: quotationTitle || 'Quotation for',
      customerName,
      customerAddress,
      contactNumber,
      siteAddress,
      columns,
      rows,
      subtotal,
      gstPercentage,
      gstAmount,
      grandTotal,
      firstPageNotes,
      termsAndConditions,
      templateId,
      prePages,
      postPages
    });

    const createdQuotation = await quotation.save();
    res.status(201).json(createdQuotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerAddress,
      contactNumber,
      siteAddress,
      quotationTitle,
      columns,
      rows,
      subtotal,
      gstPercentage,
      gstAmount,
      grandTotal,
      firstPageNotes,
      termsAndConditions,
      templateId,
      quotationDate,
      prePages,
      postPages
    } = req.body;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (customerName !== undefined) quotation.customerName = customerName;
    if (customerAddress !== undefined) quotation.customerAddress = customerAddress;
    if (contactNumber !== undefined) quotation.contactNumber = contactNumber;
    if (siteAddress !== undefined) quotation.siteAddress = siteAddress;
    if (quotationTitle !== undefined) quotation.quotationTitle = quotationTitle;
    if (columns !== undefined) quotation.columns = columns;
    if (rows !== undefined) quotation.rows = rows;
    if (subtotal !== undefined) quotation.subtotal = subtotal;
    if (gstPercentage !== undefined) quotation.gstPercentage = gstPercentage;
    if (gstAmount !== undefined) quotation.gstAmount = gstAmount;
    if (grandTotal !== undefined) quotation.grandTotal = grandTotal;
    if (firstPageNotes !== undefined) quotation.firstPageNotes = firstPageNotes;
    if (termsAndConditions !== undefined) quotation.termsAndConditions = termsAndConditions;
    if (templateId !== undefined) quotation.templateId = templateId;
    if (quotationDate !== undefined) quotation.quotationDate = quotationDate;
    if (prePages !== undefined) quotation.prePages = prePages;
    if (postPages !== undefined) quotation.postPages = postPages;

    quotation.markModified('columns');
    quotation.markModified('rows');
    quotation.markModified('prePages');
    quotation.markModified('postPages');

    const updatedQuotation = await quotation.save();
    res.json(updatedQuotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (quotation) {
      await Quotation.deleteOne({ _id: req.params.id });
      res.json({ message: 'Quotation removed' });
    } else {
      res.status(404).json({ message: 'Quotation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadQuotationPDF = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    let template = null;
    if (quotation.templateId) {
      template = await Template.findById(quotation.templateId).catch(() => null);
    }
    if (!template) {
      template = await Template.findOne({ isDefault: true });
    }
    if (!template) {
      return res.status(500).json({ message: 'No template available in the system.' });
    }

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = { companyName: 'SOLAR CIRCLE', logoUrl: '/logo.png' };
    }

    const companyData = settings.toObject ? settings.toObject() : { ...settings };
    if (!companyData.logoUrl) {
      companyData.logoUrl = '/logo.png';
    }
    if (companyData.logoUrl && !companyData.logoUrl.startsWith('http://') && !companyData.logoUrl.startsWith('https://')) {
      companyData.logoUrl = `${req.protocol}://${req.get('host')}${companyData.logoUrl.startsWith('/') ? '' : '/'}${companyData.logoUrl}`;
    }

    const pdfData = {
      ...quotation.toObject(),
      company: companyData
    };

    // Clean any hardcoded backend URLs from logo image src in the template
    let templateContent = template.content;
    templateContent = templateContent.replace(/src="https?:\/\/[a-zA-Z0-9.-]+(:\d+)?\{\{company\.logoUrl\}\}"/g, 'src="{{company.logoUrl}}"');

    // Add crossorigin="anonymous" to the image tags to avoid tainted canvas errors on the frontend
    if (!/crossorigin=/i.test(templateContent)) {
      templateContent = templateContent.replace(/<img\s+/gi, '<img crossorigin="anonymous" ');
    }

    const pdfBuffer = await generatePDFBuffer(templateContent, pdfData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Quotation_${quotation.quotationNumber}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ message: 'Failed to generate HTML', error: error ? error.toString() : 'Unknown Error', stack: error ? error.stack : '' });
  }
};

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  downloadQuotationPDF
};
