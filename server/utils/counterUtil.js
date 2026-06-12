const Counter = require('../models/Counter');

const getNextSequenceValue = async (sequenceName) => {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
};

const generateQuotationNumber = async () => {
  const seq = await getNextSequenceValue('quotation_number');
  // Format as SC-0001
  return `SC-${String(seq).padStart(4, '0')}`;
};

module.exports = { generateQuotationNumber };
