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
      quotationDate
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
      termsAndConditions,
      templateId
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
      quotationDate
    } = req.body;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    quotation.customerName = customerName || quotation.customerName;
    quotation.customerAddress = customerAddress || quotation.customerAddress;
    quotation.contactNumber = contactNumber || quotation.contactNumber;
    quotation.siteAddress = siteAddress || quotation.siteAddress;
    quotation.quotationTitle = quotationTitle || quotation.quotationTitle;
    quotation.columns = columns || quotation.columns;
    quotation.rows = rows || quotation.rows;
    quotation.subtotal = subtotal || quotation.subtotal;
    quotation.gstPercentage = gstPercentage || quotation.gstPercentage;
    quotation.gstAmount = gstAmount || quotation.gstAmount;
    quotation.grandTotal = grandTotal || quotation.grandTotal;
    quotation.firstPageNotes = firstPageNotes || quotation.firstPageNotes;
    quotation.termsAndConditions = termsAndConditions || quotation.termsAndConditions;
    quotation.templateId = templateId || quotation.templateId;
    quotation.quotationDate = quotationDate || quotation.quotationDate;

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
      settings = { companyName: 'My Company', logoUrl: '' };
    }

    const pdfData = {
      ...quotation.toObject(),
      company: settings.toObject ? settings.toObject() : settings
    };

    const pdfBuffer = await generatePDFBuffer(template.content, pdfData);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Quotation_${quotation.quotationNumber}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error ? error.toString() : 'Unknown Error', stack: error ? error.stack : '' });
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
