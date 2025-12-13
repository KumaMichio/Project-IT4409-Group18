const moduleService = require('../services/module.service');

const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;
    const module = await moduleService.createModule(courseId, instructorId, req.body);
    res.status(201).json(module);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const instructorId = req.user.id;
    const module = await moduleService.updateModule(moduleId, instructorId, req.body);
    res.json(module);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const instructorId = req.user.id;
    await moduleService.deleteModule(moduleId, instructorId);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createModule,
  updateModule,
  deleteModule
};
