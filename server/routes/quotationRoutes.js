const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  downloadQuotationPDF
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium').default || require('@sparticuz/chromium');

router.get('/test-pdf', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    await browser.close();
    res.json({ success: true, message: "Chromium launched successfully without crashing!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

router.route('/')
  .get(protect, getQuotations)
  .post(protect, createQuotation);

router.route('/:id')
  .get(protect, getQuotationById)
  .put(protect, updateQuotation)
  .delete(protect, deleteQuotation);

router.route('/:id/pdf')
  .get(protect, downloadQuotationPDF);

module.exports = router;
