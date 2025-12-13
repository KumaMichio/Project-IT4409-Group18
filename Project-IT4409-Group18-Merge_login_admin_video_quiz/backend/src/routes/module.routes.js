const express = require('express');
const router = express.Router({ mergeParams: true }); 
const {
  createModule,
  updateModule,
  deleteModule
} = require('../controllers/module.controller');
const { createLesson } = require('../controllers/lesson.controller');
const { authRequired } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');

// All routes require authentication and INSTRUCTOR/ADMIN role
router.use(authRequired, checkRole('INSTRUCTOR', 'ADMIN'));

// Module CRUD
router.post('/', createModule);
router.put('/:moduleId', updateModule);
router.delete('/:moduleId', deleteModule);

// Lesson Creation (under module)
router.post('/:moduleId/lessons', createLesson);

module.exports = router;
