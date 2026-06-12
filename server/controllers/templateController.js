const Template = require('../models/Template');

const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({});
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (template) {
      res.json(template);
    } else {
      res.status(404).json({ message: 'Template not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { name, content, isDefault } = req.body;
    
    if (isDefault) {
      await Template.updateMany({}, { isDefault: false });
    }

    const template = new Template({
      name,
      content,
      isDefault
    });

    const createdTemplate = await template.save();
    res.status(201).json(createdTemplate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { name, content, isDefault } = req.body;

    const template = await Template.findById(req.params.id);

    if (template) {
      if (isDefault && !template.isDefault) {
         await Template.updateMany({}, { isDefault: false });
      }

      template.name = name || template.name;
      template.content = content || template.content;
      if (isDefault !== undefined) {
         template.isDefault = isDefault;
      }

      const updatedTemplate = await template.save();
      res.json(updatedTemplate);
    } else {
      res.status(404).json({ message: 'Template not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (template) {
      await Template.deleteOne({ _id: req.params.id });
      res.json({ message: 'Template removed' });
    } else {
      res.status(404).json({ message: 'Template not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
